import React from 'react';
import { Play, ArrowRight, Calendar, MapPin, Clock } from 'lucide-react';
import type { ChurchEvent, RegularServiceItem } from '../../types';
import { formatEventDateRange } from '../../utils/formatters';


interface HeroSectionProps {
  onNavigate: (section: string) => void;
  onOpenLiveModal: () => void;
  events?: ChurchEvent[];
  regularServices?: RegularServiceItem[];
  onOpenEvent?: (event: ChurchEvent) => void;
}

const FALLBACK_SERVICES: Pick<RegularServiceItem, 'id' | 'day' | 'time'>[] = [
  { id: 'domingo', day: 'Domingo', time: '18:30' },
  { id: 'terca', day: 'Terça', time: '19:00' },
  { id: 'sabado', day: 'Sábado', time: '19:00' },
];

const todayIso = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Próximo evento que ainda não terminou (considera a data final, quando existir). */
function getNextEvent(events: ChurchEvent[] = []): ChurchEvent | undefined {
  const today = todayIso();
  return events
    .filter((e) => (e.endDate || e.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

const formatTime = (t: string) => t.replace(':', 'h').replace(/h00$/, 'h');
const shortDay = (d: string) => d.replace('-feira', '');

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigate,
  onOpenLiveModal,
  events,
  regularServices,
  onOpenEvent,
}) => {
  const nextEvent = getNextEvent(events);
  const services = (regularServices && regularServices.length > 0
    ? regularServices.filter((s) => s.active !== false)
    : FALLBACK_SERVICES
  ).slice(0, 4);

  return (
    <section className="hero-section">
      {/* Fundo: vídeo em loop (se existir em /videos/hero.mp4); sem vídeo, mostra um degradê de luz de palco */}
      <video
        className="hero-video"
        src="/videos/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onError={(e) => {
          (e.currentTarget as HTMLVideoElement).style.display = 'none';
        }}
        aria-hidden="true"
      />
      <div className="hero-shade" />

      <div className="hero-content">
        <span className="hero-eyebrow">
          <span className="hero-eyebrow-dot" /> Manaus · AM
        </span>

        <h1 className="hero-title">
          Proibido a entrada
          <br />
          de pessoas <span className="hero-accent">perfeitas.</span>
        </h1>

        <p className="hero-lead">
          Ministério Apostólico Caçadores da Presença. Uma igreja apaixonada pela presença de Deus, liderada pelos
          pastores Oziel e Midiã Gomes Maduro.
        </p>

        <div className="hero-actions">
          {nextEvent && onOpenEvent ? (
            <button className="hero-btn hero-btn-solid" onClick={() => onOpenEvent(nextEvent)}>
              Inscreva-se <ArrowRight size={18} />
            </button>
          ) : (
            <button className="hero-btn hero-btn-solid" onClick={() => onNavigate('eventos')}>
              Visite-nos <ArrowRight size={18} />
            </button>
          )}
          <button className="hero-btn hero-btn-line" onClick={onOpenLiveModal}>
            <Play size={16} fill="currentColor" /> Assistir ao vivo
          </button>
        </div>
      </div>

      {/* Faixa inferior: evento, cultos e local */}
      <div className="hero-strip">
        {nextEvent && (
          <button type="button" className="hero-cell hero-cell-event" onClick={() => onOpenEvent && onOpenEvent(nextEvent)}>
            <span className="hero-cell-label">
              <Calendar size={13} /> Próximo evento
            </span>
            <span className="hero-cell-main">{nextEvent.title}</span>
            <span className="hero-cell-sub">
              {formatEventDateRange(nextEvent.date, nextEvent.endDate)} · {nextEvent.time}
            </span>
          </button>
        )}

        <div className="hero-cell">
          <span className="hero-cell-label">
            <Clock size={13} /> Cultos
          </span>
          <span className="hero-times">
            {services.map((s) => (
              <span key={s.id} className="hero-time">
                <b>{shortDay(s.day)}</b> {formatTime(s.time)}
              </span>
            ))}
          </span>
        </div>

        <button type="button" className="hero-cell" onClick={() => onNavigate('sobre')}>
          <span className="hero-cell-label">
            <MapPin size={13} /> Templo Central
          </span>
          <span className="hero-cell-main">Rua Lagoa Grande, 382</span>
          <span className="hero-cell-sub">Canaranas, Cidade Nova · Manaus/AM</span>
        </button>
      </div>

      <style>{`
        .hero-section {
          position: relative;
          min-height: 100vh;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
          background:
            radial-gradient(ellipse 70% 55% at 75% 25%, rgba(245, 158, 11, 0.28) 0%, transparent 65%),
            radial-gradient(ellipse 60% 50% at 10% 85%, rgba(59, 90, 200, 0.22) 0%, transparent 65%),
            #050506;
          color: #fff;
        }
        .hero-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
        }
        .hero-shade {
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.35) 35%, rgba(0, 0, 0, 0.85) 100%),
            radial-gradient(ellipse 70% 60% at 20% 60%, rgba(0, 0, 0, 0.55) 0%, transparent 70%);
        }
        .hero-content {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
          padding: 8rem 1.5rem 3rem;
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 1.4rem;
        }
        .hero-eyebrow-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--accent-gold-light);
          box-shadow: 0 0 12px var(--accent-gold);
        }
        .hero-title {
          font-size: clamp(2.6rem, 8.5vw, 7rem);
          color: #fff;
          margin-bottom: 1.5rem;
          max-width: 14ch;
        }
        .hero-accent { color: var(--accent-gold-light); }
        .hero-lead {
          font-size: clamp(1rem, 1.6vw, 1.2rem);
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.82);
          max-width: 34rem;
          margin-bottom: 2.2rem;
        }
        .hero-actions { display: flex; flex-wrap: wrap; gap: 0.9rem; }
        .hero-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 1rem 1.8rem;
          font-family: var(--font-display);
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          border-radius: 4px;
          cursor: pointer;
          transition: transform 150ms ease, background 150ms ease, color 150ms ease;
        }
        .hero-btn:hover { transform: translateY(-2px); }
        .hero-btn-solid { background: var(--accent-gold-light); color: #0a0a0a; border: 2px solid var(--accent-gold-light); }
        .hero-btn-solid:hover { background: #fff; border-color: #fff; }
        .hero-btn-line { background: transparent; color: #fff; border: 2px solid rgba(255, 255, 255, 0.7); }
        .hero-btn-line:hover { background: #fff; color: #0a0a0a; }

        .hero-strip {
          position: relative;
          z-index: 3;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          border-top: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .hero-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 1.3rem 1.5rem;
          text-align: left;
          background: none;
          border: 0;
          border-left: 1px solid rgba(255, 255, 255, 0.14);
          color: #fff;
          cursor: default;
        }
        .hero-cell:first-child { border-left: 0; }
        button.hero-cell { cursor: pointer; }
        button.hero-cell:hover { background: rgba(255, 255, 255, 0.07); }
        .hero-cell-label {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent-gold-light);
          margin-bottom: 0.3rem;
        }
        .hero-cell-main { font-size: 1rem; font-weight: 700; line-height: 1.3; }
        .hero-cell-sub { font-size: 0.88rem; color: rgba(255, 255, 255, 0.7); }
        .hero-times { display: flex; flex-wrap: wrap; gap: 0.35rem 1.1rem; font-size: 0.95rem; }
        .hero-time b { font-weight: 700; color: rgba(255, 255, 255, 0.7); margin-right: 0.15rem; }

        @supports (animation-timeline: scroll()) {
          @media (prefers-reduced-motion: no-preference) {
            .hero-content {
              animation: hero-content-out linear both;
              animation-timeline: scroll(root);
              animation-range: 0 85vh;
            }
          }
        }
        @keyframes hero-content-out {
          to { transform: translateY(-60px); opacity: 0.15; }
        }

        @media (max-width: 700px) {
          .hero-content { padding: 6.5rem 1.1rem 2rem; }
          .hero-actions { flex-direction: column; }
          .hero-btn { width: 100%; }
          .hero-strip { grid-template-columns: 1fr; }
          .hero-cell { border-left: 0; border-top: 1px solid rgba(255, 255, 255, 0.12); padding: 1rem 1.1rem; }
          .hero-cell:first-child { border-top: 0; }
        }
      `}</style>
    </section>
  );
};
