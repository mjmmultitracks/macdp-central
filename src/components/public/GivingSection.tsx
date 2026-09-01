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
    key: '92984509989',
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
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', display: 'block' }}>
                        Chave CNPJ: 12.345.678/0001-90
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Igreja Graça & Vida de SP</span>
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
              <div>
                {cardSuccess ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
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
                        margin: '0 auto 1.5rem auto',
                      }}
                    >
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                      Contribuição Concluída com Sucesso!
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                      Valor de <strong>{formatCurrency(currentAmount)}</strong> destinado a <strong>{category}</strong>. Muito obrigado por investir na expansão do Reino de Deus.
                    </p>
                    <button
                      onClick={() => setCardSuccess(false)}
                      className="btn btn-secondary"
                    >
                      Fazer Nova Contribuição
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSimulateCardDonation} style={{ maxWidth: '520px', margin: '0 auto' }}>
                    <div className="form-group">
                      <label className="form-label">Nome no Cartão:</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="Como impresso no cartão"
                        defaultValue={donorName}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Número do Cartão:</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Validade (MM/AA):</label>
                        <input type="text" required className="form-input" placeholder="12/28" maxLength={5} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV:</label>
                        <input type="password" required className="form-input" placeholder="123" maxLength={4} />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={cardProcessing}
                      className="btn btn-primary btn-lg"
                      style={{ width: '100%', marginTop: '1rem', gap: '0.5rem' }}
                    >
                      <CreditCard size={18} />
                      <span>{cardProcessing ? 'Processando doação...' : `Confirmar Contribuição de ${formatCurrency(currentAmount)}`}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: TED/DOC */}
            {activeTab === 'ted' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                <div
                  className="card"
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderLeft: '4px solid #003399',
                  }}
                >
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    Banco do Brasil (001)
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong>Agência:</strong> 1234-5
                    <br />
                    <strong>Conta Corrente:</strong> 54321-0
                    <br />
                    <strong>Favorecido:</strong> Ministério Apostólico Caçadores da Presença (MACDP)
                    <br />
                    <strong>Chave Pix (Telefone):</strong> (92) 98450-9989
                  </p>
                </div>

                <div
                  className="card"
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderLeft: '4px solid #EC7000',
                  }}
                >
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    Banco Itaú (341)
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong>Agência:</strong> 0987
                    <br />
                    <strong>Conta Corrente:</strong> 12345-6
                    <br />
                    <strong>Favorecido:</strong> Ministério Apostólico Caçadores da Presença (MACDP)
                    <br />
                    <strong>Chave Pix (Telefone):</strong> (92) 98450-9989
                  </p>
                </div>

                <div
                  className="card"
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderLeft: '4px solid #CC092F',
                  }}
                >
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    Banco Bradesco (237)
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong>Agência:</strong> 2345
                    <br />
                    <strong>Conta Corrente:</strong> 67890-1
                    <br />
                    <strong>Favorecido:</strong> Ministério Apostólico Caçadores da Presença (MACDP)
                    <br />
                    <strong>Chave Pix (Telefone):</strong> (92) 98450-9989
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
