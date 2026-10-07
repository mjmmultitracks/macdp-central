import React from 'react';
import { Play, Calendar, Heart, MapPin, Sparkles, ChevronRight, ShieldCheck, ArrowRight, Clock } from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
  onOpenLiveModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onOpenLiveModal }) => {
  return (
    <section
      className="hero-section"
      style={{
        position: 'relative',
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '7.5rem 1.5rem 4rem 1.5rem',
        overflow: 'hidden',
      }}
    >
      {/* Background Image & Atmospheric Modern Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('/images/hero-section.jpg?v=5')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          transform: 'scale(1.02)',
          zIndex: 1,
        }}
      />
      {/* Dynamic Multi-stop Premium Gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(11, 17, 32, 0.72) 0%, rgba(11, 17, 32, 0.88) 55%, var(--bg-primary) 100%)',
          zIndex: 2,
        }}
      />

      {/* Atmospheric Gold Radial Glows */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '650px',
          height: '350px',
          background: 'radial-gradient(ellipse, rgba(245, 158, 11, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 3, maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          
          {/* Header Badge: Logo + Transmissão Ao Vivo Unificados */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.45rem 1rem 0.45rem 0.55rem',
              borderRadius: '9999px',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(245, 158, 11, 0.15)',
              backdropFilter: 'blur(16px)',
              marginBottom: '1.75rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
            onClick={onOpenLiveModal}
            className="card-hover"
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#0b1120',
                border: '1.5px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img
                src="/images/logo.png"
                alt="MACDP"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="live-pulse" style={{ width: '8px', height: '8px' }} />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.2px' }}>
                Cultos Ao Vivo • Domingo às 10h e 18h30
              </span>
            </div>

            <ChevronRight size={15} color="#f59e0b" />
          </div>

          {/* Typography: Título Forte, Direto e Imersivo */}
          <h1
            style={{
              fontSize: 'clamp(2.3rem, 5.2vw, 3.8rem)',
              fontWeight: 900,
              lineHeight: 1.14,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              marginBottom: '1rem',
              textShadow: '0 4px 24px rgba(0, 0, 0, 0.7)',
            }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 60%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Proibido a Entrada
            </span>{' '}
            de Pessoas Perfeitas.
          </h1>

          {/* Mini-tag institucional */}
          <div
            style={{
              display: 'inline-block',
              fontSize: '0.88rem',
              fontWeight: 800,
              color: '#fcd34d',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '1.25rem',
            }}
          >
            Ministério Apostólico Caçadores da Presença • Manaus/AM
          </div>

          {/* Subtitle Objetivo & Direto */}
          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
              color: '#cbd5e1',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto 2.5rem auto',
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)',
            }}
          >
            Uma igreja acolhedora, bíblica e apaixonada pela Presença de Deus, liderada pelos pastores presidentes{' '}
            <strong style={{ color: '#ffffff' }}>Oziel e Midiã Gomes Maduro</strong>. Venha viver um encontro transformador em família.
          </p>

          {/* Action CTAs: Botões Claros e Segmentados */}
          <div
            className="hero-cta-buttons"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.85rem',
              marginBottom: '3.5rem',
            }}
          >
            <button
              onClick={() => onNavigate('eventos')}
              className="btn btn-primary btn-lg"
              style={{
                gap: '0.55rem',
                padding: '0.85rem 1.75rem',
                fontWeight: 800,
                fontSize: '0.95rem',
                boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)',
              }}
            >
              <Calendar size={18} />
              <span>Conferências & Cultos</span>
            </button>

            <button
              onClick={onOpenLiveModal}
              className="btn btn-outline btn-lg"
              style={{
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(10px)',
                gap: '0.55rem',
                padding: '0.85rem 1.6rem',
                fontWeight: 700,
                fontSize: '0.95rem',
              }}
            >
              <Play size={18} fill="currentColor" color="#f59e0b" />
              <span>Assistir Ao Vivo</span>
            </button>

            <button
              onClick={() => onNavigate('oracao')}
              className="btn btn-secondary btn-lg"
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                color: '#f1f5f9',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                gap: '0.55rem',
                padding: '0.85rem 1.6rem',
                fontWeight: 700,
                fontSize: '0.95rem',
              }}
            >
              <Heart size={18} color="#f59e0b" />
              <span>Pedir Oração</span>
            </button>
          </div>

          {/* Quick-Cards: Visual Moderno e Compacto */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              textAlign: 'left',
            }}
          >
            {/* Card 1: Horários */}
            <div
              onClick={() => onNavigate('eventos')}
              className="card card-hover"
              style={{
                padding: '1.15rem 1.35rem',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(14px)',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={16} color="#f59e0b" />
                  </div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>Cultos da Semana</h4>
                </div>
                <ArrowRight size={14} color="#94a3b8" />
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                Dom: 10h e 18h30 (Família) • Qua: 19h30 • Sáb: 19h (Jovens)
              </p>
            </div>

            {/* Card 2: Localização */}
            <div
              onClick={() => onNavigate('sobre')}
              className="card card-hover"
              style={{
                padding: '1.15rem 1.35rem',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(14px)',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={16} color="#60a5fa" />
                  </div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>Templo Central</h4>
                </div>
                <ArrowRight size={14} color="#94a3b8" />
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                Rua Lagoa Grande, 382 • Canaranas, Cidade Nova, Manaus/AM
              </p>
            </div>

            {/* Card 3: Propósito / Hospital de Almas */}
            <div
              onClick={() => onNavigate('sobre')}
              className="card card-hover"
              style={{
                padding: '1.15rem 1.35rem',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(14px)',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={16} color="#34d399" />
                  </div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>Hospital de Almas</h4>
                </div>
                <ArrowRight size={14} color="#94a3b8" />
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                Acolhemos você com amor para experimentar restauração em Deus
              </p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-section {
            padding: 6.5rem 1rem 3rem 1rem !important;
            min-height: auto !important;
          }
          .hero-cta-buttons {
            flex-direction: column !important;
            width: 100% !important;
            margin-bottom: 2rem !important;
          }
          .hero-cta-buttons .btn {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </section>
  );
};
