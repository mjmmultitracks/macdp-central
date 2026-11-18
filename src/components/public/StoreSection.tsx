import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Copy, Check, MessageCircle } from 'lucide-react';
import { STORE_PRODUCTS, STORE_WHATSAPP_NUMBER, StoreFormat, StoreProduct } from '../../data/storeProducts';
import { addTransaction } from '../../services/db';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface StoreSectionProps {
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

type Step = 'form' | 'pix' | 'redirect' | 'done' | 'error';
type Delivery = 'retirada' | 'entrega';

interface Order {
  id: string;
  productTitle: string;
  formatLabel: string;
  kind: 'physical' | 'digital';
  qty: number;
  unit: number;
  total: number;
  name: string;
  phone: string;
  email: string;
  delivery?: Delivery;
  notes?: string;
  payment: 'pix' | 'cartao';
}

const PENDING_KEY = 'macdp_store_pending';
const DONE_KEY = 'macdp_store_done';

const waLink = (text: string) => `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sem armazenamento: o fluxo segue sem guardar */
  }
};

const deliveryText = (o: Order) =>
  o.kind === 'digital'
    ? 'PDF por e-mail e WhatsApp'
    : o.delivery === 'entrega'
      ? 'Entrega combinada em Manaus'
      : 'Retirada na igreja';

const orderSummary = (o: Order) =>
  `${o.qty}x ${o.productTitle} (${o.formatLabel}) · ${formatCurrency(o.total)}`;

export const StoreSection: React.FC<StoreSectionProps> = ({ onNotify }) => {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [checkout, setCheckout] = useState<{ product: StoreProduct; format: StoreFormat; qty: number } | null>(null);

  // Estado do checkout
  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [delivery, setDelivery] = useState<Delivery>('retirada');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState<'pix' | 'cartao'>('pix');
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [pix, setPix] = useState<{ paymentId: string; code: string; qr: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [doneOrder, setDoneOrder] = useState<Order | null>(null);
  const orderRef = useRef<Order | null>(null);

  const getFormat = (p: StoreProduct) => p.formats.find((f) => f.id === selected[p.id]) || p.formats[0];
  const getQty = (p: StoreProduct, f: StoreFormat) => (f.kind === 'digital' ? 1 : qtyMap[p.id] || 1);

  /** Registra a venda no financeiro (uma única vez por pedido). */
  const finalizeOrder = useCallback(
    (order: Order, paymentId: string) => {
      const done = readJson<string[]>(DONE_KEY, []);
      if (done.includes(order.id)) {
        setDoneOrder(order);
        setStep('done');
        return;
      }
      addTransaction({
        type: 'entrada',
        category: 'Venda de Livros',
        description: `Loja: ${orderSummary(order)} | ${order.name} | ${order.phone} | ${order.email} | ${deliveryText(order)}${order.notes ? ` | Obs: ${order.notes}` : ''} | Mercado Pago ${paymentId}`,
        amount: order.total,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: order.payment === 'pix' ? 'pix' : 'cartao',
        memberOrVendor: order.name,
        status: 'confirmado',
      });
      writeJson(DONE_KEY, [...done, order.id]);
      localStorage.removeItem(PENDING_KEY);
      setDoneOrder(order);
      setStep('done');
      onNotify('success', 'Pagamento confirmado! Obrigado pela compra.');
    },
    [onNotify]
  );

  const openCheckout = (product: StoreProduct, format: StoreFormat, qty: number) => {
    setCheckout({ product, format, qty });
    setStep('form');
    setErrorText('');
    setPix(null);
    setCopied(false);
    setDoneOrder(null);
  };

  const closeCheckout = () => {
    setCheckout(null);
    setPix(null);
    setBusy(false);
  };

  // Retorno do pagamento por cartão (Mercado Pago volta para o site com os dados na URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || '';
    const paymentId = params.get('payment_id') || params.get('collection_id') || '';
    if (!ref.startsWith('loja_') || !paymentId) return;

    const pending = readJson<Order | null>(PENDING_KEY, null);
    const clean = () => window.history.replaceState(null, '', window.location.pathname + '#loja');
    if (!pending || pending.id !== ref) {
      clean();
      return;
    }
    fetch(`/api/mercadopago-check-status?paymentId=${encodeURIComponent(paymentId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.isApproved) {
          setCheckout({
            product: STORE_PRODUCTS[0],
            format: STORE_PRODUCTS[0].formats[0],
            qty: pending.qty,
          });
          finalizeOrder(pending, paymentId);
        } else {
          onNotify('info', 'Seu pagamento ainda não foi confirmado. Se você pagou, fale com a secretaria.');
        }
      })
      .catch(() => onNotify('error', 'Não foi possível confirmar o pagamento agora. Fale com a secretaria.'))
      .finally(clean);
    // roda uma vez ao abrir o site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Acompanha o Pix até ser aprovado
  useEffect(() => {
    if (step !== 'pix' || !pix || !orderRef.current) return;
    const order = orderRef.current;
    let stopped = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/mercadopago-check-status?paymentId=${encodeURIComponent(pix.paymentId)}`);
        const data = await res.json();
        if (!stopped && data?.isApproved) {
          stopped = true;
          finalizeOrder(order, pix.paymentId);
        }
      } catch {
        /* tenta de novo no próximo ciclo */
      }
    };
    const timer = setInterval(tick, 4000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [step, pix, finalizeOrder]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkout) return;
    const { product, format, qty } = checkout;

    if (name.trim().length < 3) return setErrorText('Informe seu nome completo.');
    if (phone.replace(/\D/g, '').length < 10) return setErrorText('Informe um WhatsApp com DDD.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErrorText('Informe um e-mail válido.');
    setErrorText('');

    const order: Order = {
      id: `loja_${Date.now()}`,
      productTitle: product.title,
      formatLabel: format.label,
      kind: format.kind,
      qty,
      unit: format.price,
      total: Number((format.price * qty).toFixed(2)),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      delivery: format.kind === 'physical' ? delivery : undefined,
      notes: notes.trim() || undefined,
      payment,
    };
    orderRef.current = order;

    setBusy(true);
    try {
      const res = await fetch('/api/mercadopago-create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: order.total,
          title: `${product.title} (${format.label})`,
          itemTitle: `${product.title} - ${format.label}`,
          description: `Loja MACDP: ${order.qty}x ${product.title} (${format.label})`,
          name: order.name,
          email: order.email,
          phone: order.phone,
          eventId: 'loja',
          registrationId: order.id,
          paymentMethod: payment === 'pix' ? 'pix' : 'preference',
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Pagamento online indisponível no momento.');
      }

      if (payment === 'pix') {
        setPix({
          paymentId: String(data.paymentId),
          code: data.qrCode || '',
          qr: data.qrCodeBase64 ? `data:image/png;base64,${data.qrCodeBase64}` : '',
        });
        setStep('pix');
      } else {
        writeJson(PENDING_KEY, order);
        setStep('redirect');
        window.location.href = data.initPoint;
      }
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Não foi possível iniciar o pagamento.');
      setStep('error');
    } finally {
      setBusy(false);
    }
  };

  const copyPix = async () => {
    if (!pix?.code) return;
    try {
      await navigator.clipboard.writeText(pix.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      onNotify('error', 'Não foi possível copiar. Selecione o código e copie manualmente.');
    }
  };

  const fallbackMessage = checkout
    ? `Olá! Quero comprar: ${checkout.qty}x ${checkout.product.title} (${checkout.format.label}) · ${formatCurrency(checkout.format.price * checkout.qty)}.`
    : 'Olá! Quero comprar um livro da loja da MACDP.';

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
                        onClick={() => setSelected((s) => ({ ...s, [product.id]: f.id }))}
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
                      ? 'O PDF é enviado por e-mail e WhatsApp após a confirmação do pagamento.'
                      : 'Retirada na igreja ou entrega combinada em Manaus.'}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={!!checkout}
        onClose={closeCheckout}
        title={step === 'done' ? 'Compra confirmada' : step === 'pix' ? 'Pague com Pix' : 'Finalizar compra'}
        maxWidth="520px"
      >
        {checkout && step === 'form' && (
          <form onSubmit={handlePay} className="st-form">
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

            <span className="st-label">Pagamento</span>
            <div className="st-radios">
              <label className={payment === 'pix' ? 'is-on' : ''}>
                <input type="radio" name="payment" checked={payment === 'pix'} onChange={() => setPayment('pix')} />
                Pix
              </label>
              <label className={payment === 'cartao' ? 'is-on' : ''}>
                <input type="radio" name="payment" checked={payment === 'cartao'} onChange={() => setPayment('cartao')} />
                Cartão (crédito ou débito)
              </label>
            </div>

            {errorText && <p className="st-error">{errorText}</p>}
            <button type="submit" className="st-btn st-btn-full" disabled={busy}>
              {busy ? 'Aguarde...' : payment === 'pix' ? 'Gerar Pix' : 'Ir para o pagamento'}
            </button>
          </form>
        )}

        {checkout && step === 'pix' && pix && (
          <div className="st-pix">
            <p className="st-resume">
              {orderRef.current ? orderSummary(orderRef.current) : ''}
            </p>
            {pix.qr && <img className="st-qr" src={pix.qr} alt="QR Code do Pix" width={220} height={220} />}
            <code className="st-code">{pix.code}</code>
            <button type="button" className="st-btn st-btn-line st-btn-full" onClick={copyPix}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copiado' : 'Copiar código Pix'}
            </button>
            <p className="st-wait">Aguardando o pagamento… esta tela confirma sozinha quando o Pix for aprovado.</p>
          </div>
        )}

        {step === 'redirect' && <p className="st-wait">Abrindo o pagamento seguro do Mercado Pago…</p>}

        {step === 'error' && (
          <div className="st-pix">
            <p className="st-error">{errorText}</p>
            <p className="st-wait">Você também pode fazer o pedido direto com a secretaria.</p>
            <a className="st-btn st-btn-full" href={waLink(fallbackMessage)} target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> Pedir pelo WhatsApp
            </a>
            <button type="button" className="st-link" onClick={() => setStep('form')}>Voltar</button>
          </div>
        )}

        {step === 'done' && doneOrder && (
          <div className="st-pix">
            <p className="st-resume">{orderSummary(doneOrder)}</p>
            <p className="st-wait">
              {doneOrder.kind === 'digital'
                ? 'Enviaremos o PDF para o seu e-mail e WhatsApp.'
                : `A secretaria vai chamar você no WhatsApp para combinar: ${deliveryText(doneOrder).toLowerCase()}.`}
            </p>
            <a
              className="st-btn st-btn-full"
              href={waLink(`Olá! Acabei de pagar o pedido ${doneOrder.id}: ${orderSummary(doneOrder)}. Nome: ${doneOrder.name}. ${deliveryText(doneOrder)}.`)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} /> Falar com a secretaria
            </a>
            <button type="button" className="st-link" onClick={closeCheckout}>Fechar</button>
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
        @media (max-width: 760px) {
          .st-item { grid-template-columns: 1fr; }
          .st-two { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
};
