import React from 'react';
import {
  Church,
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
  ShieldCheck,
  Compass,
  Video,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (section: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  return (
    <footer
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '4rem 0 2rem 0',
        marginTop: '4rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3.5rem',
          }}
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src="/images/logo.png"
                  alt="Logo Oficial MACDP"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.2rem' }}>Ministério Apostólico</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.1, margin: 0 }}>Caçadores da Presença</h4>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.6 }}>
              <strong>"Proibido a Entrada de Pessoas Perfeitas."</strong>
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Uma igreja acolhedora, profética e apaixonada pela presença manifesta de Deus em Manaus/AM. Pastores Presidentes Oziel Gomes Maduro e Midiã Gomes Maduro.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a
                href="https://instagram.com/_macdp"
                target="_blank"
                rel="noreferrer"
                title="Instagram @_macdp"
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-tertiary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  transition: 'background 0.2s',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                📸 @_macdp
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                title="YouTube MACDP Oficial"
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-tertiary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                ▶ MACDP Oficial
              </a>
            </div>
          </div>

          {/* Horários dos Cultos */}
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--accent-gold)" />
              <span>Nossas Reuniões</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>Domingo</strong>
                <span style={{ color: 'var(--text-secondary)' }}>10:00 - Culto de Celebração & Ceia</span>
                <br />
                <span style={{ color: 'var(--text-secondary)' }}>18:30 - Culto da Família na Presença</span>
              </div>
              <div style={{ paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>Quarta-feira</strong>
                <span style={{ color: 'var(--text-secondary)' }}>19:30 - Noite Profética & Ensino</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>Sábado</strong>
                <span style={{ color: 'var(--text-secondary)' }}>19:00 - Conexão Caçadores Youth</span>
              </div>
            </div>
          </div>

          {/* Endereço e Contato */}
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--accent-gold)" />
              <span>Onde Estamos</span>
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>
              Rua Lagoa Grande, 382
              <br />
              Conj. Canaranas - Cidade Nova
              <br />
              Manaus - AM, CEP 69097-750
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={15} color="var(--accent-gold)" /> WhatsApp / Tel: (92) 98450-9989
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={15} color="var(--accent-gold)" /> contato@macdp.com.br
              </span>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>Acesso Rápido</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
              <button
                onClick={() => onNavigate('oracao')}
                style={{ background: 'none', border: 'none', textAlign: 'left', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <Heart size={15} color="var(--accent-gold)" /> Pedir Oração (Sigiloso)
              </button>
              <button
                onClick={() => onNavigate('celulas')}
                style={{ background: 'none', border: 'none', textAlign: 'left', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <Compass size={15} color="var(--accent-gold)" /> Localizador de Células
              </button>
              <button
                onClick={() => onNavigate('dizimos')}
                style={{ background: 'none', border: 'none', textAlign: 'left', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <Heart size={15} color="var(--accent-gold)" /> Contribuir via Pix
              </button>
              <button
                onClick={() => onNavigate('mensagens')}
                style={{ background: 'none', border: 'none', textAlign: 'left', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <Video size={15} color="var(--accent-gold)" /> Ouvir Mensagens / Podcasts
              </button>
              <button
                onClick={onOpenAdmin}
                style={{ background: 'none', border: 'none', textAlign: 'left', color: 'var(--accent-gold)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.5rem' }}
              >
                <ShieldCheck size={16} /> Painel Administrativo Interno
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '2rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Ministério Apostólico Caçadores da Presença (MACDP) • Manaus - AM. Todos os direitos reservados.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Declaração de Fé</span>
            <span>Política de Privacidade & LGPD</span>
            <span>Estatuto Social</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
