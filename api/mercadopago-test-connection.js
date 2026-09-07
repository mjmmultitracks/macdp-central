// Serverless function to test connection and validate Mercado Pago credentials
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const customAccessToken = (
      req.body?.accessToken ||
      req.query?.accessToken ||
      req.headers?.authorization?.replace('Bearer ', '') ||
      ''
    ).trim();

    const accessToken = (
      customAccessToken ||
      process.env.MERCADO_PAGO_ACCESS_TOKEN ||
      process.env.VITE_MERCADO_PAGO_ACCESS_TOKEN ||
      ''
    ).trim();

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum Access Token fornecido para teste.',
      });
    }

    const testResponse = await fetch('https://api.mercadopago.com/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const testData = await testResponse.json();

    if (!testResponse.ok) {
      return res.status(testResponse.status).json({
        success: false,
        error: testData.message || 'Token inválido ou sem permissões.',
        details: testData,
      });
    }

    return res.status(200).json({
      success: true,
      account: {
        id: testData.id,
        nickname: testData.nickname,
        email: testData.email,
        siteId: testData.site_id,
        countryId: testData.country_id,
      },
      message: `Conexão bem-sucedida com a conta ${testData.nickname || testData.email || testData.id}!`,
    });
  } catch (err) {
    console.error('Test Connection Exception:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Erro ao comunicar com a API do Mercado Pago.',
    });
  }
}
