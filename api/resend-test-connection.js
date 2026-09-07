// Serverless Endpoint para Testar Conexão e Disparo com Resend
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
      apiKey: customApiKey,
      toEmail,
      fromEmail,
      fromName = 'MACDP Central',
    } = req.body || {};

    const apiKey = (customApiKey && String(customApiKey).trim()) || process.env.RESEND_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        error: 'Chave de API do Resend não fornecida. Insira a chave antes de testar.',
      });
    }

    // Se informou um e-mail para envio de teste, dispara e-mail real de teste
    if (toEmail) {
      const senderEmail = (fromEmail && String(fromEmail).trim()) || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const senderName = fromName ? String(fromName).trim() : 'MACDP Central';
      const fromField = `${senderName} <${senderEmail}>`;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromField,
          to: [toEmail],
          subject: '🧪 Teste de Conexão Bem-Sucedido: MACDP Central & Resend',
          html: `
            <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 500px; border: 1px solid #e2e8f0; border-radius: 12px; margin: 0 auto;">
              <h2 style="color: #059669; margin-top: 0;">🎉 Conexão com Resend Ativa!</h2>
              <p>Este é um e-mail de teste disparado pelo painel administrativo do <strong>MACDP Central</strong>.</p>
              <div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 13px; margin: 16px 0;">
                <p style="margin: 0 0 6px 0;"><strong>Status:</strong> ✅ Operacional</p>
                <p style="margin: 0 0 6px 0;"><strong>Remetente:</strong> ${fromField}</p>
                <p style="margin: 0;"><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              </div>
              <p style="font-size: 12px; color: #64748b;">Tudo pronto para enviar confirmações de inscrições e pagamentos automaticamente!</p>
            </div>
          `,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: data.message || 'Erro ao disparar e-mail de teste pelo Resend.',
          details: data,
        });
      }

      return res.status(200).json({
        success: true,
        message: `E-mail de teste enviado com sucesso para ${toEmail}!`,
        id: data.id,
      });
    }

    // Se não informou e-mail de destino, apenas valida a chave consultando a API do Resend (GET /api-keys)
    const checkRes = await fetch('https://api.resend.com/api-keys', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const checkData = await checkRes.json();

    if (!checkRes.ok) {
      if (checkData.name === 'restricted_api_key' || checkData.message?.includes('only send emails')) {
        return res.status(200).json({
          success: true,
          message: 'Chave de API do Resend válida e pronta para envio de e-mails (Permissão: Sending Access)!',
        });
      }
      return res.status(checkRes.status).json({
        success: false,
        error: checkData.message || 'Chave de API do Resend inválida ou sem permissões.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conexão com a API do Resend validada com sucesso!',
      keysCount: checkData.data?.length || 0,
    });
  } catch (error) {
    console.error('Erro em api/resend-test-connection:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao testar conexão com o Resend: ' + error.message,
    });
  }
}
