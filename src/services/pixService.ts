// Pix EMV standard code generator with CRC16-CCITT

function formatEMVField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/** O BR Code exige texto simples: sem acentos e só letras, números e espaço. */
function toPixText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim();
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

function isValidCpf(digits: string): boolean {
  if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(digits[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(digits[9]) && calc(10) === Number(digits[10]);
}

/**
 * Ajusta a chave para o BR Code: telefone precisa do +55 (ex.: 92991279663 -> +5592991279663).
 * CPF, CNPJ, e-mail e chave aleatória ficam como estão.
 */
export function normalizePixKey(raw: string): string {
  const key = (raw || '').trim();
  if (!key || key.includes('@') || key.startsWith('+')) return key;
  const digits = key.replace(/\D/g, '');
  const formatted = /[()\s-]/.test(key);
  const looksLikeMobile = /^[1-9]{2}9\d{8}$/.test(digits);
  const looksLikeLandline = /^[1-9]{2}[2-5]\d{7}$/.test(digits);
  if (digits.length === 11 && looksLikeMobile && (formatted || !isValidCpf(digits))) return `+55${digits}`;
  if (digits.length === 10 && looksLikeLandline && formatted) return `+55${digits}`;
  if (digits.length === 13 && digits.startsWith('55') && looksLikeMobile === false && /^55[1-9]{2}9\d{8}$/.test(digits)) return `+${digits}`;
  return key;
}

export interface PixPayloadParams {
  key: string;
  name: string;
  city: string;
  amount: number;
  txid?: string;
  description?: string;
}

export function generatePixCopiaECola({
  key,
  name,
  city,
  amount,
  txid = 'MACDP' + Math.floor(Math.random() * 10000),
  description = 'Doacao MACDP',
}: PixPayloadParams): string {
  // Merchant Account Info (GUI + Key + Desc)
  const gui = formatEMVField('00', 'br.gov.bcb.pix');
  const chavePix = formatEMVField('01', normalizePixKey(key));
  const cleanDescription = toPixText(description).slice(0, 25);
  const infoAdicional = cleanDescription ? formatEMVField('02', cleanDescription) : '';
  const merchantAccountInfo = formatEMVField('26', `${gui}${chavePix}${infoAdicional}`);

  // Category Code (0000 generic)
  const mcc = formatEMVField('52', '0000');
  // Currency 986 (BRL)
  const currency = formatEMVField('53', '986');
  // Amount
  const formattedAmount = amount > 0 ? formatEMVField('54', amount.toFixed(2)) : '';
  // Country code
  const country = formatEMVField('58', 'BR');
  // Merchant Name (max 25 chars)
  const cleanName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 25);
  const merchantName = formatEMVField('59', cleanName);
  // Merchant City (max 15 chars)
  const cleanCity = city.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 15);
  const merchantCity = formatEMVField('60', cleanCity);
  // Additional Data (TxID)
  const txField = formatEMVField('05', toPixText(txid).replace(/ /g, '').slice(0, 25) || '***');
  const additionalData = formatEMVField('62', txField);

  // Payload format indicator
  const payloadFormat = formatEMVField('00', '01');

  const basePayload = `${payloadFormat}${merchantAccountInfo}${mcc}${currency}${formattedAmount}${country}${merchantName}${merchantCity}${additionalData}6304`;
  const checksum = crc16(basePayload);

  return `${basePayload}${checksum}`;
}
