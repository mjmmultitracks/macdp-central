import React, { useState, useEffect, useMemo } from 'react';
import {
  DatabaseSchema,
  UserSession,
  AppModuleId,
  ChurchSettings,
  ChurchEvent,
  AppNotification,
  ChurchProfile,
} from '../../types';
import {
  getAppNotifications,
  markAppNotificationAsRead,
  deleteAppNotification,
  INITIAL_CHURCH_SETTINGS,
} from '../../services/db';
import {
  getActiveChurchProfile,
  setSelectedChurchId,
} from '../../services/churchCatalogService';
import { applyThemeColors } from '../../utils/themeColors';
import {
  Home,
  BookOpen,
  Radio,
  Headphones,
  Menu,
  Bell,
  Sun,
  Moon,
  Smartphone,
  Shield,
  ExternalLink,
  ChevronLeft,
  ChevronDown,
  Users,
  HeartHandshake,
  DollarSign,
  Heart,
  IdCard,
  FileText,
  Calendar,
  X,
  Sparkles,
  ArrowLeft,
  Building2,
  MapPin,
} from 'lucide-react';

// Subviews
import { AppHomeView } from './AppHomeView';
import { AppBibleView } from './AppBibleView';
import { AppLiveView } from './AppLiveView';
import { AppMediaView } from './AppMediaView';
import { AppMinistriesView } from './AppMinistriesView';
import { AppCellsView } from './AppCellsView';
import { AppGivingView } from './AppGivingView';
import { AppPrayerForm } from './AppPrayerForm';
import { AppMembershipCard } from './AppMembershipCard';
import { AppSermonNotesView } from './AppSermonNotesView';
import { AppNotificationsModal } from './AppNotificationsModal';
import { AppDeviceTesterModal } from './AppDeviceTesterModal';
import { AppChurchSelectorModal } from './AppChurchSelectorModal';

interface ChurchAppProps {
  db: DatabaseSchema;
  currentUser?: UserSession;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenAdminPanel: () => void;
  onBackToWebsite: () => void;
  onLoginMember: (user: UserSession) => void;
  onLogout: () => void;
  onOpenEventDetail: (event: ChurchEvent) => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const ChurchApp: React.FC<ChurchAppProps> = ({
  db,
  currentUser,
  isDarkMode,
  onToggleTheme,
  onOpenAdminPanel,
  onBackToWebsite,
  onLoginMember,
  onLogout,
  onOpenEventDetail,
  onNotify,
}) => {
  // Navigation
  const [currentTab, setCurrentTab] = useState<'home' | 'biblia' | 'live' | 'midias' | 'mais'>('home');
  const [activeSubModule, setActiveSubModule] = useState<AppModuleId | null>(null);

  // Active Church in the Multi-Church Hub
  const [activeChurchProfile, setActiveChurchProfile] = useState<ChurchProfile>(() => getActiveChurchProfile());
  const [isChurchSelectorOpen, setIsChurchSelectorOpen] = useState(false);

  // Modals
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDeviceTesterOpen, setIsDeviceTesterOpen] = useState(false);

  // Frame simulation mode on desktop
  const [isDesktopFrame, setIsDesktopFrame] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 900;
    }
    return false;
  });

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getAppNotifications());

  useEffect(() => {
    const handleDbUpdate = () => {
      setNotifications(getAppNotifications());
    };
    const handleChurchChanged = () => {
      const updated = getActiveChurchProfile();
      setActiveChurchProfile(updated);
      if (updated.themeColors) {
        applyThemeColors(updated.themeColors, isDarkMode);
      }
    };

    window.addEventListener('igreja_db_updated', handleDbUpdate);
    window.addEventListener('app_notification_received', handleDbUpdate);
    window.addEventListener('church_selected_changed', handleChurchChanged);

    return () => {
      window.removeEventListener('igreja_db_updated', handleDbUpdate);
      window.removeEventListener('app_notification_received', handleDbUpdate);
      window.removeEventListener('church_selected_changed', handleChurchChanged);
    };
  }, [isDarkMode]);

  // Derived effective church settings (merges db.churchSettings with the selected church profile)
  const effectiveChurchSettings: ChurchSettings = useMemo(() => {
    const base: ChurchSettings = db.churchSettings || INITIAL_CHURCH_SETTINGS;
    return {
      ...base,
      name: activeChurchProfile.name || base.name || 'Ministério Apostólico Caçadores da Presença',
      shortName: activeChurchProfile.shortName || base.shortName || 'MACDP Central',
      subtitle: activeChurchProfile.subtitle || base.subtitle || 'Ministério Apostólico',
      slogan: activeChurchProfile.slogan || base.slogan || 'Proibido a Entrada de Pessoas Perfeitas.',
      logoUrl: activeChurchProfile.logoUrl || base.logoUrl || '/icon-192.png',
      pastorPresident: activeChurchProfile.pastorPresident || base.pastorPresident || 'Pr. Marcos & Pra. Juliana',
      address: {
        street: activeChurchProfile.address || base.address?.street || 'Rua Carlos Lacerda, 45',
        neighborhood: activeChurchProfile.neighborhood || base.address?.neighborhood || 'Aleixo',
        city: activeChurchProfile.city || base.address?.city || 'Manaus',
        state: activeChurchProfile.state || base.address?.state || 'AM',
        zip: base.address?.zip || '69060-000',
      },
      pix: {
        key: activeChurchProfile.pixKey || base.pix?.key || 'pix@macdp.com.br',
        receiver: activeChurchProfile.pixReceiver || base.pix?.receiver || activeChurchProfile.name,
        bank: base.pix?.bank || 'Banco Digital / PIX',
      },
      appSettings: {
        appName: activeChurchProfile.shortName,
        appShortName: activeChurchProfile.shortName,
        appSlogan: activeChurchProfile.slogan || base.appSettings?.appSlogan || 'Proibido a Entrada de Pessoas Perfeitas.',
        appLogoUrl: activeChurchProfile.logoUrl || base.appSettings?.appLogoUrl,
        liveStreamUrl: activeChurchProfile.liveStreamUrl || base.appSettings?.liveStreamUrl || 'https://www.youtube.com/@cacadordaPresenca',
        isLiveNow: activeChurchProfile.isLiveNow ?? base.appSettings?.isLiveNow ?? false,
        liveTitle: `${activeChurchProfile.shortName} Ao Vivo`,
        liveSubtitle: `Transmissão em tempo real - ${activeChurchProfile.city}`,
        bannerText: `Bem-vindo à ${activeChurchProfile.shortName}!`,
        bannerImageUrl: base.appSettings?.bannerImageUrl,
        devotionalOfTheDay: base.appSettings?.devotionalOfTheDay,
        enabledModules: base.appSettings?.enabledModules || {
          biblia: true,
          live: true,
          midias: true,
          ministerios: true,
          celulas: true,
          eventos: true,
          oracao: true,
          contribuir: true,
          carteirinha: true,
          anotacoes: true,
        },
      },
      themeColors: activeChurchProfile.themeColors || base.themeColors,
    };
  }, [db.churchSettings, activeChurchProfile]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isLive = effectiveChurchSettings.appSettings?.isLiveNow ?? true;

  const handleSelectTab = (tab: 'home' | 'biblia' | 'live' | 'midias' | 'mais') => {
    setCurrentTab(tab);
    setActiveSubModule(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSubModule = (module: AppModuleId) => {
    if (module === 'home') {
      setCurrentTab('home');
      setActiveSubModule(null);
    } else if (module === 'biblia') {
      setCurrentTab('biblia');
      setActiveSubModule(null);
    } else if (module === 'live') {
      setCurrentTab('live');
      setActiveSubModule(null);
    } else if (module === 'midias') {
      setCurrentTab('midias');
      setActiveSubModule(null);
    } else {
      setCurrentTab('mais');
      setActiveSubModule(module);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render Inner Content
  const renderContent = () => {
    if (currentTab === 'home') {
      return (
        <AppHomeView
          churchSettings={effectiveChurchSettings}
          events={db.events || []}
          sermons={db.sermons || []}
          currentUser={currentUser}
          onNavigateTab={handleNavigateSubModule}
          onOpenLive={() => handleSelectTab('live')}
          onOpenEventDetail={onOpenEventDetail}
          onOpenDeviceTester={() => setIsDeviceTesterOpen(true)}
          onOpenAdminPanel={onOpenAdminPanel}
          onNotify={onNotify}
        />
      );
    }

    if (currentTab === 'biblia') {
      return <AppBibleView onNotify={onNotify} />;
    }

    if (currentTab === 'live') {
      return (
        <AppLiveView
          churchSettings={effectiveChurchSettings}
          onOpenGiving={() => handleNavigateSubModule('contribuir')}
          onOpenPrayer={() => handleNavigateSubModule('oracao')}
          onNotify={onNotify}
        />
      );
    }

    if (currentTab === 'midias') {
      return <AppMediaView sermons={db.sermons || []} onNotify={onNotify} />;
    }

    // Tab 'mais'
    if (activeSubModule === 'ministerios') {
      return (
        <AppMinistriesView
          ministries={db.ministries || []}
          schedules={db.schedules || []}
          currentUser={currentUser}
          onNotify={onNotify}
        />
      );
    }

    if (activeSubModule === 'celulas') {
      return <AppCellsView cells={db.cells || []} onNotify={onNotify} />;
    }

    if (activeSubModule === 'contribuir') {
      return <AppGivingView churchSettings={effectiveChurchSettings} onNotify={onNotify} />;
    }

    if (activeSubModule === 'oracao') {
      return <AppPrayerForm currentUser={currentUser} onNotify={onNotify} />;
    }

    if (activeSubModule === 'carteirinha') {
      return (
        <AppMembershipCard
          currentUser={currentUser}
          churchSettings={effectiveChurchSettings}
          members={db.members || []}
          onOpenAdminPanel={onOpenAdminPanel}
          onLoginMember={onLoginMember}
          onLogout={onLogout}
          onNotify={onNotify}
        />
      );
    }

    if (activeSubModule === 'anotacoes') {
      return <AppSermonNotesView onNotify={onNotify} />;
    }

    // Menu Geral 'Mais'
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3.5rem' }}>
        {/* Card da Congregação Atual no Hub */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, var(--bg-secondary) 100%)',
            borderRadius: '20px',
            border: '1.5px solid var(--accent-gold, #f59e0b)',
            padding: '1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img
              src={effectiveChurchSettings.logoUrl || '/icon-192.png'}
              alt={effectiveChurchSettings.shortName}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                objectFit: 'cover',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/icon-192.png';
              }}
            />
            <div>
              <span
                style={{
                  fontSize: '0.675rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--accent-gold, #f59e0b)',
                  fontWeight: 800,
                  display: 'block',
                }}
              >
                Sua Congregação
              </span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block' }}>
                {effectiveChurchSettings.shortName}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {effectiveChurchSettings.address?.city} - {effectiveChurchSettings.address?.state}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsChurchSelectorOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{
              fontSize: '0.75rem',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              borderRadius: '10px',
            }}
          >
            <Building2 size={13} />
            <span>Trocar</span>
          </button>
        </div>

        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: '20px',
            border: '1px solid var(--border-subtle)',
            padding: '1.25rem',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
            Mais Recursos & Serviços
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Tudo o que você precisa na vida cristã e comunitária na {effectiveChurchSettings?.shortName || 'MACDP'}.
          </p>
        </div>

        {/* Menu List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {[
            {
              id: 'carteirinha',
              title: 'Carteirinha Digital de Membro',
              subtitle: 'Credencial oficial com foto e QR Code para check-in',
              icon: <IdCard size={20} color="#10B981" />,
              badge: currentUser ? 'Identificado' : 'Acessar',
            },
            {
              id: 'ministerios',
              title: 'Ministérios & Voluntariado',
              subtitle: 'Conheça as áreas da igreja e inscreva-se para servir',
              icon: <HeartHandshake size={20} color="#8B5CF6" />,
            },
            {
              id: 'celulas',
              title: 'Células & Grupos Familiares',
              subtitle: 'Encontre uma reunião no seu bairro com contato do líder',
              icon: <Users size={20} color="#3B82F6" />,
            },
            {
              id: 'contribuir',
              title: 'Dízimos & Ofertas (PIX)',
              subtitle: 'Copie a chave PIX e contribua com o ministério',
              icon: <DollarSign size={20} color="#EAB308" />,
            },
            {
              id: 'oracao',
              title: 'Central de Pedidos de Oração',
              subtitle: 'Envie causas para os pastores e intercessores da igreja',
              icon: <Heart size={20} color="#F43F5E" />,
            },
            {
              id: 'anotacoes',
              title: 'Caderno de Sermões',
              subtitle: 'Suas notas pessoais das pregações e cultos',
              icon: <FileText size={20} color="#6366F1" />,
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveSubModule(item.id as AppModuleId)}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <strong style={{ fontSize: '0.925rem', color: 'var(--text-primary)', display: 'block' }}>
                    {item.title}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {item.subtitle}
                  </span>
                </div>
              </div>

              <ChevronLeft size={18} style={{ transform: 'rotate(180deg)', color: 'var(--text-muted)' }} />
            </div>
          ))}
        </div>

        {/* Botão Acessar Painel de Controle ERP */}
        <div
          onClick={onOpenAdminPanel}
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)',
            borderRadius: '20px',
            border: '1.5px solid var(--accent-gold)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(245, 158, 11, 0.15)',
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
              }}
            >
              <Shield size={22} />
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#FFFFFF', display: 'block' }}>
                Painel de Controle da Igreja
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>
                Área de Gestão Eclesiástica & Liderança
              </span>
            </div>
          </div>

          <button className="btn btn-primary btn-sm">Acessar</button>
        </div>

        {/* Botão Testar no Celular Real */}
        <button
          onClick={() => setIsDeviceTesterOpen(true)}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', borderRadius: '14px' }}
        >
          <Smartphone size={18} />
          <span>Instalar / Testar em Celular Real (QR Code)</span>
        </button>

        {/* Botão Voltar ao Site */}
        <button
          onClick={onBackToWebsite}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.825rem',
            cursor: 'pointer',
            textAlign: 'center',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
          }}
        >
          <ArrowLeft size={14} />
          <span>Voltar ao Portal / Site Público da Igreja</span>
        </button>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: isDesktopFrame ? '#030712' : 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isDesktopFrame ? 'center' : 'flex-start',
        padding: isDesktopFrame ? '1.5rem 1rem' : 0,
        position: 'relative',
      }}
    >
      {/* Top Floating Utility Bar for Desktop */}
      {isDesktopFrame && (
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 1rem',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <button
            onClick={onBackToWebsite}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem', fontSize: '0.775rem' }}
          >
            <ArrowLeft size={14} />
            <span>Voltar ao Site</span>
          </button>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setIsDeviceTesterOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.35rem', fontSize: '0.775rem' }}
            >
              <Smartphone size={14} />
              <span>Testar no Celular</span>
            </button>

            <button
              onClick={() => setIsDesktopFrame(false)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Tela Cheia
            </button>
          </div>
        </div>
      )}

      {/* Main App Container / Smartphone Frame */}
      <div
        style={{
          width: '100%',
          maxWidth: isDesktopFrame ? '430px' : '640px',
          minHeight: isDesktopFrame ? '840px' : '100vh',
          height: isDesktopFrame ? '860px' : 'auto',
          background: 'var(--bg-primary)',
          borderRadius: isDesktopFrame ? '44px' : 0,
          border: isDesktopFrame ? '10px solid #1F2937' : 'none',
          boxShadow: isDesktopFrame
            ? '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.15)'
            : 'none',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Dynamic Island / Notch Simulation on Desktop */}
        {isDesktopFrame && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '110px',
              height: '24px',
              background: '#000000',
              borderRadius: '20px',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1E293B', marginRight: '6px' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0F172A' }} />
          </div>
        )}

        {/* TOP APP BAR */}
        <header
          style={{
            padding: isDesktopFrame ? '2.2rem 1.25rem 0.85rem 1.25rem' : '0.85rem 1.25rem',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Back button when in sub-module or Logo */}
          {activeSubModule ? (
            <button
              onClick={() => setActiveSubModule(null)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '0.45rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} />
              <span>Voltar</span>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <img
                src={effectiveChurchSettings?.logoUrl || '/images/logo.png'}
                alt="Logo"
                style={{ width: '34px', height: '34px', objectFit: 'contain', borderRadius: '8px' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/logo.png';
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {effectiveChurchSettings?.appSettings?.appShortName || effectiveChurchSettings?.shortName || 'MACDP'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsChurchSelectorOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    fontSize: '0.675rem',
                    color: 'var(--accent-gold, #f59e0b)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  title="Trocar congregação no app"
                >
                  <MapPin size={10} />
                  <span>{effectiveChurchSettings.address?.city || 'Trocar igreja'}</span>
                  <ChevronDown size={11} />
                </button>
              </div>

              {isLive && (
                <div
                  onClick={() => handleSelectTab('live')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #EF4444',
                    color: '#EF4444',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <span className="live-pulse" style={{ width: '6px', height: '6px' }} />
                  <span>AO VIVO</span>
                </div>
              )}
            </div>
          )}

          {/* Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Notifications Button */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    background: '#EF4444',
                    color: '#FFFFFF',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleTheme}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Profile Avatar / Login */}
            <button
              onClick={() => handleNavigateSubModule('carteirinha')}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--accent-gold)',
                color: '#0B1120',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.8rem',
              }}
            >
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : <IdCard size={18} />}
            </button>
          </div>
        </header>

        {/* APP BODY (Scrollable) */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 1.25rem 5rem 1.25rem',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {renderContent()}
        </main>

        {/* BOTTOM NAVIGATION BAR */}
        <nav
          style={{
            position: isDesktopFrame ? 'absolute' : 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '64px',
            background: 'var(--bg-primary)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            zIndex: 90,
            backdropFilter: 'blur(16px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          {[
            { id: 'home', label: 'Início', icon: <Home size={20} /> },
            { id: 'biblia', label: 'Bíblia', icon: <BookOpen size={20} /> },
            {
              id: 'live',
              label: 'Ao Vivo',
              icon: (
                <div style={{ position: 'relative' }}>
                  <Radio size={20} />
                  {isLive && (
                    <span
                      className="live-pulse"
                      style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-4px',
                        width: '7px',
                        height: '7px',
                      }}
                    />
                  )}
                </div>
              ),
            },
            { id: 'midias', label: 'Mídias', icon: <Headphones size={20} /> },
            { id: 'mais', label: 'Mais', icon: <Menu size={20} /> },
          ].map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id as any)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.2rem',
                  height: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'color 0.15s, transform 0.15s',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {item.icon}
                <span
                  style={{
                    fontSize: '0.675rem',
                    fontWeight: isActive ? 800 : 500,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Notifications Modal */}
      <AppNotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={(id) => {
          markAppNotificationAsRead(id);
          setNotifications(getAppNotifications());
        }}
        onDeleteNotification={(id) => {
          deleteAppNotification(id);
          setNotifications(getAppNotifications());
        }}
        onSelectAction={(url) => {
          if (url.includes('live')) handleSelectTab('live');
          else if (url.includes('biblia')) handleSelectTab('biblia');
          else if (url.includes('eventos')) handleNavigateSubModule('eventos');
        }}
        onNotify={onNotify}
      />

      {/* Real Device QR Code & Guide Modal */}
      <AppDeviceTesterModal
        isOpen={isDeviceTesterOpen}
        onClose={() => setIsDeviceTesterOpen(false)}
        appName={effectiveChurchSettings?.appSettings?.appName || effectiveChurchSettings?.name || 'MACDP App'}
        isDesktopFrame={isDesktopFrame}
        onToggleDesktopFrame={() => setIsDesktopFrame(!isDesktopFrame)}
      />

      {/* Multi-Church Hub Selector Modal */}
      <AppChurchSelectorModal
        isOpen={isChurchSelectorOpen}
        onClose={() => setIsChurchSelectorOpen(false)}
        onSelectChurch={(church) => {
          setActiveChurchProfile(church);
          if (church.themeColors) {
            applyThemeColors(church.themeColors, isDarkMode);
          }
          onNotify('success', `Igreja alterada para ${church.shortName}`);
        }}
      />
    </div>
  );
};
