import React, { useState } from 'react';
import { addPrayerRequest } from '../../services/db';
import { PrayerCategory } from '../../types';

interface PrayerFormProps {
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

const CATEGORIES: PrayerCategory[] = ['Saúde', 'Família', 'Finanças', 'Espiritual', 'Libertação', 'Gratidão', 'Outros'];
const WHATSAPP_URL = `https://wa.me/5592984509989?text=${encodeURIComponent('Olá! Gostaria de falar com a secretaria da MACDP.')}`;

export const PrayerForm: React.FC<PrayerFormProps> = ({ onNotify }) => {
  const [category, setCategory] = useState<PrayerCategory>('Saúde');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [requestContact, setRequestContact] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      onNotify('error', 'Escreva o seu pedido de oração.');
      return;
    }
    addPrayerRequest({
      requesterName: isAnonymous ? 'Anônimo' : name.trim() || 'Irmão(ã) em Cristo',
      isAnonymous,
      phone: isAnonymous ? undefined : phone.trim() || undefined,
      category,
      message: message.trim(),
      requestPastoralContact: isAnonymous ? false : requestContact,
    });
    setSubmitted(true);
    onNotify('success', 'Seu pedido de oração foi recebido pela equipe pastoral.');
  };

  const reset = () => {
    setSubmitted(false);
    setMessage('');
    setName('');
    setPhone('');
    setRequestContact(false);
    setIsAnonymous(false);
    setCategory('Saúde');
  };

  return (
    <section id="oracao" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="pr-head">
          <span className="pr-tag">Cuidado pastoral</span>
          <h2 className="pr-title">Pedido de oração</h2>
          <p className="pr-lead">Conte o que você está vivendo. Nossa equipe pastoral vai orar por você.</p>
        </div>

        {submitted ? (
          <div className="pr-done">
            <h3>Pedido recebido</h3>
            <p>
              Obrigado por confiar em nós. {requestContact && !isAnonymous ? 'Um pastor entrará em contato em breve.' : 'Estamos orando por você.'}
            </p>
            <button type="button" className="pr-link" onClick={reset}>
              Enviar outro pedido
            </button>
          </div>
        ) : (
          <form className="pr-form" onSubmit={handleSubmit}>
            <div className="pr-field">
              <span className="pr-label">Assunto</span>
              <div className="pr-chips">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`pr-chip${category === cat ? ' is-on' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="pr-field">
              <label className="pr-label" htmlFor="pr-message">
                Seu pedido
              </label>
              <textarea
                id="pr-message"
                className="pr-input pr-textarea"
                placeholder="Escreva aqui o seu pedido de oração"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <label className="pr-check">
              <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
              Enviar sem identificação
            </label>

            {!isAnonymous && (
              <>
                <div className="pr-row">
                  <div className="pr-field">
                    <label className="pr-label" htmlFor="pr-name">
                      Nome
                    </label>
                    <input id="pr-name" className="pr-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
                  </div>
                  <div className="pr-field">
                    <label className="pr-label" htmlFor="pr-phone">
                      WhatsApp
                    </label>
                    <input id="pr-phone" className="pr-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(92) 90000-0000" />
                  </div>
                </div>
                <label className="pr-check">
                  <input type="checkbox" checked={requestContact} onChange={(e) => setRequestContact(e.target.checked)} />
                  Quero que um pastor entre em contato
                </label>
              </>
            )}

            <button type="submit" className="pr-submit">
              Enviar pedido
            </button>
          </form>
        )}

        <p className="pr-secretary">
          Precisa falar com a secretaria?{' '}
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            WhatsApp (92) 98450-9989
          </a>
        </p>
      </div>

      <style>{`
        .pr-head { text-align: center; max-width: 36rem; margin: 0 auto 2.5rem; }
        .pr-tag { display: block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent-gold); margin-bottom: 0.9rem; }
        .pr-title { font-size: clamp(1.9rem, 4vw, 3rem); margin: 0 0 1rem; }
        .pr-lead { font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary); margin: 0; }
        .pr-form, .pr-done { max-width: 640px; margin: 0 auto; }
        .pr-field { margin-bottom: 1.75rem; }
        .pr-label { display: block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.75rem; }
        .pr-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .pr-chip { padding: 0.55rem 1rem; border: 1px solid var(--border-medium); border-radius: 4px; background: none; color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: border-color 150ms ease, color 150ms ease, background 150ms ease; }
        .pr-chip:hover { border-color: var(--text-primary); color: var(--text-primary); }
        .pr-chip.is-on { border-color: var(--accent-gold-light); background: var(--accent-gold-light); color: #0a0a0a; }
        .pr-input { width: 100%; padding: 0.8rem 0; background: none; border: 0; border-bottom: 1px solid var(--border-medium); border-radius: 0; color: var(--text-primary); font-size: 1rem; outline: 0; font-family: inherit; }
        .pr-input:focus { border-bottom-color: var(--accent-gold); }
        .pr-input::placeholder { color: var(--text-muted); }
        .pr-textarea { resize: vertical; min-height: 7rem; line-height: 1.6; }
        .pr-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .pr-check { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.5rem; font-size: 0.95rem; color: var(--text-secondary); cursor: pointer; }
        .pr-check input { width: 1.05rem; height: 1.05rem; accent-color: var(--accent-gold-light); }
        .pr-submit { width: 100%; padding: 1rem 1.5rem; border: 2px solid var(--accent-gold-light); border-radius: 4px; background: var(--accent-gold-light); color: #0a0a0a; font-family: var(--font-display); font-size: 0.8rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer; transition: background 150ms ease, border-color 150ms ease; }
        .pr-submit:hover { background: #fff; border-color: #fff; }
        .pr-done { text-align: center; padding: 1rem 0 0.5rem; }
        .pr-done h3 { font-size: 1.5rem; margin: 0 0 0.6rem; }
        .pr-done p { color: var(--text-secondary); line-height: 1.7; margin: 0 0 1rem; }
        .pr-link { background: none; border: 0; padding: 0; cursor: pointer; font-weight: 600; color: var(--text-primary); text-decoration: underline; text-underline-offset: 4px; text-decoration-color: var(--border-medium); }
        .pr-link:hover { text-decoration-color: var(--accent-gold); }
        .pr-secretary { text-align: center; margin: 2.5rem 0 0; font-size: 0.95rem; color: var(--text-secondary); }
        .pr-secretary a { color: var(--text-primary); font-weight: 600; text-decoration: underline; text-underline-offset: 4px; text-decoration-color: var(--border-medium); }
        .pr-secretary a:hover { text-decoration-color: var(--accent-gold); }
        @media (max-width: 560px) { .pr-row { grid-template-columns: 1fr; gap: 0; } }
      `}</style>
    </section>
  );
};
