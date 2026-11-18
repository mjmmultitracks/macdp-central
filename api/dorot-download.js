// Entrega do PDF do livro DOROT somente após pagamento aprovado no Mercado Pago.
// O arquivo fica criptografado no repositório (api/_files/dorot.pdf.enc); a chave está
// na variável de ambiente DOROT_PDF_KEY (64 caracteres hexadecimais) e nunca vai ao código.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ORDER_RE, getStoreItem, normalizeOrder, safeEqual, signOrder } from './_lib/store.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Use GET.' });
  }

  try {
    const keyHex = (process.env.DOROT_PDF_KEY || '').trim();
    if (!/^[0-9a-f]{64}$/i.test(keyHex)) {
      return res.status(503).json({ error: 'Download indisponível no momento. Fale com a secretaria.' });
    }

    const order = normalizeOrder(req.query?.pedido);
    if (order) {
      // Link liberado pela secretaria (assinado pelo servidor)
      if (!ORDER_RE.test(order) || !safeEqual(String(req.query?.sig || ''), signOrder(order))) {
        return res.status(403).json({ error: 'Link inválido.' });
      }
    } else {
      // Pagamento aprovado no Mercado Pago
      const paymentId = String(req.query?.paymentId || '').trim();
      if (!/^\d{3,20}$/.test(paymentId)) {
        return res.status(400).json({ error: 'Pagamento inválido.' });
      }
      const accessToken = (process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.VITE_MERCADO_PAGO_ACCESS_TOKEN || '').trim();
      if (!accessToken) {
        return res.status(503).json({ error: 'Download indisponível no momento. Fale com a secretaria.' });
      }
      const mp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!mp.ok) {
        return res.status(404).json({ error: 'Pagamento não encontrado.' });
      }
      const payment = await mp.json();
      const meta = payment.metadata || {};
      const item = getStoreItem(String(meta.product || ''), String(meta.format || ''));
      const ref = String(payment.external_reference || '');
      const validPurchase =
        payment.status === 'approved' &&
        ref.includes('loja_') &&
        item &&
        item.format.kind === 'digital' &&
        Number(payment.transaction_amount) + 0.001 >= item.format.price;
      if (!validPurchase) {
        return res.status(402).json({ error: 'Pagamento ainda não confirmado para este livro.' });
      }
    }

    const file = fs.readFileSync(path.join(process.cwd(), 'api', '_files', 'dorot.pdf.enc'));
    const iv = file.subarray(0, 12);
    const tag = file.subarray(12, 28);
    const data = file.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(keyHex, 'hex'), iv);
    decipher.setAuthTag(tag);
    const pdf = Buffer.concat([decipher.update(data), decipher.final()]);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="DOROT-A-Continuidade-Profetica.pdf"');
    res.setHeader('Content-Length', String(pdf.length));
    return res.status(200).send(pdf);
  } catch (err) {
    console.error('[dorot-download]', err);
    return res.status(500).json({ error: 'Não foi possível entregar o arquivo agora. Fale com a secretaria.' });
  }
}
