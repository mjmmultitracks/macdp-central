export interface ColorPreset {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
}

export const DEFAULT_THEME_COLORS = {
  primaryColor: '#f59e0b',
  secondaryColor: '#3b82f6',
};

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'macdp-gold',
    name: 'Dourado Presença (Padrão MACDP)',
    description: 'Dourado nobre celestial com apoio em azul real profético.',
    primary: '#f59e0b',
    secondary: '#3b82f6',
  },
  {
    id: 'royal-blue',
    name: 'Azul Real & Ouro Nobre',
    description: 'Profundidade celestial majestosa com detalhes dourados.',
    primary: '#2563eb',
    secondary: '#f59e0b',
  },
  {
    id: 'emerald-grace',
    name: 'Esmeralda & Âmbar (Vida e Graça)',
    description: 'Verde vivo simbolizando renovação espiritual e vida abundante.',
    primary: '#10b981',
    secondary: '#f59e0b',
  },
  {
    id: 'revival-purple',
    name: 'Roxo Imperial & Ouro (Realeza)',
    description: 'Elegância apostólica, realeza sacerdotal e unção.',
    primary: '#8b5cf6',
    secondary: '#f59e0b',
  },
  {
    id: 'crimson-fire',
    name: 'Bordô & Chama Profética',
    description: 'Vinho nobre expressando a consagração do altar e o fogo divino.',
    primary: '#e11d48',
    secondary: '#f59e0b',
  },
  {
    id: 'ocean-cyan',
    name: 'Safira Oceânica & Ciano Fresco',
    description: 'Frescor moderno de águas profundas do Espírito Santo.',
    primary: '#0284c7',
    secondary: '#06b6d4',
  },
  {
    id: 'flame-indigo',
    name: 'Laranja Chama & Índigo',
    description: 'Energia acolhedora e vibrante com solidez contemporânea.',
    primary: '#ea580c',
    secondary: '#6366f1',
  },
  {
    id: 'rose-gold',
    name: 'Rosé Nobre & Ouro Suave',
    description: 'Acolhimento amoroso, delicadeza e máxima sofisticação.',
    primary: '#f43f5e',
    secondary: '#fbbf24',
  },
];

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16),
    };
  }
  return null;
}

export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const adjust = (val: number) => {
    const res = Math.round(val + (percent > 0 ? (255 - val) * (percent / 100) : val * (percent / 100)));
    return Math.min(255, Math.max(0, res));
  };
  const r = adjust(rgb.r).toString(16).padStart(2, '0');
  const g = adjust(rgb.g).toString(16).padStart(2, '0');
  const b = adjust(rgb.b).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

export function getContrastTextColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#ffffff';
  // Fórmula padrão de luminância YIQ
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 145 ? '#0b1120' : '#ffffff';
}

export function applyThemeColors(
  themeColors?: { primaryColor?: string; secondaryColor?: string },
  _isDark: boolean = true
): void {
  const primary = themeColors?.primaryColor?.trim() || DEFAULT_THEME_COLORS.primaryColor;
  const secondary = themeColors?.secondaryColor?.trim() || DEFAULT_THEME_COLORS.secondaryColor;

  const root = document.documentElement;
  const rgbP = hexToRgb(primary) || { r: 245, g: 158, b: 11 };
  const rgbS = hexToRgb(secondary) || { r: 59, g: 130, b: 246 };

  // Primary Color Tokens (Mapeados para os tokens do Design System)
  root.style.setProperty('--accent-gold', primary);
  root.style.setProperty('--accent-gold-light', adjustBrightness(primary, 18));
  root.style.setProperty('--accent-gold-dark', adjustBrightness(primary, -18));
  root.style.setProperty('--accent-gold-soft', `rgba(${rgbP.r}, ${rgbP.g}, ${rgbP.b}, 0.15)`);
  root.style.setProperty('--accent-gold-glow', `rgba(${rgbP.r}, ${rgbP.g}, ${rgbP.b}, 0.25)`);
  root.style.setProperty('--shadow-gold', `0 10px 25px -5px rgba(${rgbP.r}, ${rgbP.g}, ${rgbP.b}, 0.3)`);
  root.style.setProperty('--border-focus', primary);
  root.style.setProperty('--primary-color', primary);
  root.style.setProperty('--btn-primary-text', getContrastTextColor(primary));

  // Secondary Color Tokens
  root.style.setProperty('--accent-blue', secondary);
  root.style.setProperty('--accent-blue-light', adjustBrightness(secondary, 18));
  root.style.setProperty('--accent-blue-soft', `rgba(${rgbS.r}, ${rgbS.g}, ${rgbS.b}, 0.15)`);
  root.style.setProperty('--secondary-color', secondary);
}

export function resetThemeColors(): void {
  applyThemeColors(DEFAULT_THEME_COLORS);
}
