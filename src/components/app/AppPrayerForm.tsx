import React, { useState } from 'react';
import { PrayerCategory, PrayerRequest, UserSession } from '../../types';
import { addPrayerRequest, getDatabase } from '../../services/db';
import {
  Heart,
  Send,
  Shield,
  Phone,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Users,
} from 'lucide-react';

interface AppPrayerFormProps {
  currentUser?: UserSession;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
  onSuccess?: () => void;
}

export const AppPrayerForm: React.FC<AppPrayerFormProps> = ({
  currentUser,
  onNotify,
  onSuccess,
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('Espiritual');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [requestContact, setRequestContact] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories: PrayerCategory[] = [
    'Saúde',
    'Família',
    'Finanças',
    'Espiritual',
    'Libertação',
    'Gratidão',
    'Outros',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      onNotify('error', 'Descreva o seu pedido de oração.');
      return;
    }

    try {
      addPrayerRequest({
        requesterName: isAnonymous ? 'Anônimo' : name || 'Membro da Igreja',
        isAnonymous,
        isPrivate,
        phone,
        category,
        message,
        requestPastoralContact: requestContact,
      });

      setIsSubmitted(true);
      onNotify('success', 'Seu pedido foi enviado com sucesso à nossa equipe de intercessão e pastores!');
      if (onSuccess) onSuccess();
    } catch (err) {
      onNotify('error', 'Erro ao enviar pedido de oração.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, var(--bg-secondary) 100%)',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Heart size={20} color="var(--accent-gold)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Central de Oração & Intercessão
          </h2>
        </div>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          Nossos pastores e a equipe de intercessores oram diariamente pelas causas apresentadas pela igreja.
        </p>
      </div>

      {isSubmitted ? (
        <div
          className="animate-page-enter"
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: '20px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
            Pedido de Oração Recebido!
          </h3>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '340px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
            "A oração de um justo é poderosa e eficaz." (Tiago 5:16). Sua causa já foi colocada diante do altar do Senhor.
          </p>

          <button
            onClick={() => {
              setMessage('');
              setIsSubmitted(false);
            }}
            className="btn btn-primary btn-sm"
          >
            Enviar Outro Pedido
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: '20px',
            border: '1px solid var(--border-subtle)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Categoria */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Área do Pedido
            </label>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '0.35rem 0.7rem',
                    borderRadius: '999px',
                    border: 'none',
                    background: category === cat ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
                    color: category === cat ? '#0B1120' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Nome e Telefone */}
          {!isAnonymous && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Seu Nome
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Seu WhatsApp
                </label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(92) 99999-9999"
                />
              </div>
            </div>
          )}

          {/* Mensagem do Pedido */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              Descreva o seu Motivo de Oração *
            </label>
            <textarea
              rows={4}
              required
              className="form-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escreva aqui como podemos orar por você ou por sua família..."
            />
          </div>

          {/* Checkboxes de Privacidade */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <span>Manter meu nome em anônimo</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <span>Sigilo Pastoral (visível apenas para os Pastores Presidentes)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={requestContact}
                onChange={(e) => setRequestContact(e.target.checked)}
              />
              <span>Gostaria de receber uma mensagem de apoio ou aconselhamento pastoral</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
          >
            <Send size={16} />
            <span>Enviar Pedido de Oração</span>
          </button>
        </form>
      )}
    </div>
  );
};
