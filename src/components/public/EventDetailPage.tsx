import React, { useState, useEffect } from 'react';
import { ChurchEvent } from '../../types';
import { formatDate, formatEventDateRange } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  ArrowLeft,
  Share2,
  ExternalLink,
  Navigation,
  Mic,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  HelpCircle,
  Sparkles,
  Shirt,
} from 'lucide-react';
import { getGoogleMapsEmbedUrl, getGoogleMapsDirectionsUrl } from '../../services/googleMapsService';

interface EventDetailPageProps {
  event: ChurchEvent;
  onBack: () => void;
  onStartRegistration: (event: ChurchEvent) => void;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  event,
  onBack,
  onStartRegistration,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const spotsLeft = event.totalCapacity - event.registeredCount;
  const isSoldOut = spotsLeft <= 0;
  const occupancyPercent = event.totalCapacity > 0
    ? Math.min(100, Math.round((event.registeredCount / event.totalCapacity) * 100))
    : 0;

  // Countdown timer para a conferência
  const isConference = event.date === '2026-11-13' || event.title.toLowerCase().includes('caçadores');
  const targetDate = new Date(`${event.date}T${event.time || '19:30'}:00`);

  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = targetDate.getTime() - new Date().getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = targetDate.getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [event.date, event.time]);

  const shareText = `🏛️ *${event.title}* - Ministério Apostólico Caçadores da Presença (MACDP)\n\n📅 *Data:* ${formatEventDateRange(event.date, event.endDate)} às ${event.time}\n📍 *Local:* ${event.location}\n🎟️ *Inscrição:* ${event.isFree ? 'Entrada Gratuita' : `R$ ${event.price?.toFixed(2)}`}\n\nGaranta sua vaga no site oficial: ${window.location.href}`;

  const shareWhatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div
      className="animate-fadeIn"
      style={{
        background: 'var(--bg-primary)',
        minHeight: '100vh',
        paddingTop: '76px',
        paddingBottom: '4rem',
      }}
    >
      {/* Top Breadcrumb & Back Bar */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.85rem 0',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <button
            type="button"
            onClick={onBack}
            className="btn btn-secondary btn-sm"
            style={{
              gap: '0.5rem',
              fontWeight: 700,
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <ArrowLeft size={16} />
            <span>Voltar para Todos os Eventos</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span style={{ cursor: 'pointer' }} onClick={onBack}>Início</span>
            <span>›</span>
            <span style={{ cursor: 'pointer' }} onClick={onBack}>Eventos</span>
            <span>›</span>
            <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{event.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Banner Imersivo do Evento */}
      <div
        style={{
          position: 'relative',
          minHeight: '380px',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          background: 'var(--bg-secondary)',
        }}
      >
        {/* Imagem de Fundo com Fade */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${event.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.55)',
            transform: 'scale(1.02)',
          }}
        />
        {/* Gradiente de Fusão com o tema */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, var(--bg-primary) 0%, rgba(11, 17, 32, 0.7) 60%, rgba(0, 0, 0, 0.85) 100%)',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2, paddingBottom: '2.5rem', paddingTop: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
            <span
              style={{
                background: 'rgba(245, 158, 11, 0.95)',
                color: '#0B1120',
                fontWeight: 900,
                fontSize: '0.82rem',
                padding: '0.35rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.45)',
              }}
            >
              {event.category}
            </span>

            {event.isFree ? (
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.9)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  padding: '0.35rem 0.95rem',
                  borderRadius: 'var(--radius-full)',
                  textTransform: 'uppercase',
                }}
              >
                Entrada Gratuita
              </span>
            ) : (
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: 'var(--accent-gold-light)',
                  border: '1.5px solid var(--accent-gold)',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  padding: '0.35rem 0.95rem',
                  borderRadius: 'var(--radius-full)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                R$ {event.price?.toFixed(2)}
              </span>
            )}

            {isSoldOut ? (
              <span
                style={{
                  background: 'rgba(239, 68, 68, 0.85)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  padding: '0.35rem 0.95rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                Vagas Esgotadas
              </span>
            ) : spotsLeft <= 20 ? (
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.3)',
                  color: 'var(--accent-gold-light)',
                  border: '1px solid var(--accent-gold)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                Últimas {spotsLeft} vagas!
              </span>
            ) : null}
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.15,
              margin: '0 0 1.25rem 0',
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.8)',
            }}
          >
            {event.title}
          </h1>

          {/* Quick Info Bar on Banner */}
          <div
            style={{
              display: 'flex',
              gap: '1.75rem',
              flexWrap: 'wrap',
              fontSize: '0.98rem',
              color: 'rgba(255, 255, 255, 0.9)',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--accent-gold)" />
              <strong>{formatEventDateRange(event.date, event.endDate)}</strong> às {event.time}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--accent-blue-light)" />
              <span>{event.location} {event.roomReserved ? `• ${event.roomReserved}` : ''}</span>
            </div>

            {event.speakerName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mic size={18} color="var(--accent-gold)" />
                <span>Ministração: <strong>{event.speakerName}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Content (Left) + Ticket Card (Right) */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        {/* Banner do Temporizador para a Conferência */}
        {isConference && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1.5px solid rgba(245, 158, 11, 0.5)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem 2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginBottom: '2.5rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 25px rgba(245, 158, 11, 0.15)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-gold)', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>
                <Clock size={16} />
                <span>Contagem Regressiva para o Início</span>
              </div>
              <h4 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                13 de Novembro de 2026 • Abertura às {event.time}
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: '0.25rem 0 0 0' }}>
                Prepare seu coração para viver o mover profético na Chácara Paraiso Verde em Iranduba!
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(11, 17, 32, 0.9)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '10px', padding: '0.75rem 1.1rem', textAlign: 'center', minWidth: '70px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-gold-light)', lineHeight: 1, fontFamily: 'monospace' }}>
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.25rem' }}>Dias</div>
              </div>
              <div style={{ background: 'rgba(11, 17, 32, 0.9)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '10px', padding: '0.75rem 1.1rem', textAlign: 'center', minWidth: '70px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', lineHeight: 1, fontFamily: 'monospace' }}>
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.25rem' }}>Horas</div>
              </div>
              <div style={{ background: 'rgba(11, 17, 32, 0.9)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '10px', padding: '0.75rem 1.1rem', textAlign: 'center', minWidth: '70px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', lineHeight: 1, fontFamily: 'monospace' }}>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.25rem' }}>Min</div>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1.5px solid var(--accent-gold)', borderRadius: '10px', padding: '0.75rem 1.1rem', textAlign: 'center', minWidth: '70px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-gold)', lineHeight: 1, fontFamily: 'monospace' }}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-gold-light)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Seg</div>
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'flex-start',
          }}
        >
          {/* Left Column: Extensive Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Sobre o Evento */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: 'var(--accent-gold)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Sparkles size={20} />
                <span>Sobre o Evento</span>
              </h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.85,
                  fontSize: '1.05rem',
                  margin: 0,
                  whiteSpace: 'pre-line',
                }}
              >
                {event.description}
              </p>
            </div>

            {/* Preletor em Destaque */}
            {event.speakerName && (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, var(--bg-secondary) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.75rem 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: 'var(--accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '2px solid var(--accent-gold)',
                  }}
                >
                  <Mic size={26} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
                    Preletores & Ministração
                  </span>
                  <h4 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
                    {event.speakerName}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                    Ministério de louvor, palavra inspirada e mover do Espírito Santo.
                  </p>
                </div>
              </div>
            )}

            {/* Cronograma / Programação */}
            {event.detailedSchedule && (
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '2rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                  Programação Prevista
                </h3>
                <div
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.4rem 1.6rem',
                    fontSize: '0.98rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.8,
                    borderLeft: '4px solid var(--accent-gold)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {event.detailedSchedule}
                </div>
              </div>
            )}

            {/* Formulário Personalizado - Aviso Prévia */}
            {event.customQuestions && event.customQuestions.length > 0 && (
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.75rem 2rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <HelpCircle size={20} color="var(--accent-gold)" />
                  <span>Informações Solicitadas na Inscrição</span>
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
                  Para melhor organização e acolhimento da nossa equipe, este evento solicitará as seguintes informações no momento do cadastro:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {event.customQuestions.map((q) => (
                    <span
                      key={q.id}
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-full)',
                        padding: '0.35rem 0.85rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                      }}
                    >
                      ✓ {q.label} {q.required ? '*' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Localização & Google Maps Interativo */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ padding: '1.75rem 2rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={22} color="var(--accent-gold)" />
                  <span>Localização do Evento (Google Maps)</span>
                </h3>

                <div style={{ marginTop: '0.85rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    {event.locationDetails?.placeName || event.location}
                  </div>
                  {event.locationDetails?.formattedAddress && event.locationDetails.formattedAddress !== event.location && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {event.locationDetails.formattedAddress}
                    </div>
                  )}
                  <div style={{ fontSize: '0.88rem', color: 'var(--accent-gold)', marginTop: '0.35rem', fontWeight: 700 }}>
                    Espaço Reservado: {event.roomReserved}
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <a
                      href={getGoogleMapsDirectionsUrl(
                        event.location,
                        event.locationDetails?.latitude,
                        event.locationDetails?.longitude
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        fontWeight: 700,
                        padding: '0.5rem 1.15rem',
                      }}
                    >
                      <Navigation size={15} />
                      <span>Traçar Rota no Google Maps</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Iframe Interativo do Google Maps */}
              <div style={{ height: '320px', width: '100%' }}>
                <iframe
                  title="Mapa da Localização do Evento"
                  src={getGoogleMapsEmbedUrl(
                    event.location,
                    event.locationDetails?.latitude,
                    event.locationDetails?.longitude
                  )}
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Ticket / Inscrição Card (Sticky) */}
          <div style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1.5px solid var(--border-medium)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                  Valor da Inscrição
                </span>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: event.isFree ? 'var(--status-success)' : 'var(--accent-gold)', marginTop: '0.2rem' }}>
                  {event.isFree ? 'Entrada Gratuita' : `R$ ${event.price?.toFixed(2)}`}
                </div>
                {event.hasShirt && event.shirtPrice && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      borderRadius: '6px',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.78rem',
                      color: 'var(--accent-gold)',
                      fontWeight: 700,
                      marginTop: '0.5rem',
                    }}
                  >
                    <Shirt size={14} />
                    <span>Camisa Oficial disponível por R$ {event.shirtPrice.toFixed(2)} (opcional na inscrição)</span>
                  </div>
                )}
              </div>

              {/* Barra de Progresso de Ocupação */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.45rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ocupação:</span>
                  <strong style={{ color: spotsLeft > 0 ? 'var(--status-success)' : 'var(--status-error)' }}>
                    {spotsLeft > 0 ? `${spotsLeft} vagas restantes` : 'Esgotado'}
                  </strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${occupancyPercent}%`,
                      height: '100%',
                      background: occupancyPercent > 85 ? 'var(--status-error)' : 'var(--accent-gold)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'right' }}>
                  {event.registeredCount} de {event.totalCapacity} vagas preenchidas ({occupancyPercent}%)
                </div>
              </div>

              {/* Botão de Inscrição Grande */}
              <button
                disabled={isSoldOut}
                onClick={() => onStartRegistration(event)}
                className="btn btn-primary"
                style={{
                  padding: '1rem 1.5rem',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  gap: '0.6rem',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: isSoldOut ? 'none' : '0 6px 25px rgba(245, 158, 11, 0.45)',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <Ticket size={22} />
                <span>{isSoldOut ? 'Vagas Esgotadas' : event.isFree ? 'Garantir Minha Vaga Gratuita' : `Inscrever-se • R$ ${event.price?.toFixed(2)}`}</span>
              </button>

              {/* Selos de Confiança */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--status-success)" />
                  <span>Confirmação imediata por e-mail e tela</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <QrCode size={16} color="var(--accent-gold)" />
                  <span>Comprovante oficial em PDF com QR Code</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={16} color="var(--accent-blue-light)" />
                  <span>Credenciamento rápido e ágil na portaria</span>
                </div>
              </div>

              {/* Botões de Compartilhamento */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <a
                  href={shareWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{
                    gap: '0.5rem',
                    color: '#22c55e',
                    borderColor: 'rgba(34, 197, 94, 0.35)',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  <Share2 size={16} />
                  <span>Convidar Amigo no WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn btn-secondary"
                  style={{ gap: '0.5rem', justifyContent: 'center' }}
                >
                  {copiedLink ? (
                    <>
                      <Check size={16} color="var(--status-success)" />
                      <span style={{ color: 'var(--status-success)' }}>Link Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copiar Link do Evento</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
