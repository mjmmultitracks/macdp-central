// Catálogo da loja no servidor: os preços válidos ficam aqui (o navegador não decide o valor).
// Mantenha igual a src/data/storeProducts.ts.
export const STORE_CATALOG = {
  dorot: {
    title: 'DOROT',
    formats: {
      impresso: { label: 'Impresso', price: 49.9, kind: 'physical' },
      pdf: { label: 'Digital (PDF)', price: 19.9, kind: 'digital' },
    },
  },
};

export function getStoreItem(productId, formatId) {
  const product = STORE_CATALOG[productId];
  const format = product && product.formats[formatId];
  return product && format ? { product, format } : null;
}

// ---------- Liberação manual do PDF (Pix direto na chave) ----------
import crypto from 'node:crypto';

function secret() {
  const key = (process.env.DOROT_PDF_KEY || '').trim();
  return /^[0-9a-f]{64}$/i.test(key) ? key : '';
}

const hmac = (label, value) =>
  crypto.createHmac('sha256', secret()).update(`${label}:${value}`).digest('hex');

/** Pedidos do PDF têm o formato LJP-XXXXXX (letras e números sem ambiguidade). */
export const ORDER_RE = /^LJP-[A-HJ-NP-Z2-9]{6}$/;

export const normalizeOrder = (value) => String(value || '').trim().toUpperCase();

/** Assinatura do link de download de um pedido (só o servidor consegue gerar). */
export function signOrder(order) {
  return secret() ? hmac('liberacao', normalizeOrder(order)).slice(0, 32) : '';
}

/** Senha de liberação usada pela secretaria (derivada do segredo do servidor). */
export function releasePin() {
  return secret() ? hmac('senha-secretaria', 'loja').slice(0, 8).toUpperCase() : '';
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
