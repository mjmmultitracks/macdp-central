import React from 'react';
import { Play, Calendar, Heart, MapPin, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
  onOpenLiveModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onOpenLiveModal }) => {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        padding: '8rem 0 5rem 0',
        overflow: 'hidden',
      }}
    >
      {/* Background Image & Multi-layer Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('/images/hero-section.png?v=2')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          transform: 'scale(1.03)',
          zIndex: 1,
        }}
      />
      {/* Dark gradient filter to ensure readability and warm golden atmospheric glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(11, 17, 32, 0.75) 0%, rgba(11, 17, 32, 0.88) 60%, var(--bg-primary) 100%)',
          zIndex: 2,
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 3 }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          {/* Official Church Logo Emblem */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '22px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '2px solid rgba(245, 158, 11, 0.5)',
                padding: '8px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 25px rgba(245, 158, 11, 0.25)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 4s ease-in-out infinite alternate',
              }}
            >
              <img
                src="/images/logo.png"
                alt="Logo Oficial Ministério Apostólico Caçadores da Presença"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '16px',
                }}
              />
            </div>
          </div>

          {/* Live broadcast pill */}
          <div
            onClick={onOpenLiveModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.45rem 1.15rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#FBBF24',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '2rem',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s',
            }}
          >
            <span className="live-pulse" />
            <span>Próxima Transmissão: Domingo às 10h e 18h30</span>
            <ChevronRight size={15} />
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
              fontWeight: 800,
              lineHeight: 1.12,
              color: '#ffffff',
              marginBottom: '1.25rem',
              textShadow: '0 4px 20px rgba(0,0,0,0.6)',
            }}
          >
            <span style={{ color: 'var(--accent-gold-light)' }}>Proibido a Entrada</span> de Pessoas Perfeitas.
          </h1>

          <div
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--accent-gold-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '1rem',
            }}
          >
            Ministério Apostólico Caçadores da Presença • MACDP
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#e2e8f0',
              lineHeight: 1.65,
              marginBottom: '2.5rem',
              maxWidth: '720px',
              margin: '0 auto 2.5rem auto',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            Seja muito bem-vindo à nossa comunidade em Manaus. Uma família profética, bíblica e acolhedora liderada pelos Pastores Presidentes <strong>Oziel Gomes Maduro</strong> e <strong>Midiã Gomes Maduro</strong>. Aqui você encontra amor, graça e o poder da presença de Deus.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '4rem',
            }}
          >
            <button
              onClick={() => onNavigate('eventos')}
              className="btn btn-primary btn-lg"
              style={{ gap: '0.6rem' }}
            >
              <Calendar size={19} />
              <span>Planeje sua Visita em Manaus</span>
            </button>

            <button
              onClick={onOpenLiveModal}
              className="btn btn-outline btn-lg"
              style={{
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                gap: '0.6rem',
              }}
            >
              <Play size={19} fill="currentColor" />
              <span>Assista no YouTube (MACDP Oficial)</span>
            </button>

            <button
              onClick={() => onNavigate('oracao')}
              className="btn btn-secondary btn-lg"
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                gap: '0.6rem',
              }}
            >
              <Heart size={19} color="var(--accent-gold-light)" />
              <span>Pedir Oração</span>
            </button>
          </div>

          {/* Highlights Mini-Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              textAlign: 'left',
            }}
          >
            <div
              className="card card-glass"
              style={{
                padding: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(15, 23, 42, 0.65)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <Sparkles size={18} color="var(--accent-gold-light)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Hospital de Almas</h4>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>
                "Proibido a entrada de pessoas perfeitas" — acolhemos você exatamente como você é para experimentar restauração em Cristo.
              </p>
            </div>

            <div
              className="card card-glass"
              style={{
                padding: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(15, 23, 42, 0.65)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <MapPin size={18} color="var(--accent-gold-light)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Templo Sede Manaus</h4>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>
                Rua Lagoa Grande, 382 - Cidade Nova (Conj. Canaranas), Manaus/AM. Venha nos visitar!
              </p>
            </div>

            <div
              className="card card-glass"
              style={{
                padding: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(15, 23, 42, 0.65)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <ShieldCheck size={18} color="var(--accent-gold-light)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Pastores Presidentes</h4>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>
                Oziel Gomes Maduro e Midiã Gomes Maduro, dedicados ao pastoreio e avivamento profético da igreja.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
