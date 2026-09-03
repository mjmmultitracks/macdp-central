// Serverless function to serve dynamic OpenGraph meta tags for WhatsApp, Facebook, Telegram, etc.
const FALLBACK_EVENTS = {
  evt_1: {
    title: 'Conferência Caçadores da Presença 2026',
    description: 'Três dias inesquecíveis de louvor profético, ministração da Palavra e capacitação espiritual para toda a família na Chácara Paraiso Verde.',
    date: '13 a 15 de Novembro de 2026 às 19h30',
    location: 'Chácara Paraiso Verde - Iranduba - AM',
    imageUrl: 'https://macdp.com.br/images/hero.jpg',
  },
  evt_2: {
    title: 'Retiro da Juventude Caçadores: Profundidade',
    description: 'Três dias de imersão espiritual, jejum, pregação bíblica e fogo do Espírito Santo.',
    date: '10 a 12 de Outubro de 2026 às 18h00',
    location: 'Sítio Recanto da Paz - Rio Preto da Eva - AM',
    imageUrl: 'https://macdp.com.br/images/fellowship.jpg',
  },
  evt_3: {
    title: 'Vigília Apostólica: O Fogo Nunca se Apagará',
    description: 'Uma noite inteira de oração fervorosa, intercessão pelas famílias, imposição de mãos e busca pelo Espírito Santo.',
    date: '04 de Dezembro de 2026 às 22h00',
    location: 'Templo Central MACDP - Manaus/AM',
    imageUrl: 'https://macdp.com.br/images/hero.jpg',
  },
  evt_4: {
    title: 'Conferência de Mulheres: Preciosas & Fortes',
    description: 'Um encontro transformador para mulheres que desejam florescer em graça, autoridade espiritual e restauração emocional.',
    date: '18 de Setembro de 2026 às 19h00',
    location: 'Templo Central MACDP - Manaus/AM',
    imageUrl: 'https://macdp.com.br/images/fellowship.jpg',
  },
  evt_5: {
    title: 'Escola de Líderes e Discipulado Apostólico',
    description: 'Capacitação teológica e prática para novos líderes de célula, diáconos e obreiros.',
    date: '05 de Novembro de 2026 às 19h30',
    location: 'Auditório Anexo MACDP - Manaus/AM',
    imageUrl: 'https://macdp.com.br/images/hero.jpg',
  },
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  const eventId = (req.query?.id || '').trim();
  let event = FALLBACK_EVENTS[eventId];

  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://sbcecbylxoqqbsextkrt.supabase.co';
  const supabaseKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'sb_publishable_m_UUQHfeR2u_oUc4M5vffw_Z9xm0jcM';

  if (eventId) {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/events?id=eq.${encodeURIComponent(eventId)}&select=*`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      if (response.ok) {
        const rows = await response.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const row = rows[0];
          event = {
            title: row.title || event?.title || 'Evento Especial',
            description:
              row.description ||
              event?.description ||
              'Participe conosco no Ministério Apostólico Caçadores da Presença!',
            date: row.date ? `${row.date}${row.time ? ' às ' + row.time : ''}` : (event?.date || ''),
            location: row.location || event?.location || 'Templo Central MACDP',
            imageUrl: row.image_url || event?.imageUrl || '/images/hero.jpg',
          };
        }
      }
    } catch (err) {
      console.warn('Erro ao consultar evento no Supabase:', err);
    }
  }

  // Se ainda não encontrou evento específico, usa o evento padrão da conferência
  if (!event) {
    event = FALLBACK_EVENTS.evt_1;
  }

  // Prepara URL absoluta da imagem (WhatsApp exige obrigatoriamente https:// absoluta)
  let fullImageUrl = event.imageUrl || 'https://macdp.com.br/images/hero.jpg';
  if (fullImageUrl.startsWith('data:')) {
    fullImageUrl = 'https://macdp.com.br/images/hero.jpg';
  } else if (fullImageUrl.startsWith('/')) {
    fullImageUrl = `https://macdp.com.br${fullImageUrl}`;
  } else if (!fullImageUrl.startsWith('http://') && !fullImageUrl.startsWith('https://')) {
    fullImageUrl = `https://macdp.com.br/${fullImageUrl}`;
  }

  const title = `${event.title} - MACDP Central`;
  const description = `${event.date ? `📅 ${event.date} • ` : ''}${event.location ? `📍 ${event.location} • ` : ''}${event.description || ''}`;
  const canonicalUrl = `https://macdp.com.br/evento/${eventId || 'evt_1'}`;
  const redirectTarget = `/#evento/${eventId || 'evt_1'}`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>

  <!-- Primary Meta Tags -->
  <meta name="title" content="${escapeHtml(title)}">
  <meta name="description" content="${escapeHtml(description)}">

  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${escapeHtml(event.title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${fullImageUrl}">
  <meta property="og:image:secure_url" content="${fullImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(event.title)}">
  <meta property="og:site_name" content="Ministério Apostólico Caçadores da Presença (MACDP)">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${escapeHtml(event.title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${fullImageUrl}">

  <!-- Instant Browser Redirect to Single Page App for human visitors -->
  <meta http-equiv="refresh" content="0;url=${redirectTarget}">
  <script>
    window.location.replace('${redirectTarget}');
  </script>
</head>
<body style="background: #0b1120; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; padding: 20px;">
  <div style="max-width: 500px; padding: 32px; border-radius: 16px; background: #0f172a; border: 1px solid rgba(245,158,11,0.35); box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
    <img src="${fullImageUrl}" alt="${escapeHtml(event.title)}" style="width: 100%; height: 220px; object-fit: cover; border-radius: 12px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1);" />
    <h2 style="color: #f59e0b; margin: 0 0 10px 0; font-size: 1.35rem;">${escapeHtml(event.title)}</h2>
    <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.5; margin: 0 0 20px 0;">Redirecionando para a página de inscrição oficial...</p>
    <a href="${redirectTarget}" style="display: inline-block; background: linear-gradient(135deg, #d97706, #f59e0b); color: #0b1120; font-weight: 800; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 0.95rem;">
      Abrir Inscrição do Evento
    </a>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(html);
}
