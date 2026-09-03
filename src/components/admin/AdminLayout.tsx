import React, { useState } from 'react';
import { UserRole, UserSession } from '../../types';
import { SYSTEM_USERS, hasPermission, PermissionFeature } from '../../services/authService';
import { resetDatabase } from '../../services/db';
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
  Shield,
  RotateCcw,
  Check,
  AlertTriangle,
  LogOut,
  ChevronDown,
  Building2,
  Menu,
  X,
} from 'lucide-react';
import { ChurchSettings } from '../../types';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onBackToPublic: () => void;
  onLogout?: () => void;
  currentUser: UserSession;
  onSwitchRole: (role: UserRole) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
  churchSettings?: ChurchSettings;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onBackToPublic,
  onLogout,
  currentUser,
  onSwitchRole,
  isDarkMode,
  onToggleTheme,
  onNotify,
  churchSettings,
  children,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems: Array<{ id: string; label: string; icon: any; permission: PermissionFeature }> = [
    { id: 'dashboard', label: 'Dashboard Geral', icon: LayoutDashboard, permission: 'dashboard_full' },
    { id: 'membros', label: 'Membros & CRM Visitantes', icon: Users, permission: 'members_manage' },
    { id: 'celulas_admin', label: 'Células & Grupos', icon: Compass, permission: 'members_manage' },
    { id: 'ministerios_admin', label: 'Ministérios', icon: Sparkles, permission: 'members_manage' },
    { id: 'ensino_admin', label: 'Ensino & Discipulado', icon: GraduationCap, permission: 'members_manage' },
    { id: 'kids_admin', label: 'KIDS & EBF', icon: Baby, permission: 'members_manage' },
    { id: 'patrimonio_admin', label: 'Patrimônio & Bens', icon: Archive, permission: 'members_manage' },
    { id: 'pastoral_admin', label: 'Área Pastoral & Gabinete', icon: UserCheck, permission: 'prayer_central_triage' },
    { id: 'financeiro', label: 'Gestão Financeira', icon: DollarSign, permission: 'finance_manage' },
    { id: 'eventos_admin', label: 'Eventos & Reservas', icon: Calendar, permission: 'events_manage' },
    { id: 'oracao_admin', label: 'Central de Oração', icon: HeartHandshake, permission: 'prayer_central_triage' },
    { id: 'acessos_admin', label: 'Gestão de Acessos', icon: KeyRound, permission: 'members_manage' },
    { id: 'config_igreja', label: 'Configurações da Igreja', icon: Building2, permission: 'dashboard_full' },
  ];

  const handleResetData = () => {
    if (window.confirm('Deseja restaurar todos os dados do banco para o estado de fábrica de demonstração?')) {
      resetDatabase();
      onNotify('info', 'Banco de dados restaurado com sucesso para os dados de exemplo.');
    }
  };

  const userHasCurrentTabPermission = menuItems.find((m) => m.id === currentTab)
    ? hasPermission(currentUser.role, menuItems.find((m) => m.id === currentTab)!.permission)
    : true;

  return (
    <div className="admin-main-wrapper" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      {/* Backdrop para Drawer Móvel */}
      {mobileSidebarOpen && (
        <div
          className="admin-drawer-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Drawer Móvel */}
      <aside
        className={`admin-sidebar-drawer ${mobileSidebarOpen ? 'open' : ''}`}
        style={{
          width: '260px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100dvh',
          zIndex: 1000,
        }}
      >
        {/* Church Logo & Admin Brand */}
        <div
          style={{
            padding: '1.25rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
            <div
              className="church-logo-frame"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#0f172a',
                border: '1.5px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img
                src={churchSettings?.logoUrl || '/images/logo.png'}
                alt={churchSettings?.name || 'Logo MACDP'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/logo.png';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '6px',
                }}
              />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <h3
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  margin: 0,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
                title={churchSettings?.name || 'Painel Eclesiástico'}
              >
                {churchSettings?.shortName || churchSettings?.name || 'Painel Eclesiástico'}
              </h3>
              <span
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--accent-gold)',
                  fontWeight: 600,
                  display: 'block',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {churchSettings?.subtitle || 'Caçadores da Presença'}
              </span>
            </div>
          </div>

          {/* Botão de Fechar Drawer no Mobile */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="btn btn-ghost btn-sm admin-drawer-close"
            style={{
              padding: '0.35rem',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              minHeight: '34px',
              minWidth: '34px',
            }}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>


        {/* Navigation Menu */}
        <nav style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const allowed = hasPermission(currentUser.role, item.permission);

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--accent-gold-soft)' : 'transparent',
                  color: isActive
                    ? 'var(--accent-gold)'
                    : allowed
                    ? 'var(--text-primary)'
                    : 'var(--text-muted)',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  opacity: allowed ? 1 : 0.6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {!allowed && <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--bg-tertiary)' }}>Restrito</span>}
              </button>
            );
          })}
        </nav>

        {/* Back to Public Site */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={onBackToPublic}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', gap: '0.5rem', marginBottom: '0.5rem' }}
          >
            <ArrowLeft size={16} />
            <span>Voltar ao Portal Público</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="btn btn-secondary btn-sm"
              style={{
                width: '100%',
                gap: '0.5rem',
                marginBottom: '0.75rem',
                color: '#EF4444',
                borderColor: 'rgba(239, 68, 68, 0.25)',
                background: 'rgba(239, 68, 68, 0.06)',
              }}
              title="Encerrar sessão no painel"
            >
              <LogOut size={16} />
              <span>Sair do Painel</span>
            </button>
          )}

          <button
            onClick={handleResetData}
            title="Restaurar dados de fábrica da demonstração"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              padding: '0.4rem',
            }}
          >
            <RotateCcw size={12} />
            <span>Restaurar Dados Demo</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
        {/* Top Header */}
        <header
          className="admin-header"
          style={{
            height: '70px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90,
          }}
        >
          {/* Active section title & Mobile Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="btn btn-ghost btn-sm admin-hamburger-btn"
              style={{
                padding: '0.45rem',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                minHeight: '38px',
                minWidth: '38px',
              }}
              aria-label="Abrir Menu de Navegação"
            >
              <Menu size={20} />
            </button>
            <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {menuItems.find((m) => m.id === currentTab)?.label || 'Painel Administrativo'}
            </h2>
          </div>

          {/* Right Header Actions: Role Switcher & Theme */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              aria-label="Alternar Tema"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* RBAC Role Switcher Dropdown (Crucial for user testing!) */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div className="admin-user-details" style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.1 }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)' }}>
                    Perfil: {currentUser.roleTitle}
                  </div>
                </div>
                <ChevronDown size={15} color="var(--text-muted)" />
              </button>

              {roleMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-lg)',
                    width: '320px',
                    maxWidth: 'min(320px, calc(100vw - 1.5rem))',
                    boxShadow: 'var(--shadow-xl)',
                    padding: '0.75rem',
                    zIndex: 200,
                  }}
                >
                  <div
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: '1px solid var(--border-subtle)',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Shield size={14} color="var(--accent-gold)" />
                    <span>Simular Controle de Acesso (RBAC):</span>
                  </div>

                  {(Object.keys(SYSTEM_USERS) as UserRole[]).map((role) => {
                    const u = SYSTEM_USERS[role];
                    const isSelected = currentUser.role === role;

                    return (
                      <button
                        key={role}
                        onClick={() => {
                          onSwitchRole(role);
                          setRoleMenuOpen(false);
                          onNotify('info', `Perfil alterado para: ${u.roleTitle}`);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '0.65rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'var(--accent-gold-soft)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          textAlign: 'left',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.825rem', display: 'block' }}>{u.name}</strong>
                            <small style={{ fontSize: '0.72rem', color: isSelected ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                              {u.roleTitle}
                            </small>
                          </div>
                        </div>
                        {isSelected && <Check size={16} color="var(--accent-gold)" />}
                      </button>
                    );
                  })}

                  {onLogout && (
                    <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        onClick={() => {
                          setRoleMenuOpen(false);
                          onLogout();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          width: '100%',
                          padding: '0.65rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#EF4444',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.825rem',
                          textAlign: 'left',
                        }}
                      >
                        <LogOut size={16} />
                        <span>Encerrar Sessão (Sair)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="admin-main-content" style={{ flex: 1 }}>
          {!userHasCurrentTabPermission ? (
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem 2rem',
                textAlign: 'center',
                maxWidth: '560px',
                margin: '4rem auto',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--danger-soft)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <AlertTriangle size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Acesso Restrito ao Módulo
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                O perfil atual (<strong>{currentUser.roleTitle}</strong>) não possui privilégios de acesso a esta área segundo a política de segurança RBAC.
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Dica: você pode alternar para o perfil de <strong>Administrador Geral</strong> ou <strong>Pastor Presidente</strong> no topo da página para testar este módulo.
              </p>
              <button
                onClick={() => onTabChange('dashboard')}
                className="btn btn-primary"
              >
                Voltar ao Dashboard
              </button>
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
