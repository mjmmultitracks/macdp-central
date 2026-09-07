// Serverless function to check the status of a Mercado Pago payment in real-time
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const paymentId = (req.query?.paymentId || '').trim();
    const customAccessToken = (req.query?.token || req.headers?.authorization?.replace('Bearer ', '') || '').trim();

    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId é obrigatório.', code: 'MISSING_PAYMENT_ID' });
    }

    const accessToken = (
      customAccessToken ||
      process.env.MERCADO_PAGO_ACCESS_TOKEN ||
      process.env.VITE_MERCADO_PAGO_ACCESS_TOKEN ||
      ''
    ).trim();

    if (!accessToken) {
      return res.status(400).json({ error: 'Access Token não configurado.', code: 'MISSING_ACCESS_TOKEN' });
    }

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      return res.status(mpResponse.status).json({
        error: mpData.message || 'Erro ao consultar status no Mercado Pago.',
        details: mpData,
      });
    }

    const isApproved = mpData.status === 'approved';

    return res.status(200).json({
      success: true,
      paymentId: mpData.id,
      status: mpData.status, // 'pending', 'approved', 'authorized', 'in_process', 'rejected', 'cancelled'
      statusDetail: mpData.status_detail,
      isApproved,
      dateApproved: mpData.date_approved,
      amount: mpData.transaction_amount,
      externalReference: mpData.external_reference,
    });
  } catch (err) {
    console.error('Check Status Exception:', err);
    return res.status(500).json({ error: err.message || 'Erro interno no servidor.', code: 'SERVER_ERROR' });
  }
}
