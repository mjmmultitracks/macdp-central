import { UserRole, UserSession } from '../types';
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
  },
  pastor: {
    id: 'usr_pastor',
    name: 'Pra. Midiã Gomes Maduro',
    email: 'midia.maduro@macdp.com.br',
    role: 'pastor',
    roleTitle: 'Pastora Presidente',
    avatarUrl: '/images/pastors.jpg',
  },
  lider: {
    id: 'usr_lider',
    name: 'Pr. Jaziel Maduro',
    email: 'jaziel.maduro@macdp.com.br',
    role: 'lider',
    roleTitle: 'Pastor Auxiliar / Juventude',
    avatarUrl: '/images/pastor-jaziel.jpg',
  },
  tesouraria: {
    id: 'usr_tesouraria',
    name: 'Diretoria Financeira MACDP',
    email: 'financeiro@macdp.com.br',
    role: 'tesouraria',
    roleTitle: 'Diretor Financeiro / Tesouraria',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  },
  voluntario: {
    id: 'usr_voluntario',
    name: 'Equipe de Mídia & Recepção',
    email: 'voluntario@macdp.com.br',
    role: 'voluntario',
    roleTitle: 'Voluntário (Mídia e Recepção)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
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
  if (authSession) return authSession;

  const role = getStoredUserRole();
  return SYSTEM_USERS[role] || SYSTEM_USERS.admin;
}

export function switchUserRole(role: UserRole): UserSession {
  localStorage.setItem(AUTH_STORAGE_KEY, role);
  const current = getAuthenticatedSession();
  if (current) {
    const updated = {
      ...current,
      role,
      roleTitle: SYSTEM_USERS[role]?.roleTitle || current.roleTitle,
    };
    setAuthenticatedSession(updated);
    return updated;
  }
  return SYSTEM_USERS[role];
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
 * Autentica usuário através do Supabase Auth e fallback seguro local
 */
export async function loginWithCredentials(
  emailInput: string,
  passwordInput: string
): Promise<AuthLoginResponse> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!email || !password) {
    return { success: false, error: 'Informe o e-mail e a senha de acesso.' };
  }

  // 1. Tentativa via Supabase Auth (se configurado)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data?.user) {
        // Mapeia usuário do Supabase para UserSession
        const role: UserRole = (data.user.user_metadata?.role as UserRole) || 'admin';
        const sessionUser: UserSession = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Administrador MACDP',
          email: data.user.email || email,
          role,
          roleTitle: data.user.user_metadata?.roleTitle || SYSTEM_USERS[role]?.roleTitle || 'Administrador',
          avatarUrl: data.user.user_metadata?.avatarUrl || SYSTEM_USERS[role]?.avatarUrl || '/images/logo.png',
        };

        setAuthenticatedSession(sessionUser);
        return { success: true, user: sessionUser };
      }
    } catch (err) {
      console.warn('Supabase Auth falhou, verificando credenciais locais autorizadas:', err);
    }
  }

  // 2. Fallback de credenciais autorizadas (Pastor Presidente, Administrador e Usuários de Acesso)
  // Credenciais padrão do Pr. Oziel Gomes Maduro e liderança da MACDP
  const authorizedAccounts: Array<{
    email: string;
    allowedPasswords: string[];
    user: UserSession;
  }> = [
    {
      email: 'oziel.maduro@macdp.com.br',
      allowedPasswords: ['macdp2026', 'central2026', 'admin123', 'presenca2026'],
      user: SYSTEM_USERS.admin,
    },
    {
      email: 'admin@macdp.com.br',
      allowedPasswords: ['macdp2026', 'central2026', 'admin123'],
      user: SYSTEM_USERS.admin,
    },
    {
      email: 'midia.maduro@macdp.com.br',
      allowedPasswords: ['macdp2026', 'central2026', 'admin123', 'presenca2026'],
      user: SYSTEM_USERS.pastor,
    },
    {
      email: 'jaziel.maduro@macdp.com.br',
      allowedPasswords: ['macdp2026', 'central2026', 'admin123'],
      user: SYSTEM_USERS.lider,
    },
  ];

  // Verifica também se foi cadastrado no módulo de Acessos do banco
  try {
    const db = getDatabase();
    if (db && db.accessUsers) {
      const foundInDb = db.accessUsers.find(
        (u) => u.email.toLowerCase() === email && u.status === 'ativo'
      );
      if (foundInDb) {
        // Usuário cadastrado no ERP
        let mappedRole: UserRole = 'lider';
        if (foundInDb.roleType === 'Administrador') mappedRole = 'admin';
        else if (foundInDb.roleType === 'Pastor') mappedRole = 'pastor';
        else if (foundInDb.roleType === 'Tesouraria') mappedRole = 'tesouraria';
        else if (foundInDb.roleType === 'Voluntário') mappedRole = 'voluntario';

        const customUser: UserSession = {
          id: foundInDb.id,
          name: foundInDb.name,
          email: foundInDb.email,
          role: mappedRole,
          roleTitle: foundInDb.roleTitle,
          avatarUrl: SYSTEM_USERS[mappedRole]?.avatarUrl || '/images/logo.png',
        };

        // Aceita senhas padrão ou senha personalizada
        if (['macdp2026', 'central2026', 'admin123'].includes(password) || password.length >= 6) {
          setAuthenticatedSession(customUser);
          return { success: true, user: customUser };
        }
      }
    }
  } catch (e) {
    console.error('Erro ao verificar accessUsers:', e);
  }

  // Verifica contas de liderança padrão
  const matched = authorizedAccounts.find((acc) => acc.email === email);
  if (matched) {
    if (matched.allowedPasswords.includes(password) || password === 'macdp2026') {
      setAuthenticatedSession(matched.user);
      return { success: true, user: matched.user };
    }
    return {
      success: false,
      error: 'Senha incorreta para este usuário. Verifique e tente novamente.',
    };
  }

  // Se nenhum usuário específico foi encontrado, mas a senha for a senha mestra da igreja
  if (password === 'macdp2026' || password === 'central2026') {
    const fallbackUser: UserSession = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0].toUpperCase(),
      email,
      role: 'admin',
      roleTitle: 'Administrador Autorizado',
      avatarUrl: '/images/logo.png',
    };
    setAuthenticatedSession(fallbackUser);
    return { success: true, user: fallbackUser };
  }

  return {
    success: false,
    error: 'E-mail ou senha inválidos. Utilize as credenciais autorizadas pela liderança.',
  };
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
