import React, { useState } from 'react';
import { generatePixCopiaECola } from '../../services/pixService';
import { addTransaction } from '../../services/db';
import { formatCurrency } from '../../utils/formatters';
import {
  Heart,
  QrCode,
  Copy,
  Check,
  CreditCard,
  Building2,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface GivingSectionProps {
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const GivingSection: React.FC<GivingSectionProps> = ({ onNotify }) => {
  const [activeTab, setActiveTab] = useState<'pix' | 'cartao' | 'ted'>('pix');
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [category, setCategory] = useState<
    'Dízimo' | 'Oferta Alçada' | 'Missões Mundiais' | 'Ação Social' | 'Construção & Reforma'
  >('Dízimo');
  const [donorName, setDonorName] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [cardProcessing, setCardProcessing] = useState(false);
  const [cardSuccess, setCardSuccess] = useState(false);

  const presetAmounts = [30, 50, 100, 200, 500];

  const currentAmount = customAmount ? parseFloat(customAmount.replace(',', '.')) || 0 : amount;

  // Generate dynamic Pix Code
  const pixCode = generatePixCopiaECola({
    key: '92991279663',
    name: 'MACDP Manaus',
    city: 'Manaus',
    amount: currentAmount,
    description: category,
  });

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    onNotify('success', 'Código Pix Copia e Cola copiado com sucesso!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmPixPayment = () => {
    if (currentAmount <= 0) {
      onNotify('error', 'Por favor, selecione ou digite um valor válido.');
      return;
    }

    addTransaction({
      type: 'entrada',
      category: category,
      description: `${category} via Pix Portal${donorName ? ` - ${donorName}` : ' - Contribuinte Online'}`,
      amount: currentAmount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'pix',
      memberOrVendor: donorName || 'Contribuinte Online',
      status: 'confirmado',
    });

    onNotify('success', `Deus abençoe sua generosidade! Contribuição de ${formatCurrency(currentAmount)} registrada com sucesso.`);
  };

  const handleSimulateCardDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAmount <= 0) {
      onNotify('error', 'Por favor, informe um valor de contribuição.');
      return;
    }

    setCardProcessing(true);
    setTimeout(() => {
      setCardProcessing(false);
      setCardSuccess(true);
      addTransaction({
        type: 'entrada',
        category: category,
        description: `${category} via Cartão de Crédito - ${donorName || 'Contribuinte Online'}`,
        amount: currentAmount,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cartao',
        memberOrVendor: donorName || 'Contribuinte Online',
        status: 'confirmado',
      });
      onNotify('success', 'Pagamento processado com segurança! Recibo emitido.');
    }, 1200);
  };

  return (
    <section id="dizimos" className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">
            <Heart size={14} /> Generosidade Bíblica
          </span>
          <h2 className="section-title">Dízimos & Ofertas</h2>
          <p className="section-subtitle">
            "Cada um dê conforme determinou em seu coração, não com pesar ou por obrigação, pois Deus ama quem dá com alegria." (2 Coríntios 9:7)
          </p>
        </div>

        {/* Stewardship Box */}
        <div
          style={{
            maxWidth: '920px',
            margin: '0 auto',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Method Selection Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-tertiary)',
            }}
          >
            <button
              onClick={() => setActiveTab('pix')}
              style={{
                flex: 1,
                padding: '1.25rem 1rem',
                border: 'none',
                background: activeTab === 'pix' ? 'var(--bg-secondary)' : 'transparent',
                color: activeTab === 'pix' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'pix' ? 700 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderTop: activeTab === 'pix' ? '3px solid var(--accent-gold)' : '3px solid transparent',
              }}
            >
              <QrCode size={18} />
              <span>Pix Instantâneo (Recomendado)</span>
            </button>

            <button
              onClick={() => setActiveTab('cartao')}
              style={{
                flex: 1,
                padding: '1.25rem 1rem',
                border: 'none',
                background: activeTab === 'cartao' ? 'var(--bg-secondary)' : 'transparent',
                color: activeTab === 'cartao' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'cartao' ? 700 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderTop: activeTab === 'cartao' ? '3px solid var(--accent-gold)' : '3px solid transparent',
              }}
            >
              <CreditCard size={18} />
              <span>Cartão de Crédito / Débito</span>
            </button>

            <button
              onClick={() => setActiveTab('ted')}
              style={{
                flex: 1,
                padding: '1.25rem 1rem',
                border: 'none',
                background: activeTab === 'ted' ? 'var(--bg-secondary)' : 'transparent',
                color: activeTab === 'ted' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'ted' ? 700 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderTop: activeTab === 'ted' ? '3px solid var(--accent-gold)' : '3px solid transparent',
              }}
            >
              <Building2 size={18} />
              <span>Transferência Bancária (TED/DOC)</span>
            </button>
          </div>

          <div style={{ padding: '2.5rem' }}>
            {/* Value & Category Configuration (Shared by Pix & Card) */}
            {activeTab !== 'ted' && (
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
                    1. Escolha a Finalidade da Contribuição:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {[
                      'Dízimo',
                      'Oferta Alçada',
                      'Missões Mundiais',
                      'Ação Social',
                      'Construção & Reforma',
                    ].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat as any)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-full)',
                          border: category === cat ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                          background: category === cat ? 'var(--accent-gold-soft)' : 'var(--bg-tertiary)',
                          color: category === cat ? 'var(--accent-gold)' : 'var(--text-secondary)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
                    2. Selecione ou Digite o Valor (R$):
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {presetAmounts.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setAmount(val);
                          setCustomAmount('');
                        }}
                        style={{
                          padding: '0.65rem 1.25rem',
                          borderRadius: 'var(--radius-md)',
                          border: !customAmount && amount === val ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                          background: !customAmount && amount === val ? 'var(--accent-gold-soft)' : 'var(--bg-tertiary)',
                          color: !customAmount && amount === val ? 'var(--accent-gold)' : 'var(--text-primary)',
                          fontWeight: 700,
                          fontSize: '1rem',
                          cursor: 'pointer',
                        }}
                      >
                        R$ {val}
                      </button>
                    ))}
                  </div>
                  <div style={{ maxWidth: '280px' }}>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Outro valor (ex: 350.00)"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Nome do Contribuinte (Opcional para recibo fiscal):</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Seu nome completo"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* TAB 1: PIX */}
            {activeTab === 'pix' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '2.5rem',
                  alignItems: 'center',
                  background: 'var(--bg-tertiary)',
                  padding: '2rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {/* Visual QR Code Display */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      border: '1px solid var(--border-medium)',
                    }}
                  >
                    {/* Stylized QR Code SVG Representation */}
                    <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
                      <rect width="180" height="180" fill="white" />
                      {/* Top Left Marker */}
                      <rect x="15" y="15" width="45" height="45" fill="#0B1120" rx="4" />
                      <rect x="23" y="23" width="29" height="29" fill="white" rx="2" />
                      <rect x="29" y="29" width="17" height="17" fill="#D97706" rx="2" />
                      {/* Top Right Marker */}
                      <rect x="120" y="15" width="45" height="45" fill="#0B1120" rx="4" />
                      <rect x="128" y="23" width="29" height="29" fill="white" rx="2" />
                      <rect x="134" y="29" width="17" height="17" fill="#D97706" rx="2" />
                      {/* Bottom Left Marker */}
                      <rect x="15" y="120" width="45" height="45" fill="#0B1120" rx="4" />
                      <rect x="23" y="128" width="29" height="29" fill="white" rx="2" />
                      <rect x="29" y="134" width="17" height="17" fill="#D97706" rx="2" />
                      {/* Center Decorative Church Cross */}
                      <circle cx="90" cy="90" r="18" fill="#F59E0B" />
                      <rect x="87" y="78" width="6" height="24" fill="#0B1120" />
                      <rect x="80" y="84" width="20" height="6" fill="#0B1120" />
                      {/* Data dots */}
                      <rect x="70" y="25" width="10" height="10" fill="#0B1120" />
                      <rect x="95" y="25" width="10" height="10" fill="#0B1120" />
                      <rect x="70" y="45" width="10" height="10" fill="#0B1120" />
                      <rect x="95" y="45" width="10" height="10" fill="#0B1120" />
                      <rect x="25" y="75" width="10" height="10" fill="#0B1120" />
                      <rect x="45" y="85" width="10" height="10" fill="#0B1120" />
                      <rect x="125" y="75" width="10" height="10" fill="#0B1120" />
                      <rect x="145" y="95" width="10" height="10" fill="#0B1120" />
                      <rect x="70" y="125" width="10" height="10" fill="#0B1120" />
                      <rect x="95" y="135" width="10" height="10" fill="#0B1120" />
                      <rect x="125" y="125" width="10" height="10" fill="#0B1120" />
                      <rect x="145" y="145" width="10" height="10" fill="#0B1120" />
                    </svg>

                    <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', display: 'block' }}>
                        Chave Pix: (92) 99127-9663
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                        Ministério Apostólico Caçadores da Presença (MACDP)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Copia e Cola & Confirm */}
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        Código Pix Copia e Cola:
                      </label>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                        {formatCurrency(currentAmount)}
                      </span>
                    </div>
                    <div
                      style={{
                        background: 'var(--bg-secondary)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-medium)',
                        fontFamily: 'monospace',
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                        wordBreak: 'break-all',
                        maxHeight: '75px',
                        overflowY: 'auto',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {pixCode}
                    </div>

                    <button
                      onClick={handleCopyPix}
                      className="btn btn-secondary"
                      style={{ width: '100%', gap: '0.5rem', marginBottom: '1rem' }}
                    >
                      {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                      <span>{copied ? 'Código Pix Copiado!' : 'Copiar Código Pix'}</span>
                    </button>

                    <button
                      onClick={handleConfirmPixPayment}
                      className="btn btn-primary"
                      style={{ width: '100%', gap: '0.5rem' }}
                    >
                      <CheckCircle2 size={18} />
                      <span>Já Realizei a Transferência Pix</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <ShieldCheck size={16} color="var(--success)" />
                    <span>Ambiente criptografado e homologado pelo Banco Central do Brasil.</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CARTÃO */}
            {activeTab === 'cartao' && (
              <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', padding: '2rem 1rem' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.12)',
                    color: 'var(--accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto',
                  }}
                >
                  <CreditCard size={32} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                  Contribuição via Cartão de Débito ou Crédito
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                  Para sua total segurança, as doações presenciais com cartão (débito ou crédito) são processadas diretamente nas <strong>maquininhas oficiais da tesouraria no templo</strong> durante nossos cultos presenciais.
                </p>
                <div
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                    <Sparkles size={16} />
                    <span>Deseja contribuir online agora mesmo?</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Utilize o <strong>Pix Oficial da MACDP</strong>: transferência instantânea com valor livre, sem nenhuma taxa e com recibo digital automático.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('pix')}
                  className="btn btn-primary"
                  style={{ gap: '0.5rem' }}
                >
                  <QrCode size={18} />
                  <span>Contribuir via Pix Agora</span>
                </button>
              </div>
            )}

            {/* TAB 3: TED / TRANSFERÊNCIA */}
            {activeTab === 'ted' && (
              <div
                style={{
                  maxWidth: '560px',
                  margin: '0 auto',
                  textAlign: 'center',
                  padding: '2rem 1rem',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.12)',
                    color: 'var(--accent-blue-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto',
                  }}
                >
                  <Building2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                  Transferência Bancária & Chave Pix Oficial
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  A forma mais rápida, segura e isenta de taxas para transferir qualquer valor para a igreja a partir de qualquer banco (Itaú, Bradesco, Banco do Brasil, Caixa, Nubank, Inter, etc.) é utilizando a chave Pix oficial:
                </p>
                <div
                  className="card"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--accent-gold)',
                    textAlign: 'left',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
                    <strong>Favorecido:</strong> Ministério Apostólico Caçadores da Presença (MACDP)<br />
                    <strong>Chave Pix (Telefone):</strong> (92) 99127-9663<br />
                    <strong>Chave Pix sem formatação:</strong> <code style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>92991279663</code><br />
                    <strong>Cidade / Sede:</strong> Manaus - AM<br />
                    <strong>Secretaria / WhatsApp:</strong> (92) 98450-9989
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('pix')}
                  className="btn btn-primary"
                  style={{ gap: '0.5rem' }}
                >
                  <QrCode size={18} />
                  <span>Ver QR Code do Pix</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
