export interface PresetBank {
  name: string;
  shortName: string;
  color: string;
  logoUrl: string;
  code?: string;
}

export const PRESET_BANKS: PresetBank[] = [
  {
    name: 'Banco Bradesco (237)',
    shortName: 'Bradesco',
    color: '#dc2626',
    logoUrl: '/images/banks/bradesco.svg',
    code: '237',
  },
  {
    name: 'Nu Pagamentos S.A. (260)',
    shortName: 'Nubank',
    color: '#820ad1',
    logoUrl: '/images/banks/nubank.svg',
    code: '260',
  },
  {
    name: 'Banco do Brasil (001)',
    shortName: 'Banco do Brasil',
    color: '#facc15',
    logoUrl: '/images/banks/bb.svg',
    code: '001',
  },
  {
    name: 'Itaú Unibanco (341)',
    shortName: 'Itaú',
    color: '#ec7000',
    logoUrl: '/images/banks/itau.svg',
    code: '341',
  },
  {
    name: 'Caixa Econômica Federal (104)',
    shortName: 'Caixa',
    color: '#0066b3',
    logoUrl: '/images/banks/caixa.svg',
    code: '104',
  },
  {
    name: 'Banco Santander (033)',
    shortName: 'Santander',
    color: '#ec0000',
    logoUrl: '/images/banks/santander.svg',
    code: '033',
  },
  {
    name: 'Banco Inter (077)',
    shortName: 'Banco Inter',
    color: '#ff7a00',
    logoUrl: '/images/banks/inter.svg',
    code: '077',
  },
  {
    name: 'Mercado Pago (323)',
    shortName: 'Mercado Pago',
    color: '#00aae4',
    logoUrl: '/images/banks/mercadopago.svg',
    code: '323',
  },
  {
    name: 'Sicoob (756)',
    shortName: 'Sicoob',
    color: '#003641',
    logoUrl: '/images/banks/sicoob.svg',
    code: '756',
  },
  {
    name: 'Sicredi (748)',
    shortName: 'Sicredi',
    color: '#00853b',
    logoUrl: '/images/banks/sicredi.svg',
    code: '748',
  },
  {
    name: 'C6 Bank (336)',
    shortName: 'C6 Bank',
    color: '#242424',
    logoUrl: '/images/banks/c6bank.svg',
    code: '336',
  },
  {
    name: 'PagBank / PagSeguro (290)',
    shortName: 'PagBank',
    color: '#00a859',
    logoUrl: '/images/banks/pagbank.svg',
    code: '290',
  },
  {
    name: 'Caixa Físico / Dinheiro em Espécie',
    shortName: 'Dinheiro',
    color: '#16a34a',
    logoUrl: '/images/banks/dinheiro.svg',
  },
];

/**
 * Normaliza e resolve o logotipo correto do banco evitando links externos quebrados (ex: Wikimedia)
 */
export function resolveBankLogo(bankName?: string, logoUrl?: string): string {
  const normName = (bankName || '').toLowerCase();
  const normUrl = (logoUrl || '').toLowerCase();

  // Se for link do wikimedia que bloqueia hotlinking, forçamos o logo local correspondente
  const isWikimedia = normUrl.includes('wikimedia.org');

  if (isWikimedia || !logoUrl || logoUrl.trim() === '') {
    if (normName.includes('bradesco') || normUrl.includes('bradesco')) return '/images/banks/bradesco.svg';
    if (normName.includes('nubank') || normName.includes('nu pagamentos') || normUrl.includes('nubank')) return '/images/banks/nubank.svg';
    if (normName.includes('brasil') || normUrl.includes('banco_do_brasil') || normUrl.includes('bb')) return '/images/banks/bb.svg';
    if (normName.includes('itau') || normName.includes('itaú') || normUrl.includes('itau')) return '/images/banks/itau.svg';
    if (normName.includes('caixa') || normUrl.includes('caixa')) return '/images/banks/caixa.svg';
    if (normName.includes('santander') || normUrl.includes('santander')) return '/images/banks/santander.svg';
    if (normName.includes('inter') || normUrl.includes('inter')) return '/images/banks/inter.svg';
    if (normName.includes('mercado pago') || normUrl.includes('mercado_pago')) return '/images/banks/mercadopago.svg';
    if (normName.includes('sicoob') || normUrl.includes('sicoob')) return '/images/banks/sicoob.svg';
    if (normName.includes('sicredi') || normUrl.includes('sicredi')) return '/images/banks/sicredi.svg';
    if (normName.includes('c6') || normUrl.includes('c6')) return '/images/banks/c6bank.svg';
    if (normName.includes('pagbank') || normName.includes('pagseguro') || normUrl.includes('pagbank')) return '/images/banks/pagbank.svg';
    if (normName.includes('dinheiro') || normName.includes('espécie') || normName.includes('cofre') || normName.includes('fisico')) return '/images/banks/dinheiro.svg';
  }

  // Se já for uma imagem válida (data URL base64, /images/banks/..., ou URL externa própria)
  return logoUrl || '/images/banks/bradesco.svg';
}
