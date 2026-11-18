// A secretaria informa o código do pedido e a senha de liberação e recebe o link do PDF.
// Só deve ser usado depois de conferir o Pix no extrato do banco.
import { ORDER_RE, normalizeOrder, releasePin, safeEqual, signOrder } from './_lib/store.js';

const attempts = new Map(); // limite simples de tentativas por IP (por instância)

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });

  const ip = String(req.headers['x-forwarded-for'] || 'local').split(',')[0].trim();
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (recent.length >= 8) return res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos.' });
  recent.push(now);
  attempts.set(ip, recent);

  try {
    const pin = releasePin();
    if (!pin) return res.status(503).json({ error: 'Liberação indisponível.' });

    const { pedido, senha } = req.body || {};
    if (!safeEqual(String(senha || '').trim().toUpperCase(), pin)) {
      return res.status(401).json({ error: 'Senha de liberação incorreta.' });
    }
    const order = normalizeOrder(pedido);
    if (!ORDER_RE.test(order)) {
      return res.status(400).json({ error: 'Código de pedido inválido. Use o formato LJP-XXXXXX.' });
    }
    const host = req.headers.host || 'macdp.com.br';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const url = `${proto}://${host}/api/dorot-download?pedido=${encodeURIComponent(order)}&sig=${signOrder(order)}`;
    return res.status(200).json({ success: true, pedido: order, url });
  } catch (err) {
    console.error('[loja-liberar]', err);
    return res.status(500).json({ error: 'Erro ao gerar o link.' });
  }
}
