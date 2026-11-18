// Confere se a sessão do painel (token assinado) ainda é válida.
import { fetchAccessUsers, verifySession } from './_lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const session = verifySession(token);
  if (!session) return res.status(401).json({ valid: false });
  try {
    const users = await fetchAccessUsers();
    const user = users.find((u) => String(u.email || '').toLowerCase() === session.email);
    if (!user || user.status === 'bloqueado') return res.status(401).json({ valid: false });
    return res.status(200).json({ valid: true, email: session.email });
  } catch {
    // Se o banco falhar, mantém a sessão (o token assinado já é válido)
    return res.status(200).json({ valid: true, email: session.email });
  }
}
