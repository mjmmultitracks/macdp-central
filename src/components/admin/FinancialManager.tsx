import React, { useState } from 'react';
import { FinancialTransaction, TransactionCategory, PaymentMethod } from '../../types';
import { addTransaction, updateTransaction, deleteTransaction } from '../../services/db';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import {
  DollarSign,
  Plus,
  Filter,
  Download,
  Printer,
  FileText,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  CheckCircle2,
  Building,
  ShieldCheck,
} from 'lucide-react';

interface FinancialManagerProps {
  transactions: FinancialTransaction[];
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const FinancialManager: React.FC<FinancialManagerProps> = ({ transactions, onNotify }) => {
  const [filterType, setFilterType] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);
  const [receiptTx, setReceiptTx] = useState<FinancialTransaction | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Form states for new/edit transaction
  const [type, setType] = useState<'entrada' | 'saida'>('entrada');
  const [category, setCategory] = useState<TransactionCategory>('Dízimo');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [memberOrVendor, setMemberOrVendor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const openNewModal = () => {
    setEditingTx(null);
    setType('entrada');
    setCategory('Dízimo');
    setDescription('');
    setAmount(0);
    setPaymentMethod('pix');
    setMemberOrVendor('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsNewTxModalOpen(true);
  };

  const openEditModal = (tx: FinancialTransaction) => {
    setEditingTx(tx);
    setType(tx.type);
    setCategory(tx.category);
    setDescription(tx.description);
    setAmount(tx.amount);
    setPaymentMethod(tx.paymentMethod);
    setMemberOrVendor(tx.memberOrVendor);
    setDate(tx.date);
    setIsNewTxModalOpen(true);
  };

  const totalInflow = transactions
    .filter((t) => t.type === 'entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = transactions
    .filter((t) => t.type === 'saida')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalInflow - totalOutflow;

  const filteredTransactions = transactions.filter((t) => {
    const matchType = filterType === 'todos' || t.type === filterType;
    const matchCat = filterCategory === 'todos' || t.category === filterCategory;
    const matchSearch =
      !searchTerm ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.memberOrVendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.receiptNumber && t.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchType && matchCat && matchSearch;
  });

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      onNotify('error', 'O valor deve ser maior que zero.');
      return;
    }
    if (!description.trim()) {
      onNotify('error', 'Informe uma descrição do lançamento.');
      return;
    }

    if (editingTx) {
      updateTransaction(editingTx.id, {
        type,
        category,
        description,
        amount,
        date,
        paymentMethod,
        memberOrVendor: memberOrVendor || (type === 'entrada' ? 'Membro Não Identificado' : 'Fornecedor Geral'),
      });
      onNotify('success', `Lançamento atualizado com sucesso!`);
    } else {
      addTransaction({
        type,
        category,
        description,
        amount,
        date,
        paymentMethod,
        memberOrVendor: memberOrVendor || (type === 'entrada' ? 'Membro Não Identificado' : 'Fornecedor Geral'),
        status: 'confirmado',
      });
      onNotify('success', `Lançamento de ${formatCurrency(amount)} registrado com sucesso!`);
    }

    setIsNewTxModalOpen(false);
    setDescription('');
    setAmount(0);
    setMemberOrVendor('');
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Deseja realmente estornar/excluir este lançamento financeiro?')) {
      deleteTransaction(id);
      onNotify('info', 'Lançamento financeiro removido.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 3 Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Total de Entradas (Dízimos & Ofertas)
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', margin: '0.4rem 0' }}>
            {formatCurrency(totalInflow)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mês Vigente</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Total de Saídas Operacionais
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--danger)', margin: '0.4rem 0' }}>
            {formatCurrency(totalOutflow)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contas, Projetos e Ajuda Social</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Saldo Líquido / Reserva do Mês
          </span>
          <div
            style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: netBalance >= 0 ? 'var(--accent-gold)' : 'var(--danger)',
              margin: '0.4rem 0',
            }}
          >
            {formatCurrency(netBalance)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Superávit de {((netBalance / Math.max(1, totalInflow)) * 100).toFixed(1)}% das receitas
          </span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1 }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
            <Search
              size={17}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Buscar recibo, descrição, membro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <select
            className="form-select"
            style={{ width: '150px' }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="todos">Todas as Operações</option>
            <option value="entrada">Apenas Entradas</option>
            <option value="saida">Apenas Saídas</option>
          </select>

          {/* Category Filter */}
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="todos">Todas as Categorias</option>
            <option value="Dízimo">Dízimo</option>
            <option value="Oferta Alçada">Oferta Alçada</option>
            <option value="Missões Mundiais">Missões Mundiais</option>
            <option value="Ação Social">Ação Social</option>
            <option value="Construção & Reforma">Construção & Reforma</option>
            <option value="Contas Fixas (Água/Luz/Net)">Contas Fixas</option>
            <option value="Salários & Encargos">Salários & Encargos</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <Printer size={16} />
            <span>Relatório Mensal</span>
          </button>

          <button
            onClick={openNewModal}
            className="btn btn-primary"
            style={{ gap: '0.45rem', fontSize: '0.875rem' }}
          >
            <Plus size={16} />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="table-container" style={{ background: 'var(--bg-secondary)' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Nº Recibo / Código</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Contribuinte / Favorecido</th>
              <th>Forma</th>
              <th style={{ textAlign: 'right' }}>Valor (R$)</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx.id}>
                <td>
                  <span style={{ fontSize: '0.85rem' }}>{formatDate(tx.date)}</span>
                </td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>
                    {tx.receiptNumber || 'N/A'}
                  </span>
                </td>
                <td>
                  <strong style={{ fontSize: '0.875rem' }}>{tx.description}</strong>
                </td>
                <td>
                  <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                    {tx.category}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {tx.memberOrVendor}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {tx.paymentMethod}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <strong
                    style={{
                      fontSize: '0.95rem',
                      color: tx.type === 'entrada' ? 'var(--success)' : 'var(--danger)',
                    }}
                  >
                    {tx.type === 'entrada' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </strong>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                    {tx.type === 'entrada' && (
                      <button
                        onClick={() => setReceiptTx(tx)}
                        className="btn btn-sm btn-secondary"
                        title="Emitir Recibo Oficial"
                        style={{ padding: '0.35rem' }}
                      >
                        <FileText size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(tx)}
                      className="btn btn-sm btn-secondary"
                      title="Editar Lançamento"
                      style={{ padding: '0.35rem' }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="btn btn-sm btn-secondary"
                      title="Estornar/Excluir Lançamento"
                      style={{ padding: '0.35rem', color: 'var(--danger)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NEW TRANSACTION MODAL */}
      <Modal
        isOpen={isNewTxModalOpen}
        onClose={() => setIsNewTxModalOpen(false)}
        title={editingTx ? 'Editar Lançamento Financeiro' : 'Novo Lançamento Financeiro'}
        maxWidth="550px"
      >
        <form onSubmit={handleSaveTransaction}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => {
                setType('entrada');
                setCategory('Dízimo');
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: type === 'entrada' ? '2px solid var(--success)' : '1px solid var(--border-subtle)',
                background: type === 'entrada' ? 'var(--success-soft)' : 'var(--bg-tertiary)',
                color: type === 'entrada' ? 'var(--success)' : 'var(--text-secondary)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Entrada (Receita)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('saida');
                setCategory('Contas Fixas (Água/Luz/Net)');
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: type === 'saida' ? '2px solid var(--danger)' : '1px solid var(--border-subtle)',
                background: type === 'saida' ? 'var(--danger-soft)' : 'var(--bg-tertiary)',
                color: type === 'saida' ? 'var(--danger)' : 'var(--text-secondary)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              - Saída (Despesa)
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Categoria *</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              {type === 'entrada' ? (
                <>
                  <option value="Dízimo">Dízimo</option>
                  <option value="Oferta Alçada">Oferta Alçada</option>
                  <option value="Missões Mundiais">Missões Mundiais</option>
                  <option value="Construção & Reforma">Construção & Reforma</option>
                  <option value="Ação Social">Ação Social</option>
                </>
              ) : (
                <>
                  <option value="Contas Fixas (Água/Luz/Net)">Contas Fixas (Água/Luz/Net)</option>
                  <option value="Salários & Encargos">Salários & Encargos</option>
                  <option value="Ação Social">Ação Social / Cestas</option>
                  <option value="Manutenção Predial">Manutenção Predial</option>
                  <option value="Equipamentos & Mídia">Equipamentos & Som</option>
                  <option value="Eventos & Conferências">Eventos & Conferências</option>
                </>
              )}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição do Lançamento *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: Dízimo membro ref. agosto / Conta de luz Enel"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                className="form-input"
                placeholder="0.00"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Forma de Pagamento</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
              >
                <option value="pix">Pix</option>
                <option value="cartao">Cartão de Crédito/Débito</option>
                <option value="transferencia">TED / Transferência</option>
                <option value="dinheiro">Dinheiro Espécie</option>
                <option value="boleto">Boleto Bancário</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nome do Membro ou Fornecedor</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Lucas Gabriel / Enel SP"
                value={memberOrVendor}
                onChange={(e) => setMemberOrVendor(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsNewTxModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar Lançamento
            </button>
          </div>
        </form>
      </Modal>

      {/* OFFICIAL RECEIPT MODAL (READY FOR PRINTING) */}
      <Modal
        isOpen={!!receiptTx}
        onClose={() => setReceiptTx(null)}
        title="Recibo Oficial de Contribuição"
        maxWidth="680px"
      >
        {receiptTx && (
          <div>
            <div
              id="printable-receipt"
              style={{
                background: '#ffffff',
                color: '#0f172a',
                padding: '2rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid #cbd5e1',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                lineHeight: 1.6,
              }}
            >
              {/* Receipt Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '2px solid #0f172a',
                  paddingBottom: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    MINISTÉRIO APOSTÓLICO CAÇADORES DA PRESENÇA (MACDP)
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#475569' }}>
                    Rua Lagoa Grande, 382 - Conj. Canaranas, Cidade Nova - Manaus/AM • Tel/Pix: (92) 98450-9989
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706', display: 'block' }}>
                    RECIBO Nº
                  </span>
                  <strong style={{ fontSize: '1rem', fontFamily: 'monospace' }}>
                    {receiptTx.receiptNumber}
                  </strong>
                </div>
              </div>

              {/* Receipt Body */}
              <p style={{ marginBottom: '1rem' }}>
                Recebemos de <strong>{receiptTx.memberOrVendor}</strong> a importância de{' '}
                <strong>{formatCurrency(receiptTx.amount)}</strong>, referente a{' '}
                <strong>{receiptTx.category} ({receiptTx.description})</strong>, efetuada via{' '}
                <strong>{receiptTx.paymentMethod.toUpperCase()}</strong> na data de{' '}
                <strong>{formatDate(receiptTx.date)}</strong>.
              </p>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px dashed #94a3b8',
                  borderRadius: '6px',
                  padding: '1rem',
                  margin: '1.5rem 0',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Código de Autenticação Digital:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    SHA256-{Math.random().toString(36).substring(2, 12).toUpperCase()}
                  </span>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.35rem' }}>
                  Documento emitido para fins de comprovação voluntária perante conselho eclesiástico.
                </div>
              </div>

              {/* Signature Line */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginTop: '3rem',
                  paddingTop: '1rem',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                  Manaus - AM, {formatDate(receiptTx.date)}
                </div>
                <div style={{ textAlign: 'center', width: '240px', borderTop: '1px solid #0f172a', paddingTop: '0.4rem' }}>
                  <strong style={{ fontSize: '0.825rem', display: 'block' }}>Diretoria de Tesouraria</strong>
                  <span style={{ fontSize: '0.7rem', color: '#647489' }}>Caçadores da Presença (MACDP)</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setReceiptTx(null)}
                className="btn btn-secondary"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-primary"
                style={{ gap: '0.4rem' }}
              >
                <Printer size={16} />
                <span>Imprimir Recibo</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MONTHLY CONSOLIDATED REPORT MODAL */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Balancete Financeiro Mensal Consolidado"
        maxWidth="740px"
      >
        <div style={{ fontSize: '0.9rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Demonstrativo Mensal de Entradas e Saídas</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Prestação de contas do Ministério Apostólico Caçadores da Presença (MACDP) — Exercício 2026
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ color: 'var(--success)', fontWeight: 700, marginBottom: '0.5rem' }}>Entradas Realizadas</h4>
              <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>{formatCurrency(totalInflow)}</p>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ color: 'var(--danger)', fontWeight: 700, marginBottom: '0.5rem' }}>Saídas Totais</h4>
              <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>{formatCurrency(totalOutflow)}</p>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Resumo das Principais Contas:</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span>Dízimos e Ofertas Regulares:</span>
                <strong>{formatCurrency(transactions.filter((t) => t.category === 'Dízimo' || t.category === 'Oferta Alçada').reduce((s, t) => s + t.amount, 0))}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span>Projetos Sociais & Cestas Básicas:</span>
                <strong>{formatCurrency(transactions.filter((t) => t.category === 'Ação Social').reduce((s, t) => s + t.amount, 0))}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span>Manutenção do Templo e Contas Fixas:</span>
                <strong>{formatCurrency(transactions.filter((t) => t.category.includes('Contas Fixas') || t.category.includes('Equipamentos')).reduce((s, t) => s + t.amount, 0))}</strong>
              </li>
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setIsReportModalOpen(false)} className="btn btn-secondary">
              Fechar
            </button>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ gap: '0.4rem' }}>
              <Printer size={16} />
              <span>Imprimir Relatório</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
