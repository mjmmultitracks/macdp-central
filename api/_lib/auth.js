// Autenticação do painel: senhas com hash (PBKDF2) e sessão assinada pelo servidor.
import crypto from 'node:crypto';

export const PBKDF2_ITERATIONS = 310000;

const secretKey = () => {
  const base = (process.env.DOROT_PDF_KEY || '').trim();
  return /^[0-9a-f]{64}$/i.test(base) ? base : '';
};

const b64u = (buf) => Buffer.from(buf).toString('base64url');

/** Formato: pbkdf2$<iterações>$<salt base64>$<hash base64> */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(String(password), salt, PBKDF2_ITERATIONS, 32, 'sha256');
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export function verifyPassword(password, stored) {
  try {
    const [scheme, iterations, saltB64, hashB64] = String(stored || '').split('$');
    if (scheme !== 'pbkdf2') return false;
    const iter = parseInt(iterations, 10);
    if (!iter || iter < 100000) return false;
    const expected = Buffer.from(hashB64, 'base64');
    const actual = crypto.pbkdf2Sync(String(password), Buffer.from(saltB64, 'base64'), iter, expected.length, 'sha256');
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/** Token de sessão assinado (HMAC-SHA256). Vale por 12 horas. */
export function signSession(email, ttlMs = 12 * 60 * 60 * 1000) {
  const key = secretKey();
  if (!key) return '';
  const payload = b64u(JSON.stringify({ email, exp: Date.now() + ttlMs }));
  const sig = crypto.createHmac('sha256', key).update(`admin-session:${payload}`).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySession(token) {
  const key = secretKey();
  if (!key || !token) return null;
  const [payload, sig] = String(token).split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', key).update(`admin-session:${payload}`).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

const SUPABASE_URL = () => process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sbcecbylxoqqbsextkrt.supabase.co';
const SUPABASE_KEY = () =>
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_m_UUQHfeR2u_oUc4M5vffw_Z9xm0jcM';

/** Usuários do painel cadastrados no banco. */
export async function fetchAccessUsers() {
  const res = await fetch(`${SUPABASE_URL()}/rest/v1/church_store?key=eq.main_church_db&select=users:data->accessUsers`, {
    headers: { apikey: SUPABASE_KEY(), Authorization: `Bearer ${SUPABASE_KEY()}` },
  });
  if (!res.ok) throw new Error('Falha ao consultar usuários.');
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] && Array.isArray(rows[0].users) ? rows[0].users : [];
}

const attempts = new Map();
/** Limite de tentativas por chave (IP ou e-mail): 8 em 10 minutos, por instância do servidor. */
export function tooManyAttempts(key) {
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > 8;
}
