// Webhook handler for Mercado Pago payment updates
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Always acknowledge receipt to Mercado Pago
  try {
    const topic = req.query?.topic || req.body?.type || req.query?.type;
    const paymentId = req.query?.id || req.body?.data?.id || req.query?.['data.id'];

    console.log(`[Mercado Pago Webhook] Received ${topic} for payment ${paymentId}`);

    // If it's a payment update
    if (topic === 'payment' && paymentId) {
      const accessToken = (
        process.env.MERCADO_PAGO_ACCESS_TOKEN ||
        process.env.VITE_MERCADO_PAGO_ACCESS_TOKEN ||
        ''
      ).trim();

      if (accessToken) {
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (mpResponse.ok) {
          const mpData = await mpResponse.json();
          console.log(`[Mercado Pago Webhook] Payment ${paymentId} status: ${mpData.status}`);
          // External reference is format eventId:registrationId
          const externalRef = mpData.external_reference || '';
          console.log(`[Mercado Pago Webhook] External Ref: ${externalRef}`);

          if (mpData.status === 'approved' && externalRef.includes(':')) {
            const [eventId, regId] = externalRef.split(':');
            const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sbcecbylxoqqbsextkrt.supabase.co';
            const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_m_UUQHfeR2u_oUc4M5vffw_Z9xm0jcM';

            if (regId && regId !== 'undefined') {
              await fetch(`${supabaseUrl}/rest/v1/event_registrations?id=eq.${encodeURIComponent(regId)}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Prefer': 'return=minimal',
                },
                body: JSON.stringify({
                  payment_status: 'confirmed',
                  payment_notes: `Aprovado via Webhook Mercado Pago (ID: ${paymentId}) em ${new Date().toISOString()}`,
                }),
              }).catch((err) => console.error('[Webhook Supabase Update Error]:', err));
            }
          }
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Mercado Pago Webhook] Error:', err);
    return res.status(200).json({ received: true, error: err.message });
  }
}
