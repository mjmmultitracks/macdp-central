import React, { useState } from 'react';
import { ChurchSettings } from '../../types';
import {
  DollarSign,
  Copy,
  Check,
  QrCode,
  Heart,
  MessageCircle,
  Building,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface AppGivingViewProps {
  churchSettings?: ChurchSettings;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AppGivingView: React.FC<AppGivingViewProps> = ({ churchSettings, onNotify }) => {
  const [copied, setCopied] = useState(false);

  const pixKey = churchSettings?.pix?.key || '92991279663';
  const receiver = churchSettings?.pix?.receiver || 'Ministério Apostólico Caçadores da Presença';
  const bank = churchSettings?.pix?.bank || 'Bradesco / NuBank';
  const secretaryPhone = churchSettings?.whatsapp || '92991279663';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    onNotify('success', 'Chave PIX copiada para a área de transferência!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendReceipt = () => {
    const msg = encodeURIComponent(
      `Olá Secretaria! Estou enviando o comprovante da minha contribuição (dízimo/oferta) realizada pelo aplicativo da igreja.`
    );
    window.open(`https://wa.me/55${secretaryPhone}?text=${msg}`, '_blank');
  };

  // QR Code da Chave PIX
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    pixKey
  )}&bgcolor=ffffff&color=0b1120&margin=8`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      {/* Banner Principal */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, var(--bg-secondary) 100%)',
          borderRadius: '24px',
          border: '1px solid var(--accent-gold-glow)',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--accent-gold)',
            color: '#0B1120',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
          }}
        >
          <DollarSign size={28} />
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
          Dízimos, Ofertas & Missões
        </h2>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto', lineHeight: 1.5 }}>
          "Cada um dê conforme determinou em seu coração, não com pesar ou por obrigação, pois Deus ama a quem dá com alegria." — 2 Co 9:7
        </p>
      </div>

      {/* Caixa PIX Oficial */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <span className="badge badge-gold" style={{ marginBottom: '1rem' }}>
          Chave PIX Oficial da Igreja
        </span>

        {/* QR Code Container */}
        <div
          style={{
            background: '#FFFFFF',
            padding: '12px',
            borderRadius: '16px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
            marginBottom: '1.25rem',
          }}
        >
          <img
            src={qrCodeUrl}
            alt="QR Code PIX"
            style={{ width: '180px', height: '180px', display: 'block', borderRadius: '8px' }}
          />
        </div>

        {/* Chave PIX com botão de copiar */}
        <div
          style={{
            width: '100%',
            background: 'var(--bg-tertiary)',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ textAlign: 'left', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Chave PIX:</span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--accent-gold)', wordBreak: 'break-all' }}>
              {pixKey}
            </strong>
          </div>

          <button
            onClick={handleCopyPix}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.35rem', flexShrink: 0 }}
          >
            {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        {/* Dados da Instituição */}
        <div
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            background: 'rgba(245, 158, 11, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.15)',
            textAlign: 'left',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
            <Building size={12} />
            <span>Favorecido Oficial:</span>
          </div>
          <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>
            {receiver}
          </strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Instituição / Banco: {bank}
          </span>
        </div>

        {/* Botão Enviar Comprovante */}
        <button
          onClick={handleSendReceipt}
          className="btn btn-secondary"
          style={{
            width: '100%',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            borderRadius: '14px',
          }}
        >
          <MessageCircle size={16} color="#10B981" />
          <span>Enviar Comprovante pelo WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
