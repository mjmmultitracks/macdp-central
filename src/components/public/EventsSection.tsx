import React, { useState } from 'react';
import { ChurchEvent } from '../../types';
import { formatDate, formatEventDateRange } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Navigation,
  CheckCircle2,
  Car,
  Train,
  ExternalLink,
  Ticket,
  List,
  LayoutGrid,
} from 'lucide-react';

interface EventsSectionProps {
  events: ChurchEvent[];
  onRegisterEvent: (event: ChurchEvent) => void;
  onOpenEventDetail: (event: ChurchEvent) => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  events,
  onRegisterEvent,
  onOpenEventDetail,
}) => {
  const [selectedDayTab, setSelectedDayTab] = useState<'domingo' | 'quarta' | 'sabado'>('domingo');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const regularServices = [
    {
      id: 'domingo_1',
      day: 'Domingo',
      time: '10:00',
      title: 'Culto de Celebração & Ceia',
      description: 'Início da semana em adoração profunda, ministração da Palavra e celebração da Ceia do Senhor. Berçário e Kids abertos.',
      category: 'Geral',
    },
    {
      id: 'domingo_2',
      day: 'Domingo',
      time: '18:30',
      title: 'Culto da Família & Graça Kids',
      description: 'Culto focado na restauração e fortalecimento dos lares, com louvor contemporâneo e salas para todas as idades infantis.',
      category: 'Famílias',
    },
    {
      id: 'quarta',
      day: 'Quarta-feira',
      time: '19:30',
      title: 'Noite de Oração & Estudo Bíblico',
      description: 'Momento precioso de intercessão coletiva pelas causas da igreja, cura e aprofundamento exegético das Escrituras.',
      category: 'Edificação',
    },
    {
      id: 'sabado',
      day: 'Sábado',
      time: '19:00',
      title: 'Culto Conexão Jovem (Youth)',
      description: 'Comunidade jovem, música vibrante, temas atuais e comunhão pós-culto na cafeteria da igreja.',
      category: 'Jovens',
    },
  ];

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

        {/* Regular Services Timetable */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            marginBottom: '4rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1.25rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Horários de Reuniões Semanais</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Todos os nossos cultos contam com recepção calorosa e suporte do ministério infantil
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setSelectedDayTab('domingo')}
                className={`btn btn-sm ${selectedDayTab === 'domingo' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Domingos (2 cultos)
              </button>
              <button
                onClick={() => setSelectedDayTab('quarta')}
                className={`btn btn-sm ${selectedDayTab === 'quarta' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Quartas
              </button>
              <button
                onClick={() => setSelectedDayTab('sabado')}
                className={`btn btn-sm ${selectedDayTab === 'sabado' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Sábados
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {regularServices
              .filter((s) => (selectedDayTab === 'domingo' ? s.day === 'Domingo' : s.day.toLowerCase().includes(selectedDayTab)))
              .map((service) => (
                <div
                  key={service.id}
                  className="card card-hover"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span className="badge badge-gold">
                      <Clock size={12} /> {service.day} às {service.time}
                    </span>
                    <span className="badge badge-blue">{service.category}</span>
                  </div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {service.title}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {service.description}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={14} color="var(--success)" /> Entrada Livre • Sem necessidade de inscrição prévia
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Featured Events List / Grid */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="section-tag">Conferências & Projetos</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Próximos Eventos em Destaque</h3>
            </div>

            {/* View Mode Toggle: Lista vs Colunas */}
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
          </div>

          {viewMode === 'list' ? (
            /* ==================== MODO LISTA ==================== */
            <div key="list-view" className="animate-fade-scale" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {events.map((evt) => {
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
              }}
            >
              {events.map((evt) => {
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
        </div>

        {/* Interactive Location & Directions */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            }}
          >
            {/* Location Info */}
            <div style={{ padding: '2.5rem' }}>
              <span className="section-tag">
                <Navigation size={14} /> Como Chegar
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem' }}>
                Visite-nos em Manaus (Conj. Canaranas)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                Nosso templo sede está localizado no coração da Zona Norte de Manaus. Rua Lagoa Grande, 382 - Cidade Nova (Conj. Canaranas). Você e sua família serão recebidos com muito amor e a doce Presença de Deus!
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: 'var(--accent-gold-soft)',
                      color: 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Endereço Completo</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Rua Lagoa Grande, 382 - Cidade Nova - Conj. Canaranas - Manaus - AM
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: 'var(--accent-gold-soft)',
                      color: 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Car size={18} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Acesso & Estacionamento</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Fácil acesso pela Av. Noel Nutels e Av. Camapuã. Estacionamento e recepção acolhedora na chegada.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
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
                  className="btn btn-secondary"
                  style={{ gap: '0.5rem' }}
                >
                  <Navigation size={16} />
                  <span>Pedir Uber até o MACDP</span>
                </a>
              </div>
            </div>

            {/* Simulated Interactive Map Display */}
            <div
              style={{
                background: 'var(--bg-tertiary)',
                position: 'relative',
                minHeight: '340px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                borderLeft: '1px solid var(--border-subtle)',
              }}
            >
              {/* Stylized vector map representation */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-medium)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-inner)',
                }}
              >
                {/* Stylized Grid Roads */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.2,
                    backgroundImage:
                      'radial-gradient(var(--text-muted) 1px, transparent 1px), radial-gradient(var(--text-muted) 1px, var(--bg-secondary) 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Road visual road */}
                <div
                  style={{
                    position: 'absolute',
                    width: '140%',
                    height: '38px',
                    background: 'var(--accent-gold-soft)',
                    borderTop: '2px dashed var(--accent-gold)',
                    borderBottom: '2px dashed var(--accent-gold)',
                    transform: 'rotate(-25deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: '0.15em',
                    color: 'var(--accent-gold)',
                    textTransform: 'uppercase',
                  }}
                >
                  Rua Lagoa Grande — Canaranas / Cidade Nova
                </div>

                {/* Church Pin with Pulse */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                      color: '#0B1120',
                      padding: '0.6rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <MapPin size={16} />
                    <span>MACDP • Caçadores da Presença</span>
                  </div>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      background: 'var(--accent-gold)',
                      borderRadius: '50%',
                      boxShadow: '0 0 0 8px rgba(245, 158, 11, 0.3)',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: '0.35rem', fontWeight: 600 }}>
                    Rua Lagoa Grande, 382 • Manaus/AM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
