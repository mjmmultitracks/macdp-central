import React, { useState } from 'react';
import { Sermon } from '../../types';
import {
  Play,
  Headphones,
  Calendar,
  BookOpen,
  Share2,
  Clock,
  Search,
  Pause,
  RotateCcw,
  FastForward,
  Volume2,
  X,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface AppMediaViewProps {
  sermons: Sermon[];
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AppMediaView: React.FC<AppMediaViewProps> = ({ sermons, onNotify }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Sermon | null>(null);

  // Audio Player State
  const [activeAudioSermon, setActiveAudioSermon] = useState<Sermon | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const filteredSermons = (sermons || []).filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.title.toLowerCase().includes(term) ||
      s.preacher.toLowerCase().includes(term) ||
      s.series.toLowerCase().includes(term) ||
      s.scripture.toLowerCase().includes(term)
    );
  });

  const handlePlayAudio = (sermon: Sermon) => {
    setActiveAudioSermon(sermon);
    setIsPlayingAudio(true);
    onNotify('info', `Tocando áudio: "${sermon.title}"`);
  };

  const handleShareSermon = (sermon: Sermon) => {
    const text = `🎧 Ouça esta palavra poderosa ministrada na MACDP:\n"${sermon.title}" por ${sermon.preacher}\n\nLink: ${window.location.origin}/?app=true#midias`;
    if (navigator.share) {
      navigator.share({ title: sermon.title, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      onNotify('success', 'Link da mensagem copiado com sucesso!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '5rem' }}>
      {/* Search & Tabs */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)',
          padding: '1rem',
        }}
      >
        {/* Search Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-tertiary)',
            padding: '0.6rem 0.85rem',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '0.75rem',
          }}
        >
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Buscar pregações, pregadores ou temas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '0.875rem',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('video')}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'video' ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
              color: activeTab === 'video' ? '#0B1120' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Play size={15} fill={activeTab === 'video' ? '#0B1120' : 'none'} />
            <span>Vídeos & Pregações ({filteredSermons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'audio' ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
              color: activeTab === 'audio' ? '#0B1120' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Headphones size={15} />
            <span>Podcasts de Áudio</span>
          </button>
        </div>
      </div>

      {/* Sermons Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredSermons.map((sermon) => (
          <div
            key={sermon.id}
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Media Thumbnail Container */}
            <div
              style={{
                position: 'relative',
                paddingBottom: '50%',
                background: '#0B1120',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (activeTab === 'video') {
                  setSelectedVideo(sermon);
                } else {
                  handlePlayAudio(sermon);
                }
              }}
            >
              <img
                src={sermon.videoThumbnail || '/images/hero.jpg'}
                alt={sermon.title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.85,
                }}
              />

              {/* Gradient Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(11, 17, 32, 0.9) 0%, transparent 60%)',
                }}
              />

              {/* Play Button Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.9)',
                  color: '#0B1120',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(245, 158, 11, 0.5)',
                }}
              >
                {activeTab === 'video' ? (
                  <Play size={24} fill="#0B1120" style={{ marginLeft: '3px' }} />
                ) : (
                  <Headphones size={24} />
                )}
              </div>

              {/* Badge Series & Duration */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                  {sermon.series}
                </span>

                <span
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    color: '#FFFFFF',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {sermon.duration}
                </span>
              </div>
            </div>

            {/* Sermon Details */}
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                <Calendar size={13} />
                <span>{formatDate(sermon.date)}</span>
                <span>•</span>
                <span>{sermon.preacher}</span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: 'var(--text-primary)' }}>
                {sermon.title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                <BookOpen size={14} />
                <span>{sermon.scripture}</span>
              </div>

              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                {sermon.summary}
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setSelectedVideo(sermon)}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.35rem', padding: '0.4rem 0.85rem', fontSize: '0.775rem' }}
                  >
                    <Play size={14} />
                    <span>Assistir</span>
                  </button>

                  <button
                    onClick={() => handlePlayAudio(sermon)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.35rem', padding: '0.4rem 0.85rem', fontSize: '0.775rem' }}
                  >
                    <Headphones size={14} />
                    <span>Ouvir Áudio</span>
                  </button>
                </div>

                <button
                  onClick={() => handleShareSermon(sermon)}
                  title="Compartilhar"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    borderRadius: '10px',
                    padding: '0.45rem',
                    cursor: 'pointer',
                  }}
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Persistent Bottom Audio Player Bar */}
      {activeAudioSermon && (
        <div
          className="animate-page-enter"
          style={{
            position: 'fixed',
            bottom: '72px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 24px)',
            maxWidth: '480px',
            background: 'var(--bg-secondary)',
            backgroundImage: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, var(--bg-secondary) 100%)',
            border: '1px solid var(--accent-gold)',
            borderRadius: '18px',
            padding: '0.85rem 1rem',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--accent-gold)',
                  color: '#0B1120',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Headphones size={18} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <strong
                  style={{
                    fontSize: '0.85rem',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    color: 'var(--text-primary)',
                  }}
                >
                  {activeAudioSermon.title}
                </strong>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {activeAudioSermon.preacher}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  const speeds = [1, 1.25, 1.5, 2];
                  const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                  setPlaybackSpeed(nextSpeed);
                }}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  borderRadius: '8px',
                  padding: '0.2rem 0.45rem',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {playbackSpeed}x
              </button>

              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--accent-gold)',
                  color: '#0B1120',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {isPlayingAudio ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
              </button>

              <button
                onClick={() => setActiveAudioSermon(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.3rem',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <audio
            src={activeAudioSermon.audioUrl}
            autoPlay={isPlayingAudio}
            controls
            style={{ width: '100%', height: '30px' }}
          />
        </div>
      )}

      {/* Video Modal Player */}
      {selectedVideo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(5, 8, 16, 0.9)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="animate-page-enter"
            style={{
              width: '100%',
              maxWidth: '680px',
              background: 'var(--bg-secondary)',
              borderRadius: '24px',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {selectedVideo.title}
              </h3>
              <button
                onClick={() => setSelectedVideo(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#0B1120' }}>
              {selectedVideo.videoEmbedUrl ? (
                <iframe
                  src={selectedVideo.videoEmbedUrl}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Esta ministração está disponível no canal oficial do YouTube.
                  </p>
                  <a
                    href="https://www.youtube.com/@_macdp"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    Abrir Canal do YouTube
                  </a>
                </div>
              )}
            </div>

            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-gold">{selectedVideo.series}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {formatDate(selectedVideo.date)} • {selectedVideo.duration}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {selectedVideo.summary}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
