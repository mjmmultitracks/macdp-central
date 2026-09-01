import { UserRole, UserSession } from '../types';

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
    name: 'Thiago Albuquerque',
    email: 'thiago.louvor@igrejagracavida.com.br',
    role: 'lider',
    roleTitle: 'Líder do Ministério de Louvor',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  },
  tesouraria: {
    id: 'usr_tesouraria',
    name: 'Marcos Vinicius Ribeiro',
    email: 'tesouraria@igrejagracavida.com.br',
    role: 'tesouraria',
    roleTitle: 'Diretor Financeiro / Tesouraria',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  },
  voluntario: {
    id: 'usr_voluntario',
    name: 'Beatriz Silveira',
    email: 'beatriz.silveira@gmail.com',
    role: 'voluntario',
    roleTitle: 'Voluntária (Mídia e Recepção)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  },
};

const AUTH_STORAGE_KEY = 'igreja_auth_role';

export function getStoredUserRole(): UserRole {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (stored && stored in SYSTEM_USERS) {
    return stored as UserRole;
  }
  return 'admin';
}

export function getCurrentUser(): UserSession {
  const role = getStoredUserRole();
  return SYSTEM_USERS[role];
}

export function switchUserRole(role: UserRole): UserSession {
  localStorage.setItem(AUTH_STORAGE_KEY, role);
  return SYSTEM_USERS[role];
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
