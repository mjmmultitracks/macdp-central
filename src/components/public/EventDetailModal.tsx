import React from 'react';
import { ChurchEvent } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Share2,
  X,
  Sparkles,
  Ticket,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  Mic,
  Navigation,
} from 'lucide-react';
import { getGoogleMapsEmbedUrl, getGoogleMapsDirectionsUrl } from '../../services/googleMapsService';

interface EventDetailModalProps {
  event: ChurchEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onStartRegistration: (event: ChurchEvent) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onStartRegistration,
}) => {
  if (!isOpen || !event) return null;

  const spotsLeft = event.totalCapacity - event.registeredCount;
  const isSoldOut = spotsLeft <= 0;

  const shareText = `🏛️ *${event.title}* - Ministério Apostólico Caçadores da Presença (MACDP)\n\n📅 *Data:* ${formatDate(event.date)} às ${event.time}\n📍 *Local:* ${event.location}\n🎟️ *Inscrição:* ${event.isFree ? 'Entrada Gratuita' : `R$ ${event.price?.toFixed(2)}`}\n\nGaranta sua vaga no site oficial: ${window.location.origin}/#eventos`;

  const shareWhatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'rgba(5, 8, 16, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), 0 0 35px rgba(245, 158, 11, 0.12)',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Banner with Category & Badges */}
        <div style={{ position: 'relative', height: '280px', flexShrink: 0, overflow: 'hidden' }}>
          <img
            src={event.imageUrl}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Ambient Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, var(--bg-secondary) 0%, rgba(11, 17, 32, 0.5) 60%, rgba(0, 0, 0, 0.8) 100%)',
            }}
          />

          {/* Top Floating Badges */}
          <div
            style={{
              position: 'absolute',
              top: '1.25rem',
              left: '1.5rem',
              right: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.9)',
                  color: '#0B1120',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  padding: '0.3rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
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
                    fontSize: '0.78rem',
                    padding: '0.3rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    textTransform: 'uppercase',
                  }}
                >
                  Entrada Gratuita
                </span>
              ) : (
                <span
                  style={{
                    background: 'rgba(245, 158, 11, 0.25)',
                    color: 'var(--accent-gold-light)',
                    border: '1px solid rgba(245, 158, 11, 0.6)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    padding: '0.3rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  R$ {event.price?.toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '0.45rem',
                borderRadius: '50%',
                minWidth: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(11, 17, 32, 0.8)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              title="Fechar detalhes"
            >
              <X size={16} />
            </button>
          </div>

          {/* Event Title on Banner Base */}
          <div
            style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1.5rem',
              right: '1.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.85rem',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.2,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
              }}
            >
              {event.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Key Facts Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Calendar size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Data</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatDate(event.date)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: 'var(--accent-blue-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Clock size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Horário</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {event.time}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--status-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Users size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vagas</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {spotsLeft > 0 ? `${spotsLeft} vagas restantes` : 'Esgotado'}
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.65rem', color: 'var(--accent-gold)' }}>
              Sobre o Evento
            </h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.94rem' }}>
              {event.description}
            </p>
          </div>

          {/* Preletor & Ministração */}
          {event.speakerName && (
            <div
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.18)',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Mic size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Preletores & Ministração:
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {event.speakerName}
                </div>
              </div>
            </div>
          )}

          {/* Schedule / Programação */}
          {event.detailedSchedule && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Programação Prevista
              </h4>
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  fontSize: '0.88rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  borderLeft: '3px solid var(--accent-gold)',
                }}
              >
                {event.detailedSchedule}
              </div>
            </div>
          )}

          {/* Location & Church Address with Google Maps API */}
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
              Localização & Como Chegar (Google Maps)
            </h4>
            <div
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1.1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <MapPin size={22} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                    {event.locationDetails?.placeName || event.location}
                  </div>
                  {event.locationDetails?.formattedAddress && event.locationDetails.formattedAddress !== event.location && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {event.locationDetails.formattedAddress}
                    </div>
                  )}
                  <div style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', marginTop: '0.25rem', fontWeight: 600 }}>
                    Espaço: {event.roomReserved} • Ministério Apostólico Caçadores da Presença (MACDP)
                  </div>
                  <div style={{ marginTop: '0.65rem' }}>
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
                        gap: '0.35rem',
                        fontSize: '0.78rem',
                        padding: '0.35rem 0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      <Navigation size={13} />
                      <span>Traçar Rota no Google Maps</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Interactive Google Maps Embed */}
              <div style={{ height: '180px', width: '100%', position: 'relative' }}>
                <iframe
                  title="Mapa do Local do Evento no Google Maps"
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
        </div>

        {/* Footer Actions */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '1.25rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'var(--bg-tertiary)',
          }}
        >
          <a
            href={shareWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.45rem' }}
          >
            <Share2 size={16} />
            <span>Compartilhar no WhatsApp</span>
          </a>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={onClose} className="btn btn-secondary">
              Fechar
            </button>

            <button
              disabled={isSoldOut}
              onClick={() => {
                onClose();
                onStartRegistration(event);
              }}
              className="btn btn-primary"
              style={{
                gap: '0.5rem',
                padding: '0.65rem 1.75rem',
                fontWeight: 900,
                fontSize: '0.98rem',
                boxShadow: isSoldOut ? 'none' : '0 4px 20px rgba(245, 158, 11, 0.4)',
              }}
            >
              <Ticket size={18} />
              <span>{isSoldOut ? 'Vagas Esgotadas' : event.isFree ? 'Garantir Minha Vaga Gratuita' : `Inscrever-se • R$ ${event.price?.toFixed(2)}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
