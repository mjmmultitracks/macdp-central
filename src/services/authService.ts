import { UserRole, UserSession, PanelModuleId } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { getDatabase } from './db';

export const SYSTEM_USERS: Record<UserRole, UserSession> = {
  admin: {
    id: 'usr_admin',
    name: 'Pr. Oziel Gomes Maduro',
    email: 'oziel.maduro@macdp.com.br',
    role: 'admin',
    roleTitle: 'Pastor Presidente & Fundador',
    avatarUrl: '/images/pastors.jpg',
    allowedModules: [
      'dashboard',
      'membros',
      'celulas_admin',
      'ministerios_admin',
      'ensino_admin',
      'kids_admin',
      'patrimonio_admin',
      'pastoral_admin',
      'financeiro',
      'eventos_admin',
      'oracao_admin',
      'acessos_admin',
      'config_igreja',
    ],
    canEdit: true,
  },
  pastor: {
    id: 'usr_pastor',
    name: 'Pra. Midiã Gomes Maduro',
    email: 'midia.maduro@macdp.com.br',
    role: 'pastor',
    roleTitle: 'Pastora Presidente',
    avatarUrl: '/images/pastors.jpg',
    allowedModules: [
      'dashboard',
      'membros',
      'celulas_admin',
      'ministerios_admin',
      'ensino_admin',
      'kids_admin',
      'patrimonio_admin',
      'pastoral_admin',
      'eventos_admin',
      'oracao_admin',
    ],
    canEdit: true,
  },
  lider: {
    id: 'usr_lider',
    name: 'Pr. Jaziel Maduro',
    email: 'jaziel.maduro@macdp.com.br',
    role: 'lider',
    roleTitle: 'Pastor Auxiliar / Juventude',
    avatarUrl: '/images/pastor-jaziel.jpg',
    allowedModules: [
      'membros',
      'celulas_admin',
      'ministerios_admin',
      'eventos_admin',
      'oracao_admin',
    ],
    canEdit: true,
  },
  tesouraria: {
    id: 'usr_tesouraria',
    name: 'Diretoria Financeira MACDP',
    email: 'financeiro@macdp.com.br',
    role: 'tesouraria',
    roleTitle: 'Diretor Financeiro / Tesouraria',
    avatarUrl: '/images/logo.png',
    allowedModules: [
      'dashboard',
      'financeiro',
      'patrimonio_admin',
    ],
    canEdit: true,
  },
  voluntario: {
    id: 'usr_voluntario',
    name: 'Equipe de Mídia & Recepção',
    email: 'voluntario@macdp.com.br',
    role: 'voluntario',
    roleTitle: 'Voluntário (Mídia e Recepção)',
    avatarUrl: '/images/logo.png',
    allowedModules: [
      'eventos_admin',
      'oracao_admin',
    ],
    canEdit: false,
  },
};

const AUTH_STORAGE_KEY = 'igreja_auth_role';
const AUTH_SESSION_KEY = 'macdp_auth_user_session';

export function getStoredUserRole(): UserRole {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (stored && stored in SYSTEM_USERS) {
    return stored as UserRole;
  }
  return 'admin';
}

export function getCurrentUser(): UserSession {
  // First check if there is an authenticated session
  const authSession = getAuthenticatedSession();
  if (authSession) {
    try {
      const db = getDatabase();
      if (db && db.accessUsers) {
        const found = db.accessUsers.find(
          (u) => u.email.toLowerCase() === authSession.email.toLowerCase() || u.id === authSession.id
        );
        if (found) {
          return {
            ...authSession,
            name: found.name || authSession.name,
            roleTitle: found.roleTitle || authSession.roleTitle,
            allowedModules: found.allowedModules,
            canEdit: found.canEdit,
          };
        }
      }
    } catch (e) {
      console.warn('Erro ao sincronizar dados de acesso:', e);
    }
    return authSession;
  }

  const role = getStoredUserRole();
  return SYSTEM_USERS[role] || SYSTEM_USERS.admin;
}

export function switchUserRole(role: UserRole): UserSession {
  localStorage.setItem(AUTH_STORAGE_KEY, role);
  const sysUser = SYSTEM_USERS[role] || SYSTEM_USERS.admin;
  const current = getAuthenticatedSession();
  if (current) {
    const updated: UserSession = {
      ...current,
      role,
      roleTitle: sysUser.roleTitle || current.roleTitle,
      allowedModules: sysUser.allowedModules,
      canEdit: sysUser.canEdit,
    };
    setAuthenticatedSession(updated);
    return updated;
  }
  return sysUser;
}

// Session Persistence
export function getAuthenticatedSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as UserSession;
    if (session && session.id && session.email) {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

export function setAuthenticatedSession(user: UserSession): void {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_STORAGE_KEY, user.role);
}

export function clearAuthenticatedSession(): void {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

export function isUserAuthenticated(): boolean {
  return getAuthenticatedSession() !== null;
}

export interface AuthLoginResponse {
  success: boolean;
  user?: UserSession;
  error?: string;
}

/**
 * Login do painel: o servidor confere e-mail e senha (hash) e devolve uma sessão assinada.
 */
export async function loginWithCredentials(
  emailInput: string,
  passwordInput: string
): Promise<AuthLoginResponse> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput;

  if (!email || !password) {
    return { success: false, error: 'Informe o e-mail e a senha de acesso.' };
  }

  try {
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.error || 'Não foi possível entrar agora. Tente novamente.' };
    }

    const u = data.user;
    let mappedRole: UserRole = 'lider';
    if (u.roleType === 'Administrador') mappedRole = 'admin';
    else if (u.roleType === 'Pastor') mappedRole = 'pastor';
    else if (u.roleType === 'Tesouraria') mappedRole = 'tesouraria';
    else if (u.roleType === 'Voluntário') mappedRole = 'voluntario';

    const sessionUser: UserSession = {
      id: u.id,
      name: u.name,
      email: u.email,
      role: mappedRole,
      roleTitle: u.roleTitle,
      avatarUrl: SYSTEM_USERS[mappedRole]?.avatarUrl || '/images/logo.png',
      allowedModules: u.allowedModules || [],
      canEdit: u.canEdit ?? true,
      token: data.token,
    };
    setAuthenticatedSession(sessionUser);
    return { success: true, user: sessionUser };
  } catch {
    return { success: false, error: 'Não foi possível conectar ao servidor. Verifique a internet e tente de novo.' };
  }
}

/** Confere no servidor se a sessão guardada ainda é válida (token assinado). */
export async function verifyAdminSession(): Promise<boolean> {
  const session = getAuthenticatedSession();
  if (!session) return false;
  // Em produção, sessão sem token (criada à mão ou antiga) não vale.
  if (!session.token) return !import.meta.env.PROD;
  try {
    const res = await fetch('/api/admin-session', { headers: { Authorization: `Bearer ${session.token}` } });
    return res.status !== 401;
  } catch {
    return true; // sem conexão: não derruba a sessão por isso
  }
}

/**
 * Encerra a sessão ativa do usuário
 */
export async function logoutUser(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Erro ao deslogar do Supabase:', e);
    }
  }
  clearAuthenticatedSession();
}

// Permissions Matrix
export type PermissionFeature =
  | 'dashboard_full'
  | 'members_manage'
  | 'visitors_pipeline'
  | 'finance_manage'
  | 'finance_reports'
  | 'schedules_manage'
  | 'schedules_view'
  | 'events_manage'
  | 'prayer_central_triage'
  | 'prayer_central_view';

export function hasPermission(role: UserRole, feature: PermissionFeature): boolean {
  switch (role) {
    case 'admin':
      return true; // Full access
    case 'pastor':
      return feature !== 'finance_manage'; // Can view dashboard, members, visitors, prayer, events, schedules
    case 'tesouraria':
      return feature === 'finance_manage' || feature === 'finance_reports' || feature === 'dashboard_full';
    case 'lider':
      return (
        feature === 'schedules_manage' ||
        feature === 'schedules_view' ||
        feature === 'events_manage' ||
        feature === 'members_manage'
      );
    case 'voluntario':
      return feature === 'schedules_view';
    default:
      return false;
  }
}

/**
 * Verifica se um módulo específico do painel está disponível para o usuário.
 * Se o usuário tiver restrições definidas em allowedModules (via Gestão de Acessos),
 * apenas os módulos expressamente liberados são exibidos.
 */
export function isUserModuleAllowed(user: UserSession | null | undefined, moduleId: string): boolean {
  if (!user) return false;

  // 1. Se o usuário tem lista personalizada de módulos liberados configurada no ERP (db.accessUsers)
  if (user.allowedModules && user.allowedModules.length > 0) {
    if (moduleId.startsWith('financeiro')) {
      return user.allowedModules.includes('financeiro');
    }
    return user.allowedModules.includes(moduleId as PanelModuleId);
  }

  // 2. Administrador irrestrito tem acesso a tudo
  if (user.role === 'admin') {
    return true;
  }

  // 3. Fallback baseado no papel (RBAC padrão)
  if (moduleId.startsWith('financeiro')) {
    return user.role === 'tesouraria';
  }
  if (moduleId === 'dashboard') {
    return user.role === 'pastor' || user.role === 'tesouraria';
  }
  if (moduleId === 'acessos_admin' || moduleId === 'config_igreja') {
    return false;
  }
  if (
    moduleId === 'membros' ||
    moduleId === 'celulas_admin' ||
    moduleId === 'ministerios_admin' ||
    moduleId === 'ensino_admin' ||
    moduleId === 'kids_admin'
  ) {
    return user.role === 'pastor' || user.role === 'lider';
  }
  if (moduleId === 'patrimonio_admin') {
    return user.role === 'pastor' || user.role === 'tesouraria';
  }
  if (moduleId === 'pastoral_admin') {
    return user.role === 'pastor';
  }
  if (moduleId === 'oracao_admin') {
    return user.role === 'pastor' || user.role === 'lider' || user.role === 'voluntario';
  }
  if (moduleId === 'eventos_admin') {
    return true;
  }

  return false;
}
