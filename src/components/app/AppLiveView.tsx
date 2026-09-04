import React, { useState } from 'react';
import { ChurchSettings } from '../../types';
import {
  Radio,
  Share2,
  Heart,
  MessageSquare,
  DollarSign,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Users,
  Check,
  Send,
} from 'lucide-react';

interface AppLiveViewProps {
  churchSettings?: ChurchSettings;
  onOpenGiving: () => void;
  onOpenPrayer: () => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AppLiveView: React.FC<AppLiveViewProps> = ({
  churchSettings,
  onOpenGiving,
  onOpenPrayer,
  onNotify,
}) => {
  const appSettings = churchSettings?.appSettings;
  const isLive = appSettings?.isLiveNow ?? true;
  const liveTitle = appSettings?.liveTitle || 'Culto da Presença Ao Vivo';
  const liveSubtitle =
    appSettings?.liveSubtitle || 'Transmissão Oficial Direto do Altar • Templo Central';
  const liveStreamUrl =
    appSettings?.liveStreamUrl || churchSettings?.social?.youtube || 'https://www.youtube.com/@_macdp';

  // State for live notes
  const [liveNote, setLiveNote] = useState('');
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(148);
  const [hasLiked, setHasLiked] = useState(false);

  // Helper para embed do YouTube
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/embed/')) return url;
    if (url.includes('watch?v=')) {
      const id = url.split('watch?v=')[1]?.split('&')[0];
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
    }
    if (url.includes('/live')) {
      // Ex: https://www.youtube.com/@_macdp/live
      return url;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(liveStreamUrl);

  const handleShareLive = () => {
    const shareText = `🔴 Assista ao Culto Ao Vivo da ${churchSettings?.shortName || 'MACDP'} agora mesmo:\n"${liveTitle}"\n\nLink: ${window.location.origin}/?app=true#live`;
    if (navigator.share) {
      navigator.share({ title: liveTitle, text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      onNotify('success', 'Link da transmissão ao vivo copiado!');
    }
  };

  const handleSaveNote = () => {
    if (!liveNote.trim()) return;
    try {
      const notesKey = 'macdp_app_sermon_notes';
      const existing = JSON.parse(localStorage.getItem(notesKey) || '[]');
      const newEntry = {
        id: `note_${Date.now()}`,
        title: `Anotações do Culto: ${liveTitle}`,
        content: liveNote,
        date: new Date().toLocaleDateString('pt-BR'),
        updatedAt: new Date().toISOString(),
      };
      existing.unshift(newEntry);
      localStorage.setItem(notesKey, JSON.stringify(existing));
      setIsNoteSaved(true);
      onNotify('success', 'Anotações do culto salvas no seu caderno pessoal!');
      setTimeout(() => setIsNoteSaved(false), 2500);
    } catch {
      onNotify('error', 'Erro ao salvar anotação.');
    }
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
      onNotify('success', 'Amém! Você interagiu com o culto.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3.5rem' }}>
      {/* Player de Transmissão Ao Vivo */}
      <div
        style={{
          background: '#0B1120',
          borderRadius: '24px',
          overflow: 'hidden',
          border: isLive ? '2px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border-subtle)',
          boxShadow: isLive ? '0 10px 30px rgba(239, 68, 68, 0.2)' : 'var(--shadow-md)',
          position: 'relative',
        }}
      >
        {/* Status Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: isLive ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 42, 0.85)',
            color: '#FFFFFF',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            backdropFilter: 'blur(6px)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          {isLive ? (
            <>
              <span className="live-pulse" style={{ width: '8px', height: '8px' }} />
              <span>AO VIVO AGORA</span>
            </>
          ) : (
            <>
              <Clock size={12} />
              <span>OFFLINE NO MOMENTO</span>
            </>
          )}
        </div>

        {/* Viewers Simulation */}
        {isLive && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(15, 23, 42, 0.75)',
              color: '#F8FAFC',
              padding: '0.35rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.725rem',
              fontWeight: 600,
              backdropFilter: 'blur(6px)',
            }}
          >
            <Users size={12} color="#10B981" />
            <span>284 assistindo</span>
          </div>
        )}

        {/* Video Screen Container */}
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          {embedUrl && isLive ? (
            <iframe
              src={embedUrl}
              title={liveTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.15) 0%, #0B1120 75%)',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: isLive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                  border: isLive ? '2px solid #EF4444' : '2px solid var(--accent-gold)',
                  color: isLive ? '#EF4444' : 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  boxShadow: isLive ? '0 0 25px rgba(239, 68, 68, 0.4)' : 'none',
                }}
              >
                <Radio size={30} />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.4rem 0' }}>
                {liveTitle}
              </h3>

              <p style={{ color: '#94A3B8', fontSize: '0.85rem', maxWidth: '380px', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                {isLive
                  ? 'Nossa transmissão oficial está disponível em nosso canal oficial do YouTube.'
                  : 'Nossos cultos são transmitidos ao vivo aos domingos (10:00 e 18:30) e quartas (19:30).'}
              </p>

              <a
                href={liveStreamUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-sm"
                style={{ gap: '0.4rem' }}
              >
                <span>Acessar Transmissão Oficial</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Título & Detalhes do Culto */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
              {liveTitle}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              {liveSubtitle}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleLike}
              style={{
                background: hasLiked ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-tertiary)',
                border: hasLiked ? '1px solid #EF4444' : '1px solid var(--border-subtle)',
                color: hasLiked ? '#EF4444' : 'var(--text-secondary)',
                borderRadius: '12px',
                padding: '0.45rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Heart size={16} fill={hasLiked ? '#EF4444' : 'none'} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={handleShareLive}
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                borderRadius: '12px',
                padding: '0.45rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Share2 size={16} />
              <span>Compartilhar</span>
            </button>
          </div>
        </div>

        {/* Botões Rápidos de Ação durante o Culto */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            onClick={onOpenPrayer}
            className="btn btn-secondary"
            style={{
              padding: '0.65rem 0.9rem',
              fontSize: '0.85rem',
              gap: '0.5rem',
              borderRadius: '14px',
              justifyContent: 'center',
            }}
          >
            <MessageSquare size={16} color="var(--accent-gold)" />
            <span>Pedir Oração no Culto</span>
          </button>

          <button
            onClick={onOpenGiving}
            className="btn btn-primary"
            style={{
              padding: '0.65rem 0.9rem',
              fontSize: '0.85rem',
              gap: '0.5rem',
              borderRadius: '14px',
              justifyContent: 'center',
            }}
          >
            <DollarSign size={16} />
            <span>Dízimos & Ofertas (PIX)</span>
          </button>
        </div>
      </div>

      {/* Caderno de Anotações do Sermão Durante a Live */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <FileText size={18} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Minhas Anotações do Culto
          </h3>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0' }}>
          Anote as palavras proféticas, versículos e pontos principais da ministração. Ficará salvo no seu aparelho!
        </p>

        <textarea
          rows={4}
          value={liveNote}
          onChange={(e) => setLiveNote(e.target.value)}
          placeholder="Ex: Ponto 1: A presença de Deus exige santidade... Versículo citado: Isaías 6..."
          style={{
            width: '100%',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '0.75rem 1rem',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            outline: 'none',
            resize: 'vertical',
            marginBottom: '0.75rem',
            fontFamily: 'inherit',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSaveNote}
            disabled={!liveNote.trim()}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem', padding: '0.5rem 1rem' }}
          >
            {isNoteSaved ? <Check size={15} color="#10B981" /> : <Send size={15} />}
            <span>{isNoteSaved ? 'Anotação Salva!' : 'Salvar no Meu Caderno'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
