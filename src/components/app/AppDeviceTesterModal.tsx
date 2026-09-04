import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Share2,
  X,
  Wifi,
  Sparkles,
  Info,
  Apple,
} from 'lucide-react';

interface AppDeviceTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
  isDesktopFrame: boolean;
  onToggleDesktopFrame: () => void;
}

export const AppDeviceTesterModal: React.FC<AppDeviceTesterModalProps> = ({
  isOpen,
  onClose,
  appName = 'MACDP App',
  isDesktopFrame,
  onToggleDesktopFrame,
}) => {
  const [copied, setCopied] = useState(false);
  const [appUrl, setAppUrl] = useState('');
  const [manualIp, setManualIp] = useState('');
  const [activeTab, setActiveTab] = useState<'qr' | 'iphone' | 'android'>('qr');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const url = `${origin}/?app=true`;
      setAppUrl(url);

      const port = window.location.port || '5174';
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Pre-popula com o IP da rede local da máquina (192.168.101.5) e porta do Vite
        setManualIp(`192.168.101.5:${port}`);
      } else {
        setManualIp(`${window.location.host}`);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTestUrl = manualIp
    ? (manualIp.startsWith('http://') || manualIp.startsWith('https://')
        ? (manualIp.includes('app=true') ? manualIp : `${manualIp}${manualIp.endsWith('/') ? '' : '/'}?app=true`)
        : `http://${manualIp}${manualIp.endsWith('/') ? '' : '/'}?app=true`)
    : appUrl || 'http://192.168.101.5:5174/?app=true';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentTestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Gerador de QR Code visual em SVG usando API pública confiável e fallback SVG
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    currentTestUrl
  )}&bgcolor=ffffff&color=0b1120&margin=10`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(5, 8, 16, 0.85)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={onClose}
    >
      <div
        className="animate-page-enter"
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'var(--bg-secondary)',
          borderRadius: '24px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 30px rgba(245, 158, 11, 0.15)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent-gold) 0%, #d97706 100%)',
                color: '#0B1120',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              }}
            >
              <Smartphone size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Testar no Celular Real
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Abra instantaneamente no seu iPhone ou Android
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-tertiary)',
            padding: '0.35rem 0.5rem',
            gap: '0.35rem',
          }}
        >
          <button
            onClick={() => setActiveTab('qr')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'qr' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'qr' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'qr' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: activeTab === 'qr' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            <QrCode size={16} />
            <span>Escanear QR Code</span>
          </button>

          <button
            onClick={() => setActiveTab('iphone')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'iphone' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'iphone' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'iphone' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: activeTab === 'iphone' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            <Apple size={16} />
            <span>Como Instalar no iPhone</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'android' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'android' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'android' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: activeTab === 'android' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            <Smartphone size={16} />
            <span>Android (Chrome)</span>
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
          {activeTab === 'qr' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              {/* QR Code Container */}
              <div
                style={{
                  background: '#FFFFFF',
                  padding: '14px',
                  borderRadius: '18px',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={qrCodeApiUrl}
                  alt={`QR Code para ${appName}`}
                  style={{ width: '200px', height: '200px', display: 'block', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Wifi size={16} color="var(--accent-gold)" />
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Aponte a câmera do seu celular
                </strong>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Seu computador e seu celular devem estar conectados na <strong>mesma rede Wi-Fi</strong>. Toque na notificação amarela que aparecer na câmera para abrir o app!
              </p>

              {/* URL Box with Copy Button */}
              <div
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '0.6rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  marginBottom: '0.5rem',
                }}
              >
                <input
                  type="text"
                  readOnly
                  value={currentTestUrl}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.825rem',
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
                <button
                  onClick={handleCopyUrl}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.35rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>

              {/* IP Customizer */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px dashed var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  IP / Host da Máquina:
                </span>
                <input
                  type="text"
                  value={manualIp}
                  onChange={(e) => setManualIp(e.target.value)}
                  placeholder="192.168.101.5:5174"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-gold)',
                    fontSize: '0.78rem',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Modo de Visualização Desktop (Moldura de Smartphone) */}
              <div
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '14px',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-primary)' }}>
                    Simulador de Celular na Tela do PC
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {isDesktopFrame ? 'Modo moldura ativo (formato iPhone)' : 'Modo tela cheia responsiva ativo'}
                  </span>
                </div>

                <button
                  onClick={onToggleDesktopFrame}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.4rem', whiteSpace: 'nowrap' }}
                >
                  <Smartphone size={15} />
                  <span>{isDesktopFrame ? 'Desativar Moldura' : 'Ativar Moldura'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'iphone' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '14px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--accent-gold)',
                      color: '#0B1120',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    1
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
                      Abra o link no navegador Safari
                    </strong>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                      Aponte a câmera para o QR code ou digite o link no Safari do seu iPhone.
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: '14px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--accent-gold)',
                      color: '#0B1120',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    2
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
                      Toque no botão Compartilhar
                    </strong>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                      É o ícone do quadrado com uma setinha para cima <Share2 size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> na barra inferior do Safari.
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: '14px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--accent-gold)',
                      color: '#0B1120',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    3
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
                      Selecione "Adicionar à Tela de Início"
                    </strong>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                      Role um pouco para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>. Em seguida toque em "Adicionar" no topo.
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: '14px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <Check size={22} color="#10B981" />
                <p style={{ fontSize: '0.825rem', color: '#10B981', margin: 0, fontWeight: 600 }}>
                  Pronto! O ícone oficial da MACDP aparecerá na tela do seu iPhone como um aplicativo nativo, abrindo em tela cheia sem barras de navegador!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '14px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--accent-gold)',
                      color: '#0B1120',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    1
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
                      Abra o link no Google Chrome
                    </strong>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                      Escaneie o QR Code com a câmera do Android ou abra no Chrome.
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: '14px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--accent-gold)',
                      color: '#0B1120',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    2
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
                      Toque no banner "Instalar Aplicativo"
                    </strong>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                      Uma barra ou pop-up "Instalar {appName}" aparecerá automaticamente na parte inferior. Se não aparecer, toque nos 3 pontinhos no canto superior e selecione <strong>"Instalar aplicativo"</strong> ou "Adicionar à tela inicial".
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: '14px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <Check size={22} color="#10B981" />
                <p style={{ fontSize: '0.825rem', color: '#10B981', margin: 0, fontWeight: 600 }}>
                  O app será instalado como um aplicativo de verdade no Android, com ícone na gaveta de apps e suporte a notificações push!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: 'var(--bg-tertiary)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '0.6rem 1.4rem' }}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
