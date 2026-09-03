import React, { useState, useEffect } from 'react';
import { DatabaseSchema, Sermon, ChurchEvent, UserRole, UserSession } from './types';
import { getDatabase, calculateChurchStats, addEventRegistration } from './services/db';
import { getCurrentUser, switchUserRole, isUserAuthenticated, logoutUser } from './services/authService';
import { formatDate } from './utils/formatters';
import { pullDatabaseFromSupabase, pushDatabaseToSupabase, subscribeToSupabaseRealtime } from './services/supabaseSync';
import { isSupabaseConfigured } from './services/supabase';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Modal } from './components/common/Modal';
import { ToastContainer, ToastMessage } from './components/common/Toast';

// Public Sections
import { HeroSection } from './components/public/HeroSection';
import { EventsSection } from './components/public/EventsSection';
import { SermonsSection } from './components/public/SermonsSection';
import { AboutSection } from './components/public/AboutSection';
import { CellsLocator } from './components/public/CellsLocator';
import { GivingSection } from './components/public/GivingSection';
import { PrayerForm } from './components/public/PrayerForm';

// Admin Views
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardHome } from './components/admin/DashboardHome';
import { MembersCRM } from './components/admin/MembersCRM';
import { FinancialManager } from './components/admin/FinancialManager';
import { EventsManager } from './components/admin/EventsManager';
import { PrayerCentral } from './components/admin/PrayerCentral';
import { CellsManager } from './components/admin/CellsManager';
import { MinistriesManager } from './components/admin/MinistriesManager';
import { TeachingManager } from './components/admin/TeachingManager';
import { KidsManager } from './components/admin/KidsManager';
import { PatrimonyManager } from './components/admin/PatrimonyManager';
import { PastoralManager } from './components/admin/PastoralManager';
import { AccessManager } from './components/admin/AccessManager';
import { ChurchSettingsManager } from './components/admin/ChurchSettingsManager';
import { MemberSelfRegistration } from './components/public/MemberSelfRegistration';
import { EventDetailPage } from './components/public/EventDetailPage';
import { EventRegistrationWizard } from './components/public/EventRegistrationWizard';
import { ConferenceCountdown } from './components/public/ConferenceCountdown';
import { AdminLogin } from './components/admin/AdminLogin';

// Icons for Modals
import { Play, Headphones, Share2, BookOpen, CheckCircle2, Calendar, Radio, Users } from 'lucide-react';

export function App() {
  // Verificação de rota administrativa segura (/admin, /painel, #admin, ?admin=true)
  const isAdminRoute = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    return (
      path === '/admin' ||
      path === '/admin/' ||
      path === '/painel' ||
      path === '/painel/' ||
      path === '/gestao' ||
      path === '/gestao/' ||
      hash === '#admin' ||
      hash === '#painel' ||
      search.get('admin') === 'true' ||
      search.get('painel') === 'true'
    );
  };

  // Navigation State
  const [view, setView] = useState<'public' | 'admin'>(() => (isAdminRoute() ? 'admin' : 'public'));
  const [publicSection, setPublicSection] = useState('home');
  const [adminTab, setAdminTab] = useState('dashboard');

  // DB State
  const [db, setDb] = useState<DatabaseSchema>(getDatabase);

  // Auth / RBAC State
  const [currentUser, setCurrentUser] = useState<UserSession>(getCurrentUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isUserAuthenticated());

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('igreja_theme');
    if (saved) return saved === 'dark';
    return true; // Default to elegant dark mode
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Public Modals
  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [activeSermon, setActiveSermon] = useState<Sermon | null>(null);
  const [selectedEventForModal, setSelectedEventForModal] = useState<ChurchEvent | null>(null);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<ChurchEvent | null>(null);
  const [selectedEventForWizard, setSelectedEventForWizard] = useState<ChurchEvent | null>(null);
  const [volunteerMinistryName, setVolunteerMinistryName] = useState<string | null>(null);

  // Form states for event registration modal
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Form states for volunteer modal
  const [volName, setVolName] = useState('');
  const [volPhone, setVolPhone] = useState('');
  const [volExperience, setVolExperience] = useState('');

  // Public Member Self-Registration via Link (?cadastro=membro)
  const [isSelfRegOpen, setIsSelfRegOpen] = useState(false);

  // Check URL parameters for auto-registration
  useEffect(() => {
    const checkQuery = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('cadastro') === 'membro' || window.location.hash === '#cadastro-membro') {
        setIsSelfRegOpen(true);
      }
    };
    checkQuery();
    window.addEventListener('popstate', checkQuery);
    return () => window.removeEventListener('popstate', checkQuery);
  }, []);

  // Hash listener for dedicated Event Detail Page (#evento/id)
  useEffect(() => {
    const checkEventHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#evento/')) {
        const eventId = hash.replace('#evento/', '');
        const found = db.events.find((e) => e.id === eventId);
        if (found) {
          setSelectedEventForDetail(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (hash.startsWith('#evento-')) {
        const eventId = hash.replace('#evento-', '');
        const found = db.events.find((e) => e.id === eventId);
        if (found) {
          setSelectedEventForDetail(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };
    checkEventHash();
    window.addEventListener('hashchange', checkEventHash);
    window.addEventListener('popstate', checkEventHash);
    return () => {
      window.removeEventListener('hashchange', checkEventHash);
      window.removeEventListener('popstate', checkEventHash);
    };
  }, [db.events]);

  // Setup Theme on root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('igreja_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Listen to DB updates across application
  useEffect(() => {
    const handleDbUpdate = () => {
      setDb(getDatabase());
    };
    window.addEventListener('igreja_db_updated', handleDbUpdate);
    return () => window.removeEventListener('igreja_db_updated', handleDbUpdate);
  }, []);

  // Inicialização e Sincronização em Tempo Real com Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // 1. Busca dados em nuvem do Supabase
    pullDatabaseFromSupabase().then((remoteDb) => {
      if (remoteDb && remoteDb.events && remoteDb.events.length > 0) {
        setDb(remoteDb);
        localStorage.setItem('macdp_db_data_v3', JSON.stringify(remoteDb));
      } else {
        // Se ainda não houver dados no Supabase, sobe os dados locais atuais como semente inicial
        const currentLocal = getDatabase();
        pushDatabaseToSupabase(currentLocal);
      }
    });

    // 2. Conecta canal em tempo real para sincronização instantânea
    const unsubscribe = subscribeToSupabaseRealtime((updatedDb) => {
      setDb(updatedDb);
      localStorage.setItem('macdp_db_data_v3', JSON.stringify(updatedDb));
      addNotification('info', 'Dados sincronizados com o Supabase em tempo real!');
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Listener de rotas de URL (/admin, /painel, #admin, ?admin=true) e atalho secreto de teclado
  useEffect(() => {
    const handleUrlChange = () => {
      if (isAdminRoute()) {
        setView('admin');
      } else if (window.location.pathname === '/' && window.location.hash !== '#admin' && !new URLSearchParams(window.location.search).get('admin')) {
        setView('public');
      }
    };

    // Atalho secreto e seguro de teclado para pastores e liderança (Ctrl + Shift + A ou Cmd + Shift + A)
    const handleSecretShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setView((prev) => {
          const next = prev === 'public' ? 'admin' : 'public';
          if (next === 'admin') {
            if (window.location.pathname !== '/admin') {
              window.history.pushState(null, '', '/admin');
            }
          } else {
            if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/painel')) {
              window.history.pushState(null, '', '/');
            }
          }
          return next;
        });
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('keydown', handleSecretShortcut);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('keydown', handleSecretShortcut);
    };
  }, []);

  // Navegação para a rota /admin com atualização limpa do histórico do navegador
  const navigateToAdmin = () => {
    setView('admin');
    if (window.location.pathname !== '/admin') {
      window.history.pushState(null, '', '/admin');
    }
  };

  // Retorno para o site público restaurando a URL raiz /
  const navigateToPublic = (sectionId = 'home') => {
    setView('public');
    if (
      window.location.pathname.startsWith('/admin') ||
      window.location.pathname.startsWith('/painel') ||
      window.location.pathname.startsWith('/gestao')
    ) {
      window.history.pushState(null, '', '/');
    }
    handlePublicNavigate(sectionId);
  };

  const addNotification = (type: 'success' | 'error' | 'info', text: string) => {
    const newToast: ToastMessage = {
      id: `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      text,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleSwitchRole = (role: UserRole) => {
    const updated = switchUserRole(role);
    setCurrentUser(updated);
  };

  const handleLogout = async () => {
    await logoutUser();
    setIsAuthenticated(false);
    setView('public');
    if (
      window.location.pathname.startsWith('/admin') ||
      window.location.pathname.startsWith('/painel') ||
      window.location.pathname.startsWith('/gestao')
    ) {
      window.history.pushState(null, '', '/');
    }
    addNotification('info', 'Sessão administrativa encerrada com segurança.');
  };

  const handlePublicNavigate = (sectionId: string) => {
    if (selectedEventForDetail) {
      setSelectedEventForDetail(null);
    }
    setPublicSection(sectionId);
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setTimeout(() => {
      const elem = document.getElementById(sectionId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleOpenEventPage = (evt: ChurchEvent) => {
    setSelectedEventForDetail(evt);
    window.location.hash = `#evento/${evt.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromEventPage = () => {
    setSelectedEventForDetail(null);
    window.location.hash = '#eventos';
    setTimeout(() => {
      const elem = document.getElementById('eventos');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  // Event Registration Submit
  const handleEventRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForModal || !regName.trim()) return;

    addEventRegistration(selectedEventForModal.id, {
      name: regName,
      email: regEmail,
      phone: regPhone,
    });

    addNotification('success', `Inscrição confirmada para o evento "${selectedEventForModal.title}"!`);
    setSelectedEventForModal(null);
    setRegName('');
    setRegEmail('');
    setRegPhone('');
  };

  // Volunteer Ministry Submit
  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volName.trim()) return;

    addNotification(
      'success',
      `Obrigado, ${volName}! Seu interesse em servir no ministério "${volunteerMinistryName}" foi enviado à liderança!`
    );
    setVolunteerMinistryName(null);
    setVolName('');
    setVolPhone('');
    setVolExperience('');
  };

  const stats = calculateChurchStats(db);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast notifications container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* VIEW ROUTER */}
      {view === 'public' ? (
        <div key="public-view" className="animate-page-enter" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Public Navbar */}
          <Navbar
            currentSection={selectedEventForDetail ? 'eventos' : publicSection}
            onNavigate={handlePublicNavigate}
            onOpenAdmin={navigateToAdmin}
            isAuthenticated={isAuthenticated}
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
            isSolid={!!selectedEventForDetail}
            churchSettings={db.churchSettings}
          />

          {/* Public Content: Dedicated Event Page or Main Church Homepage */}
          {selectedEventForDetail ? (
            <main key={`event-${selectedEventForDetail.id}`} className="animate-page-enter" style={{ flex: 1 }}>
              <EventDetailPage
                event={selectedEventForDetail}
                onBack={handleBackFromEventPage}
                onStartRegistration={(evt) => {
                  setSelectedEventForWizard(evt);
                }}
              />
            </main>
          ) : (
            <main key="church-home" className="animate-page-enter" style={{ flex: 1 }}>
              <HeroSection
                onNavigate={handlePublicNavigate}
                onOpenLiveModal={() => setLiveModalOpen(true)}
              />

              {/* Temporizador da Conferência Caçadores da Presença 2026 (13 de Novembro) */}
              <ConferenceCountdown
                event={db.events.find((e) => e.id === 'evt_1' || e.date === '2026-11-13' || e.title.toLowerCase().includes('caçadores'))}
                onOpenEvent={handleOpenEventPage}
                onRegister={(evt) => setSelectedEventForWizard(evt)}
              />

              <AboutSection />

              <CellsLocator
                cells={db.cells}
                ministries={db.ministries}
                onVolunteerMinistry={(name) => setVolunteerMinistryName(name)}
              />

              <SermonsSection
                sermons={db.sermons}
                onPlaySermon={(sermon) => setActiveSermon(sermon)}
              />

              <EventsSection
                events={db.events}
                onRegisterEvent={handleOpenEventPage}
                onOpenEventDetail={handleOpenEventPage}
              />

              <GivingSection onNotify={addNotification} />

              <PrayerForm onNotify={addNotification} />
            </main>
          )}

          {/* Public Footer */}
          <Footer
            onNavigate={handlePublicNavigate}
            onOpenAdmin={navigateToAdmin}
            churchSettings={db.churchSettings}
          />
        </div>
      ) : !isAuthenticated ? (
        /* Tela de Autenticação Segura (Gatekeeper do Painel ERP) */
        <AdminLogin
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthenticated(true);
          }}
          onBackToPublic={() => navigateToPublic('home')}
          onNotify={addNotification}
          churchSettings={db.churchSettings}
        />
      ) : (
        /* Internal Administrative Panel (ERP) */
        <div key="admin-view" className="animate-page-enter" style={{ minHeight: '100vh' }}>
          <AdminLayout
            currentTab={adminTab}
            onTabChange={setAdminTab}
            onBackToPublic={() => navigateToPublic('home')}
            onLogout={handleLogout}
            currentUser={currentUser}
            onSwitchRole={handleSwitchRole}
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
            onNotify={addNotification}
            churchSettings={db.churchSettings}
          >
          {adminTab === 'dashboard' && (
            <DashboardHome
              db={db}
              stats={stats}
              onNavigateTab={setAdminTab}
              onOpenNewMemberModal={() => setAdminTab('membros')}
              onOpenNewTransactionModal={() => setAdminTab('financeiro')}
            />
          )}

          {adminTab === 'membros' && (
            <MembersCRM
              members={db.members}
              visitors={db.visitors}
              cells={db.cells}
              onNotify={addNotification}
            />
          )}

          {adminTab === 'celulas_admin' && (
            <CellsManager
              cells={db.cells}
              onNotify={addNotification}
            />
          )}

          {adminTab === 'ministerios_admin' && (
            <MinistriesManager
              ministries={db.ministries}
              onNotify={addNotification}
            />
          )}

          {adminTab === 'ensino_admin' && (
            <TeachingManager
              classes={db.teachingClasses || []}
              materials={db.teachingMaterials || []}
              logs={db.teachingLogs || []}
              cells={db.cells}
              ministries={db.ministries}
              members={db.members}
              onNotify={addNotification}
            />
          )}

          {adminTab === 'kids_admin' && (
            <KidsManager
              childrenList={db.kidsChildren || []}
              lessons={db.kidsLessons || []}
              onNotify={addNotification}
            />
          )}

          {adminTab === 'patrimonio_admin' && (
            <PatrimonyManager
              assets={db.patrimonyAssets || []}
              onNotify={addNotification}
            />
          )}

          {adminTab === 'pastoral_admin' && (
            <PastoralManager
              appointments={db.pastoralAppointments || []}
              prayers={db.prayers || []}
              onNotify={addNotification}
            />
          )}

          {adminTab === 'financeiro' && (
            <FinancialManager
              transactions={db.transactions}
              onNotify={addNotification}
            />
          )}

          {adminTab === 'eventos_admin' && (
            <EventsManager
              events={db.events}
              onNotify={addNotification}
            />
          )}

          {adminTab === 'oracao_admin' && (
            <PrayerCentral
              prayers={db.prayers}
              onNotify={addNotification}
            />
          )}

          {adminTab === 'acessos_admin' && (
            <AccessManager
              accessUsers={db.accessUsers || []}
              onNotify={addNotification}
            />
          )}

          {adminTab === 'config_igreja' && (
            <ChurchSettingsManager
              churchSettings={db.churchSettings}
              onNotify={addNotification}
            />
          )}
          </AdminLayout>
        </div>
      )}

      {/* LIVE BROADCAST MODAL */}
      <Modal
        isOpen={liveModalOpen}
        onClose={() => setLiveModalOpen(false)}
        title="Culto Ao Vivo • MACDP Oficial"
        maxWidth="760px"
      >
        <div>
          <div
            style={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
              borderRadius: 'var(--radius-lg)',
              background: '#0B1120',
              marginBottom: '1.25rem',
            }}
          >
            {/* Live broadcast official player */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.15) 0%, #0B1120 75%)',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '2px solid #EF4444',
                  color: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  boxShadow: '0 0 25px rgba(239, 68, 68, 0.4)',
                }}
              >
                <Radio size={32} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                Transmissões Oficiais • MACDP Manaus
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', maxWidth: '480px', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Nossos cultos são transmitidos ao vivo todos os domingos às 10:00 e 18:30, e quartas às 19:30 diretamente pelo YouTube oficial.
              </p>
              <a
                href="https://www.youtube.com/@_macdp"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ gap: '0.5rem' }}
              >
                <Play size={16} />
                <span>Acessar Canal do YouTube @_macdp</span>
              </a>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="live-pulse" />
                <strong style={{ fontSize: '1rem' }}>Transmissão ao Vivo Oficial</strong>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Todos os domingos às 10:00 e 18:30 (Horário de Brasília)
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  addNotification('success', 'Link da transmissão copiado com sucesso!');
                }}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.4rem' }}
              >
                <Share2 size={15} />
                <span>Compartilhar Culto</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ACTIVE SERMON MEDIA PLAYER MODAL */}
      <Modal
        isOpen={!!activeSermon}
        onClose={() => setActiveSermon(null)}
        title={activeSermon ? activeSermon.title : ''}
        maxWidth="780px"
      >
        {activeSermon && (
          <div>
            <div
              style={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
                overflow: 'hidden',
                borderRadius: 'var(--radius-lg)',
                background: '#0B1120',
                marginBottom: '1.25rem',
              }}
            >
              {activeSermon.videoEmbedUrl && activeSermon.videoEmbedUrl.includes('embed/') ? (
                <iframe
                  src={activeSermon.videoEmbedUrl}
                  title={activeSermon.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.15) 0%, #0B1120 75%)',
                    padding: '2rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '2px solid #EF4444',
                      color: '#EF4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                      boxShadow: '0 0 20px rgba(239, 68, 68, 0.35)',
                    }}
                  >
                    <Play size={26} fill="currentColor" />
                  </div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.4rem' }}>
                    {activeSermon.title}
                  </h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', maxWidth: '420px', marginBottom: '1.25rem' }}>
                    Assista a esta ministração na íntegra em nosso canal oficial do YouTube.
                  </p>
                  <a
                    href="https://www.youtube.com/@_macdp"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.5rem' }}
                  >
                    <Play size={15} />
                    <span>Assistir no Canal @_macdp</span>
                  </a>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-gold">{activeSermon.series}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {formatDate(activeSermon.date)} • {activeSermon.duration}
                </span>
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                {activeSermon.title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
                <BookOpen size={15} />
                <span>Passagem Bíblica: {activeSermon.scripture}</span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {activeSermon.summary}
              </p>

              {/* Audio Podcast Player Simulation */}
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'var(--accent-gold)',
                    color: '#0B1120',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Headphones size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.875rem', display: 'block' }}>MACDP Podcast da Presença (Áudio)</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ouça a mensagem enquanto dirige ou trabalha</span>
                </div>
                <audio controls style={{ height: '36px', maxWidth: '240px' }}>
                  <source src={activeSermon.audioUrl} type="audio/ogg" />
                </audio>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    addNotification('success', 'Link da mensagem copiado para a área de transferência!');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.4rem' }}
                >
                  <Share2 size={15} />
                  <span>Compartilhar</span>
                </button>
                <button
                  onClick={() => setActiveSermon(null)}
                  className="btn btn-primary btn-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MULTI-STEP ANIMATED EVENT REGISTRATION WIZARD */}
      {selectedEventForWizard && (
        <EventRegistrationWizard
          event={selectedEventForWizard}
          isOpen={!!selectedEventForWizard}
          onClose={() => setSelectedEventForWizard(null)}
          onSuccess={() => {
            setDb(getDatabase());
            addNotification('success', 'Inscrição realizada com sucesso! Vaga garantida no evento.');
          }}
        />
      )}

      {/* VOLUNTEER MINISTRY MODAL */}
      <Modal
        isOpen={!!volunteerMinistryName}
        onClose={() => setVolunteerMinistryName(null)}
        title={volunteerMinistryName ? `Quero Servir no Ministério de ${volunteerMinistryName}` : ''}
      >
        <form onSubmit={handleVolunteerSubmit}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Ficamos muito felizes pelo seu desejo de servir ao Reino de Deus! Preencha suas informações para que o líder do ministério entre em contato com você.
          </p>

          <div className="form-group">
            <label className="form-label">Seu Nome Completo *</label>
            <input
              type="text"
              required
              className="form-input"
              value={volName}
              onChange={(e) => setVolName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Seu WhatsApp *</label>
            <input
              type="tel"
              required
              className="form-input"
              placeholder="(11) 98765-4321"
              value={volPhone}
              onChange={(e) => setVolPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Possui experiência prévia ou dons específicos nesta área?</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Ex: Toco violão há 5 anos / Tenho formação em pedagogia / Sei operar câmeras..."
              value={volExperience}
              onChange={(e) => setVolExperience(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setVolunteerMinistryName(null)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Enviar Interesse
            </button>
          </div>
        </form>
      </Modal>

      {/* Auto-Registration Modal for Members via Shareable Link */}
      <MemberSelfRegistration
        cells={db.cells || []}
        isOpen={isSelfRegOpen}
        onClose={() => {
          setIsSelfRegOpen(false);
          if (window.location.search.includes('cadastro=membro') || window.location.hash === '#cadastro-membro') {
            const url = new URL(window.location.href);
            url.searchParams.delete('cadastro');
            window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
          }
        }}
        onSuccessNotification={(msg) => addNotification('success', msg)}
      />
    </div>
  );
}

export default App;
