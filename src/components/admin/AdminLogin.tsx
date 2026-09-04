import React, { useState } from 'react';
import { UserSession, ChurchSettings } from '../../types';
import { loginWithCredentials } from '../../services/authService';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: UserSession) => void;
  onBackToPublic: () => void;
  onNotify?: (type: 'success' | 'error' | 'info', text: string) => void;
  churchSettings?: ChurchSettings;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToPublic,
  onNotify,
  churchSettings,
}) => {
  const [email, setEmail] = useState('oziel.maduro@macdp.com.br');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await loginWithCredentials(email, password);

      if (result.success && result.user) {
        if (onNotify) {
          onNotify('success', `Bem-vindo(a) ao painel, ${result.user.name}!`);
        }
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Credenciais inválidas. Tente novamente.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro de comunicação ao validar acesso.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0b1120 70%)',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="animate-page-enter"
    >
      {/* Subtle Background Glow Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '10%',
          width: '500px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(245, 158, 11, 0.28)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 30px rgba(245, 158, 11, 0.08)',
          position: 'relative',
          zIndex: 10,
        }}
        className="animate-modal-pop"
      >
        {/* Top Header with Church Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '74px',
              height: '74px',
              margin: '0 auto 1.25rem auto',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(15, 23, 42, 0.9))',
              border: '1.5px solid var(--accent-gold)',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px var(--accent-gold-glow)',
            }}
          >
            <img
              src={churchSettings?.logoUrl || '/images/logo.png'}
              alt={churchSettings?.name || 'Logo Oficial MACDP'}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/logo.png';
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '14px',
              }}
            />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              color: 'var(--accent-gold-light)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem',
            }}
          >
            <ShieldCheck size={14} />
            <span>Acesso Restrito & Seguro</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.45rem',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '0.35rem',
            }}
          >
            {churchSettings?.shortName || churchSettings?.name || 'Painel Eclesiástico'}
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            {churchSettings?.subtitle || 'Ministério Apostólico Caçadores da Presença'}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              color: '#FCA5A5',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label
              className="form-label"
              style={{
                color: '#e2e8f0',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Mail size={15} color="var(--accent-gold)" />
              <span>E-mail Corporativo ou Ministerial</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="seu.nome@macdp.com.br"
                className="form-input"
                style={{
                  background: 'rgba(2, 6, 23, 0.65)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  color: '#ffffff',
                  padding: '0.85rem 1rem',
                  fontSize: '0.95rem',
                  borderRadius: 'var(--radius-md)',
                  width: '100%',
                }}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.4rem',
              }}
            >
              <label
                className="form-label"
                style={{
                  color: '#e2e8f0',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: 0,
                }}
              >
                <Lock size={15} color="var(--accent-gold)" />
                <span>Senha de Acesso</span>
              </label>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="form-input"
                style={{
                  background: 'rgba(2, 6, 23, 0.65)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  color: '#ffffff',
                  padding: '0.85rem 2.8rem 0.85rem 1rem',
                  fontSize: '0.95rem',
                  borderRadius: 'var(--radius-md)',
                  width: '100%',
                }}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: 'var(--accent-gold)',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                }}
              />
              <span>Manter conectado neste dispositivo</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: '0 8px 24px var(--accent-gold-glow)',
              cursor: isLoading ? 'wait' : 'pointer',
              opacity: isLoading ? 0.75 : 1,
            }}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" />
                <span>Autenticando com segurança...</span>
              </>
            ) : (
              <>
                <KeyRound size={18} />
                <span>Entrar no Painel ERP</span>
              </>
            )}
          </button>
        </form>

        {/* Security / Privacy notice */}
        <div
          style={{
            marginTop: '1.75rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: 'var(--accent-gold-light)', fontWeight: 600 }}>Ambiente Eclesiástico Restrito & Monitorado</span>
          <br />
          Para liberação de usuário ou recuperação de senha, contate a Secretaria: {churchSettings?.phone || '(92) 99127-9663'}.
        </div>

        {/* Back to Public Site Link */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={onBackToPublic}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-muted)')}
          >
            <ArrowLeft size={16} />
            <span>Voltar ao Portal Público da Igreja</span>
          </button>
        </div>
      </div>
    </div>
  );
};
