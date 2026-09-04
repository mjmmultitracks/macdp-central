import React from 'react';
import { ChurchSettings, ChurchEvent, Sermon, AppModuleId, UserSession } from '../../types';
import {
  Radio,
  BookOpen,
  Headphones,
  Users,
  HeartHandshake,
  DollarSign,
  Heart,
  IdCard,
  FileText,
  Calendar,
  Sparkles,
  QrCode,
  Share2,
  ChevronRight,
  Clock,
  MapPin,
  Smartphone,
  Shield,
} from 'lucide-react';
import { getTodayDevotional } from '../../services/bibleService';
import { formatDate } from '../../utils/formatters';

interface AppHomeViewProps {
  churchSettings?: ChurchSettings;
  events: ChurchEvent[];
  sermons: Sermon[];
  currentUser?: UserSession;
  onNavigateTab: (tab: AppModuleId) => void;
  onOpenLive: () => void;
  onOpenEventDetail: (event: ChurchEvent) => void;
  onOpenDeviceTester: () => void;
  onOpenAdminPanel: () => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AppHomeView: React.FC<AppHomeViewProps> = ({
  churchSettings,
  events = [],
  sermons = [],
  currentUser,
  onNavigateTab,
  onOpenLive,
  onOpenEventDetail,
  onOpenDeviceTester,
  onOpenAdminPanel,
  onNotify,
}) => {
  const appSettings = churchSettings?.appSettings;
  const isLive = appSettings?.isLiveNow ?? true;
  const devotional = getTodayDevotional();

  const primaryColor = churchSettings?.themeColors?.primaryColor || '#f59e0b';
  const shortName = churchSettings?.shortName || 'MACDP Central';
  const bannerText =
    appSettings?.bannerText ||
    'Bem-vindo à presença de Deus! Uma igreja acolhedora, profética e apaixonada.';

  const canAccessAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'pastor' ||
    currentUser?.role === 'lider' ||
    currentUser?.role === 'tesouraria';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      {/* Banner Principal de Boas-Vindas da Igreja */}
      <div
        style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, #0F172A 100%)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <img
            src={churchSettings?.logoUrl || '/images/logo.png'}
            alt="Logo"
            style={{ width: '42px', height: '42px', objectFit: 'contain' }}
          />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              {shortName}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
              {churchSettings?.slogan || 'Proibido a Entrada de Pessoas Perfeitas'}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#E2E8F0', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
          {bannerText}
        </p>

        {/* Status do Membro ou Botão de Acesso ao Painel */}
        {currentUser && canAccessAdmin && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} color="var(--accent-gold)" />
              <span style={{ fontSize: '0.75rem', color: '#F1F5F9', fontWeight: 600 }}>
                {currentUser.name} ({currentUser.roleTitle})
              </span>
            </div>
            <button
              onClick={onOpenAdminPanel}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.725rem', padding: '0.3rem 0.65rem' }}
            >
              Painel ERP
            </button>
          </div>
        )}
      </div>

      {/* Card Destaque: Culto Ao Vivo (Live) */}
      <div
        onClick={onOpenLive}
        style={{
          background: isLive
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, var(--bg-secondary) 100%)'
            : 'var(--bg-secondary)',
          border: isLive ? '1.5px solid rgba(239, 68, 68, 0.6)' : '1px solid var(--border-subtle)',
          borderRadius: '20px',
          padding: '1.25rem',
          cursor: 'pointer',
          boxShadow: isLive ? '0 10px 30px rgba(239, 68, 68, 0.2)' : 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '16px',
              background: isLive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)',
              border: isLive ? '2px solid #EF4444' : '1px solid var(--accent-gold)',
              color: isLive ? '#EF4444' : 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Radio size={24} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              {isLive ? (
                <>
                  <span className="live-pulse" style={{ width: '8px', height: '8px' }} />
                  <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#EF4444' }}>
                    AO VIVO AGORA
                  </span>
                </>
              ) : (
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  TRANSMISSÃO OFICIAL
                </span>
              )}
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.15rem 0', color: 'var(--text-primary)' }}>
              {appSettings?.liveTitle || 'Culto da Família Ao Vivo'}
            </h3>

            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isLive ? 'Toque para assistir em tempo real' : 'Domingos 10h e 18h30 • Quartas 19h30'}
            </span>
          </div>
        </div>

        <button className={isLive ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'} style={{ flexShrink: 0 }}>
          {isLive ? 'Assistir' : 'Ver Horários'}
        </button>
      </div>

      {/* Grid de Ações e Módulos Rápidos */}
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Acesso Rápido
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
          {/* Bíblia */}
          <div
            onClick={() => onNavigateTab('biblia')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '0.85rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              transition: 'transform 0.15s',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={20} />
            </div>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-primary)' }}>Bíblia</span>
          </div>

          {/* Mídias */}
          <div
            onClick={() => onNavigateTab('midias')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '0.85rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Headphones size={20} />
            </div>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-primary)' }}>Mídias</span>
          </div>

          {/* Células */}
          <div
            onClick={() => onNavigateTab('celulas')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '0.85rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} />
            </div>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-primary)' }}>Células</span>
          </div>

          {/* PIX / Doações */}
          <div
            onClick={() => onNavigateTab('contribuir')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '0.85rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(234, 179, 8, 0.15)',
                color: '#EAB308',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={20} />
            </div>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-primary)' }}>Dízimos</span>
          </div>

          {/* Ministérios */}
          <div
            onClick={() => onNavigateTab('ministerios')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '0.85rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.15)',
                color: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HeartHandshake size={20} />
            </div>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-primary)' }}>Ministérios</span>
          </div>

          {/* Oração */}
          <div
            onClick={() => onNavigateTab('oracao')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '0.85rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#F43F5E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Heart size={20} />
            </div>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-primary)' }}>Oração</span>
          </div>

          {/* Carteirinha */}
          <div
            onClick={() => onNavigateTab('carteirinha')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '0.85rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IdCard size={20} />
            </div>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-primary)' }}>Carteirinha</span>
          </div>

          {/* Anotações */}
          <div
            onClick={() => onNavigateTab('anotacoes')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '0.85rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={20} />
            </div>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-primary)' }}>Caderno</span>
          </div>
        </div>
      </div>

      {/* Banner de Teste no Celular Real */}
      <div
        onClick={onOpenDeviceTester}
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '1.15rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'var(--accent-gold)',
              color: '#0B1120',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
            }}
          >
            <Smartphone size={22} />
          </div>
          <div>
            <strong style={{ fontSize: '0.925rem', color: 'var(--text-primary)', display: 'block' }}>
              Testar no seu Celular Real
            </strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Aponte a câmera e instale no iPhone ou Android via QR Code
            </span>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" style={{ flexShrink: 0, gap: '0.3rem' }}>
          <QrCode size={14} />
          <span>QR Code</span>
        </button>
      </div>

      {/* Card Versículo do Dia */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)' }}>
            <Sparkles size={16} />
            <strong style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Versículo do Dia</strong>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{devotional.reference}</span>
        </div>

        <p style={{ fontSize: '0.9rem', fontStyle: 'italic', margin: '0 0 0.5rem 0', color: 'var(--text-primary)', lineHeight: 1.5 }}>
          "{devotional.verse}"
        </p>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0' }}>
          {devotional.message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              const text = `"${devotional.verse}" — ${devotional.reference}\n\n📲 Compartilhado do App da Igreja MACDP`;
              if (navigator.share) {
                navigator.share({ title: 'Versículo do Dia', text }).catch(() => {});
              } else {
                navigator.clipboard.writeText(text);
                onNotify('success', 'Versículo copiado para o WhatsApp!');
              }
            }}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem', fontSize: '0.75rem' }}
          >
            <Share2 size={13} />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>

      {/* Próximos Eventos da Igreja */}
      {events.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Próximos Eventos & Conferências
            </h3>
            <button
              onClick={() => onNavigateTab('eventos')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-gold)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Ver todos
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {events.slice(0, 2).map((evt) => (
              <div
                key={evt.id}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '20px',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                onClick={() => onOpenEventDetail(evt)}
              >
                <div style={{ position: 'relative', height: '120px', background: '#0B1120' }}>
                  <img
                    src={evt.imageUrl || '/images/hero.jpg'}
                    alt={evt.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: 'var(--accent-gold)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                    }}
                  >
                    {evt.category}
                  </div>
                </div>

                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    <Calendar size={13} />
                    <span>{formatDate(evt.date)} às {evt.time}</span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
                    {evt.title}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                    <MapPin size={13} />
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
