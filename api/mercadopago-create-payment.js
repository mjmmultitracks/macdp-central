// Serverless function to create a payment or preference with Mercado Pago
import { getStoreItem } from './_lib/store.js';
import { getEventAmount } from './_lib/events.js';

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
      description: customDescription,
      itemTitle,
      productId,
      formatId,
      quantity,
      includeShirt,
    } = req.body || {};

    // O token do servidor tem prioridade; o enviado pelo navegador só vale se não houver token no servidor.
    const accessToken = (
      process.env.MERCADO_PAGO_ACCESS_TOKEN ||
      process.env.VITE_MERCADO_PAGO_ACCESS_TOKEN ||
      customAccessToken ||
      ''
    ).trim();

    if (!accessToken) {
      return res.status(400).json({
        error: 'Access Token do Mercado Pago não configurado. Por favor, configure no Painel da Igreja.',
        code: 'MISSING_ACCESS_TOKEN',
      });
    }

    // Loja: o valor é calculado aqui no servidor, a partir do catálogo (o navegador não define o preço).
    let parsedAmount = parseFloat(amount);
    let storeMetadata;
    if (eventId === 'loja') {
      const item = getStoreItem(String(productId || ''), String(formatId || ''));
      if (!item) {
        return res.status(400).json({ error: 'Produto inválido.', code: 'INVALID_PRODUCT' });
      }
      const qty = item.format.kind === 'digital' ? 1 : Math.min(10, Math.max(1, parseInt(quantity, 10) || 1));
      parsedAmount = Number((item.format.price * qty).toFixed(2));
      storeMetadata = { product: String(productId), format: String(formatId), quantity: qty };
    }
    // Inscrição em evento: o valor também vem do cadastro do evento, não do navegador.
    if (eventId && eventId !== 'loja' && eventId !== 'evt') {
      let eventPricing;
      try {
        eventPricing = await getEventAmount(String(eventId), includeShirt === true);
      } catch (e) {
        return res.status(503).json({ error: 'Não foi possível conferir o valor da inscrição agora. Tente novamente.', code: 'PRICE_LOOKUP_FAILED' });
      }
      if (!eventPricing) {
        return res.status(404).json({ error: 'Evento não encontrado.', code: 'EVENT_NOT_FOUND' });
      }
      parsedAmount = eventPricing.amount;
    }
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
          description: customDescription ? String(customDescription).slice(0, 80) : `Inscrição: ${title.slice(0, 45)} - MACDP`,
          payment_method_id: 'pix',
          payer: {
            email: payerEmail,
            first_name: firstName,
            last_name: lastName,
          },
          external_reference: `${eventId || 'evt'}:${registrationId || Date.now()}`,
          ...(storeMetadata ? { metadata: storeMetadata } : {}),
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
              title: itemTitle ? String(itemTitle).slice(0, 120) : `Inscrição: ${title} - MACDP`,
              description: customDescription ? String(customDescription).slice(0, 200) : `Vaga oficial no evento ${title}`,
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
          ...(storeMetadata ? { metadata: storeMetadata } : {}),
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
