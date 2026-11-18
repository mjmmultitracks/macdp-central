import React from 'react';
import { Music, Play, MessageCircle } from 'lucide-react';
import { MUSIC_RELEASES, MUSIC_WHATSAPP_NUMBER, MUSIC_INVITE_MESSAGE } from '../../data/musicReleases';

const inviteUrl = `https://wa.me/${MUSIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(MUSIC_INVITE_MESSAGE)}`;

const formatReleaseDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return '';
  const text = new Date(y, m - 1, d).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const MusicSection: React.FC = () => {
  const releases = [...MUSIC_RELEASES].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return (
    <section id="music" className="section music" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="music-head">
          <div>
            <span className="music-tag">Ministério de Louvor</span>
            <h2 className="music-title">Caçadores da Presença Music</h2>
            <p className="music-lead">
              O ministério de louvor da MACDP. Adoração que nasce na presença de Deus, nos cultos e também fora deles.
            </p>
          </div>
          <a href={inviteUrl} target="_blank" rel="noreferrer" className="music-invite">
            <MessageCircle size={18} />
            Convidar para um evento
          </a>
        </div>

        {releases.length > 0 && (
          <div className="music-releases">
            <h3 className="music-sub">Últimos lançamentos</h3>
            <div className="music-grid">
              {releases.map((r) => (
                <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="music-card">
                  <span className="music-cover">
                    {r.coverUrl ? <img src={r.coverUrl} alt={`Capa de ${r.title}`} loading="lazy" /> : <Music size={36} />}
                    <span className="music-play">
                      <Play size={18} fill="currentColor" />
                    </span>
                  </span>
                  <strong className="music-name">{r.title}</strong>
                  <span className="music-meta">
                    {[formatReleaseDate(r.date), r.platform].filter(Boolean).join(' · ')}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .music-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; flex-wrap: wrap; max-width: 1100px; margin: 0 auto; }
        .music-tag { display: block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent-gold); margin-bottom: 0.9rem; }
        .music-title { font-size: clamp(1.9rem, 4vw, 3rem); margin: 0 0 1rem; }
        .music-lead { font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary); max-width: 34rem; margin: 0; }
        .music-invite {
          display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.95rem 1.6rem;
          font-family: var(--font-display); font-size: 0.8rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase;
          background: var(--accent-gold-light); color: #0a0a0a; border: 2px solid var(--accent-gold-light); border-radius: 4px;
          transition: background 150ms ease, border-color 150ms ease;
        }
        .music-invite:hover { background: #fff; border-color: #fff; }
        .music-releases { max-width: 1100px; margin: 3.5rem auto 0; }
        .music-sub { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); margin: 0 0 1.25rem; padding-top: 1.5rem; border-top: 1px solid var(--border-medium); }
        .music-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }
        .music-card { display: flex; flex-direction: column; gap: 0.35rem; color: var(--text-primary); }
        .music-cover {
          position: relative; display: flex; align-items: center; justify-content: center; aspect-ratio: 16 / 9; overflow: hidden;
          border-radius: var(--radius-md); background: var(--bg-tertiary); color: var(--text-muted); margin-bottom: 0.45rem;
        }
        .music-cover img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 300ms ease; }
        .music-card:hover .music-cover img { transform: scale(1.04); }
        .music-play {
          position: absolute; right: 0.7rem; bottom: 0.7rem; width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; background: var(--accent-gold-light); color: #0a0a0a;
          opacity: 0; transform: translateY(6px); transition: opacity 200ms ease, transform 200ms ease;
        }
        .music-card:hover .music-play, .music-card:focus-visible .music-play { opacity: 1; transform: none; }
        .music-name { font-size: 1rem; font-weight: 700; line-height: 1.35; }
        .music-meta { font-size: 0.85rem; color: var(--text-secondary); }
        @media (max-width: 640px) { .music-invite { width: 100%; justify-content: center; } }
      `}</style>
    </section>
  );
};
