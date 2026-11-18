import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { generatePixCopiaECola } from '../../services/pixService';
import { addTransaction } from '../../services/db';
import { formatCurrency } from '../../utils/formatters';
import { Copy, Check } from 'lucide-react';

interface GivingSectionProps {
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

// Chave Pix (telefone). No BR Code, chaves de telefone levam o código do país (+55).
const PIX_KEY = '+5592991279663';
const PIX_KEY_DISPLAY = '(92) 99127-9663';
const CATEGORIES = ['Dízimo', 'Oferta Alçada', 'Missões Mundiais', 'Ação Social', 'Construção & Reforma'] as const;
const PRESETS = [30, 50, 100, 200, 500];

export const GivingSection: React.FC<GivingSectionProps> = ({ onNotify }) => {
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  const [txid] = useState(() => 'MACDP' + Math.floor(Math.random() * 100000));
  const currentAmount = customAmount ? parseFloat(customAmount.replace(',', '.')) || 0 : amount;

  const pixCode = generatePixCopiaECola({
    key: PIX_KEY,
    name: 'MACDP Manaus',
    city: 'Manaus',
    amount: currentAmount,
    description: category,
    txid,
  });

  // QR Code real, gerado a partir do código Pix (o mesmo que vai no Copia e Cola)
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(pixCode, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 360,
      color: { dark: '#0B1120', light: '#FFFFFF' },
    })
      .then((url) => {
        if (!cancelled) setQrUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [pixCode]);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      onNotify('success', 'Código Pix copiado!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      onNotify('error', 'Não foi possível copiar. Selecione o código e copie manualmente.');
    }
  };

  // O aviso do visitante NÃO confirma dinheiro: entra como pendente para a tesouraria conferir no extrato.
  const handleNotifyPayment = () => {
    if (currentAmount <= 0) {
      onNotify('error', 'Selecione ou digite um valor válido.');
      return;
    }
    addTransaction({
      type: 'entrada',
      category,
      description: `${category} via Pix (aviso do site)${donorName ? ` - ${donorName}` : ''}`,
      amount: currentAmount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'pix',
      memberOrVendor: donorName || 'Contribuinte online',
      status: 'pendente',
    });
    onNotify('success', `Deus abençoe sua generosidade! Aviso de ${formatCurrency(currentAmount)} enviado; a tesouraria confirma o recebimento.`);
  };

  return (
    <section id="dizimos" className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="giv-head">
          <span className="giv-tag">Generosidade</span>
          <h2 className="giv-title">Dízimos e ofertas</h2>
          <p className="giv-verse">
            “Cada um dê conforme determinou em seu coração, não com pesar ou por obrigação, pois Deus ama quem dá com alegria.” 2 Coríntios 9:7
          </p>
        </div>

        <div className="giv-grid">
          <div className="giv-form">
            <div className="giv-field">
              <span className="giv-label">Finalidade</span>
              <div className="giv-chips">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`giv-chip${category === cat ? ' is-on' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="giv-field">
              <span className="giv-label">Valor</span>
              <div className="giv-chips">
                {PRESETS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`giv-chip${!customAmount && amount === val ? ' is-on' : ''}`}
                    onClick={() => {
                      setAmount(val);
                      setCustomAmount('');
                    }}
                  >
                    R$ {val}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                className="giv-input"
                placeholder="Outro valor (ex.: 350,00)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>

            <div className="giv-field">
              <span className="giv-label">Seu nome (opcional)</span>
              <input
                type="text"
                className="giv-input"
                placeholder="Para o recibo"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
              />
            </div>
          </div>

          <div className="giv-pix">
            <div className="giv-qr">
              {qrUrl ? (
                <div className="giv-qr-wrap">
                  <img src={qrUrl} alt="QR Code do Pix da MACDP" width={200} height={200} />
                  {/* Cruz dourada no centro, como no desenho original */}
                  <svg className="giv-qr-cross" viewBox="0 0 40 40" aria-hidden="true">
                    <circle cx="20" cy="20" r="18" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="3" />
                    <rect x="17" y="9" width="6" height="22" fill="#0B1120" />
                    <rect x="10" y="15" width="20" height="6" fill="#0B1120" />
                  </svg>
                </div>
              ) : (
                <div className="giv-qr-wrap giv-qr-loading" />
              )}
              <span className="giv-key">Chave Pix: {PIX_KEY_DISPLAY}</span>
              <span className="giv-owner">Ministério Apostólico Caçadores da Presença (MACDP)</span>
            </div>

            <div className="giv-code">
              <div className="giv-code-head">
                <span>Pix Copia e Cola</span>
                <strong>{formatCurrency(currentAmount)}</strong>
              </div>
              <code>{pixCode}</code>
              <button type="button" className="giv-btn giv-btn-line" onClick={handleCopyPix}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado' : 'Copiar código'}
              </button>
              <button type="button" className="giv-btn giv-btn-solid" onClick={handleNotifyPayment}>
                Já fiz o Pix
              </button>
              <p className="giv-hint">Depois de pagar no app do seu banco, toque em “Já fiz o Pix” para avisar a tesouraria.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .giv-head { text-align: center; max-width: 42rem; margin: 0 auto 3rem; }
        .giv-tag { display: block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent-gold); margin-bottom: 0.9rem; }
        .giv-title { font-size: clamp(1.9rem, 4vw, 3rem); margin: 0 0 1rem; }
        .giv-verse { font-size: 1rem; line-height: 1.7; color: var(--text-secondary); margin: 0; }
        .giv-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: clamp(2rem, 5vw, 4rem); max-width: 1000px; margin: 0 auto; align-items: start; }
        .giv-field { margin-bottom: 2rem; }
        .giv-label { display: block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.8rem; }
        .giv-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
        .giv-chip { padding: 0.6rem 1rem; border: 1px solid var(--border-medium); border-radius: 4px; background: none; color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: border-color 150ms ease, color 150ms ease, background 150ms ease; }
        .giv-chip:hover { border-color: var(--text-primary); color: var(--text-primary); }
        .giv-chip.is-on { border-color: var(--accent-gold-light); background: var(--accent-gold-light); color: #0a0a0a; }
        .giv-input { width: 100%; padding: 0.8rem 0; background: none; border: 0; border-bottom: 1px solid var(--border-medium); color: var(--text-primary); font-size: 1rem; outline: 0; border-radius: 0; }
        .giv-input:focus { border-bottom-color: var(--accent-gold); }
        .giv-input::placeholder { color: var(--text-muted); }

        .giv-pix { display: grid; gap: 1.75rem; }
        .giv-qr { display: flex; flex-direction: column; align-items: center; background: #ffffff; border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-md); }
        .giv-qr-wrap { position: relative; width: 200px; height: 200px; }
        .giv-qr-wrap img { display: block; width: 100%; height: 100%; }
        .giv-qr-cross { position: absolute; left: 50%; top: 50%; width: 42px; height: 42px; transform: translate(-50%, -50%); }
        .giv-qr-loading { background: #f1f5f9; border-radius: 8px; }
        .giv-key { margin-top: 0.9rem; font-size: 0.85rem; font-weight: 800; color: #0F172A; }
        .giv-owner { font-size: 0.72rem; color: #64748B; font-weight: 600; text-align: center; margin-top: 0.15rem; }
        .giv-code { display: flex; flex-direction: column; gap: 0.75rem; }
        .giv-code-head { display: flex; align-items: baseline; justify-content: space-between; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-muted); }
        .giv-code-head strong { font-size: 1rem; letter-spacing: 0; color: var(--accent-gold); }
        .giv-code code { display: block; max-height: 4.5rem; overflow-y: auto; padding: 0.75rem; border: 1px solid var(--border-medium); border-radius: 4px; font-size: 0.75rem; word-break: break-all; color: var(--text-secondary); }
        .giv-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.95rem 1.25rem; border-radius: 4px; font-family: var(--font-display); font-size: 0.78rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; transition: background 150ms ease, color 150ms ease, border-color 150ms ease; }
        .giv-btn-line { background: none; color: var(--text-primary); border: 2px solid var(--border-medium); }
        .giv-btn-line:hover { border-color: var(--text-primary); }
        .giv-btn-solid { background: var(--accent-gold-light); color: #0a0a0a; border: 2px solid var(--accent-gold-light); }
        .giv-btn-solid:hover { background: #fff; border-color: #fff; }
        .giv-hint { font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; margin: 0; }
        @media (max-width: 820px) { .giv-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
};
