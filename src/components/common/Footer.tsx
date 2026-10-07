import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
  Compass,
  Video,

  Shield,
  ArrowUpRight,
} from 'lucide-react';
import { ChurchSettings } from '../../types';

interface FooterProps {
  onNavigate: (section: string) => void;
  onOpenAdmin?: () => void;
  churchSettings?: ChurchSettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin, churchSettings }) => {
  return (
    <footer
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '3.5rem 0 2rem 0',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        {/* Main Clean Grid (4 colunas objetivas) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '2.5rem 2rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Coluna 1: Identidade da Igreja & Redes Sociais */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: '#0b1120',
                  border: '1.5px solid rgba(245, 158, 11, 0.4)',
                  padding: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={churchSettings?.logoUrl || '/images/logo.png'}
                  alt="MACDP"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', lineHeight: 1 }}>
                  Ministério Apostólico
                </span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.2rem 0 0 0', lineHeight: 1.1 }}>
                  Caçadores da Presença
                </h4>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.55, margin: 0 }}>
              "Proibido a entrada de pessoas perfeitas." Um hospital de almas e uma família em Manaus que caça a Presença de Deus.
            </p>

            {/* Redes Sociais Compactas */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {churchSettings?.social?.instagram && (
                <a
                  href={churchSettings.social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>📸</span>
                  <span>Instagram</span>
                </a>
              )}
              {churchSettings?.social?.youtube && (
                <a
                  href={churchSettings.social.youtube}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>▶</span>
                  <span>YouTube</span>
                </a>
              )}
            </div>
          </div>

          {/* Coluna 2: Cultos Semanais Compactos */}
          <div>
            <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={15} color="var(--accent-gold)" />
              <span>Cultos & Reuniões</span>
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <strong>Domingo (Manhã)</strong>
                <span>10:00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <strong>Domingo (Família)</strong>
                <span>18:30</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <strong>Quarta-feira (Ensino)</strong>
                <span>19:30</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <strong>Sábado (Jovens)</strong>
                <span>19:00</span>
              </div>
            </div>
          </div>

          {/* Coluna 3: Endereço & Contato Direto */}
          <div>
            <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={15} color="var(--accent-gold)" />
              <span>Templo Sede</span>
            </h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.5, margin: '0 0 0.65rem 0' }}>
              {churchSettings?.address.street || 'Rua Lagoa Grande, 382'} • Canaranas, Cidade Nova, Manaus - AM
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Phone size={13} color="var(--accent-gold)" /> {churchSettings?.phone || '(92) 99127-9663'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Mail size={13} color="var(--accent-gold)" /> {churchSettings?.email || 'contato@macdp.com.br'}
              </span>
            </div>
          </div>

          {/* Coluna 4: Ações & Acesso Rápido */}
          <div>
            <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Acesso Rápido
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.84rem' }}>
              <button
                onClick={() => onNavigate('eventos')}
                style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ArrowUpRight size={13} color="var(--accent-gold)" /> Inscrição em Conferências
              </button>
              <button
                onClick={() => onNavigate('celulas')}
                style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Compass size={13} color="var(--accent-gold)" /> Encontrar uma Célula
              </button>
              <button
                onClick={() => onNavigate('dizimos')}
                style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Heart size={13} color="var(--accent-gold)" /> Contribuição via PIX
              </button>
              <button
                onClick={() => onNavigate('oracao')}
                style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Mail size={13} color="var(--accent-gold)" /> Pedido de Oração
              </button>
            </div>
          </div>
        </div>

        {/* Linha Inferior Limpa & Copyright */}
        <div
          style={{
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          <div
            onClick={(e) => {
              if (e.detail >= 3 && onOpenAdmin) onOpenAdmin();
            }}
            style={{ userSelect: 'none', cursor: 'default' }}
          >
            © {new Date().getFullYear()} Ministério Apostólico Caçadores da Presença • Manaus/AM. Todos os direitos reservados.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span>Declaração de Fé</span>
            <span>Privacidade & LGPD</span>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Shield size={12} />
                <span>Acesso Pastoral</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
