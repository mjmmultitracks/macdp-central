import { ChurchProfile, ChurchSettings } from '../types';
import { getDatabase } from './db';

const SELECTED_CHURCH_KEY = 'igreja_app_selected_church_id';
const CHURCH_CATALOG_STORAGE_KEY = 'igreja_app_church_catalog';

// Helper to convert churchSettings from DB to a ChurchProfile
export const churchSettingsToProfile = (settings: ChurchSettings, id = 'macdp-central', slug = 'macdp-central'): ChurchProfile => ({
  id,
  slug,
  name: settings.name || 'Ministério Apostólico Caçadores da Presença',
  shortName: settings.shortName || 'MACDP Central',
  subtitle: settings.subtitle || 'Ministério Apostólico',
  slogan: settings.slogan || 'Proibido a Entrada de Pessoas Perfeitas.',
  logoUrl: settings.logoUrl || '/icon-192.png',
  pastorPresident: settings.pastorPresident || 'Pr. Marcos & Pra. Juliana',
  city: settings.address?.city || 'Manaus',
  state: settings.address?.state || 'AM',
  neighborhood: settings.address?.neighborhood || 'Aleixo',
  address: `${settings.address?.street || 'Rua Carlos Lacerda, 45'} - ${settings.address?.neighborhood || 'Aleixo'}, ${settings.address?.city || 'Manaus'} - ${settings.address?.state || 'AM'}`,
  phone: settings.phone || '(92) 99123-4567',
  whatsapp: settings.whatsapp || '92991234567',
  email: settings.email || 'contato@macdp.com.br',
  pixKey: settings.pix?.key || 'pix@macdp.com.br',
  pixReceiver: settings.pix?.receiver || settings.name,
  liveStreamUrl: settings.appSettings?.liveStreamUrl || 'https://www.youtube.com/@cacadordaPresenca',
  isLiveNow: settings.appSettings?.isLiveNow ?? false,
  themeColors: settings.themeColors || {
    primaryColor: '#f59e0b',
    secondaryColor: '#3b82f6',
  },
  appSettings: settings.appSettings,
  isVerified: true,
  isFeatured: true,
});

// Congregações padrão para o Hub
const DEFAULT_CHURCHES: ChurchProfile[] = [
  {
    id: 'macdp-central',
    slug: 'macdp-central',
    name: 'Ministério Apostólico Caçadores da Presença - Templo Central',
    shortName: 'MACDP Central (Sede)',
    subtitle: 'Templo Sede',
    slogan: 'Proibido a Entrada de Pessoas Perfeitas.',
    logoUrl: '/icon-192.png',
    pastorPresident: 'Pr. Marcos & Pra. Juliana Maduro',
    city: 'Manaus',
    state: 'AM',
    neighborhood: 'Aleixo',
    address: 'Av. André Araújo, 1200 - Aleixo, Manaus - AM',
    phone: '(92) 99123-4567',
    whatsapp: '92991234567',
    email: 'contato@macdp.com.br',
    pixKey: 'pix@macdp.com.br',
    pixReceiver: 'Ministério Apostólico Caçadores da Presença',
    liveStreamUrl: 'https://www.youtube.com/@cacadordaPresenca',
    isLiveNow: true,
    themeColors: {
      primaryColor: '#f59e0b',
      secondaryColor: '#3b82f6',
    },
    isVerified: true,
    isFeatured: true,
  },
  {
    id: 'macdp-norte',
    slug: 'macdp-norte',
    name: 'Ministério Apostólico Caçadores da Presença - Zona Norte',
    shortName: 'MACDP Zona Norte',
    subtitle: 'Congregação Regional',
    slogan: 'Lugar de recomeços e transformação.',
    logoUrl: '/icon-192.png',
    pastorPresident: 'Pr. Rafael & Pra. Camila',
    city: 'Manaus',
    state: 'AM',
    neighborhood: 'Cidade Nova',
    address: 'Av. Noel Nutels, 450 - Cidade Nova, Manaus - AM',
    phone: '(92) 98456-7890',
    whatsapp: '92984567890',
    email: 'zonanorte@macdp.com.br',
    pixKey: 'pix.norte@macdp.com.br',
    pixReceiver: 'MACDP Zona Norte',
    liveStreamUrl: 'https://www.youtube.com/@cacadordaPresenca',
    isLiveNow: false,
    themeColors: {
      primaryColor: '#10b981',
      secondaryColor: '#06b6d4',
    },
    isVerified: true,
    isFeatured: true,
  },
  {
    id: 'macdp-leste',
    slug: 'macdp-leste',
    name: 'Ministério Apostólico Caçadores da Presença - Zona Leste',
    shortName: 'MACDP Zona Leste',
    subtitle: 'Congregação Regional',
    slogan: 'Conectando vidas ao altar de Deus.',
    logoUrl: '/icon-192.png',
    pastorPresident: 'Pr. Daniel & Pra. Vanessa',
    city: 'Manaus',
    state: 'AM',
    neighborhood: 'São José',
    address: 'Alameda Cosme Ferreira, 890 - São José, Manaus - AM',
    phone: '(92) 98111-2233',
    whatsapp: '92981112233',
    email: 'zonaleste@macdp.com.br',
    pixKey: 'pix.leste@macdp.com.br',
    pixReceiver: 'MACDP Zona Leste',
    liveStreamUrl: 'https://www.youtube.com/@cacadordaPresenca',
    isLiveNow: false,
    themeColors: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#ec4899',
    },
    isVerified: true,
    isFeatured: false,
  },
  {
    id: 'comunidade-esperanca-sp',
    slug: 'comunidade-esperanca',
    name: 'Comunidade Cristã Esperança',
    shortName: 'Esperança Church SP',
    subtitle: 'Igreja Parceira Hub',
    slogan: 'Uma igreja família para todas as gerações.',
    logoUrl: '/icon-192.png',
    pastorPresident: 'Pr. Lucas & Pra. Ana Paula',
    city: 'São Paulo',
    state: 'SP',
    neighborhood: 'Moema',
    address: 'Av. Ibirapuera, 2400 - Moema, São Paulo - SP',
    phone: '(11) 97777-8888',
    whatsapp: '11977778888',
    email: 'contato@esperancachurch.com.br',
    pixKey: 'pix@esperancachurch.com.br',
    pixReceiver: 'Comunidade Cristã Esperança',
    liveStreamUrl: 'https://www.youtube.com/@cacadordaPresenca',
    isLiveNow: false,
    themeColors: {
      primaryColor: '#3b82f6',
      secondaryColor: '#6366f1',
    },
    isVerified: true,
    isFeatured: false,
  },
];

export const getChurchCatalog = (): ChurchProfile[] => {
  // Sync the latest churchSettings from DB into the central church
  const db = getDatabase();
  const centralFromDb = db.churchSettings ? churchSettingsToProfile(db.churchSettings) : null;

  try {
    const stored = localStorage.getItem(CHURCH_CATALOG_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ChurchProfile[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (centralFromDb) {
          const idx = parsed.findIndex((c) => c.id === 'macdp-central');
          if (idx >= 0) {
            parsed[idx] = { ...parsed[idx], ...centralFromDb };
          } else {
            parsed.unshift(centralFromDb);
          }
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler catálogo de igrejas:', e);
  }

  const list = [...DEFAULT_CHURCHES];
  if (centralFromDb) {
    list[0] = { ...list[0], ...centralFromDb };
  }
  return list;
};

export const searchChurches = (query: string): ChurchProfile[] => {
  const catalog = getChurchCatalog();
  const q = query.trim().toLowerCase();
  if (!q) return catalog;

  return catalog.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.shortName.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.neighborhood?.toLowerCase().includes(q) ||
      c.pastorPresident?.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q)
  );
};

export const getChurchByIdOrSlug = (idOrSlug: string): ChurchProfile | undefined => {
  const catalog = getChurchCatalog();
  const target = idOrSlug.trim().toLowerCase();
  return catalog.find((c) => c.id.toLowerCase() === target || c.slug.toLowerCase() === target);
};

export const getSelectedChurchId = (): string => {
  try {
    // 1. Check URL query params first (e.g. ?church=macdp-central)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlChurch = params.get('church');
      if (urlChurch) {
        const found = getChurchByIdOrSlug(urlChurch);
        if (found) {
          localStorage.setItem(SELECTED_CHURCH_KEY, found.id);
          return found.id;
        }
      }
    }

    // 2. Check localStorage
    const saved = localStorage.getItem(SELECTED_CHURCH_KEY);
    if (saved) return saved;
  } catch (e) {
    console.error('Erro ao obter selected church:', e);
  }

  // 3. Default is MACDP Central
  return 'macdp-central';
};

export const setSelectedChurchId = (churchId: string): void => {
  try {
    localStorage.setItem(SELECTED_CHURCH_KEY, churchId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('church_selected_changed', {
          detail: { churchId },
        })
      );
    }
  } catch (e) {
    console.error('Erro ao salvar selected church:', e);
  }
};

export const getActiveChurchProfile = (): ChurchProfile => {
  const id = getSelectedChurchId();
  const found = getChurchByIdOrSlug(id);
  if (found) return found;

  const catalog = getChurchCatalog();
  return catalog[0] || DEFAULT_CHURCHES[0];
};
