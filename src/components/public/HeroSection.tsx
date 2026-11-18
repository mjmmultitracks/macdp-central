import React from 'react';
import { Play, Calendar, Heart, MapPin, Clock, ArrowRight } from 'lucide-react';
import type { ChurchEvent, RegularServiceItem } from '../../types';
import { formatEventDateRange } from '../../utils/formatters';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
  onOpenLiveModal: () => void;
  events?: ChurchEvent[];
  regularServices?: RegularServiceItem[];
  onOpenEvent?: (event: ChurchEvent) => void;
}

const FALLBACK_SERVICES: Pick<RegularServiceItem, 'id' | 'day' | 'time' | 'title'>[] = [
  { id: 'dom-manha', day: 'Domingo', time: '10:00', title: 'Culto da Família' },
  { id: 'dom-noite', day: 'Domingo', time: '18:30', title: 'Culto de Celebração' },
  { id: 'qua', day: 'Quarta-feira', time: '19:30', title: 'Noite de Oração e Estudo Bíblico' },
  { id: 'sab', day: 'Sábado', time: '19:00', title: 'Culto Jovem' },
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
      <div className="hero-inner">
        <div className="hero-copy">
          <span className="hero-eyebrow">Ministério Apostólico Caçadores da Presença · Manaus/AM</span>

          <h1 className="hero-title">
            Proibido a entrada
            <br />
            de pessoas <em>perfeitas.</em>
          </h1>

          <p className="hero-lead">
            Uma igreja acolhedora, bíblica e apaixonada pela presença de Deus, liderada pelos pastores
            presidentes <strong>Oziel e Midiã Gomes Maduro</strong>. Venha viver um encontro transformador em
            família.
          </p>

          <div className="hero-actions">
            {nextEvent && onOpenEvent ? (
              <button className="btn btn-primary btn-lg" onClick={() => onOpenEvent(nextEvent)}>
                <Calendar size={18} />
                Inscrever-se no próximo evento
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={() => onNavigate('eventos')}>
                <Calendar size={18} />
                Ver cultos e eventos
              </button>
            )}
            <button className="btn btn-secondary btn-lg" onClick={onOpenLiveModal}>
              <Play size={18} />
              Assistir ao vivo
            </button>
            <button className="hero-link" onClick={() => onNavigate('oracao')}>
              <Heart size={16} />
              Pedir oração
            </button>
          </div>
        </div>

        <aside className="hero-panel" aria-label="Informações rápidas">
          {nextEvent && (
            <button
              type="button"
              className="hero-event"
              onClick={() => onOpenEvent && onOpenEvent(nextEvent)}
            >
              <span className="hero-panel-label">Próximo evento</span>
              <strong className="hero-event-title">{nextEvent.title}</strong>
              <span className="hero-event-meta">
                {formatEventDateRange(nextEvent.date, nextEvent.endDate)} · {nextEvent.time}
              </span>
              <span className="hero-event-cta">
                Ver detalhes e inscrição <ArrowRight size={15} />
              </span>
            </button>
          )}

          <div className="hero-block">
            <span className="hero-panel-label">
              <Clock size={14} /> Cultos
            </span>
            <ul className="hero-services">
              {services.map((s) => (
                <li key={s.id}>
                  <span className="hero-service-day">{s.day}</span>
                  <span className="hero-service-time">{s.time.replace(':', 'h').replace(/h00$/, 'h')}</span>
                  <span className="hero-service-title">{s.title}</span>
                </li>
              ))}
            </ul>
          </div>

          <button type="button" className="hero-block hero-place" onClick={() => onNavigate('sobre')}>
            <span className="hero-panel-label">
              <MapPin size={14} /> Templo Central
            </span>
            <span className="hero-place-text">
              Rua Lagoa Grande, 382 · Canaranas, Cidade Nova, Manaus/AM
            </span>
          </button>
        </aside>
      </div>

      <style>{`
        .hero-section {
          position: relative;
          padding: 8rem 1.5rem 4.5rem;
          background:
            radial-gradient(ellipse 60% 50% at 85% 10%, rgba(183, 121, 9, 0.10) 0%, transparent 70%),
            radial-gradient(ellipse 55% 45% at 5% 90%, rgba(30, 58, 110, 0.07) 0%, transparent 70%),
            var(--bg-primary);
          border-bottom: 1px solid var(--border-subtle);
        }
        [data-theme='dark'] .hero-section {
          background:
            linear-gradient(180deg, rgba(11, 17, 32, 0.82) 0%, rgba(11, 17, 32, 0.94) 70%, var(--bg-primary) 100%),
            url('/images/hero-section.jpg?v=5') center 30% / cover no-repeat;
        }
        .hero-inner {
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.85fr);
          gap: 3rem;
          align-items: center;
        }
        .hero-eyebrow {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent-gold);
          margin-bottom: 1.1rem;
        }
        .hero-title {
          font-size: clamp(2.4rem, 5vw, 3.9rem);
          font-weight: 700;
          line-height: 1.12;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
        }
        .hero-title em {
          font-style: italic;
          color: var(--accent-gold);
        }
        .hero-lead {
          font-size: 1.08rem;
          line-height: 1.7;
          color: var(--text-secondary);
          max-width: 34rem;
          margin-bottom: 2rem;
        }
        .hero-lead strong { color: var(--text-primary); }
        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.85rem;
        }
        .hero-link {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.6rem 0.4rem;
          background: none;
          border: 0;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-primary);
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-color: var(--border-medium);
        }
        .hero-link:hover { text-decoration-color: var(--accent-gold); }

        .hero-panel {
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
        }
        .hero-panel-label {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.55rem;
        }
        .hero-event {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          text-align: left;
          padding: 1.4rem 1.5rem;
          background: var(--accent-blue);
          color: #ffffff;
          border: 0;
          cursor: pointer;
        }
        .hero-event .hero-panel-label { color: rgba(255, 255, 255, 0.7); }
        .hero-event-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          line-height: 1.3;
          margin-bottom: 0.35rem;
        }
        .hero-event-meta { font-size: 0.9rem; color: rgba(255, 255, 255, 0.85); }
        .hero-event-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.9rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: #fcd34d;
        }
        .hero-block {
          display: block;
          width: 100%;
          text-align: left;
          padding: 1.25rem 1.5rem;
          background: none;
          border: 0;
          border-top: 1px solid var(--border-subtle);
        }
        .hero-block:first-child { border-top: 0; }
        .hero-services { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.55rem; }
        .hero-services li {
          display: grid;
          grid-template-columns: 6.5rem 3rem 1fr;
          gap: 0.5rem;
          align-items: baseline;
          font-size: 0.92rem;
        }
        .hero-service-day { font-weight: 700; color: var(--text-primary); }
        .hero-service-time { font-weight: 700; color: var(--accent-gold); }
        .hero-service-title { color: var(--text-secondary); }
        .hero-place { cursor: pointer; }
        .hero-place:hover .hero-place-text { color: var(--text-primary); }
        .hero-place-text { display: block; font-size: 0.92rem; color: var(--text-secondary); line-height: 1.5; }

        @media (max-width: 900px) {
          .hero-section { padding: 6.5rem 1rem 3rem; }
          .hero-inner { grid-template-columns: 1fr; gap: 2rem; }
        }
        @media (max-width: 560px) {
          .hero-actions { flex-direction: column; align-items: stretch; }
          .hero-actions .btn { width: 100%; justify-content: center; }
          .hero-link { justify-content: center; }
          .hero-services li { grid-template-columns: 5.6rem 2.6rem 1fr; font-size: 0.86rem; }
        }
      `}</style>
    </section>
  );
};
