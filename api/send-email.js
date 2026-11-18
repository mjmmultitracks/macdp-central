// Envio de e-mails de confirmação de inscrição via Resend.
// Proteções: só envia para o e-mail de uma inscrição existente, ignora chave/remetente vindos do navegador,
// limita tamanho e quantidade de envios.
const SUPABASE_URL = () =>
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sbcecbylxoqqbsextkrt.supabase.co';
const SUPABASE_KEY = () =>
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_m_UUQHfeR2u_oUc4M5vffw_Z9xm0jcM';

const hits = new Map();
function tooMany(key, limit, windowMs) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > limit;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** A inscrição pode levar alguns instantes para chegar ao banco: tenta algumas vezes. */
async function registrationHasEmail(registrationId, email) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(
      `${SUPABASE_URL()}/rest/v1/event_registrations?id=eq.${encodeURIComponent(registrationId)}&select=email`,
      { headers: { apikey: SUPABASE_KEY(), Authorization: `Bearer ${SUPABASE_KEY()}` } }
    );
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows[0] && String(rows[0].email || '').trim().toLowerCase() === email) return true;
    }
    await sleep(800);
  }
  return false;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const { to, subject, html, registrationId } = req.body || {};

    const recipient = typeof to === 'string' ? to.trim().toLowerCase() : '';
    if (!/^\S+@\S+\.\S+$/.test(recipient)) {
      return res.status(400).json({ error: 'Destinatário inválido.' });
    }
    if (typeof registrationId !== 'string' || !/^[\w-]{4,80}$/.test(registrationId)) {
      return res.status(400).json({ error: 'Inscrição não informada.' });
    }
    if (typeof subject !== 'string' || !subject.trim() || subject.length > 200 || typeof html !== 'string' || !html.trim() || html.length > 120000) {
      return res.status(400).json({ error: 'Assunto ou conteúdo inválido.' });
    }

    const ip = String(req.headers['x-forwarded-for'] || 'local').split(',')[0].trim();
    if (tooMany(`ip:${ip}`, 10, 10 * 60 * 1000) || tooMany(`reg:${registrationId}`, 3, 60 * 60 * 1000) || tooMany(`to:${recipient}`, 5, 60 * 60 * 1000)) {
      return res.status(429).json({ error: 'Limite de envios atingido. Tente novamente mais tarde.' });
    }

    if (!(await registrationHasEmail(registrationId, recipient))) {
      return res.status(403).json({ error: 'Só enviamos e-mails para inscrições cadastradas.' });
    }

    const apiKey = (process.env.RESEND_API_KEY || '').trim();
    if (!apiKey) {
      return res.status(400).json({ error: 'Envio de e-mail não configurado no servidor.' });
    }

    const senderEmail = process.env.RESEND_FROM_EMAIL || 'eventos@macdp.com.br';
    const senderName = process.env.RESEND_FROM_NAME || 'MACDP Central';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `${senderName} <${senderEmail}>`, to: [recipient], subject: subject.trim(), html }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Erro Resend API:', data);
      return res.status(response.status).json({ error: data.message || 'Falha ao enviar e-mail pelo Resend.' });
    }
    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Erro inesperado em api/send-email:', error);
    return res.status(500).json({ error: 'Erro interno no servidor ao processar envio de e-mail.' });
  }
}
