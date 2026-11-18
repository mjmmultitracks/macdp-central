// Informa ao site se o Mercado Pago está configurado no servidor (sem revelar nenhum segredo).
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const token = (process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.VITE_MERCADO_PAGO_ACCESS_TOKEN || '').trim();
  return res.status(200).json({ configured: !!token });
}
