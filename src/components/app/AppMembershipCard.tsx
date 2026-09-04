import React, { useState } from 'react';
import { UserSession, ChurchSettings, Member } from '../../types';
import {
  IdCard,
  Shield,
  QrCode,
  CheckCircle2,
  Lock,
  LogOut,
  ExternalLink,
  Sparkles,
  Calendar,
  Building2,
  Award,
  User,
  ArrowRight,
} from 'lucide-react';

interface AppMembershipCardProps {
  currentUser?: UserSession;
  churchSettings?: ChurchSettings;
  members?: Member[];
  onOpenAdminPanel: () => void;
  onLoginMember: (user: UserSession) => void;
  onLogout: () => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AppMembershipCard: React.FC<AppMembershipCardProps> = ({
  currentUser,
  churchSettings,
  members = [],
  onOpenAdminPanel,
  onLoginMember,
  onLogout,
  onNotify,
}) => {
  // Login form state if not authenticated
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Tenta achar dados cadastrais do membro na base
  const memberData = members.find(
    (m) =>
      m.email.toLowerCase() === currentUser?.email.toLowerCase() ||
      m.name.toLowerCase() === currentUser?.name.toLowerCase()
  );

  const canAccessAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'pastor' ||
    currentUser?.role === 'lider' ||
    currentUser?.role === 'tesouraria';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Login mock / identificação
    const found = members.find((m) => m.email.toLowerCase() === email.toLowerCase());
    if (found) {
      const session: UserSession = {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.roleInChurch.toLowerCase().includes('pastor')
          ? 'pastor'
          : found.roleInChurch.toLowerCase().includes('líder')
          ? 'lider'
          : 'voluntario',
        roleTitle: found.roleInChurch,
        avatarUrl: found.photoUrl || '/images/logo.png',
      };
      onLoginMember(session);
      onNotify('success', `Bem-vindo de volta, ${found.name}!`);
    } else {
      // Cria sessão como membro autenticado
      const session: UserSession = {
        id: `m_${Date.now()}`,
        name: email.split('@')[0],
        email: email,
        role: 'voluntario',
        roleTitle: 'Membro em Comunhão',
        avatarUrl: '/images/logo.png',
      };
      onLoginMember(session);
      onNotify('success', 'Identificação confirmada!');
    }
  };

  const memberCode = memberData?.id || currentUser?.id || 'MACDP-2026-01';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `MEMBRO:${memberCode}|${currentUser?.name || ''}|IGREJA:${churchSettings?.shortName || 'MACDP'}`
  )}&bgcolor=ffffff&color=0b1120&margin=4`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3.5rem' }}>
      {currentUser ? (
        <>
          {/* CARTEIRINHA DIGITAL OFICIAL */}
          <div
            className="animate-page-enter"
            style={{
              position: 'relative',
              borderRadius: '24px',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #111827 0%, #1F2937 50%, #0F172A 100%)',
              border: '2px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.15)',
              overflow: 'hidden',
              color: '#FFFFFF',
            }}
          >
            {/* Holograma de fundo */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '180px',
                height: '180px',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Top Header da Carteirinha */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img
                  src={churchSettings?.logoUrl || '/images/logo.png'}
                  alt="Logo"
                  style={{ width: '38px', height: '38px', objectFit: 'contain' }}
                />
                <div>
                  <strong style={{ fontSize: '0.9rem', display: 'block', letterSpacing: '0.05em' }}>
                    {churchSettings?.shortName || 'MACDP Central'}
                  </strong>
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', textTransform: 'uppercase', fontWeight: 800 }}>
                    Credencial Eclesiástica Digital
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10B981',
                  color: '#10B981',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <CheckCircle2 size={11} />
                <span>ATIVO</span>
              </div>
            </div>

            {/* Foto e Nome do Membro */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '2px solid var(--accent-gold)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  background: 'var(--bg-tertiary)',
                  flexShrink: 0,
                }}
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <User size={32} />
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: '#FFFFFF' }}>
                  {currentUser.name}
                </h3>
                <span style={{ fontSize: '0.825rem', color: 'var(--accent-gold)', fontWeight: 700, display: 'block' }}>
                  {currentUser.roleTitle || memberData?.roleInChurch || 'Membro Ativo'}
                </span>
                <span style={{ fontSize: '0.725rem', color: '#94A3B8' }}>
                  ID: {memberCode.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Informações de Registro e QR Code */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '16px',
                padding: '0.85rem 1rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: '#94A3B8' }}>Congregação: </span>
                  <strong>{churchSettings?.address?.city || 'Manaus'} - Central</strong>
                </div>
                <div>
                  <span style={{ color: '#94A3B8' }}>Batismo nas Águas: </span>
                  <strong>{memberData?.baptismDate || 'Sim / Confirmado'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94A3B8' }}>Ministério: </span>
                  <strong>{memberData?.ministries?.[0] || 'Intercessão & Comunhão'}</strong>
                </div>
              </div>

              {/* QR Code de Check-in */}
              <div
                style={{
                  background: '#FFFFFF',
                  padding: '5px',
                  borderRadius: '10px',
                  flexShrink: 0,
                }}
              >
                <img
                  src={qrCodeUrl}
                  alt="QR Code de Membro"
                  style={{ width: '64px', height: '64px', display: 'block' }}
                />
              </div>
            </div>
          </div>

          {/* ACESSO AO PAINEL DE CONTROLE POR DENTRO DO APP */}
          {canAccessAdmin && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
                borderRadius: '20px',
                border: '1px solid var(--accent-gold)',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'var(--accent-gold)',
                    color: '#0B1120',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                  }}
                >
                  <Shield size={22} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block' }}>
                    Painel de Controle ERP
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Gestão de membros, finanças, eventos e culto ao vivo
                  </span>
                </div>
              </div>

              <button
                onClick={onOpenAdminPanel}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.4rem', whiteSpace: 'nowrap', padding: '0.55rem 1rem' }}
              >
                <span>Acessar Painel</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* Botão de Logout */}
          <button
            onClick={() => {
              onLogout();
              onNotify('info', 'Sessão do membro encerrada.');
            }}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center', gap: '0.4rem', padding: '0.65rem' }}
          >
            <LogOut size={16} />
            <span>Sair da Conta de Membro</span>
          </button>
        </>
      ) : (
        /* Tela de Identificação / Login de Membro */
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: '24px',
            border: '1px solid var(--border-subtle)',
            padding: '1.75rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <IdCard size={28} />
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
            Área do Membro
          </h2>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '340px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
            Identifique-se para acessar sua Carteirinha Digital de Membro, escalas de ministério e o Painel de Controle da liderança.
          </p>

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Seu E-mail Cadastrado
              </label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="exemplo@macdp.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Senha de Acesso
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem', padding: '0.75rem' }}
            >
              <Lock size={16} />
              <span>Acessar Carteirinha & Perfil</span>
            </button>
          </form>

          {/* Atalho Rápido de Demonstração / Teste */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.6rem' }}>
              Identificação Rápida de Teste:
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  const pastor = members[0];
                  if (pastor) {
                    onLoginMember({
                      id: pastor.id,
                      name: pastor.name,
                      email: pastor.email,
                      role: 'pastor',
                      roleTitle: pastor.roleInChurch,
                      avatarUrl: pastor.photoUrl,
                    });
                    onNotify('success', `Identificado como ${pastor.name}`);
                  }
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Pr. Oziel Gomes (Pastor Presidente)
              </button>

              <button
                type="button"
                onClick={() => {
                  onLoginMember({
                    id: 'm_demo',
                    name: 'Membro Ativo da MACDP',
                    email: 'membro@macdp.com.br',
                    role: 'voluntario',
                    roleTitle: 'Membro em Comunhão',
                    avatarUrl: '/images/logo.png',
                  });
                  onNotify('success', 'Identificado como Membro Ativo');
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Membro Geral
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
