import React, { useState } from 'react';
import { addPrayerRequest } from '../../services/db';
import { PrayerCategory } from '../../types';
import {
  Heart,
  Mail,
  Phone,
  Clock,
  Send,
  Shield,
  CheckCircle2,
  Lock,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface PrayerFormProps {
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const PrayerForm: React.FC<PrayerFormProps> = ({ onNotify }) => {
  const [activeTab, setActiveTab] = useState<'oracao' | 'contato'>('oracao');

  // Prayer state
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('Saúde');
  const [message, setMessage] = useState('');
  const [requestContact, setRequestContact] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // General contact state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleSubmitPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      onNotify('error', 'Por favor, escreva o seu pedido de oração.');
      return;
    }

    addPrayerRequest({
      requesterName: isAnonymous ? 'Anônimo' : name || 'Irmão(ã) em Cristo',
      isAnonymous,
      phone: isAnonymous ? undefined : phone,
      email: isAnonymous ? undefined : email,
      category,
      message,
      requestPastoralContact: isAnonymous ? false : requestContact,
    });

    setSubmitted(true);
    onNotify(
      'success',
      'Seu pedido de oração foi recebido e já está sob os cuidados da equipe pastoral!'
    );
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    onNotify('success', 'Mensagem enviada com sucesso para a secretaria pastoral!');
  };

  return (
    <section id="oracao" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">
            <Heart size={14} /> Cuidado Pastoral
          </span>
          <h2 className="section-title">Pedidos de Oração & Contato</h2>
          <p className="section-subtitle">
            Nossa equipe de intercessão e o corpo pastoral oram diariamente por cada motivo apresentado. Você não precisa carregar seus fardos sozinho.
          </p>
        </div>

        <div
          style={{
            maxWidth: '840px',
            margin: '0 auto',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setActiveTab('oracao')}
              style={{
                flex: 1,
                padding: '1.25rem 1rem',
                border: 'none',
                background: activeTab === 'oracao' ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
                color: activeTab === 'oracao' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'oracao' ? 700 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderTop: activeTab === 'oracao' ? '3px solid var(--accent-gold)' : '3px solid transparent',
              }}
            >
              <Heart size={18} />
              <span>Enviar Pedido de Oração</span>
            </button>

            <button
              onClick={() => setActiveTab('contato')}
              style={{
                flex: 1,
                padding: '1.25rem 1rem',
                border: 'none',
                background: activeTab === 'contato' ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
                color: activeTab === 'contato' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'contato' ? 700 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderTop: activeTab === 'contato' ? '3px solid var(--accent-gold)' : '3px solid transparent',
              }}
            >
              <MessageSquare size={18} />
              <span>Fale com a Secretaria Pastoral</span>
            </button>
          </div>

          <div style={{ padding: '2.5rem' }}>
            {activeTab === 'oracao' ? (
              submitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'var(--success-soft)',
                      color: 'var(--success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem auto',
                    }}
                  >
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Seu Pedido Chegou ao Nosso Altar!
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
                    A equipe de intercessores já está orando pela sua causa. Cremos que o Senhor ouve e responde ao clamor do Seu povo.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                    className="btn btn-secondary"
                  >
                    Enviar Outro Pedido
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitPrayer}>
                  {/* Confidentiality banner */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.85rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-gold-soft)',
                      color: 'var(--accent-gold)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '1.75rem',
                    }}
                  >
                    <Lock size={16} />
                    <span>Seus dados e relatos são tratados com absoluto sigilo pastoral e respeito.</span>
                  </div>

                  {/* Anonymous Toggle */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.925rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-gold)' }}
                      />
                      <span>Desejo fazer este pedido de forma totalmente anônima</span>
                    </label>
                  </div>

                  {/* Category Selector */}
                  <div className="form-group">
                    <label className="form-label">Qual a área da sua necessidade?</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(['Saúde', 'Família', 'Finanças', 'Espiritual', 'Gratidão', 'Outros'] as PrayerCategory[]).map(
                        (cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: 'var(--radius-full)',
                              border: category === cat ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                              background: category === cat ? 'var(--accent-gold-soft)' : 'var(--bg-tertiary)',
                              color: category === cat ? 'var(--accent-gold)' : 'var(--text-secondary)',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {cat}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Personal details (if not anonymous) */}
                  {!isAnonymous && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Seu Nome:</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Ex: Maria dos Santos"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">WhatsApp (para contato):</label>
                        <input
                          type="tel"
                          className="form-input"
                          placeholder="(11) 98765-4321"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div className="form-group">
                    <label className="form-label">Escreva seu pedido de oração:</label>
                    <textarea
                      required
                      className="form-textarea"
                      placeholder="Conte-nos o que você tem enfrentado para que possamos interceder por você..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Pastoral contact request */}
                  {!isAnonymous && (
                    <div style={{ marginBottom: '1.75rem' }}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={requestContact}
                          onChange={(e) => setRequestContact(e.target.checked)}
                          style={{ width: '16px', height: '16px', accentColor: 'var(--accent-gold)' }}
                        />
                        <span>Gostaria de receber uma ligação ou mensagem pastoral de acolhimento</span>
                      </label>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', gap: '0.5rem' }}>
                    <Send size={18} />
                    <span>Enviar Pedido à Central de Oração</span>
                  </button>
                </form>
              )
            ) : contactSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={40} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Mensagem Recebida!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Nossa secretaria retornará seu contato em até 24 horas úteis.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitContact}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nome Completo:</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Seu nome"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">E-mail de Contato:</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      placeholder="seu@email.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assunto:</label>
                  <select
                    className="form-select"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                  >
                    <option value="duvidas">Dúvidas Gerais sobre a Igreja</option>
                    <option value="batismo">Informações sobre Batismo e Membresia</option>
                    <option value="gabinete">Agendamento de Gabinete Pastoral</option>
                    <option value="casamento">Agendamento de Casamento</option>
                    <option value="social">Doações e Parcerias Sociais</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Sua Mensagem:</label>
                  <textarea
                    required
                    className="form-textarea"
                    placeholder="Como podemos lhe ajudar?"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', gap: '0.5rem' }}>
                  <Send size={18} />
                  <span>Enviar Mensagem</span>
                </button>

                <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Atendimento direto pelo WhatsApp: <strong>(92) 98450-9989</strong> | Templo: Rua Lagoa Grande, 382 - Canaranas - Manaus/AM
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
