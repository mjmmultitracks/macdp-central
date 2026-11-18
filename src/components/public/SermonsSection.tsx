import React, { useState } from 'react';
import { Sermon } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Play, Search } from 'lucide-react';

interface SermonsSectionProps {
  sermons: Sermon[];
  onPlaySermon: (sermon: Sermon) => void;
}

const PAGE_SIZE = 6;

export const SermonsSection: React.FC<SermonsSectionProps> = ({ sermons, onPlaySermon }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const term = searchTerm.trim().toLowerCase();
  const featured = sermons[0];
  const isSearching = term.length > 0;

  const list = sermons
    .filter((s) => (isSearching ? true : s.id !== featured?.id))
    .filter(
      (s) =>
        !isSearching ||
        s.title.toLowerCase().includes(term) ||
        s.scripture.toLowerCase().includes(term) ||
        s.preacher.toLowerCase().includes(term) ||
        (s.summary || '').toLowerCase().includes(term)
    );

  return (
    <section id="mensagens" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="msg-head">
          <span className="msg-tag">Mídia e mensagens</span>
          <h2 className="msg-title">Mensagens em destaque</h2>
        </div>

        {featured && !isSearching && (
          <div className="msg-featured">
            <button type="button" className="msg-thumb" onClick={() => onPlaySermon(featured)} aria-label={`Assistir ${featured.title}`}>
              <img src={featured.videoThumbnail} alt="" />
              <span className="msg-play">
                <Play size={26} fill="currentColor" />
              </span>
              {featured.duration && <span className="msg-duration">{featured.duration}</span>}
            </button>

            <div className="msg-featured-info">
              <span className="msg-label">Última mensagem</span>
              <h3>{featured.title}</h3>
              <p className="msg-meta">
                {[featured.preacher, formatDate(featured.date), featured.scripture].filter(Boolean).join(' · ')}
              </p>
              {featured.summary && <p className="msg-summary">{featured.summary}</p>}
              <div className="msg-actions">
                <button type="button" className="msg-btn" onClick={() => onPlaySermon(featured)}>
                  <Play size={15} fill="currentColor" /> Assistir
                </button>
                {featured.audioUrl && (
                  <button type="button" className="msg-link" onClick={() => onPlaySermon(featured)}>
                    Ouvir em áudio
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="msg-search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Buscar mensagem, pregador ou versículo"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setVisible(PAGE_SIZE);
            }}
          />
        </div>

        {list.length === 0 ? (
          <p className="msg-empty">Nenhuma mensagem encontrada.</p>
        ) : (
          <div className="msg-grid">
            {list.slice(0, visible).map((sermon) => (
              <button key={sermon.id} type="button" className="msg-card" onClick={() => onPlaySermon(sermon)}>
                <span className="msg-card-thumb">
                  <img src={sermon.videoThumbnail} alt="" loading="lazy" />
                  <span className="msg-card-play">
                    <Play size={18} fill="currentColor" />
                  </span>
                  {sermon.duration && <span className="msg-duration">{sermon.duration}</span>}
                </span>
                <span className="msg-card-meta">
                  {[sermon.series, formatDate(sermon.date)].filter(Boolean).join(' · ')}
                </span>
                <strong className="msg-card-title">{sermon.title}</strong>
                <span className="msg-card-by">{sermon.preacher}</span>
              </button>
            ))}
          </div>
        )}

        {list.length > visible && (
          <div className="msg-more">
            <button type="button" className="msg-more-btn" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
              Ver mais mensagens
            </button>
          </div>
        )}
      </div>

      <style>{`
        .msg-head { text-align: center; max-width: 40rem; margin: 0 auto 3rem; }
        .msg-tag { display: block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent-gold); margin-bottom: 0.9rem; }
        .msg-title { font-size: clamp(1.9rem, 4vw, 3rem); margin: 0; }

        .msg-featured { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: clamp(1.5rem, 4vw, 3rem); align-items: center; max-width: 1100px; margin: 0 auto 3.5rem; }
        .msg-thumb { position: relative; display: block; width: 100%; aspect-ratio: 16 / 9; padding: 0; border: 0; border-radius: var(--radius-lg); overflow: hidden; cursor: pointer; background: var(--bg-tertiary); }
        .msg-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 300ms ease; }
        .msg-thumb:hover img { transform: scale(1.03); }
        .msg-play { position: absolute; left: 50%; top: 50%; width: 64px; height: 64px; margin: -32px 0 0 -32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding-left: 4px; background: var(--accent-gold-light); color: #0a0a0a; }
        .msg-duration { position: absolute; right: 0.7rem; bottom: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(0, 0, 0, 0.75); color: #fff; font-size: 0.75rem; font-weight: 600; }
        .msg-label { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent-gold); }
        .msg-featured-info h3 { font-size: clamp(1.4rem, 2.6vw, 2rem); margin: 0.6rem 0 0.75rem; line-height: 1.25; }
        .msg-meta { font-size: 0.92rem; color: var(--text-secondary); margin: 0 0 1rem; }
        .msg-summary { font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); margin: 0 0 1.5rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .msg-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 1.25rem; }
        .msg-btn { display: inline-flex; align-items: center; gap: 0.55rem; padding: 0.9rem 1.5rem; border: 2px solid var(--accent-gold-light); border-radius: 4px; background: var(--accent-gold-light); color: #0a0a0a; font-family: var(--font-display); font-size: 0.78rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; transition: background 150ms ease, border-color 150ms ease; }
        .msg-btn:hover { background: #fff; border-color: #fff; }
        .msg-link { background: none; border: 0; padding: 0; cursor: pointer; font-weight: 600; font-size: 0.95rem; color: var(--text-primary); text-decoration: underline; text-underline-offset: 4px; text-decoration-color: var(--border-medium); }
        .msg-link:hover { text-decoration-color: var(--accent-gold); }

        .msg-search { display: flex; align-items: center; gap: 0.7rem; max-width: 1100px; margin: 0 auto 1.75rem; padding: 0 0.25rem 0.75rem; border-bottom: 1px solid var(--border-medium); color: var(--text-muted); }
        .msg-search input { flex: 1; min-width: 0; background: none; border: 0; outline: 0; color: var(--text-primary); font-size: 1rem; padding: 0.25rem 0; }
        .msg-search input::placeholder { color: var(--text-muted); }
        .msg-search:focus-within { border-bottom-color: var(--accent-gold); }

        .msg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem 1.5rem; max-width: 1100px; margin: 0 auto; }
        .msg-card { display: flex; flex-direction: column; gap: 0.3rem; padding: 0; background: none; border: 0; text-align: left; color: var(--text-primary); cursor: pointer; }
        .msg-card-thumb { position: relative; display: block; aspect-ratio: 16 / 9; border-radius: var(--radius-md); overflow: hidden; background: var(--bg-tertiary); margin-bottom: 0.5rem; }
        .msg-card-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 300ms ease; }
        .msg-card:hover .msg-card-thumb img { transform: scale(1.04); }
        .msg-card-play { position: absolute; right: 0.7rem; bottom: 0.7rem; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding-left: 2px; background: var(--accent-gold-light); color: #0a0a0a; opacity: 0; transform: translateY(6px); transition: opacity 200ms ease, transform 200ms ease; }
        .msg-card:hover .msg-card-play, .msg-card:focus-visible .msg-card-play { opacity: 1; transform: none; }
        .msg-card-thumb .msg-duration { right: auto; left: 0.6rem; }
        .msg-card-meta { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.04em; color: var(--accent-gold); }
        .msg-card-title { font-size: 1.05rem; font-weight: 700; line-height: 1.35; }
        .msg-card-by { font-size: 0.88rem; color: var(--text-secondary); }
        .msg-empty { text-align: center; color: var(--text-secondary); padding: 2rem 0; }
        .msg-more { text-align: center; margin-top: 2.5rem; }
        .msg-more-btn { padding: 0.8rem 1.6rem; border: 2px solid var(--border-medium); border-radius: 4px; background: none; color: var(--text-primary); font-family: var(--font-display); font-size: 0.78rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; }
        .msg-more-btn:hover { border-color: var(--text-primary); }
        @media (max-width: 820px) { .msg-featured { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
};
