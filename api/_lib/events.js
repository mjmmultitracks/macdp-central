// Preços dos eventos conferidos no servidor (o navegador não define o valor da inscrição).
const SUPABASE_URL = () =>
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sbcecbylxoqqbsextkrt.supabase.co';
const SUPABASE_KEY = () =>
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_m_UUQHfeR2u_oUc4M5vffw_Z9xm0jcM';

/** Retorna { amount, title } calculado a partir do cadastro do evento, ou null se não existir. */
export async function getEventAmount(eventId, includeShirt) {
  const res = await fetch(
    `${SUPABASE_URL()}/rest/v1/church_store?key=eq.main_church_db&select=events:data->events`,
    { headers: { apikey: SUPABASE_KEY(), Authorization: `Bearer ${SUPABASE_KEY()}` } }
  );
  if (!res.ok) throw new Error('Não foi possível consultar o evento.');
  const rows = await res.json();
  const events = Array.isArray(rows) && rows[0] && Array.isArray(rows[0].events) ? rows[0].events : [];
  const event = events.find((e) => e && e.id === eventId);
  if (!event) return null;

  const ticket = event.isFree ? 0 : Number(event.price) || 0;
  const shirt = includeShirt && event.hasShirt ? Number(event.shirtPrice) || 0 : 0;
  return { amount: Number((ticket + shirt).toFixed(2)), title: String(event.title || '') };
}
