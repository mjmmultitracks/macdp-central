import React, { useState, useEffect } from 'react';
import { ChurchEvent } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  Sparkles,
  Ticket,
  ChevronRight,
  Share2,
  Flame,
  MapPin,
  Users,
} from 'lucide-react';

interface ConferenceCountdownProps {
  event?: ChurchEvent;
  onOpenEvent: (event: ChurchEvent) => void;
  onRegister: (event: ChurchEvent) => void;
}

export const ConferenceCountdown: React.FC<ConferenceCountdownProps> = ({
  event,
  onOpenEvent,
  onRegister,
}) => {
  // Target: 13 de Novembro de 2026 às 19:30 (Horário de Manaus)
  const targetDate = new Date('2026-11-13T19:30:00');

  const calculateTimeLeft = () => {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isPast: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  const shareText = `🔥 *Conferência Caçadores da Presença 2026*\n\n📅 Início: 13 de Novembro de 2026 às 19h30\n📍 Local: Chácara Paraiso Verde - Iranduba - AM\n⏳ Faltam apenas ${timeLeft.days} dias, ${timeLeft.hours} horas e ${timeLeft.minutes} minutos!\n\nGaranta sua vaga no site oficial:\n${window.location.origin}/evento/evt_1`;

  const shareWhatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <section
      style={{
        position: 'relative',
        margin: '-2.5rem auto 3.5rem auto',
        maxWidth: '1200px',
        padding: '0 1.5rem',
        zIndex: 10,
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.92) 50%, rgba(20, 15, 5, 0.96) 100%)',
          border: '1.5px solid rgba(245, 158, 11, 0.45)',
          borderRadius: 'var(--radius-2xl)',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(245, 158, 11, 0.15)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow de Fundo */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
          }}
        >
          {/* Lado Esquerdo: Informações da Conferência */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: 'var(--radius-full)', padding: '0.35rem 0.9rem', marginBottom: '1rem' }}>
              <Flame size={16} color="var(--accent-gold)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-gold-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                O Grande Evento do Ano • 13 de Novembro de 2026
              </span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.18,
                margin: '0 0 0.75rem 0',
              }}
            >
              Conferência <span style={{ color: 'var(--accent-gold-light)' }}>Caçadores da Presença</span> 2026
            </h2>

            <p style={{ fontSize: '0.98rem', color: '#cbd5e1', lineHeight: 1.65, margin: '0 0 1.5rem 0', maxWidth: '540px' }}>
              Três dias inesquecíveis de louvor profético, ministração da Palavra, capacitação espiritual e avivamento sobrenatural com os <strong>Prs. Oziel e Midiã Gomes Maduro</strong> e preletores convidados.
            </p>

            {/* Metadados rápidos */}
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Calendar size={16} color="var(--accent-gold)" />
                <strong>13 a 15 de Novembro de 2026</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Clock size={16} color="var(--accent-gold)" />
                <span>Início às 19:30</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <MapPin size={16} color="var(--accent-blue-light)" />
                <span>Chácara Paraiso Verde • Iranduba - AM</span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {event && (
                <button
                  type="button"
                  onClick={() => onRegister(event)}
                  className="btn btn-primary"
                  style={{
                    gap: '0.55rem',
                    padding: '0.8rem 1.6rem',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.45)',
                  }}
                >
                  <Ticket size={18} />
                  <span>Garantir Minha Vaga</span>
                </button>
              )}

              {event && (
                <button
                  type="button"
                  onClick={() => onOpenEvent(event)}
                  className="btn btn-secondary"
                  style={{
                    gap: '0.5rem',
                    padding: '0.8rem 1.35rem',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    background: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <span>Ver Programação</span>
                  <ChevronRight size={16} />
                </button>
              )}

              <a
                href={shareWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
                style={{
                  color: '#22c55e',
                  fontSize: '0.88rem',
                  gap: '0.4rem',
                  padding: '0.75rem 1rem',
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
                title="Compartilhar contagem no WhatsApp"
              >
                <Share2 size={16} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Lado Direito: Temporizador / Contagem Regressiva Monumental */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} />
              <span>Contagem Regressiva para a Abertura</span>
            </div>

            {/* 4 Caixas de Contagem */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 'clamp(0.5rem, 1.5vw, 1rem)',
                width: '100%',
                maxWidth: '460px',
              }}
            >
              {/* Dias */}
              <div
                style={{
                  background: 'rgba(11, 17, 32, 0.85)',
                  border: '1.5px solid rgba(245, 158, 11, 0.45)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.25rem 0.65rem',
                  textAlign: 'center',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    fontWeight: 900,
                    color: 'var(--accent-gold-light)',
                    lineHeight: 1,
                    fontFamily: 'monospace, sans-serif',
                    textShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
                  }}
                >
                  {formatNumber(timeLeft.days)}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    marginTop: '0.5rem',
                  }}
                >
                  Dias
                </div>
              </div>

              {/* Horas */}
              <div
                style={{
                  background: 'rgba(11, 17, 32, 0.85)',
                  border: '1.5px solid rgba(245, 158, 11, 0.45)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.25rem 0.65rem',
                  textAlign: 'center',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    fontWeight: 900,
                    color: '#ffffff',
                    lineHeight: 1,
                    fontFamily: 'monospace, sans-serif',
                  }}
                >
                  {formatNumber(timeLeft.hours)}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    marginTop: '0.5rem',
                  }}
                >
                  Horas
                </div>
              </div>

              {/* Minutos */}
              <div
                style={{
                  background: 'rgba(11, 17, 32, 0.85)',
                  border: '1.5px solid rgba(245, 158, 11, 0.45)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.25rem 0.65rem',
                  textAlign: 'center',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    fontWeight: 900,
                    color: '#ffffff',
                    lineHeight: 1,
                    fontFamily: 'monospace, sans-serif',
                  }}
                >
                  {formatNumber(timeLeft.minutes)}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    marginTop: '0.5rem',
                  }}
                >
                  Minutos
                </div>
              </div>

              {/* Segundos */}
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1.5px solid var(--accent-gold)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.25rem 0.65rem',
                  textAlign: 'center',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 158, 11, 0.25)',
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    fontWeight: 900,
                    color: 'var(--accent-gold)',
                    lineHeight: 1,
                    fontFamily: 'monospace, sans-serif',
                    textShadow: '0 0 15px rgba(245, 158, 11, 0.5)',
                  }}
                >
                  {formatNumber(timeLeft.seconds)}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: 'var(--accent-gold-light)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    marginTop: '0.5rem',
                  }}
                >
                  Segundos
                </div>
              </div>
            </div>

            {/* Aviso de Vagas Limitadas */}
            <div style={{ marginTop: '1.25rem', fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={14} color="var(--accent-gold)" />
              <span>Vagas limitadas pela capacidade do local (200 pessoas).</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
