// Login do painel: confere e-mail e senha (hash) no servidor e devolve uma sessão assinada.
import { fetchAccessUsers, signSession, tooManyAttempts, verifyPassword } from './_lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });

  const ip = String(req.headers['x-forwarded-for'] || 'local').split(',')[0].trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (tooManyAttempts(`ip:${ip}`) || (email && tooManyAttempts(`mail:${email}`))) {
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' });
  }
  if (!email || !password) return res.status(400).json({ error: 'Informe o e-mail e a senha de acesso.' });

  try {
    const users = await fetchAccessUsers();
    const user = users.find((u) => String(u.email || '').toLowerCase() === email);
    const ok = !!user && verifyPassword(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }
    if (user.status === 'bloqueado') {
      return res.status(403).json({ error: 'Seu acesso ao painel foi bloqueado pela administração da igreja.' });
    }
    const token = signSession(email);
    if (!token) return res.status(503).json({ error: 'Login indisponível no momento.' });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleType: user.roleType,
        roleTitle: user.roleTitle,
        allowedModules: user.allowedModules || [],
        canEdit: user.canEdit ?? true,
      },
    });
  } catch (err) {
    console.error('[admin-login]', err);
    return res.status(500).json({ error: 'Não foi possível entrar agora. Tente novamente.' });
  }
}
