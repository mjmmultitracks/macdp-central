// Serverless function to create a payment or preference with Mercado Pago
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const {
      amount,
      title = 'Inscrição em Evento - MACDP',
      name = 'Participante',
      email,
      phone,
      eventId,
      registrationId,
      paymentMethod = 'pix', // 'pix' or 'preference' (card/checkout pro)
      customAccessToken,
    } = req.body || {};

    const accessToken = (
      customAccessToken ||
      process.env.MERCADO_PAGO_ACCESS_TOKEN ||
      process.env.VITE_MERCADO_PAGO_ACCESS_TOKEN ||
      ''
    ).trim();

    if (!accessToken) {
      return res.status(400).json({
        error: 'Access Token do Mercado Pago não configurado. Por favor, configure no Painel da Igreja.',
        code: 'MISSING_ACCESS_TOKEN',
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Valor da transação inválido.', code: 'INVALID_AMOUNT' });
    }

    const payerEmail = (email && email.includes('@')) ? email.trim() : 'contato@macdp.com.br';
    const nameParts = (name || 'Participante MACDP').trim().split(' ');
    const firstName = nameParts[0] || 'Participante';
    const lastName = nameParts.slice(1).join(' ') || 'Presença';

    // ==================== 1. PIX INSTANTÂNEO ====================
    if (paymentMethod === 'pix') {
      const idempotencyKey = `macdp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          transaction_amount: Number(parsedAmount.toFixed(2)),
          description: `Inscrição: ${title.slice(0, 45)} - MACDP`,
          payment_method_id: 'pix',
          payer: {
            email: payerEmail,
            first_name: firstName,
            last_name: lastName,
          },
          external_reference: `${eventId || 'evt'}:${registrationId || Date.now()}`,
          notification_url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host || 'macdp.com.br'}/api/mercadopago-webhook`,
        }),
      });

      const mpData = await mpResponse.json();

      if (!mpResponse.ok) {
        console.error('Mercado Pago Payment Error:', mpData);
        return res.status(mpResponse.status).json({
          error: mpData.message || 'Erro ao gerar cobrança no Mercado Pago.',
          details: mpData,
        });
      }

      const txData = mpData.point_of_interaction?.transaction_data || {};

      return res.status(200).json({
        success: true,
        paymentId: mpData.id,
        status: mpData.status,
        statusDetail: mpData.status_detail,
        qrCode: txData.qr_code, // Código Copia e Cola
        qrCodeBase64: txData.qr_code_base64, // Imagem Base64 do QR Code
        ticketUrl: txData.ticket_url,
        amount: parsedAmount,
      });
    }

    // ==================== 2. CHECKOUT PREFERENCE (CARTÃO / PARCELADO) ====================
    if (paymentMethod === 'preference') {
      const baseUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host || 'macdp.com.br'}`;
      const prefResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          items: [
            {
              id: eventId || 'evento',
              title: `Inscrição: ${title} - MACDP`,
              description: `Vaga oficial no evento ${title}`,
              unit_price: Number(parsedAmount.toFixed(2)),
              quantity: 1,
              currency_id: 'BRL',
            },
          ],
          payer: {
            name: firstName,
            surname: lastName,
            email: payerEmail,
            phone: phone ? { number: phone.replace(/\D/g, '') } : undefined,
          },
          back_urls: {
            success: `${baseUrl}?payment=approved&ref=${registrationId}`,
            failure: `${baseUrl}?payment=failure`,
            pending: `${baseUrl}?payment=pending&ref=${registrationId}`,
          },
          auto_return: 'approved',
          external_reference: `${eventId || 'evt'}:${registrationId || Date.now()}`,
          statement_descriptor: 'MACDP IGREJA',
        }),
      });

      const prefData = await prefResponse.json();

      if (!prefResponse.ok) {
        console.error('Mercado Pago Preference Error:', prefData);
        return res.status(prefResponse.status).json({
          error: prefData.message || 'Erro ao criar checkout do Mercado Pago.',
          details: prefData,
        });
      }

      return res.status(200).json({
        success: true,
        preferenceId: prefData.id,
        initPoint: prefData.init_point, // Link oficial para pagamento no cartão/parcelamento
        sandboxInitPoint: prefData.sandbox_init_point,
      });
    }

    return res.status(400).json({ error: 'Forma de pagamento não suportada.', code: 'UNSUPPORTED_METHOD' });
  } catch (err) {
    console.error('Mercado Pago Handler Exception:', err);
    return res.status(500).json({ error: err.message || 'Erro interno no servidor.', code: 'SERVER_ERROR' });
  }
}
