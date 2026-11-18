import React, { useState } from 'react';
import { UserSession, ChurchSettings } from '../../types';
import { loginWithCredentials } from '../../services/authService';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const result = await loginWithCredentials(email, password);
      if (result.success && result.user) {
        onNotify?.('success', `Bem-vindo(a), ${result.user.name}!`);
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'E-mail ou senha incorretos.');
      }
    } catch {
      setErrorMessage('Não foi possível entrar agora. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const contact = churchSettings?.phone || '(92) 98450-9989';

  return (
    <div className="lg-page animate-page-enter">
      <div className="lg-box">
        <img
          className="lg-logo"
          src={churchSettings?.logoUrl || '/images/logo.png'}
          alt={churchSettings?.name || 'MACDP'}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/logo.png';
          }}
        />
        <span className="lg-eyebrow">{churchSettings?.shortName || 'MACDP'}</span>
        <h1 className="lg-title">Painel administrativo</h1>

        <form onSubmit={handleSubmit} className="lg-form" noValidate>
          <label className="lg-label" htmlFor="lg-email">E-mail</label>
          <input
            id="lg-email"
            className="lg-input"
            type="email"
            autoComplete="username"
            placeholder="seu.nome@macdp.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="lg-label" htmlFor="lg-password">Senha</label>
          <div className="lg-pass">
            <input
              id="lg-password"
              className="lg-input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="lg-eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {errorMessage && (
            <p className="lg-error" role="alert">
              {errorMessage}
            </p>
          )}

          <button type="submit" className="lg-submit" disabled={isLoading || !email || !password}>
            {isLoading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="lg-help">Esqueceu a senha ou precisa de acesso? Fale com a secretaria: {contact}</p>

        <button type="button" className="lg-back" onClick={onBackToPublic}>
          <ArrowLeft size={15} /> Voltar ao site
        </button>
      </div>

      <style>{`
        .lg-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; background: #09090b; }
        .lg-box { width: 100%; max-width: 400px; display: flex; flex-direction: column; align-items: stretch; }
        .lg-logo { width: 56px; height: 56px; object-fit: contain; align-self: center; margin-bottom: 1.25rem; }
        .lg-eyebrow { text-align: center; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent-gold-light); }
        .lg-title { text-align: center; font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0.4rem 0 2rem; }
        .lg-form { display: flex; flex-direction: column; }
        .lg-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #8b8b95; margin: 0 0 0.3rem; }
        .lg-input { width: 100%; padding: 0.8rem 0; background: none; border: 0; border-bottom: 1px solid #34343c; border-radius: 0; color: #fff; font-size: 1rem; outline: 0; margin-bottom: 1.5rem; }
        .lg-input:focus { border-bottom-color: var(--accent-gold-light); }
        .lg-input::placeholder { color: #55555e; }
        .lg-pass { position: relative; }
        .lg-pass .lg-input { padding-right: 2.5rem; }
        .lg-eye { position: absolute; right: 0; top: 0.55rem; background: none; border: 0; color: #8b8b95; cursor: pointer; padding: 0.2rem; }
        .lg-eye:hover { color: #fff; }
        .lg-error { color: #f87171; font-size: 0.9rem; margin: -0.5rem 0 1rem; }
        .lg-submit { padding: 1rem; border: 2px solid var(--accent-gold-light); border-radius: 4px; background: var(--accent-gold-light); color: #0a0a0a; font-family: var(--font-display); font-size: 0.8rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer; transition: background 150ms ease, border-color 150ms ease; }
        .lg-submit:hover:not(:disabled) { background: #fff; border-color: #fff; }
        .lg-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .lg-help { text-align: center; font-size: 0.85rem; line-height: 1.6; color: #8b8b95; margin: 1.75rem 0 0; }
        .lg-back { display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; margin: 1.25rem auto 0; background: none; border: 0; color: #8b8b95; font-size: 0.88rem; cursor: pointer; }
        .lg-back:hover { color: #fff; }
      `}</style>
    </div>
  );
};
