// Serverless Endpoint para Envio de E-mails via Resend
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const {
      to,
      subject,
      html,
      fromName = 'MACDP Central',
      fromEmail,
      apiKey: customApiKey,
    } = req.body || {};

    if (!to) {
      return res.status(400).json({ error: 'O campo "to" (destinatário) é obrigatório.' });
    }

    if (!subject || !html) {
      return res.status(400).json({ error: 'Os campos "subject" e "html" são obrigatórios.' });
    }

    // Prioriza chave informada no payload (configuração do painel) ou variável de ambiente
    const apiKey = (customApiKey && String(customApiKey).trim()) || process.env.RESEND_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        error: 'Chave de API do Resend não configurada. Cadastre a chave no Painel da Igreja ou defina RESEND_API_KEY.',
      });
    }

    // Remetente: se especificado e válido, usa; senão usa padrão do ambiente ou onboarding@resend.dev
    const senderEmail = (fromEmail && String(fromEmail).trim()) || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const senderName = fromName ? String(fromName).trim() : 'MACDP Central';
    const fromField = `${senderName} <${senderEmail}>`;

    const recipients = Array.isArray(to) ? to : [to];

    const payload = {
      from: fromField,
      to: recipients,
      subject,
      html,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Resend API:', data);
      return res.status(response.status).json({
        error: data.message || 'Falha ao enviar e-mail pelo Resend.',
        details: data,
      });
    }

    return res.status(200).json({
      success: true,
      id: data.id,
      from: fromField,
      to: recipients,
    });
  } catch (error) {
    console.error('Erro inesperado em api/send-email:', error);
    return res.status(500).json({
      error: 'Erro interno no servidor ao processar envio de e-mail.',
      message: error.message,
    });
  }
}
