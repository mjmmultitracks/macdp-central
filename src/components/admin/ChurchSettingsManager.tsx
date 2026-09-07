import React, { useState, useRef } from 'react';
import { ChurchSettings, ChurchAppSettings, AppModuleId } from '../../types';
import {
  updateChurchSettings,
  INITIAL_CHURCH_SETTINGS,
  INITIAL_APP_SETTINGS,
  sendAppNotification,
  toggleAppLiveStatus,
} from '../../services/db';
import { sendNativePushNotification } from '../../services/notificationService';
import {
  Building2,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Share2,
  DollarSign,
  Shield,
  Sparkles,
  Info,
  Check,
  Palette,
  RefreshCw,
  Smartphone,
  Radio,
  Bell,
  Send,
  Lock,
  QrCode,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { COLOR_PRESETS, DEFAULT_THEME_COLORS, applyThemeColors } from '../../utils/themeColors';

interface ChurchSettingsManagerProps {
  churchSettings?: ChurchSettings;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const ChurchSettingsManager: React.FC<ChurchSettingsManagerProps> = ({
  churchSettings: initialSettings,
  onNotify,
}) => {
  const currentSettings = initialSettings || INITIAL_CHURCH_SETTINGS;

  // Form State
  const [form, setForm] = useState<ChurchSettings>({
    name: currentSettings.name || '',
    shortName: currentSettings.shortName || '',
    subtitle: currentSettings.subtitle || '',
    slogan: currentSettings.slogan || '',
    description: currentSettings.description || '',
    logoUrl: currentSettings.logoUrl || '/images/logo.png',
    pastorPresident: currentSettings.pastorPresident || '',
    cnpj: currentSettings.cnpj || '',
    phone: currentSettings.phone || '',
    whatsapp: currentSettings.whatsapp || '',
    email: currentSettings.email || '',
    address: {
      street: currentSettings.address?.street || '',
      neighborhood: currentSettings.address?.neighborhood || '',
      city: currentSettings.address?.city || '',
      state: currentSettings.address?.state || 'AM',
      zip: currentSettings.address?.zip || '',
    },
    social: {
      instagram: currentSettings.social?.instagram || '',
      instagramHandle: currentSettings.social?.instagramHandle || '@_macdp',
      youtube: currentSettings.social?.youtube || '',
      facebook: currentSettings.social?.facebook || '',
    },
    pix: {
      key: currentSettings.pix?.key || '',
      receiver: currentSettings.pix?.receiver || '',
      bank: currentSettings.pix?.bank || '',
    },
    mercadoPago: {
      enabled: currentSettings.mercadoPago?.enabled || false,
      accessToken: currentSettings.mercadoPago?.accessToken || '',
      publicKey: currentSettings.mercadoPago?.publicKey || '',
      sandbox: currentSettings.mercadoPago?.sandbox || false,
    },
    themeColors: {
      primaryColor: currentSettings.themeColors?.primaryColor || DEFAULT_THEME_COLORS.primaryColor,
      secondaryColor: currentSettings.themeColors?.secondaryColor || DEFAULT_THEME_COLORS.secondaryColor,
    },
    appSettings: currentSettings.appSettings || INITIAL_APP_SETTINGS,
  });

  const [activeTab, setActiveTab] = useState<'brand' | 'colors' | 'app' | 'contact' | 'address' | 'social' | 'mercadopago'>('brand');
  const [isSaving, setIsSaving] = useState(false);
  const [isChurchLinkCopied, setIsChurchLinkCopied] = useState(false);

  // Mercado Pago Test & Visibility State
  const [isTestingMp, setIsTestingMp] = useState(false);
  const [mpTestResult, setMpTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showAccessToken, setShowAccessToken] = useState(false);

  const handleTestMercadoPago = async () => {
    if (!form.mercadoPago?.accessToken?.trim()) {
      onNotify('error', 'Digite ou cole o Access Token do Mercado Pago antes de testar.');
      return;
    }
    setIsTestingMp(true);
    setMpTestResult(null);
    try {
      const res = await fetch('/api/mercadopago-test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: form.mercadoPago.accessToken.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMpTestResult({
          success: true,
          message: data.message || `Conexão bem-sucedida com a conta ${data.account?.nickname || ''}!`,
        });
        onNotify('success', 'Conexão com o Mercado Pago validada com sucesso!');
      } else {
        setMpTestResult({
          success: false,
          message: data.error || 'Não foi possível validar o token do Mercado Pago.',
        });
        onNotify('error', data.error || 'Falha ao conectar com o Mercado Pago.');
      }
    } catch (err: any) {
      setMpTestResult({
        success: false,
        message: err.message || 'Erro de rede ao conectar à API.',
      });
      onNotify('error', 'Erro ao testar conexão.');
    } finally {
      setIsTestingMp(false);
    }
  };

  // Push Notification Dispatcher Form State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'live' | 'evento' | 'pastoral' | 'geral'>('geral');
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Color Handlers
  const handleColorChange = (key: 'primaryColor' | 'secondaryColor', val: string) => {
    const updatedTheme = {
      ...(form.themeColors || DEFAULT_THEME_COLORS),
      [key]: val,
    };
    setForm((prev) => ({
      ...prev,
      themeColors: updatedTheme,
    }));
    applyThemeColors(updatedTheme);
  };

  const handleSelectPreset = (preset: { primary: string; secondary: string; name: string }) => {
    const updatedTheme = {
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
    };
    setForm((prev) => ({
      ...prev,
      themeColors: updatedTheme,
    }));
    applyThemeColors(updatedTheme);
    onNotify('info', `Paleta "${preset.name}" aplicada ao vivo!`);
  };

  const handleResetColors = () => {
    setForm((prev) => ({
      ...prev,
      themeColors: DEFAULT_THEME_COLORS,
    }));
    applyThemeColors(DEFAULT_THEME_COLORS);
    onNotify('info', 'Cores redefinidas para o padrão oficial MACDP.');
  };

  // Handle local file upload for church logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onNotify('error', 'Selecione um arquivo de imagem válido (PNG, JPG, SVG ou WEBP).');
      return;
    }

    // Limit to 4MB
    if (file.size > 4 * 1024 * 1024) {
      onNotify('error', 'A imagem é muito grande. Escolha uma imagem de até 4 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setForm((prev) => ({ ...prev, logoUrl: base64 }));
        onNotify('info', 'Nova imagem carregada para a logomarca!');
      }
    };
    reader.onerror = () => {
      onNotify('error', 'Erro ao ler arquivo de imagem.');
    };
    reader.readAsDataURL(file);
  };

  // Reset to default logo
  const handleResetLogo = () => {
    setForm((prev) => ({ ...prev, logoUrl: '/images/logo.png' }));
    onNotify('info', 'Logotipo redefinido para o padrão original da MACDP.');
  };

  // Save Settings
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!form.name.trim()) {
      onNotify('error', 'O Nome da Igreja é obrigatório.');
      return;
    }

    setIsSaving(true);
    try {
      updateChurchSettings(form);
      onNotify('success', 'Identidade e configurações da igreja salvas com sucesso!');
    } catch (err: any) {
      onNotify('error', err?.message || 'Erro ao salvar configurações.');
    } finally {
      setTimeout(() => setIsSaving(false), 400);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={20} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Configurações & Identidade da Igreja
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Personalize o nome da igreja, logotipo oficial, lema, contatos, endereço e redes sociais exibidos no portal e painel.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="btn btn-primary"
          style={{ gap: '0.5rem', padding: '0.65rem 1.4rem' }}
        >
          {isSaving ? (
            <>
              <span className="spinner-border spinner-border-sm" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Salvar Alterações</span>
            </>
          )}
        </button>
      </div>

      {/* Live Preview Card */}
      <div
        className="card"
        style={{
          background: 'var(--bg-secondary)',
          backgroundImage: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
          border: '1px solid var(--accent-gold-glow)',
          borderLeft: '4px solid var(--accent-gold)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '140px',
            height: '140px',
            background: 'radial-gradient(circle, var(--accent-gold-glow) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1.15rem', color: 'var(--accent-gold)' }}>
          <Sparkles size={16} />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Pré-visualização em Tempo Real da Marca
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: '1 1 360px', minWidth: 0 }}>
            {/* Logo box */}
            <div
              className="church-logo-frame"
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '16px',
                background: '#0f172a',
                border: '2px solid rgba(245, 158, 11, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img
                src={form.logoUrl || '/images/logo.png'}
                alt="Logo da Igreja"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/logo.png';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '10px',
                }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--accent-gold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  display: 'block',
                  marginBottom: '0.15rem',
                }}
              >
                {form.subtitle || 'Ministério Apostólico'}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
                  {form.name || 'Nome da Igreja'}
                </h3>
                {form.shortName && (
                  <span
                    className="badge badge-gold"
                    style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem' }}
                  >
                    {form.shortName}
                  </span>
                )}
              </div>

              {form.slogan && (
                <p
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic',
                    margin: '0.35rem 0 0 0',
                  }}
                >
                  "{form.slogan}"
                </p>
              )}
            </div>
          </div>

          {/* Quick info badges */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              background: 'var(--bg-tertiary)',
              padding: '0.85rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              minWidth: '240px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {form.pastorPresident && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ color: 'var(--accent-gold)' }}>👑</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{form.pastorPresident}</span>
              </div>
            )}
            {form.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Phone size={13} color="var(--accent-gold)" />
                <span>{form.phone}</span>
              </div>
            )}
            {form.address?.city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <MapPin size={13} color="var(--accent-blue-light)" />
                <span>
                  {form.address.neighborhood ? `${form.address.neighborhood}, ` : ''}
                  {form.address.city}/{form.address.state}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        className="scrollable-tabs-bar"
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-medium)',
          gap: '0.5rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('brand')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'brand' ? '2px solid var(--accent-gold)' : '2px solid transparent',
            color: activeTab === 'brand' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <ImageIcon size={16} />
          <span>Marca & Logotipo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('colors')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'colors' ? '2px solid var(--accent-gold)' : '2px solid transparent',
            color: activeTab === 'colors' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s ease',
          }}
        >
          <Palette size={16} />
          <span>Cores do Tema & Painel</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('app')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'app' ? '2px solid var(--accent-gold)' : '2px solid transparent',
            color: activeTab === 'app' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s ease',
          }}
        >
          <Smartphone size={16} />
          <span>📱 Aplicativo da Igreja & Live</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'contact' ? '2px solid var(--accent-gold)' : '2px solid transparent',
            color: activeTab === 'contact' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Phone size={16} />
          <span>Liderança & Contato</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('address')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'address' ? '2px solid var(--accent-gold)' : '2px solid transparent',
            color: activeTab === 'address' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <MapPin size={16} />
          <span>Endereço do Templo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('social')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'social' ? '2px solid var(--accent-gold)' : '2px solid transparent',
            color: activeTab === 'social' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            whiteSpace: 'nowrap',
          }}
        >
          <Share2 size={16} />
          <span>Redes & PIX Geral</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mercadopago')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'mercadopago' ? '2px solid var(--accent-gold)' : '2px solid transparent',
            color: activeTab === 'mercadopago' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            whiteSpace: 'nowrap',
          }}
        >
          <CreditCard size={16} />
          <span>Mercado Pago (Gateway)</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* ==================== TAB 1: MARCA & LOGOTIPO ==================== */}
        {activeTab === 'brand' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Identidade Visual & Logomarca
            </h4>

            {/* Logo Configuration Box */}
            <div
              style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              <div
                className="church-logo-frame"
                style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '16px',
                  background: '#0f172a',
                  border: '1.5px solid rgba(245, 158, 11, 0.45)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={form.logoUrl || '/images/logo.png'}
                  alt="Logotipo"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/logo.png';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block' }}>
                    Logotipo Oficial da Igreja
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Carregue uma imagem do seu computador (PNG, JPG, SVG ou WEBP) ou informe uma URL externa.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.4rem', color: 'var(--accent-gold)' }}
                  >
                    <Upload size={14} />
                    <span>Carregar Imagem do Computador</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.35rem', color: 'var(--text-secondary)' }}
                    title="Restaurar logotipo original"
                  >
                    <RotateCcw size={13} />
                    <span>Restaurar Padrão</span>
                  </button>
                </div>

                <div style={{ marginTop: '0.25rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                    Ou insira a URL direta do logo:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://exemplo.com/logo.png ou /images/logo.png"
                    value={form.logoUrl}
                    onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Church Name & Slogans */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Nome Completo da Igreja *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Ex: Ministério Apostólico Caçadores da Presença"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nome Curto / Sigla</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: MACDP Central"
                  value={form.shortName}
                  onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subtítulo / Segmento</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Ministério Apostólico"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lema / Slogan da Igreja</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder='Ex: "Proibido a Entrada de Pessoas Perfeitas."'
                  value={form.slogan}
                  onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descrição Institucional / Visão da Igreja</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Breve descrição institucional exibida no rodapé e páginas de apresentação..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* ==================== TAB 2: CORES DO TEMA & PAINEL ==================== */}
        {activeTab === 'colors' && (
          <div className="animate-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header Info */}
            <div
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.15rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'var(--accent-gold-soft)',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid var(--accent-gold-glow)',
                }}
              >
                <Palette size={26} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Personalização de Cores do Site e Painel de Controle
                </h4>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Defina as cores primárias e secundárias do design system. Todos os botões, títulos, selos, destaques, cartões e a navegação do painel administrativo se adaptam em tempo real.
                </p>
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {/* Primary Color Card */}
              <div
                className="card"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <label style={{ fontSize: '0.84rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-gold)', letterSpacing: '0.5px', display: 'block' }}>
                      Cor Primária (Destaque Principal)
                    </label>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Botões principais, títulos, bordas ativas e brilhos
                    </span>
                  </div>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: form.themeColors?.primaryColor || DEFAULT_THEME_COLORS.primaryColor,
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.25)',
                      flexShrink: 0,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <input
                    type="color"
                    value={form.themeColors?.primaryColor || DEFAULT_THEME_COLORS.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    style={{
                      width: '56px',
                      height: '46px',
                      padding: '2px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-medium)',
                      cursor: 'pointer',
                      background: 'var(--bg-tertiary)',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="#f59e0b"
                      value={form.themeColors?.primaryColor || DEFAULT_THEME_COLORS.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.98rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Color Card */}
              <div
                className="card"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <label style={{ fontSize: '0.84rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-blue-light)', letterSpacing: '0.5px', display: 'block' }}>
                      Cor Secundária (Apoio & Contraste)
                    </label>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Badges secundárias, links e ícones de apoio
                    </span>
                  </div>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: form.themeColors?.secondaryColor || DEFAULT_THEME_COLORS.secondaryColor,
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.25)',
                      flexShrink: 0,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <input
                    type="color"
                    value={form.themeColors?.secondaryColor || DEFAULT_THEME_COLORS.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    style={{
                      width: '56px',
                      height: '46px',
                      padding: '2px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-medium)',
                      cursor: 'pointer',
                      background: 'var(--bg-tertiary)',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="#3b82f6"
                      value={form.themeColors?.secondaryColor || DEFAULT_THEME_COLORS.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.98rem' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Presets Gallery */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Paletas Harmoniosas Prontas
                  </h4>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Clique em qualquer paleta para aplicar instantaneamente em todo o site e painel:
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetColors}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.4rem', fontSize: '0.8rem' }}
                >
                  <RotateCcw size={14} />
                  <span>Restaurar Padrão MACDP</span>
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '0.9rem',
                }}
              >
                {COLOR_PRESETS.map((p) => {
                  const currentPrimary = (form.themeColors?.primaryColor || DEFAULT_THEME_COLORS.primaryColor).toLowerCase();
                  const currentSecondary = (form.themeColors?.secondaryColor || DEFAULT_THEME_COLORS.secondaryColor).toLowerCase();
                  const isSelected = currentPrimary === p.primary.toLowerCase() && currentSecondary === p.secondary.toLowerCase();

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPreset(p)}
                      style={{
                        background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                        border: isSelected ? '2px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem',
                        boxShadow: isSelected ? '0 4px 18px var(--accent-gold-glow)' : 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: p.primary,
                              border: '2px solid #ffffff',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            }}
                          />
                          <div
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: p.secondary,
                              border: '2px solid #ffffff',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                              marginLeft: '-10px',
                            }}
                          />
                        </div>

                        {isSelected && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background: 'var(--accent-gold-soft)',
                              color: 'var(--accent-gold)',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-full)',
                              border: '1px solid var(--accent-gold)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Check size={11} />
                            <span>Ativo</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {p.name}
                        </div>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                          {p.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Elements Interactive Preview Box */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-gold)', letterSpacing: '0.5px' }}>
                Demonstração de Elementos com as Cores Escolhidas
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-primary">
                  Botão Primário
                </button>
                <button type="button" className="btn btn-outline">
                  Botão Contorno
                </button>
                <button type="button" className="btn btn-secondary">
                  Botão Secundário
                </button>
                <span
                  style={{
                    background: 'var(--accent-gold-soft)',
                    color: 'var(--accent-gold)',
                    border: '1px solid var(--accent-gold)',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                  }}
                >
                  Selo Destaque (Primária)
                </span>
                <span
                  style={{
                    background: 'var(--accent-blue-soft)',
                    color: 'var(--accent-blue-light)',
                    border: '1px solid var(--accent-blue-light)',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                  }}
                >
                  Selo Apoio (Secundária)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: APLICATIVO DA IGREJA & LIVE ==================== */}
        {activeTab === 'app' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 0. Link e QR Code de Divulgação do Aplicativo Oficial da Igreja */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, var(--bg-secondary) 100%)',
                border: '1.5px solid var(--accent-gold, #f59e0b)',
                borderRadius: '24px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: 'var(--accent-gold, #f59e0b)',
                      color: '#0B1120',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 20px rgba(245, 158, 11, 0.25)',
                    }}
                  >
                    <QrCode size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        Link & QR Code Oficial do Aplicativo
                      </h4>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.6rem',
                          borderRadius: '999px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10B981',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        Aplicativo Oficial
                      </span>
                    </div>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      Membros que acessarem por este link ou apontarem a câmera para o QR Code abrem o aplicativo da igreja diretamente no celular!
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.25rem',
                  alignItems: 'center',
                }}
              >
                {/* Left: Link and explanations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                      Link Direto do Aplicativo para Membros
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        readOnly
                        value={typeof window !== 'undefined' ? `${window.location.origin}/app` : 'https://macdp.com.br/app'}
                        className="form-input"
                        style={{
                          flex: 1,
                          fontSize: '0.85rem',
                          fontFamily: 'monospace',
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const url = typeof window !== 'undefined' ? `${window.location.origin}/app` : 'https://macdp.com.br/app';
                          navigator.clipboard.writeText(url);
                          setIsChurchLinkCopied(true);
                          setTimeout(() => setIsChurchLinkCopied(false), 2500);
                          onNotify('success', 'Link direto do app copiado para a área de transferência!');
                        }}
                        className="btn btn-secondary"
                        style={{ gap: '0.4rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      >
                        {isChurchLinkCopied ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                        <span>{isChurchLinkCopied ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '14px',
                      padding: '0.85rem',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>
                      💡 Dica para a Mídia da Igreja:
                    </strong>
                    Projete este QR Code no telão do santuário antes e depois dos cultos ou imprima no boletim semanal. Os membros abrem o aplicativo na hora e podem instalá-lo no celular.
                  </div>
                </div>

                {/* Right: Visual QR Code Card */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '1.25rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    maxWidth: '220px',
                    margin: '0 auto',
                  }}
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/app` : 'https://macdp.com.br/app')}`}
                    alt="QR Code do App da Igreja"
                    style={{ width: '160px', height: '160px', display: 'block' }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', marginTop: '0.5rem', textAlign: 'center' }}>
                    {form.shortName || 'MACDP Central'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#64748B', textAlign: 'center' }}>
                    Aponte a câmera do celular
                  </span>
                </div>
              </div>
            </div>

            {/* 1. Transmissão Ao Vivo (Live Stream) */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#EF4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Radio size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      Controle de Transmissão Ao Vivo (Culto Online)
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Ative a sinalização de live e defina o link oficial para os membros assistirem no celular
                    </span>
                  </div>
                </div>

                {/* Botão Liga/Desliga Ao Vivo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: form.appSettings?.isLiveNow ? '#EF4444' : 'var(--text-muted)' }}>
                    {form.appSettings?.isLiveNow ? '🔴 CULTO AO VIVO ATIVADO' : '⚪ Transmissão Desligada'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !form.appSettings?.isLiveNow;
                      setForm((prev) => ({
                        ...prev,
                        appSettings: {
                          ...(prev.appSettings || INITIAL_APP_SETTINGS),
                          isLiveNow: nextState,
                        },
                      }));
                      toggleAppLiveStatus(nextState, form.appSettings?.liveTitle, form.appSettings?.liveStreamUrl);
                      onNotify(
                        nextState ? 'success' : 'info',
                        nextState
                          ? 'Transmissão Ao Vivo ativada! Notificação enviada aos membros.'
                          : 'Status de transmissão ao vivo desativado.'
                      );
                    }}
                    className={form.appSettings?.isLiveNow ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ gap: '0.4rem', padding: '0.5rem 1.1rem' }}
                  >
                    <Radio size={16} />
                    <span>{form.appSettings?.isLiveNow ? 'Desligar Ao Vivo' : 'Ligar Ao Vivo Agora'}</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Link da Transmissão (YouTube Live ou Vídeo)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://www.youtube.com/@_macdp/live ou link de embed"
                    value={form.appSettings?.liveStreamUrl || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        appSettings: {
                          ...(form.appSettings || INITIAL_APP_SETTINGS),
                          liveStreamUrl: e.target.value,
                        },
                      })
                    }
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    Pode ser link de canal, live direta ou vídeo do YouTube.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Título do Culto Ao Vivo</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Culto da Família & Presença de Deus"
                    value={form.appSettings?.liveTitle || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        appSettings: {
                          ...(form.appSettings || INITIAL_APP_SETTINGS),
                          liveTitle: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Subtítulo / Mensagem da Transmissão</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Transmissão Oficial Direto do Templo Central • Manaus/AM"
                    value={form.appSettings?.liveSubtitle || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        appSettings: {
                          ...(form.appSettings || INITIAL_APP_SETTINGS),
                          liveSubtitle: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* 2. Disparador de Notificações Push para o App */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: 'var(--accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bell size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Disparar Notificação Push para os Membros no Celular
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Envie alertas imediatos sobre cultos, novos eventos, devocionais ou avisos pastorais urgentes
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Título da Notificação *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: 🔴 Culto da Família Começou!"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Notificação</label>
                  <select
                    className="form-select"
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value as any)}
                  >
                    <option value="geral">Geral / Informativo</option>
                    <option value="live">🔴 Culto Ao Vivo</option>
                    <option value="evento">🔥 Eventos & Conferências</option>
                    <option value="pastoral">📖 Mensagem Pastoral / Devocional</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Mensagem do Comunicado *</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Escreva a mensagem que aparecerá no celular dos membros..."
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  disabled={isSendingNotif || !notifTitle.trim() || !notifMessage.trim()}
                  onClick={() => {
                    setIsSendingNotif(true);
                    try {
                      sendAppNotification({
                        title: notifTitle,
                        message: notifMessage,
                        type: notifType,
                        actionUrl: notifType === 'live' ? '#live' : notifType === 'evento' ? '#eventos' : '#biblia',
                      });
                      sendNativePushNotification(notifTitle, {
                        body: notifMessage,
                        icon: form.logoUrl || '/images/logo.png',
                      });
                      onNotify('success', `Notificação push "${notifTitle}" disparada para todos os membros no app!`);
                      setNotifTitle('');
                      setNotifMessage('');
                    } catch (err) {
                      onNotify('error', 'Erro ao disparar notificação.');
                    } finally {
                      setIsSendingNotif(false);
                    }
                  }}
                  className="btn btn-primary"
                  style={{ gap: '0.4rem', padding: '0.65rem 1.4rem' }}
                >
                  <Send size={16} />
                  <span>{isSendingNotif ? 'Enviando Alerta...' : 'Disparar Notificação Push'}</span>
                </button>
              </div>
            </div>

            {/* 3. Módulos Ativos no Aplicativo da Igreja */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Smartphone size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Módulos & Recursos Ativos no App
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Ative ou desative seções do aplicativo de acordo com as necessidades da sua congregação
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                {[
                  { key: 'biblia', label: '📖 Bíblia Sagrada (66 Livros)' },
                  { key: 'live', label: '🔴 Culto Ao Vivo (Live Stream)' },
                  { key: 'midias', label: '🎬 Mídias & Podcasts de Áudio' },
                  { key: 'ministerios', label: '🤝 Ministérios & Voluntários' },
                  { key: 'celulas', label: '👥 Células nas Casas' },
                  { key: 'contribuir', label: '💰 Dízimos & Doações (PIX)' },
                  { key: 'oracao', label: '🙏 Central de Oração' },
                  { key: 'carteirinha', label: '🪪 Carteirinha Digital de Membro' },
                  { key: 'anotacoes', label: '📝 Caderno de Sermões' },
                ].map((mod) => {
                  const isChecked = form.appSettings?.enabledModules?.[mod.key as keyof ChurchAppSettings['enabledModules']] ?? true;
                  return (
                    <label
                      key={mod.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        background: isChecked ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-tertiary)',
                        border: isChecked ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: isChecked ? 'var(--text-primary)' : 'var(--text-muted)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const currentEnabled = form.appSettings?.enabledModules || INITIAL_APP_SETTINGS.enabledModules;
                          setForm({
                            ...form,
                            appSettings: {
                              ...(form.appSettings || INITIAL_APP_SETTINGS),
                              enabledModules: {
                                ...currentEnabled,
                                [mod.key]: e.target.checked,
                              },
                            },
                          });
                        }}
                      />
                      <span>{mod.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Banner de Boas-Vindas da Tela Inicial do App */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Mensagem & Banner da Home do Aplicativo
              </h4>

              <div className="form-group">
                <label className="form-label">Mensagem de Destaque / Boas-Vindas</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  value={form.appSettings?.bannerText || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      appSettings: {
                        ...(form.appSettings || INITIAL_APP_SETTINGS),
                        bannerText: e.target.value,
                      },
                    })
                  }
                  placeholder="Mensagem inspiradora exibida logo no topo da tela inicial do aplicativo..."
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: LIDERANÇA & CONTATO ==================== */}
        {activeTab === 'contact' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Liderança Pastoral & Canais Oficiais
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Pastores Presidentes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Pr. Oziel Gomes Maduro & Pra. Midiã Gomes Maduro"
                  value={form.pastorPresident}
                  onChange={(e) => setForm({ ...form, pastorPresident: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">CNPJ da Instituição</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: 00.000.000/0001-00"
                  value={form.cnpj || ''}
                  onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telefone da Secretaria / Fixo</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: (92) 99127-9663"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp Oficial (somente dígitos com DDD)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: 92991279663"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Utilizado para disparar links diretos de WhatsApp da secretaria.
                </span>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">E-mail Institucional de Atendimento</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Ex: contato@macdp.com.br"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: ENDEREÇO DO TEMPLO ==================== */}
        {activeTab === 'address' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Endereço da Sede / Templo Principal
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Logradouro (Rua/Avenida e Número)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Rua Lagoa Grande, 382"
                  value={form.address.street}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: { ...form.address, street: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bairro</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Conj. Canaranas / Cidade Nova"
                  value={form.address.neighborhood}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: { ...form.address, neighborhood: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cidade</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Manaus"
                  value={form.address.city}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: { ...form.address, city: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estado / UF</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: AM"
                  value={form.address.state}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: { ...form.address, state: e.target.value.toUpperCase() },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">CEP</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: 69097-750"
                  value={form.address.zip}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: { ...form.address, zip: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: REDES SOCIAIS & PIX ==================== */}
        {activeTab === 'social' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Redes Sociais & Dados de Contribuição (PIX)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Link do Instagram</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: https://instagram.com/_macdp"
                  value={form.social.instagram}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      social: { ...form.social, instagram: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Identificador do Instagram (com @)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: @_macdp"
                  value={form.social.instagramHandle}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      social: { ...form.social, instagramHandle: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Canal Oficial do YouTube</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: https://www.youtube.com/@_macdp"
                  value={form.social.youtube}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      social: { ...form.social, youtube: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Página do Facebook</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: https://facebook.com/macdpoficial"
                  value={form.social.facebook || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      social: { ...form.social, facebook: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chave PIX Oficial da Igreja</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: CNPJ, celular, e-mail ou chave aleatória"
                  value={form.pix.key}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      pix: { ...form.pix, key: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Titular / Favorecido do PIX</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Ministério Apostólico Caçadores da Presença"
                  value={form.pix.receiver}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      pix: { ...form.pix, receiver: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Banco / Instituição Financeira</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Banco Bradesco / Nubank"
                  value={form.pix.bank || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      pix: { ...form.pix, bank: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 7: MERCADO PAGO GATEWAY ==================== */}
        {activeTab === 'mercadopago' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(0, 158, 227, 0.15)',
                    border: '1px solid rgba(0, 158, 227, 0.4)',
                    color: '#009ee3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CreditCard size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Integração Oficial Mercado Pago
                  </h4>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Baixa 100% automática de PIX em tempo real e pagamentos via Cartão de Crédito nas inscrições de eventos.
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    background: form.mercadoPago?.enabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                    color: form.mercadoPago?.enabled ? 'var(--status-success)' : 'var(--text-muted)',
                    border: `1px solid ${form.mercadoPago?.enabled ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                  }}
                >
                  {form.mercadoPago?.enabled ? '● Ativo nas Inscrições' : '○ Inativo'}
                </span>
              </div>
            </div>

            {/* Ativar/Desativar Switch */}
            <div
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block' }}>
                  Ativar Mercado Pago como Processador Principal
                </span>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Quando ativado, os eventos pagos gerarão PIX dinâmico com confirmação instantânea na hora do pagamento e permitirão parcelamento no cartão.
                </p>
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={form.mercadoPago?.enabled || false}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mercadoPago: {
                        ...(form.mercadoPago || { accessToken: '', publicKey: '' }),
                        enabled: e.target.checked,
                      },
                    })
                  }
                  style={{ width: '20px', height: '20px', accentColor: '#009ee3' }}
                />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: form.mercadoPago?.enabled ? '#009ee3' : 'var(--text-secondary)' }}>
                  {form.mercadoPago?.enabled ? 'Integração Ativada' : 'Integração Desativada'}
                </span>
              </label>
            </div>

            {/* Credenciais Form */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Access Token (Produção ou Teste) *</label>
                  <button
                    type="button"
                    onClick={() => setShowAccessToken(!showAccessToken)}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0.15rem 0.45rem', fontSize: '0.72rem', gap: '0.3rem' }}
                  >
                    {showAccessToken ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{showAccessToken ? 'Ocultar' : 'Exibir'}</span>
                  </button>
                </div>
                <input
                  type={showAccessToken ? 'text' : 'password'}
                  className="form-input"
                  placeholder="APP_USR-0000000000000000-000000-..."
                  value={form.mercadoPago?.accessToken || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mercadoPago: {
                        ...(form.mercadoPago || { enabled: false, publicKey: '' }),
                        accessToken: e.target.value,
                      },
                    })
                  }
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                  Token privado da aplicação no Mercado Pago. Mantido protegido no servidor.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Public Key (Chave Pública)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="APP_USR-00000000-0000-0000-0000-000000000000"
                  value={form.mercadoPago?.publicKey || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mercadoPago: {
                        ...(form.mercadoPago || { enabled: false, accessToken: '' }),
                        publicKey: e.target.value,
                      },
                    })
                  }
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                  Chave pública do Mercado Pago utilizada pelo frontend.
                </span>
              </div>
            </div>

            {/* Test Connection Button & Result Banner */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={isTestingMp || !form.mercadoPago?.accessToken}
                  onClick={handleTestMercadoPago}
                  className="btn btn-secondary"
                  style={{ gap: '0.5rem', fontWeight: 800, borderColor: '#009ee3', color: '#009ee3' }}
                >
                  {isTestingMp ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  <span>{isTestingMp ? 'Testando Conexão...' : 'Testar Conexão com Mercado Pago'}</span>
                </button>

                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Valida se o Access Token fornecido está ativo e possui permissões na API.
                </span>
              </div>

              {mpTestResult && (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    background: mpTestResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${mpTestResult.success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                    color: mpTestResult.success ? 'var(--status-success)' : '#ef4444',
                  }}
                >
                  {mpTestResult.success ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  <span>{mpTestResult.message}</span>
                </div>
              )}
            </div>

            {/* Instruction Card */}
            <div
              style={{
                background: 'rgba(0, 158, 227, 0.06)',
                border: '1px solid rgba(0, 158, 227, 0.25)',
                borderRadius: '8px',
                padding: '1rem 1.25rem',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
              }}
            >
              <strong style={{ color: '#009ee3', fontSize: '0.88rem', display: 'block', marginBottom: '0.4rem' }}>
                📖 Como obter suas credenciais no Mercado Pago:
              </strong>
              <ol style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li>Acesse o portal oficial: <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>Mercado Pago Developers (Clique para abrir)</a>.</li>
                <li>Faça login com a conta da igreja no Mercado Pago.</li>
                <li>No menu superior, clique em <strong>Suas integrações</strong> &gt; Crie ou selecione sua aplicação.</li>
                <li>No menu lateral, acesse <strong>Credenciais de produção</strong> (ou Credenciais de teste).</li>
                <li>Copie o <strong>Access Token</strong> e a <strong>Public Key</strong>, cole nos campos acima e clique em <strong>"Testar Conexão"</strong>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '1rem',
            paddingTop: '0.5rem',
          }}
        >
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary"
            style={{ gap: '0.5rem', padding: '0.75rem 1.8rem' }}
          >
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm" />
                <span>Salvando Dados...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Salvar Configurações da Igreja</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
