import React, { useState } from 'react';
import { Sermon } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  Video,
  Headphones,
  Play,
  Search,
  BookOpen,
  Calendar,
  Share2,
  Download,
  Filter,
} from 'lucide-react';

interface SermonsSectionProps {
  sermons: Sermon[];
  onPlaySermon: (sermon: Sermon) => void;
}

export const SermonsSection: React.FC<SermonsSectionProps> = ({ sermons, onPlaySermon }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPreacher, setSelectedPreacher] = useState('todos');
  const [selectedSeries, setSelectedSeries] = useState('todos');

  const preachers = Array.from(new Set(sermons.map((s) => s.preacher)));
  const seriesList = Array.from(new Set(sermons.map((s) => s.series)));

  const filteredSermons = sermons.filter((s) => {
    const matchSearch =
      !searchTerm ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.scripture.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchPreacher = selectedPreacher === 'todos' || s.preacher === selectedPreacher;
    const matchSeries = selectedSeries === 'todos' || s.series === selectedSeries;

    return matchSearch && matchPreacher && matchSeries;
  });

  const featuredSermon = sermons[0];

  return (
    <section id="mensagens" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">
            <Video size={14} /> Palavra & Ensino
          </span>
          <h2 className="section-title">Mídia & Mensagens em Destaque</h2>
          <p className="section-subtitle">
            Aprofunde seus conhecimentos nas Escrituras Sagradas através de nossas pregações dominicais, séries temáticas e podcasts semanais.
          </p>
        </div>

        {/* Featured Latest Sermon Banner */}
        {featuredSermon && (
          <div
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              marginBottom: '4rem',
              boxShadow: 'var(--shadow-lg)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            }}
          >
            {/* Thumbnail with overlay play */}
            <div
              onClick={() => onPlaySermon(featuredSermon)}
              style={{
                position: 'relative',
                minHeight: '320px',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              <img
                src={featuredSermon.videoThumbnail}
                alt={featuredSermon.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(11, 17, 32, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
              >
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: '#0B1120',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingLeft: '4px',
                    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.5)',
                  }}
                >
                  <Play size={28} fill="currentColor" />
                </div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  right: '1rem',
                  background: 'rgba(11, 17, 32, 0.8)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {featuredSermon.duration}
              </div>
            </div>

            {/* Content Details */}
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span className="badge badge-gold">Última Mensagem</span>
                <span className="badge badge-blue">{featuredSermon.series}</span>
              </div>

              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.25 }}>
                {featuredSermon.title}
              </h3>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                <span>Por <strong>{featuredSermon.preacher}</strong> ({featuredSermon.preacherRole})</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} /> {formatDate(featuredSermon.date)}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-gold)' }}>
                  <BookOpen size={14} /> {featuredSermon.scripture}
                </span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                {featuredSermon.summary}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  onClick={() => onPlaySermon(featuredSermon)}
                  className="btn btn-primary"
                  style={{ gap: '0.5rem' }}
                >
                  <Play size={16} fill="currentColor" />
                  <span>Assistir Vídeo Completo</span>
                </button>
                <button
                  onClick={() => onPlaySermon(featuredSermon)}
                  className="btn btn-secondary"
                  style={{ gap: '0.5rem' }}
                >
                  <Headphones size={16} />
                  <span>Ouvir em Áudio / Podcast</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '2.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          {/* Text search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Pesquisar por título, versículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Preacher select */}
          <div>
            <select
              className="form-select"
              value={selectedPreacher}
              onChange={(e) => setSelectedPreacher(e.target.value)}
            >
              <option value="todos">Todos os Pregadores</option>
              {preachers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Series select */}
          <div>
            <select
              className="form-select"
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
            >
              <option value="todos">Todas as Séries</option>
              {seriesList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sermons Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {filteredSermons.map((sermon) => (
            <div
              key={sermon.id}
              className="card card-hover"
              style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div
                onClick={() => onPlaySermon(sermon)}
                style={{
                  position: 'relative',
                  height: '180px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={sermon.videoThumbnail}
                  alt={sermon.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(11, 17, 32, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(245, 158, 11, 0.9)',
                      color: '#0B1120',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingLeft: '3px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    }}
                  >
                    <Play size={20} fill="currentColor" />
                  </div>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0.75rem',
                    right: '0.75rem',
                    background: 'rgba(11, 17, 32, 0.85)',
                    color: '#fff',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {sermon.duration}
                </div>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                    {sermon.series}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatDate(sermon.date)}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  {sermon.title}
                </h4>

                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Pregador: <strong>{sermon.preacher}</strong>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <BookOpen size={13} color="var(--accent-gold)" />
                  <span>{sermon.scripture}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem', marginTop: 'auto' }}>
                  {sermon.tags.map((t, idx) => (
                    <span key={idx} className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onPlaySermon(sermon)}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', gap: '0.4rem' }}
                >
                  <Play size={14} />
                  <span>Assistir / Ouvir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
