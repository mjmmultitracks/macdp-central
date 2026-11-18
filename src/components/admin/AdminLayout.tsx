import React, { useState, useEffect } from 'react';
import { UserRole, UserSession, ChurchSettings } from '../../types';
import { SYSTEM_USERS, PermissionFeature, isUserModuleAllowed } from '../../services/authService';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Calendar,
  HeartHandshake,
  Compass,
  Sparkles,
  GraduationCap,
  Baby,
  Archive,
  UserCheck,
  KeyRound,
  ArrowLeft,
  Sun,
  Moon,
  Check,
  AlertTriangle,
  LogOut,
  ChevronDown,
  Building2,
  Menu,
  X,
  Smartphone,
  QrCode,
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onBackToPublic: () => void;
  onLogout?: () => void;
  onOpenApp?: () => void;
  onOpenDeviceTester?: () => void;
  currentUser: UserSession;
  onSwitchRole: (role: UserRole) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
  churchSettings?: ChurchSettings;
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  permission: PermissionFeature;
}

interface MenuGroup {
  title?: string;
  items: MenuItem[];
}

const FINANCE_SUB_ITEMS = [
  { id: 'financeiro_fluxo', label: 'Lançamentos' },
  { id: 'financeiro_contas', label: 'Contas e caixas' },
  { id: 'financeiro_categorias', label: 'Categorias' },
  { id: 'financeiro_eventos', label: 'Caixa dos eventos' },
];

const MENU_GROUPS: MenuGroup[] = [
  {
    items: [{ id: 'dashboard', label: 'Painel', icon: LayoutDashboard, permission: 'dashboard_full' }],
  },
  {
    title: 'Pessoas',
    items: [
      { id: 'membros', label: 'Membros e visitantes', icon: Users, permission: 'members_manage' },
      { id: 'ministerios_admin', label: 'Ministérios', icon: Sparkles, permission: 'members_manage' },
      { id: 'celulas_admin', label: 'Células', icon: Compass, permission: 'members_manage' },
      { id: 'ensino_admin', label: 'Ensino', icon: GraduationCap, permission: 'members_manage' },
      { id: 'kids_admin', label: 'Kids', icon: Baby, permission: 'members_manage' },
      { id: 'pastoral_admin', label: 'Área pastoral', icon: UserCheck, permission: 'prayer_central_triage' },
      { id: 'oracao_admin', label: 'Pedidos de oração', icon: HeartHandshake, permission: 'prayer_central_triage' },
    ],
  },
  {
    title: 'Igreja',
    items: [
      { id: 'eventos_admin', label: 'Eventos e inscrições', icon: Calendar, permission: 'events_manage' },
      { id: 'patrimonio_admin', label: 'Patrimônio', icon: Archive, permission: 'members_manage' },
    ],
  },
  {
    title: 'Finanças',
    items: [{ id: 'financeiro', label: 'Financeiro', icon: DollarSign, permission: 'finance_manage' }],
  },
  {
    title: 'Sistema',
    items: [
      { id: 'acessos_admin', label: 'Acessos', icon: KeyRound, permission: 'members_manage' },
      { id: 'config_igreja', label: 'Configurações', icon: Building2, permission: 'dashboard_full' },
    ],
  },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onBackToPublic,
  onLogout,
  onOpenApp,
  onOpenDeviceTester,
  currentUser,
  onSwitchRole,
  isDarkMode,
  onToggleTheme,
  onNotify,
  churchSettings,
  children,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(() => currentTab.startsWith('financeiro'));

  const allItems = MENU_GROUPS.flatMap((g) => g.items);
  const visibleGroups = MENU_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((item) => isUserModuleAllowed(currentUser, item.id)),
  })).filter((g) => g.items.length > 0);
  const visibleItems = visibleGroups.flatMap((g) => g.items);

  // Regra específica: ocultar botões de aplicativo mobile e teste no celular para mikamaduro@macdp.com.br
  const userEmail = (currentUser?.email || '').toLowerCase().trim();
  const shouldHideAppButtons = userEmail === 'mikamaduro@macdp.com.br';

  const userHasCurrentTabPermission = isUserModuleAllowed(currentUser, currentTab);

  // Se o usuário estiver em um módulo não permitido para ele, redireciona para o primeiro liberado
  useEffect(() => {
    if (!userHasCurrentTabPermission && visibleItems.length > 0) {
      onTabChange(visibleItems[0].id);
    }
  }, [userHasCurrentTabPermission, visibleItems, onTabChange]);

  const activeFinanceSub = FINANCE_SUB_ITEMS.find((s) => s.id === currentTab);
  const currentGroup = MENU_GROUPS.find((g) =>
    g.items.some((m) => m.id === currentTab || (m.id === 'financeiro' && currentTab.startsWith('financeiro')))
  );
  const currentTitle = currentTab.startsWith('financeiro')
    ? activeFinanceSub
      ? `Financeiro · ${activeFinanceSub.label}`
      : 'Financeiro'
    : allItems.find((m) => m.id === currentTab)?.label || 'Painel administrativo';

  const go = (id: string) => {
    onTabChange(id);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="admin-main-wrapper adm">
      {mobileSidebarOpen && (
        <div className="admin-drawer-backdrop" onClick={() => setMobileSidebarOpen(false)} aria-hidden="true" />
      )}

      <aside className={`admin-sidebar-drawer adm-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="adm-brand">
          <img
            src={churchSettings?.logoUrl || '/images/logo.png'}
            alt={churchSettings?.name || 'MACDP'}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/logo.png';
            }}
          />
          <div className="adm-brand-text">
            <strong>{churchSettings?.shortName || churchSettings?.name || 'MACDP'}</strong>
            <span>Painel administrativo</span>
          </div>
          <button type="button" className="admin-drawer-close adm-icon-btn" onClick={() => setMobileSidebarOpen(false)} aria-label="Fechar menu">
            <X size={18} />
          </button>
        </div>

        <nav className="adm-nav" aria-label="Menu do painel">
          {visibleGroups.map((group, gi) => (
            <div key={gi} className="adm-group">
              {group.title && <span className="adm-group-title">{group.title}</span>}
              {group.items.map((item) => {
                const Icon = item.icon;
                if (item.id === 'financeiro') {
                  const active = currentTab.startsWith('financeiro');
                  return (
                    <div key={item.id}>
                      <button
                        type="button"
                        className={`adm-nav-item${active ? ' is-active' : ''}`}
                        onClick={() => {
                          setFinanceOpen((o) => !o);
                          if (!active) onTabChange('financeiro_fluxo');
                        }}
                      >
                        <Icon size={17} />
                        <span>{item.label}</span>
                        <ChevronDown size={14} className={`adm-chevron${financeOpen ? ' is-open' : ''}`} />
                      </button>
                      {financeOpen && (
                        <div className="adm-sub">
                          {FINANCE_SUB_ITEMS.map((sub) => {
                            const subActive = currentTab === sub.id || (currentTab === 'financeiro' && sub.id === 'financeiro_fluxo');
                            return (
                              <button key={sub.id} type="button" className={`adm-sub-item${subActive ? ' is-active' : ''}`} onClick={() => go(sub.id)}>
                                {sub.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`adm-nav-item${currentTab === item.id ? ' is-active' : ''}`}
                    onClick={() => go(item.id)}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="adm-sidebar-foot">
          <button type="button" className="adm-foot-btn" onClick={onBackToPublic}>
            <ArrowLeft size={15} /> Ver o site
          </button>
        </div>
      </aside>

      <div className="adm-main">
        <header className="admin-header adm-header">
          <div className="adm-header-left">
            <button type="button" className="admin-hamburger-btn adm-icon-btn" onClick={() => setMobileSidebarOpen(true)} aria-label="Abrir menu">
              <Menu size={20} />
            </button>
            <div className="adm-title">
              {currentGroup?.title && <span className="admin-breadcrumb-prefix">{currentGroup.title}</span>}
              <h2>{currentTitle}</h2>
            </div>
          </div>

          <div className="adm-header-right">
            {onOpenApp && !shouldHideAppButtons && (
              <button type="button" className="adm-ghost admin-hide-mobile" onClick={onOpenApp} title="Abrir o aplicativo da igreja">
                <Smartphone size={15} /> <span className="admin-btn-text">Aplicativo</span>
              </button>
            )}
            {onOpenDeviceTester && !shouldHideAppButtons && (
              <button type="button" className="adm-ghost admin-hide-mobile" onClick={onOpenDeviceTester} title="Testar no celular por QR Code">
                <QrCode size={15} /> <span className="admin-btn-text">Testar no celular</span>
              </button>
            )}
            <button type="button" className="adm-icon-btn" onClick={onToggleTheme} aria-label="Alternar tema">
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className="adm-user">
              <button type="button" className="adm-user-btn" onClick={() => setUserMenuOpen((o) => !o)} aria-expanded={userMenuOpen}>
                <img src={currentUser.avatarUrl} alt="" />
                <span className="admin-user-details">
                  <strong>{currentUser.name}</strong>
                  <small>{currentUser.roleTitle}</small>
                </span>
                <ChevronDown size={14} />
              </button>

              {userMenuOpen && (
                <div className="adm-menu">
                  <div className="adm-menu-head">
                    <strong>{currentUser.name}</strong>
                    <span>{currentUser.email}</span>
                    {currentUser.canEdit === false && <em>Somente leitura</em>}
                  </div>

                  {currentUser.role === 'admin' && (
                    <>
                      <span className="adm-menu-label">Ver o painel como</span>
                      {(Object.keys(SYSTEM_USERS) as UserRole[]).map((role) => {
                        const u = SYSTEM_USERS[role];
                        const selected = currentUser.role === role;
                        return (
                          <button
                            key={role}
                            type="button"
                            className={`adm-menu-item${selected ? ' is-on' : ''}`}
                            onClick={() => {
                              onSwitchRole(role);
                              setUserMenuOpen(false);
                              onNotify('info', `Perfil alterado para: ${u.roleTitle}`);
                            }}
                          >
                            <span>{u.roleTitle}</span>
                            {selected && <Check size={15} />}
                          </button>
                        );
                      })}
                    </>
                  )}

                  {onLogout && (
                    <button
                      type="button"
                      className="adm-menu-item adm-menu-danger"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                    >
                      <LogOut size={15} /> Sair do painel
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="admin-main-content" style={{ flex: 1 }}>
          {!userHasCurrentTabPermission ? (
            <div className="adm-denied">
              <AlertTriangle size={28} />
              <h3>Módulo não disponível</h3>
              <p>
                Este módulo não faz parte das permissões do seu usuário (<strong>{currentUser.roleTitle}</strong>).
              </p>
              {visibleItems.length > 0 && (
                <button type="button" className="btn btn-primary" onClick={() => onTabChange(visibleItems[0].id)}>
                  Ir para {visibleItems[0].label}
                </button>
              )}
            </div>
          ) : (
            <div key={currentTab} className="animate-tab-content" style={{ width: '100%' }}>
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
