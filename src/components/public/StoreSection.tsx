import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, MessageCircle } from 'lucide-react';
import { STORE_PRODUCTS, STORE_WHATSAPP_NUMBER, StoreFormat, StoreProduct } from '../../data/storeProducts';
import { generatePixCopiaECola } from '../../services/pixService';
import { addTransaction } from '../../services/db';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface StoreSectionProps {
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

type Delivery = 'retirada' | 'entrega';

interface Order {
  id: string;
  productTitle: string;
  formatLabel: string;
  kind: 'physical' | 'digital';
  qty: number;
  total: number;
  name: string;
  phone: string;
  email: string;
  delivery?: Delivery;
  notes?: string;
}

// Pix direto na chave da secretaria (telefone). Chaves de telefone levam o +55 no BR Code.
const PIX_KEY = '+5592984509989';
const PIX_NAME = 'Oziel Gomes Maduro';
const PIX_CITY = 'Manaus';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const waLink = (text: string) => `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

/** Código do pedido: LJP-XXXXXX (PDF) ou LJI-XXXXXX (impresso). */
const newOrderId = (kind: 'physical' | 'digital') => {
  let code = '';
  for (let i = 0; i < 6; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return `LJ${kind === 'digital' ? 'P' : 'I'}-${code}`;
};

const deliveryText = (o: Order) =>
  o.kind === 'digital'
    ? 'PDF enviado pela secretaria'
    : o.delivery === 'entrega'
      ? 'Entrega combinada em Manaus'
      : 'Retirada na igreja';

const orderSummary = (o: Order) => `${o.qty}x ${o.productTitle} (${o.formatLabel}) · ${formatCurrency(o.total)}`;

export const StoreSection: React.FC<StoreSectionProps> = ({ onNotify }) => {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [checkout, setCheckout] = useState<{ product: StoreProduct; format: StoreFormat; qty: number } | null>(null);

  const [step, setStep] = useState<'form' | 'pix'>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [delivery, setDelivery] = useState<Delivery>('retirada');
  const [notes, setNotes] = useState('');
  const [errorText, setErrorText] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [pixCode, setPixCode] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Área da secretaria (aparece só em macdp.com.br/#liberar)
  const [showRelease, setShowRelease] = useState(false);
  const [relOrder, setRelOrder] = useState('');
  const [relPin, setRelPin] = useState('');
  const [relBusy, setRelBusy] = useState(false);
  const [relLink, setRelLink] = useState('');
  const [relError, setRelError] = useState('');

  useEffect(() => {
    const check = () => setShowRelease(window.location.hash === '#liberar');
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, []);

  const getFormat = (p: StoreProduct) => p.formats.find((f) => f.id === selected[p.id]) || p.formats[0];
  const getQty = (p: StoreProduct, f: StoreFormat) => (f.kind === 'digital' ? 1 : qtyMap[p.id] || 1);

  const openCheckout = (product: StoreProduct, format: StoreFormat, qty: number) => {
    setCheckout({ product, format, qty });
    setStep('form');
    setErrorText('');
    setOrder(null);
    setPixCode('');
    setQrUrl('');
    setCopied(false);
  };
  const closeCheckout = () => setCheckout(null);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkout) return;
    const { product, format, qty } = checkout;

    if (name.trim().length < 3) return setErrorText('Informe seu nome completo.');
    if (phone.replace(/\D/g, '').length < 10) return setErrorText('Informe um WhatsApp com DDD.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErrorText('Informe um e-mail válido.');
    setErrorText('');

    const newOrder: Order = {
      id: newOrderId(format.kind),
      productTitle: product.title,
      formatLabel: format.label,
      kind: format.kind,
      qty,
      total: Number((format.price * qty).toFixed(2)),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      delivery: format.kind === 'physical' ? delivery : undefined,
      notes: notes.trim() || undefined,
    };

    const code = generatePixCopiaECola({
      key: PIX_KEY,
      name: PIX_NAME,
      city: PIX_CITY,
      amount: newOrder.total,
      description: '',
      txid: newOrder.id.replace('-', ''),
    });

    try {
      setQrUrl(
        await QRCode.toDataURL(code, { errorCorrectionLevel: 'M', margin: 1, width: 440, color: { dark: '#000000', light: '#FFFFFF' } })
      );
    } catch {
      setQrUrl('');
    }

    // Fica registrado como PENDENTE para a secretaria conferir o Pix no extrato
    addTransaction({
      type: 'entrada',
      category: 'Venda de Livros',
      description: `Loja (Pix direto) - Pedido ${newOrder.id}: ${orderSummary(newOrder)} | ${newOrder.name} | ${newOrder.phone} | ${newOrder.email} | ${deliveryText(newOrder)}${newOrder.notes ? ` | Obs: ${newOrder.notes}` : ''}`,
      amount: newOrder.total,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'pix',
      memberOrVendor: newOrder.name,
      status: 'pendente',
    });

    setOrder(newOrder);
    setPixCode(code);
    setStep('pix');
  };

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      onNotify('error', 'Não foi possível copiar. Selecione o código e copie manualmente.');
    }
  };

  const proofMessage = order
    ? `Olá! Fiz o Pix do pedido ${order.id}: ${orderSummary(order)}. Nome: ${order.name}. ${deliveryText(order)}. Segue o comprovante.`
    : '';

  const handleRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    setRelBusy(true);
    setRelError('');
    setRelLink('');
    try {
      const res = await fetch('/api/loja-liberar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedido: relOrder, senha: relPin }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) throw new Error(data?.error || 'Não foi possível gerar o link.');
      setRelLink(data.url);
    } catch (err) {
      setRelError(err instanceof Error ? err.message : 'Não foi possível gerar o link.');
    } finally {
      setRelBusy(false);
    }
  };

  return (
    <section id="loja" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="st-head">
          <span className="st-tag">Loja</span>
          <h2 className="st-title">Livros da Conferência</h2>
          <p className="st-lead">Leve a palavra da Conferência Profética para casa.</p>
        </div>

        <div className="st-list">
          {STORE_PRODUCTS.map((product) => {
            const format = getFormat(product);
            const qty = getQty(product, format);
            return (
              <article key={product.id} className="st-item">
                <div className="st-book">
                  <img src={product.cover} alt={`Capa do livro ${product.title}`} loading="lazy" />
                </div>

                <div className="st-info">
                  <span className="st-author">{product.author}</span>
                  <h3 className="st-name">{product.title}</h3>
                  {product.subtitle && <p className="st-sub">{product.subtitle}</p>}
                  <p className="st-desc">{product.description}</p>
                  {product.details && <p className="st-details">{product.details}</p>}

                  <div className="st-formats" role="radiogroup" aria-label="Formato">
                    {product.formats.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        role="radio"
                        aria-checked={format.id === f.id}
                        className={`st-format${format.id === f.id ? ' is-on' : ''}`}
                        onClick={() => setSelected((sel) => ({ ...sel, [product.id]: f.id }))}
                      >
                        <span>{f.label}</span>
                        <strong>{formatCurrency(f.price)}</strong>
                      </button>
                    ))}
                  </div>

                  <div className="st-buy">
                    {format.kind === 'physical' && (
                      <div className="st-qty" aria-label="Quantidade">
                        <button type="button" onClick={() => setQtyMap((m) => ({ ...m, [product.id]: Math.max(1, qty - 1) }))} aria-label="Diminuir">
                          −
                        </button>
                        <span>{qty}</span>
                        <button type="button" onClick={() => setQtyMap((m) => ({ ...m, [product.id]: Math.min(10, qty + 1) }))} aria-label="Aumentar">
                          +
                        </button>
                      </div>
                    )}
                    <button type="button" className="st-btn" onClick={() => openCheckout(product, format, qty)}>
                      Comprar · {formatCurrency(format.price * qty)}
                    </button>
                  </div>
                  <p className="st-note">
                    {format.kind === 'digital'
                      ? 'Pague por Pix e receba o link do PDF no WhatsApp assim que a secretaria confirmar.'
                      : 'Retirada na igreja ou entrega combinada em Manaus.'}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {showRelease && (
          <form className="st-release" onSubmit={handleRelease}>
            <h3>Área da secretaria · liberar PDF</h3>
            <p>Use somente depois de ver o Pix no extrato do banco.</p>
            <label className="st-label" htmlFor="rel-order">Código do pedido</label>
            <input id="rel-order" className="st-input" value={relOrder} onChange={(e) => setRelOrder(e.target.value)} placeholder="LJP-XXXXXX" autoCapitalize="characters" />
            <label className="st-label" htmlFor="rel-pin">Senha de liberação</label>
            <input id="rel-pin" className="st-input" type="password" value={relPin} onChange={(e) => setRelPin(e.target.value)} />
            {relError && <p className="st-error">{relError}</p>}
            <button type="submit" className="st-btn" disabled={relBusy}>
              {relBusy ? 'Gerando...' : 'Gerar link do PDF'}
            </button>
            {relLink && (
              <div className="st-release-out">
                <p className="st-wait">Envie este texto ao comprador:</p>
                <code className="st-code">{`Pagamento confirmado! Baixe o seu livro DOROT: ${relLink}`}</code>
                <button
                  type="button"
                  className="st-btn st-btn-line"
                  onClick={() => navigator.clipboard.writeText(`Pagamento confirmado! Baixe o seu livro DOROT: ${relLink}`).then(() => onNotify('success', 'Texto copiado.'))}
                >
                  <Copy size={16} /> Copiar texto
                </button>
              </div>
            )}
          </form>
        )}
      </div>

      <Modal isOpen={!!checkout} onClose={closeCheckout} title={step === 'pix' ? 'Pague com Pix' : 'Finalizar compra'} maxWidth="520px">
        {checkout && step === 'form' && (
          <form onSubmit={handleContinue} className="st-form">
            <p className="st-resume">
              {checkout.qty}x {checkout.product.title} ({checkout.format.label}) ·{' '}
              <strong>{formatCurrency(checkout.format.price * checkout.qty)}</strong>
            </p>

            <label className="st-label" htmlFor="st-name">Nome completo</label>
            <input id="st-name" className="st-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />

            <div className="st-two">
              <div>
                <label className="st-label" htmlFor="st-phone">WhatsApp</label>
                <input id="st-phone" className="st-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(92) 90000-0000" autoComplete="tel" />
              </div>
              <div>
                <label className="st-label" htmlFor="st-email">E-mail</label>
                <input id="st-email" className="st-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
            </div>

            {checkout.format.kind === 'physical' && (
              <>
                <span className="st-label">Recebimento</span>
                <div className="st-radios">
                  <label className={delivery === 'retirada' ? 'is-on' : ''}>
                    <input type="radio" name="delivery" checked={delivery === 'retirada'} onChange={() => setDelivery('retirada')} />
                    Retirada na igreja
                  </label>
                  <label className={delivery === 'entrega' ? 'is-on' : ''}>
                    <input type="radio" name="delivery" checked={delivery === 'entrega'} onChange={() => setDelivery('entrega')} />
                    Entrega em Manaus (combinada)
                  </label>
                </div>
                {delivery === 'entrega' && (
                  <>
                    <label className="st-label" htmlFor="st-notes">Endereço ou bairro</label>
                    <input id="st-notes" className="st-input" value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </>
                )}
              </>
            )}

            {errorText && <p className="st-error">{errorText}</p>}
            <button type="submit" className="st-btn st-btn-full">Gerar Pix</button>
          </form>
        )}

        {checkout && step === 'pix' && order && (
          <div className="st-pix">
            <p className="st-resume">{orderSummary(order)}</p>
            <p className="st-order">Pedido <strong>{order.id}</strong></p>
            {qrUrl && <img className="st-qr" src={qrUrl} alt="QR Code do Pix" width={220} height={220} />}
            <span className="st-payee">Recebedor: {PIX_NAME}</span>
            <code className="st-code">{pixCode}</code>
            <button type="button" className="st-btn st-btn-line st-btn-full" onClick={copyPix}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copiado' : 'Copiar código Pix'}
            </button>
            <a className="st-btn st-btn-full" href={waLink(proofMessage)} target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> Já paguei · enviar comprovante
            </a>
            <p className="st-wait">
              {order.kind === 'digital'
                ? 'Depois que a secretaria confirmar o Pix, você recebe o link do PDF no WhatsApp.'
                : `Depois que a secretaria confirmar o Pix, ela combina com você: ${deliveryText(order).toLowerCase()}.`}
            </p>
          </div>
        )}
      </Modal>

      <style>{`
        .st-head { text-align: center; max-width: 36rem; margin: 0 auto 3rem; }
        .st-tag { display: block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent-gold); margin-bottom: 0.9rem; }
        .st-title { font-size: clamp(1.9rem, 4vw, 3rem); margin: 0 0 1rem; }
        .st-lead { font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary); margin: 0; }
        .st-list { display: grid; gap: 4rem; max-width: 1000px; margin: 0 auto; }
        .st-item { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: clamp(2rem, 5vw, 4rem); align-items: center; }
        .st-book { display: flex; justify-content: center; perspective: 1200px; }
        .st-book img { width: min(100%, 320px); height: auto; display: block; border-radius: 3px 6px 6px 3px; box-shadow: -6px 10px 24px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.4), inset 8px 0 14px -8px rgba(0,0,0,0.6); transform: rotateY(-8deg); transition: transform 300ms ease, box-shadow 300ms ease; }
        .st-book:hover img { transform: rotateY(-2deg) translateY(-4px); box-shadow: -10px 16px 30px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4); }
        .st-author { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent-gold); }
        .st-name { font-size: clamp(1.8rem, 3.4vw, 2.6rem); margin: 0.4rem 0 0.35rem; }
        .st-sub { font-family: var(--font-display); font-weight: 600; font-size: 1rem; color: var(--text-primary); margin: 0 0 1rem; line-height: 1.4; }
        .st-desc { font-size: 1rem; line-height: 1.7; color: var(--text-secondary); margin: 0 0 0.6rem; }
        .st-details { font-size: 0.85rem; color: var(--text-muted); margin: 0 0 1.5rem; }
        .st-formats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem; }
        .st-format { display: flex; flex-direction: column; align-items: flex-start; gap: 0.15rem; padding: 0.85rem 1rem; border: 1px solid var(--border-medium); border-radius: 4px; background: none; color: var(--text-secondary); cursor: pointer; text-align: left; font-size: 0.9rem; transition: border-color 150ms ease; }
        .st-format strong { font-size: 1.15rem; color: var(--text-primary); }
        .st-format:hover { border-color: var(--text-primary); }
        .st-format.is-on { border-color: var(--accent-gold-light); box-shadow: inset 0 0 0 1px var(--accent-gold-light); }
        .st-buy { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .st-qty { display: inline-flex; align-items: center; border: 1px solid var(--border-medium); border-radius: 4px; }
        .st-qty button { width: 2.5rem; height: 2.9rem; background: none; border: 0; color: var(--text-primary); font-size: 1.2rem; cursor: pointer; }
        .st-qty span { min-width: 2rem; text-align: center; font-weight: 700; }
        .st-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.95rem 1.6rem; border: 2px solid var(--accent-gold-light); border-radius: 4px; background: var(--accent-gold-light); color: #0a0a0a; font-family: var(--font-display); font-size: 0.78rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; transition: background 150ms ease, border-color 150ms ease; text-decoration: none; }
        .st-btn:hover { background: #fff; border-color: #fff; }
        .st-btn:disabled { opacity: 0.6; cursor: wait; }
        .st-btn-line { background: none; color: var(--text-primary); border-color: var(--border-medium); }
        .st-btn-line:hover { background: none; border-color: var(--text-primary); }
        .st-btn-full { width: 100%; }
        .st-note { font-size: 0.85rem; color: var(--text-muted); margin: 0.9rem 0 0; }

        .st-form, .st-pix { display: flex; flex-direction: column; gap: 0.4rem; }
        .st-pix { align-items: center; text-align: center; gap: 1rem; }
        .st-resume { font-size: 0.95rem; color: var(--text-secondary); margin: 0 0 0.75rem; }
        .st-resume strong { color: var(--accent-gold); }
        .st-label { display: block; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted); margin: 0.9rem 0 0.2rem; }
        .st-input { width: 100%; padding: 0.7rem 0; background: none; border: 0; border-bottom: 1px solid var(--border-medium); border-radius: 0; color: var(--text-primary); font-size: 1rem; outline: 0; }
        .st-input:focus { border-bottom-color: var(--accent-gold); }
        .st-two { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .st-radios { display: grid; gap: 0.5rem; margin-top: 0.4rem; }
        .st-radios label { display: flex; align-items: center; gap: 0.6rem; padding: 0.7rem 0.9rem; border: 1px solid var(--border-medium); border-radius: 4px; cursor: pointer; font-size: 0.95rem; color: var(--text-secondary); }
        .st-radios label.is-on { border-color: var(--accent-gold-light); color: var(--text-primary); }
        .st-radios input { accent-color: var(--accent-gold-light); }
        .st-error { color: #f87171; font-size: 0.9rem; margin: 0.6rem 0 0; }
        .st-form .st-btn { margin-top: 1.25rem; }
        .st-qr { background: #fff; padding: 0.6rem; border-radius: 8px; }
        .st-code { display: block; width: 100%; max-height: 4.5rem; overflow-y: auto; padding: 0.7rem; border: 1px solid var(--border-medium); border-radius: 4px; font-size: 0.72rem; word-break: break-all; color: var(--text-secondary); text-align: left; }
        .st-wait { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin: 0; }
        .st-link { background: none; border: 0; padding: 0; cursor: pointer; font-weight: 600; color: var(--text-primary); text-decoration: underline; text-underline-offset: 4px; }

        .st-order { margin: 0; font-size: 0.95rem; color: var(--text-secondary); }
        .st-order strong { color: var(--text-primary); letter-spacing: 0.08em; }
        .st-payee { font-size: 0.85rem; color: var(--text-secondary); }
        .st-release { max-width: 520px; margin: 4rem auto 0; padding: 1.5rem; border: 1px dashed var(--border-medium); border-radius: 8px; display: flex; flex-direction: column; gap: 0.4rem; }
        .st-release h3 { font-size: 1.1rem; margin: 0; }
        .st-release p { font-size: 0.9rem; color: var(--text-secondary); margin: 0 0 0.5rem; }
        .st-release .st-btn { margin-top: 1rem; }
        .st-release-out { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
        @media (max-width: 760px) {
          .st-item { grid-template-columns: 1fr; }
          .st-two { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
};
