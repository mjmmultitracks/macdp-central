import React, { useState } from 'react';
import { ChurchEvent, RegularServiceItem } from '../../types';
import { formatEventDateRange } from '../../utils/formatters';
import {
  Calendar,
  MapPin,
  Users,
  Navigation,
  ExternalLink,
  Ticket,
  List,
  LayoutGrid,
} from 'lucide-react';

interface EventsSectionProps {
  events: ChurchEvent[];
  regularServices?: RegularServiceItem[];
  onRegisterEvent: (event: ChurchEvent) => void;
  onOpenEventDetail: (event: ChurchEvent) => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  events,
  regularServices: customServices,
  onRegisterEvent,
  onOpenEventDetail,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Separa eventos que ainda vão acontecer dos que já terminaram
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const upcomingEvents = events.filter((e) => (e.endDate || e.date) >= todayIso);
  const pastEvents = events.filter((e) => (e.endDate || e.date) < todayIso);

  const regularServices = (customServices || [
    {
      id: 'domingo_1',
      day: 'Domingo',
      time: '10:00',
      title: 'Culto de Celebração & Ceia',
      description: 'Início da semana em adoração profunda, ministração da Palavra e celebração da Ceia do Senhor. Berçário e Kids abertos.',
      category: 'Geral',
      active: true,
    },
    {
      id: 'domingo_2',
      day: 'Domingo',
      time: '18:30',
      title: 'Culto da Família & Caçadores Kids',
      description: 'Culto focado na restauração e fortalecimento dos lares, com louvor contemporâneo e salas para todas as idades infantis.',
      category: 'Famílias',
      active: true,
    },
    {
      id: 'quarta',
      day: 'Quarta-feira',
      time: '19:30',
      title: 'Noite de Oração & Estudo Bíblico',
      description: 'Momento precioso de intercessão coletiva pelas causas da igreja, cura e aprofundamento exegético das Escrituras.',
      category: 'Edificação',
      active: true,
    },
    {
      id: 'sabado',
      day: 'Sábado',
      time: '19:00',
      title: 'Culto Conexão Jovem (Youth)',
      description: 'Comunidade jovem, música vibrante, temas atuais e comunhão pós-culto na cafeteria da igreja.',
      category: 'Jovens',
      active: true,
    },
  ]).filter((s) => s.active !== false);


  // Ex.: '19:30' -> '19h30' e '10:00' -> '10h'
  const formatServiceTime = (t: string) => t.replace(':', 'h').replace(/h00$/, 'h');

  return (
    <section id="eventos" className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Section Title */}
        <div className="section-header">
          <span className="section-tag">
            <Calendar size={14} /> Agenda da Igreja
          </span>
          <h2 className="section-title">Cultos Regulares & Próximos Eventos</h2>
          <p className="section-subtitle">
            Participe dos nossos encontros semanais ou inscreva-se nas conferências e acampamentos especiais. Há sempre um lugar preparado para você!
          </p>
        </div>

        {/* Cultos semanais: lista limpa em linhas */}
        <div className="weekly" style={{ marginBottom: '4rem' }}>
          <div className="weekly-head">
            <h3>Cultos semanais</h3>
            <p>Entrada livre, sem necessidade de inscrição. Recepção calorosa e ministério infantil em todos os cultos.</p>
          </div>

          <ul className="weekly-list">
            {regularServices.map((service) => (
              <li key={service.id} className="weekly-row">
                <span className="weekly-day">{service.day}</span>
                <span className="weekly-time">{formatServiceTime(service.time)}</span>
                <span className="weekly-info">
                  <strong>{service.title}</strong>
                  <span>{service.description}</span>
                </span>
                {service.category && <span className="weekly-tag">{service.category}</span>}
              </li>
            ))}
          </ul>
        </div>

        <style>{`
          .weekly { max-width: 960px; margin-left: auto; margin-right: auto; }
          .weekly-head { margin-bottom: 1.25rem; }
          .weekly-head h3 { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.35rem; }
          .weekly-head p { color: var(--text-secondary); font-size: 0.95rem; margin: 0; max-width: 40rem; }
          .weekly-list { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--border-medium); }
          .weekly-row {
            display: grid;
            grid-template-columns: 9rem 5.5rem 1fr auto;
            align-items: baseline;
            gap: 1.25rem;
            padding: 1.35rem 0;
            border-bottom: 1px solid var(--border-subtle);
          }
          .weekly-day { font-size: 0.82rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-secondary); }
          .weekly-time { font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; color: var(--accent-gold); line-height: 1; }
          .weekly-info { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
          .weekly-info strong { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); }
          .weekly-info span { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .weekly-tag { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); white-space: nowrap; }
          @media (max-width: 700px) {
            .weekly-row { grid-template-columns: auto 1fr; gap: 0.35rem 1rem; padding: 1.1rem 0; }
            .weekly-day { grid-column: 1; grid-row: 1; align-self: center; }
            .weekly-time { grid-column: 2; grid-row: 1; font-size: 1.3rem; }
            .weekly-info { grid-column: 1 / -1; grid-row: 2; }
            .weekly-tag { display: none; }
          }
        `}</style>

        {/* Featured Events List / Grid */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="section-tag">Conferências & Projetos</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Próximos Eventos em Destaque</h3>
            </div>

            {/* View Mode Toggle: Lista vs Colunas */}
            {upcomingEvents.length > 0 && (
            <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setViewMode('list')}
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
                title="Visualizar em Linhas / Lista"
              >
                <List size={14} />
                <span>Lista</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
                title="Visualizar em Colunas / Grade"
              >
                <LayoutGrid size={14} />
                <span>Colunas</span>
              </button>
            </div>
            )}
          </div>

          {viewMode === 'list' ? (
            /* ==================== MODO LISTA ==================== */
            <div key="list-view" className="animate-fade-scale" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {upcomingEvents.map((evt) => {
                const spotsLeft = evt.totalCapacity - evt.registeredCount;
                return (
                  <div
                    key={evt.id}
                    onClick={() => onOpenEventDetail(evt)}
                    className="card card-hover"
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: '1.25rem 1.5rem',
                      gap: '1.75rem',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-secondary)',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: '200px',
                        height: '130px',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        position: 'relative',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={evt.imageUrl}
                        alt={evt.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '0.45rem',
                          left: '0.45rem',
                          background: 'rgba(11, 17, 32, 0.85)',
                          backdropFilter: 'blur(8px)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          color: '#fff',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        {formatEventDateRange(evt.date, evt.endDate)} • {evt.time}
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0.45rem',
                          right: '0.45rem',
                        }}
                      >
                        {evt.isFree ? (
                          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Entrada Gratuita</span>
                        ) : (
                          <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>R$ {evt.price?.toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--accent-gold)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {evt.category}
                      </span>

                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                        {evt.title}
                      </h4>

                      <p
                        style={{
                          fontSize: '0.86rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.5,
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {evt.description}
                      </p>

                      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MapPin size={14} color="var(--accent-gold)" />
                          <span>{evt.location}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Users size={14} color="var(--accent-gold)" />
                          <span>{spotsLeft > 0 ? `${spotsLeft} vagas restantes` : 'Esgotado'} ({evt.registeredCount} inscritos)</span>
                        </div>
                      </div>
                    </div>

                    {/* Button */}
                    <div style={{ flexShrink: 0, alignSelf: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEventDetail(evt);
                        }}
                        className="btn btn-primary"
                        style={{ padding: '0.7rem 1.25rem', gap: '0.5rem', fontWeight: 800, whiteSpace: 'nowrap' }}
                      >
                        <Ticket size={16} />
                        <span>{evt.isFree ? 'Ver Detalhes & Inscrição' : `Ver Detalhes • R$ ${evt.price?.toFixed(2)}`}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ==================== MODO GRADE / COLUNAS ==================== */
            <div
              key="grid-view"
              className="animate-fade-scale"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: '2rem',
              }}
            >
              {upcomingEvents.map((evt) => {
                const spotsLeft = evt.totalCapacity - evt.registeredCount;
                return (
                  <div
                    key={evt.id}
                    onClick={() => onOpenEventDetail(evt)}
                    className="card card-hover"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    }}
                  >
                    <div style={{ position: 'relative', height: '190px' }}>
                      <img
                        src={evt.imageUrl}
                        alt={evt.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '1rem',
                          left: '1rem',
                          background: 'rgba(11, 17, 32, 0.85)',
                          backdropFilter: 'blur(8px)',
                          padding: '0.4rem 0.8rem',
                          borderRadius: 'var(--radius-md)',
                          color: '#fff',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        {formatEventDateRange(evt.date, evt.endDate)} • {evt.time}
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                        }}
                      >
                        {evt.isFree ? (
                          <span className="badge badge-success">Entrada Gratuita</span>
                        ) : (
                          <span className="badge badge-gold">R$ {evt.price?.toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--accent-gold)',
                          textTransform: 'uppercase',
                          marginBottom: '0.4rem',
                        }}
                      >
                        {evt.category}
                      </span>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.3 }}>
                        {evt.title}
                      </h4>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.6,
                          marginBottom: '1.25rem',
                          flex: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {evt.description}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MapPin size={14} color="var(--accent-gold)" />
                          <span>{evt.location}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Users size={14} color="var(--accent-gold)" />
                          <span>{spotsLeft > 0 ? `${spotsLeft} vagas restantes` : 'Esgotado'} ({evt.registeredCount} inscritos)</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEventDetail(evt);
                        }}
                        className="btn btn-primary"
                        style={{ width: '100%', gap: '0.45rem', fontWeight: 800 }}
                      >
                        <Ticket size={16} />
                        <span>{evt.isFree ? 'Ver Detalhes & Inscrição' : `Ver Detalhes • R$ ${evt.price?.toFixed(2)}`}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {upcomingEvents.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '2.5rem 1.5rem',
                border: '1px dashed var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--text-secondary)',
              }}
            >
              <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Nenhum evento programado no momento
              </strong>
              Os cultos semanais continuam abertos a todos. Novos eventos serão divulgados aqui e em nossas redes.
            </div>
          )}

          {pastEvents.length > 0 && (
            <div style={{ marginTop: '2.5rem' }}>
              <h4
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: '0.75rem',
                }}
              >
                Eventos anteriores
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {pastEvents.map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => onOpenEventDetail(evt)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      padding: '0.9rem 0',
                      background: 'none',
                      border: 0,
                      borderTop: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <span>
                      <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{evt.title}</strong>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {formatEventDateRange(evt.date, evt.endDate)}
                      </span>
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      Encerrado
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Como chegar: endereço e mapa real */}
        <div id="como-chegar" className="visit">
          <div className="visit-info">
            <span className="visit-tag">Como chegar</span>
            <h3 className="visit-title">Visite-nos em Manaus</h3>

            <address className="visit-address">
              Rua Lagoa Grande, 382
              <span>Cidade Nova (Conj. Canaranas) · Manaus/AM</span>
            </address>

            <p className="visit-note">
              Acesso pela Av. Noel Nutels e Av. Camapuã. Estacionamento e recepção na chegada.
            </p>

            <div className="visit-actions">
              <a
                href="https://maps.google.com/?q=Rua+Lagoa+Grande+382+Cidade+Nova+Canaranas+Manaus+AM"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ gap: '0.5rem' }}
              >
                <MapPin size={16} />
                <span>Abrir no Google Maps</span>
                <ExternalLink size={14} />
              </a>
              <a
                href="https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=Rua%20Lagoa%20Grande%2C%20382%20Canaranas%20Manaus"
                target="_blank"
                rel="noreferrer"
                className="visit-link"
              >
                <Navigation size={15} /> Pedir Uber
              </a>
            </div>
          </div>

          <div className="visit-map">
            <iframe
              title="Mapa do templo da MACDP"
              src="https://maps.google.com/maps?q=Rua+Lagoa+Grande+382+Cidade+Nova+Manaus+AM&z=16&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <style>{`
          .visit {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
            gap: clamp(1.5rem, 4vw, 3.5rem);
            align-items: stretch;
            max-width: 1100px;
            margin: 0 auto;
          }
          .visit-info { display: flex; flex-direction: column; justify-content: center; }
          .visit-tag {
            font-size: 0.75rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
            color: var(--accent-gold); margin-bottom: 0.9rem;
          }
          .visit-title { font-size: clamp(1.8rem, 3.4vw, 2.6rem); margin: 0 0 1.5rem; }
          .visit-address {
            font-style: normal; font-size: 1.2rem; font-weight: 700; color: var(--text-primary);
            line-height: 1.35; margin-bottom: 1rem;
          }
          .visit-address span { display: block; font-size: 0.95rem; font-weight: 500; color: var(--text-secondary); margin-top: 0.2rem; }
          .visit-note { font-size: 0.92rem; color: var(--text-secondary); line-height: 1.6; margin: 0 0 1.75rem; max-width: 26rem; }
          .visit-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 1.25rem; }
          .visit-link {
            display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.95rem;
            color: var(--text-primary); text-decoration: underline; text-underline-offset: 4px;
            text-decoration-color: var(--border-medium);
          }
          .visit-link:hover { text-decoration-color: var(--accent-gold); }
          .visit-map {
            min-height: 360px; border-radius: var(--radius-lg); overflow: hidden;
            border: 1px solid var(--border-subtle); background: var(--bg-tertiary);
          }
          .visit-map iframe { width: 100%; height: 100%; min-height: 360px; border: 0; display: block; }
          [data-theme='dark'] .visit-map iframe { filter: invert(0.92) hue-rotate(180deg) saturate(0.7) contrast(0.95); }
          @media (max-width: 820px) {
            .visit { grid-template-columns: 1fr; }
            .visit-map, .visit-map iframe { min-height: 280px; }
          }
        `}</style>
      </div>
    </section>
  );
};
