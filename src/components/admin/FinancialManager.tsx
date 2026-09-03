import React, { useState } from 'react';
import {
  FinancialTransaction,
  PaymentMethod,
  BankAccount,
  FinancialCategory,
  ChurchEvent,
} from '../../types';
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
  addFinancialCategory,
  updateFinancialCategory,
  deleteFinancialCategory,
} from '../../services/db';
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
  Tag,
  Ticket,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  Layers,
  CreditCard,
  Coins,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Shirt,
  AlertCircle,
} from 'lucide-react';

interface FinancialManagerProps {
  transactions: FinancialTransaction[];
  bankAccounts?: BankAccount[];
  financialCategories?: FinancialCategory[];
  events?: ChurchEvent[];
  activeSubTab?: FinancialSubTab;
  onSubTabChange?: (tab: FinancialSubTab) => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

type FinancialSubTab = 'fluxo' | 'contas' | 'categorias' | 'eventos_caixa';

export const FinancialManager: React.FC<FinancialManagerProps> = ({
  transactions,
  bankAccounts = [],
  financialCategories = [],
  events = [],
  activeSubTab: activeSubTabExternal,
  onSubTabChange,
  onNotify,
}) => {
  // Sub-menu Navigation State (sincronizado com Dropdown da Sidebar e Abas)
  const [internalSubTab, setInternalSubTab] = useState<FinancialSubTab>('fluxo');
  const activeSubTab = activeSubTabExternal !== undefined ? activeSubTabExternal : internalSubTab;

  const setActiveSubTab = (tab: FinancialSubTab) => {
    setInternalSubTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };

  // Filters for General Ledger (Fluxo)
  const [filterType, setFilterType] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [filterAccount, setFilterAccount] = useState('todos');
  const [filterEvent, setFilterEvent] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Event for Event Cashflow Subtab
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    return events.length > 0 ? events[0].id : 'evt_1';
  });

  // Modal states
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);
  const [receiptTx, setReceiptTx] = useState<FinancialTransaction | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Bank Account Modals & State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [accountForm, setAccountForm] = useState<Omit<BankAccount, 'id'>>({
    name: '',
    bankName: 'Banco Bradesco (237)',
    accountType: 'corrente',
    agency: '',
    accountNumber: '',
    pixKey: '',
    initialBalance: 0,
    color: '#d97706',
    isDefault: false,
    status: 'ativo',
    notes: '',
  });

  // Category Modals & State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FinancialCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<Omit<FinancialCategory, 'id'>>({
    name: '',
    type: 'entrada',
    color: '#10b981',
    description: '',
  });

  // Event Expense Modal State
  const [isEventExpenseModalOpen, setIsEventExpenseModalOpen] = useState(false);

  // Form states for new/edit general transaction
  const [txType, setTxType] = useState<'entrada' | 'saida'>('entrada');
  const [txCategory, setTxCategory] = useState('Dízimo');
  const [txDescription, setTxDescription] = useState('');
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txPaymentMethod, setTxPaymentMethod] = useState<PaymentMethod>('pix');
  const [txMemberOrVendor, setTxMemberOrVendor] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txAccountId, setTxAccountId] = useState<string>('');
  const [txEventId, setTxEventId] = useState<string>('');

  // Copy PIX feedback state
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);

  // Default Bank Account helper
  const defaultAccount = bankAccounts.find((a) => a.isDefault && a.status === 'ativo') || bankAccounts[0];

  // Global KPIs
  const totalInflow = transactions
    .filter((t) => t.type === 'entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = transactions
    .filter((t) => t.type === 'saida')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalInflow - totalOutflow;

  // Compute live balances per account (initialBalance + Inflows - Outflows)
  const getAccountLiveBalance = (acc: BankAccount) => {
    const accInflow = transactions
      .filter((t) => t.type === 'entrada' && (t.bankAccountId === acc.id || (!t.bankAccountId && acc.isDefault)))
      .reduce((s, t) => s + t.amount, 0);
    const accOutflow = transactions
      .filter((t) => t.type === 'saida' && (t.bankAccountId === acc.id || (!t.bankAccountId && acc.isDefault)))
      .reduce((s, t) => s + t.amount, 0);
    return acc.initialBalance + accInflow - accOutflow;
  };

  // Filtered transactions for General Ledger
  const filteredTransactions = transactions.filter((t) => {
    const matchType = filterType === 'todos' || t.type === filterType;
    const matchCat = filterCategory === 'todos' || t.category === filterCategory;
    const matchAcc =
      filterAccount === 'todos' ||
      t.bankAccountId === filterAccount ||
      (!t.bankAccountId && defaultAccount && defaultAccount.id === filterAccount);
    const matchEvt = filterEvent === 'todos' || t.eventId === filterEvent;
    const matchSearch =
      !searchTerm ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.memberOrVendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.receiptNumber && t.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.eventName && t.eventName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchType && matchCat && matchAcc && matchEvt && matchSearch;
  });

  // Selected Event Calculations for Event Cashflow Subtab
  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const eventTransactions = currentEvent
    ? transactions.filter((t) => t.eventId === currentEvent.id)
    : [];

  const eventTotalRevenue = eventTransactions
    .filter((t) => t.type === 'entrada' && t.status === 'confirmado')
    .reduce((sum, t) => sum + t.amount, 0);

  const eventTotalExpenses = eventTransactions
    .filter((t) => t.type === 'saida')
    .reduce((sum, t) => sum + t.amount, 0);

  const eventNetBalance = eventTotalRevenue - eventTotalExpenses;

  const eventPaidRegistrationsCount = currentEvent
    ? currentEvent.registrations.filter((r) => r.paymentStatus === 'confirmed').length
    : 0;

  const eventShirtsCount = currentEvent
    ? currentEvent.registrations.filter((r) => r.includeShirt).length
    : 0;

  // Handlers for Transactions
  const openNewTxModal = (presetEventId?: string) => {
    setEditingTx(null);
    setTxType('entrada');
    setTxCategory(presetEventId ? 'Despesas de Eventos & Conferências' : (financialCategories[0]?.name || 'Dízimo'));
    setTxDescription('');
    setTxAmount(0);
    setTxPaymentMethod('pix');
    setTxMemberOrVendor('');
    setTxDate(new Date().toISOString().split('T')[0]);
    setTxAccountId(defaultAccount?.id || '');
    setTxEventId(presetEventId || '');
    setIsNewTxModalOpen(true);
  };

  const openEditTxModal = (tx: FinancialTransaction) => {
    setEditingTx(tx);
    setTxType(tx.type);
    setTxCategory(tx.category);
    setTxDescription(tx.description);
    setTxAmount(tx.amount);
    setTxPaymentMethod(tx.paymentMethod);
    setTxMemberOrVendor(tx.memberOrVendor);
    setTxDate(tx.date);
    setTxAccountId(tx.bankAccountId || defaultAccount?.id || '');
    setTxEventId(tx.eventId || '');
    setIsNewTxModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (txAmount <= 0) {
      onNotify('error', 'O valor deve ser maior que zero.');
      return;
    }
    if (!txDescription.trim()) {
      onNotify('error', 'A descrição do lançamento é obrigatória.');
      return;
    }

    const linkedEvent = events.find((ev) => ev.id === txEventId);

    if (editingTx) {
      updateTransaction(editingTx.id, {
        type: txType,
        category: txCategory,
        description: txDescription.trim(),
        amount: Number(txAmount),
        paymentMethod: txPaymentMethod,
        memberOrVendor: txMemberOrVendor.trim() || 'Ministério / Não informado',
        date: txDate,
        bankAccountId: txAccountId || defaultAccount?.id,
        eventId: txEventId || undefined,
        eventName: linkedEvent ? linkedEvent.title : undefined,
      });
      onNotify('success', 'Lançamento financeiro atualizado com sucesso!');
    } else {
      addTransaction({
        type: txType,
        category: txCategory,
        description: txDescription.trim(),
        amount: Number(txAmount),
        paymentMethod: txPaymentMethod,
        memberOrVendor: txMemberOrVendor.trim() || 'Ministério / Não informado',
        date: txDate,
        status: 'confirmado',
        bankAccountId: txAccountId || defaultAccount?.id,
        eventId: txEventId || undefined,
        eventName: linkedEvent ? linkedEvent.title : undefined,
      });
      onNotify('success', 'Lançamento financeiro cadastrado com sucesso!');
    }

    setIsNewTxModalOpen(false);
  };

  const handleDeleteTransaction = (tx: FinancialTransaction) => {
    if (window.confirm(`Tem certeza que deseja excluir o lançamento "${tx.description}"?`)) {
      deleteTransaction(tx.id);
      onNotify('info', 'Lançamento excluído com sucesso.');
    }
  };

  // Handlers for Bank Accounts
  const openNewAccountModal = () => {
    setEditingAccount(null);
    setAccountForm({
      name: '',
      bankName: 'Banco Bradesco (237)',
      accountType: 'corrente',
      agency: '',
      accountNumber: '',
      pixKey: '',
      initialBalance: 0,
      color: '#d97706',
      isDefault: bankAccounts.length === 0,
      status: 'ativo',
      notes: '',
    });
    setIsAccountModalOpen(true);
  };

  const openEditAccountModal = (acc: BankAccount) => {
    setEditingAccount(acc);
    setAccountForm({
      name: acc.name,
      bankName: acc.bankName,
      accountType: acc.accountType,
      agency: acc.agency || '',
      accountNumber: acc.accountNumber || '',
      pixKey: acc.pixKey || '',
      initialBalance: acc.initialBalance,
      color: acc.color || '#d97706',
      isDefault: !!acc.isDefault,
      status: acc.status,
      notes: acc.notes || '',
    });
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.name.trim()) {
      onNotify('error', 'O nome da conta é obrigatório.');
      return;
    }

    if (editingAccount) {
      updateBankAccount(editingAccount.id, accountForm);
      onNotify('success', `Conta "${accountForm.name}" atualizada com sucesso!`);
    } else {
      addBankAccount(accountForm);
      onNotify('success', `Nova conta bancária "${accountForm.name}" cadastrada!`);
    }

    setIsAccountModalOpen(false);
  };

  const handleDeleteAccount = (acc: BankAccount) => {
    if (window.confirm(`Deseja excluir a conta "${acc.name}"? Os lançamentos vinculados a ela serão mantidos no extrato.`)) {
      deleteBankAccount(acc.id);
      onNotify('info', `Conta "${acc.name}" removida com sucesso.`);
    }
  };

  const handleSetDefaultAccount = (acc: BankAccount) => {
    updateBankAccount(acc.id, { isDefault: true });
    onNotify('success', `Conta "${acc.name}" definida como padrão da igreja!`);
  };

  const handleCopyPix = (acc: BankAccount) => {
    if (acc.pixKey) {
      navigator.clipboard.writeText(acc.pixKey);
      setCopiedPixId(acc.id);
      setTimeout(() => setCopiedPixId(null), 2500);
      onNotify('success', 'Chave PIX copiada para a área de transferência!');
    }
  };

  // Handlers for Financial Categories
  const openNewCategoryModal = (presetType: 'entrada' | 'saida' = 'entrada') => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      type: presetType,
      color: presetType === 'entrada' ? '#10b981' : '#ef4444',
      description: '',
    });
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: FinancialCategory) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      type: cat.type,
      color: cat.color || (cat.type === 'entrada' ? '#10b981' : '#ef4444'),
      description: cat.description || '',
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      onNotify('error', 'O nome da categoria é obrigatório.');
      return;
    }

    if (editingCategory) {
      updateFinancialCategory(editingCategory.id, categoryForm);
      onNotify('success', `Categoria "${categoryForm.name}" atualizada!`);
    } else {
      addFinancialCategory(categoryForm);
      onNotify('success', `Nova categoria "${categoryForm.name}" cadastrada!`);
    }

    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (cat: FinancialCategory) => {
    if (cat.isSystem) {
      if (!window.confirm(`Atenção: "${cat.name}" é uma categoria fundamental do sistema. Deseja realmente excluí-la?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Excluir a categoria "${cat.name}"?`)) return;
    }
    deleteFinancialCategory(cat.id);
    onNotify('info', `Categoria "${cat.name}" removida com sucesso.`);
  };

  // ========================================================
  // MOTOR DE IMPRESSÃO EM ALTA DEFINIÇÃO PARA RECIBO & PDF
  // ========================================================
  const generateReceiptHtml = (tx: FinancialTransaction) => {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Recibo Financeiro #${tx.receiptNumber || '0000'} - MACDP Central</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 1.5cm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 1.5cm;
      line-height: 1.6;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .receipt-box {
      max-width: 720px;
      margin: 0 auto;
      border: 2px solid #0f172a;
      border-radius: 8px;
      padding: 2.25rem 2.5rem;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .church-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.5px;
    }
    .church-sub {
      font-size: 0.78rem;
      color: #475569;
      margin-top: 0.35rem;
    }
    .rec-num-box {
      text-align: right;
    }
    .rec-label {
      font-size: 0.75rem;
      font-weight: 800;
      color: #d97706;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
    }
    .rec-num {
      font-size: 1.25rem;
      font-weight: 900;
      font-family: monospace;
      color: #0f172a;
    }
    .value-banner {
      background: #f0fdf4;
      border: 1.5px solid #16a34a;
      border-radius: 6px;
      padding: 0.85rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .value-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #166534;
      text-transform: uppercase;
    }
    .value-num {
      font-size: 1.45rem;
      font-weight: 900;
      color: #15803d;
    }
    .content {
      font-size: 0.95rem;
      line-height: 1.8;
      color: #1e293b;
      margin-bottom: 1.5rem;
    }
    .event-badge {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      color: #92400e;
      padding: 0.5rem 0.85rem;
      border-radius: 6px;
      font-size: 0.85rem;
      margin-bottom: 1.5rem;
    }
    .auth-block {
      background: #f8fafc;
      border: 1px dashed #94a3b8;
      border-radius: 6px;
      padding: 0.85rem 1.15rem;
      margin: 1.75rem 0;
      font-size: 0.78rem;
    }
    .auth-top {
      display: flex;
      justify-content: space-between;
      font-family: monospace;
      font-weight: 700;
      color: #334155;
    }
    .auth-bottom {
      color: #64748b;
      font-size: 0.72rem;
      margin-top: 0.25rem;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 3.5rem;
      padding-top: 1rem;
    }
    .date-place {
      font-size: 0.85rem;
      color: #475569;
    }
    .sign-box {
      text-align: center;
      width: 230px;
      border-top: 1.5px solid #0f172a;
      padding-top: 0.4rem;
    }
    .sign-title {
      font-size: 0.825rem;
      font-weight: 700;
      display: block;
      color: #0f172a;
    }
    .sign-sub {
      font-size: 0.7rem;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="receipt-box">
    <div class="header">
      <div>
        <h3 class="church-name">MINISTÉRIO APOSTÓLICO CAÇADORES DA PRESENÇA (MACDP)</h3>
        <p class="church-sub">Rua Lagoa Grande, 382 - Canaranas, Manaus/AM • Tel/Pix: (92) 99127-9663</p>
      </div>
      <div class="rec-num-box">
        <span class="rec-label">RECIBO Nº</span>
        <strong class="rec-num">${tx.receiptNumber || '0000'}</strong>
      </div>
    </div>

    <div class="value-banner">
      <span class="value-title">Valor do Recebimento</span>
      <span class="value-num">${formatCurrency(tx.amount)}</span>
    </div>

    <p class="content">
      Recebemos de <strong>${tx.memberOrVendor}</strong> a importância de 
      <strong style="color: #059669;">${formatCurrency(tx.amount)}</strong>, 
      referente a <strong>${tx.category} (${tx.description})</strong>, 
      efetuada via <strong>${tx.paymentMethod.toUpperCase()}</strong> na data de 
      <strong>${formatDate(tx.date)}</strong>.
    </p>

    ${tx.eventName ? `
      <div class="event-badge">
        🎪 <strong>Evento Vinculado:</strong> ${tx.eventName}
      </div>
    ` : ''}

    <div class="auth-block">
      <div class="auth-top">
        <span>Código de Autenticação Digital:</span>
        <span>SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}</span>
      </div>
      <div class="auth-bottom">
        Documento emitido para fins de comprovação eclesiástica perante a tesouraria.
      </div>
    </div>

    <div class="signatures">
      <div class="date-place">
        Manaus - AM, ${formatDate(tx.date)}
      </div>
      <div class="sign-box">
        <strong class="sign-title">Diretoria de Tesouraria</strong>
        <span class="sign-sub">MACDP Central</span>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const handlePrintReceipt = (tx: FinancialTransaction) => {
    onNotify('info', 'Gerando pré-visualização do recibo em PDF...');
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(generateReceiptHtml(tx));
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2500);
    }, 250);
  };

  const handleOpenReceiptInNewTab = (tx: FinancialTransaction) => {
    const win = window.open('', '_blank');
    if (!win) {
      onNotify('error', 'Por favor, permita pop-ups para visualizar o recibo em uma nova guia.');
      return;
    }
    win.document.open();
    win.document.write(generateReceiptHtml(tx));
    win.document.close();
  };

  const handlePrintFinancialReport = () => {
    onNotify('info', 'Gerando pré-visualização do demonstrativo financeiro em PDF...');
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const reportHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Demonstrativo Financeiro Consolidado - MACDP</title>
  <style>
    @page { size: A4 portrait; margin: 1.5cm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 1.5cm;
      line-height: 1.6;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .report-box { max-width: 720px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 1.25rem; margin-bottom: 1.5rem; }
    .kpi-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
    .kpi-card { padding: 1.25rem; border-radius: 8px; border: 1px solid #cbd5e1; }
    .account-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    .account-table th, .account-table td { padding: 0.65rem 0.85rem; border-bottom: 1px solid #e2e8f0; text-align: left; }
  </style>
</head>
<body>
  <div class="report-box">
    <div class="header">
      <h2 style="font-size: 1.35rem; font-weight: 800;">MINISTÉRIO APOSTÓLICO CAÇADORES DA PRESENÇA</h2>
      <h3 style="font-size: 1.1rem; color: #475569; margin-top: 0.25rem;">Demonstrativo Financeiro Consolidado — Exercício 2026</h3>
      <p style="font-size: 0.78rem; color: #64748b; margin-top: 0.25rem;">Manaus/AM • Emitido em ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>

    <div class="kpi-row">
      <div class="kpi-card" style="background: #f0fdf4; border-color: #22c55e;">
        <span style="color: #166534; font-size: 0.825rem; font-weight: 700; text-transform: uppercase;">Total de Entradas</span>
        <h3 style="font-size: 1.6rem; color: #15803d; font-weight: 900; margin-top: 0.35rem;">${formatCurrency(totalInflow)}</h3>
      </div>
      <div class="kpi-card" style="background: #fef2f2; border-color: #ef4444;">
        <span style="color: #991b1b; font-size: 0.825rem; font-weight: 700; text-transform: uppercase;">Total de Saídas</span>
        <h3 style="font-size: 1.6rem; color: #b91c1c; font-weight: 900; margin-top: 0.35rem;">${formatCurrency(totalOutflow)}</h3>
      </div>
    </div>

    <h4 style="font-size: 1rem; font-weight: 800; margin: 1.5rem 0 0.5rem 0;">Saldos por Conta Bancária:</h4>
    <table class="account-table">
      <thead>
        <tr style="background: #f8fafc; font-size: 0.8rem;">
          <th>CONTA / CAIXA</th>
          <th>BANCO / TIPO</th>
          <th style="text-align: right;">SALDO CONCILIADO</th>
        </tr>
      </thead>
      <tbody>
        ${bankAccounts.map((acc) => {
          const bal = getAccountLiveBalance(acc);
          return `<tr>
            <td><strong>${acc.name}</strong></td>
            <td>${acc.bankName} (${acc.accountType})</td>
            <td style="text-align: right; font-weight: 800; color: ${bal >= 0 ? '#15803d' : '#b91c1c'};">${formatCurrency(bal)}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;

    doc.open();
    doc.write(reportHtml);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2500);
    }, 250);
  };

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%', minHeight: '85vh', paddingBottom: '3rem' }}>
      {/* Module Title and Sub-menus */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.75rem',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--accent-gold-soft)',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DollarSign size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Gestão Financeira & Tesouraria
                </h2>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Controle de receitas, despesas, contas bancárias, plano de contas e caixa específico de eventos
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.45rem' }}
            >
              <Printer size={15} />
              <span>Balancete Mensal</span>
            </button>

            <button
              onClick={() => openNewTxModal()}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.45rem' }}
            >
              <Plus size={16} />
              <span>Novo Lançamento</span>
            </button>
          </div>
        </div>

        {/* Sub-menu Navigation Tabs */}
        <div
          className="scrollable-tabs-bar"
          style={{
            display: 'flex',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.75rem',
            gap: '0.5rem',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveSubTab('fluxo')}
            style={{
              padding: '0.65rem 1.15rem',
              background: activeSubTab === 'fluxo' ? 'var(--accent-gold-soft)' : 'transparent',
              border: activeSubTab === 'fluxo' ? '1px solid var(--accent-gold)' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              color: activeSubTab === 'fluxo' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease',
            }}
          >
            <FileText size={16} />
            <span>Lançamentos & Fluxo Geral</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('contas')}
            style={{
              padding: '0.65rem 1.15rem',
              background: activeSubTab === 'contas' ? 'var(--accent-gold-soft)' : 'transparent',
              border: activeSubTab === 'contas' ? '1px solid var(--accent-gold)' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              color: activeSubTab === 'contas' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease',
            }}
          >
            <Building size={16} />
            <span>Contas Bancárias & Caixas ({bankAccounts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('categorias')}
            style={{
              padding: '0.65rem 1.15rem',
              background: activeSubTab === 'categorias' ? 'var(--accent-gold-soft)' : 'transparent',
              border: activeSubTab === 'categorias' ? '1px solid var(--accent-gold)' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              color: activeSubTab === 'categorias' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease',
            }}
          >
            <Tag size={16} />
            <span>Plano de Contas / Categorias ({financialCategories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('eventos_caixa')}
            style={{
              padding: '0.65rem 1.15rem',
              background: activeSubTab === 'eventos_caixa' ? 'var(--accent-gold-soft)' : 'transparent',
              border: activeSubTab === 'eventos_caixa' ? '1px solid var(--accent-gold)' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              color: activeSubTab === 'eventos_caixa' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease',
            }}
          >
            <Ticket size={16} />
            <span>Caixa dos Eventos ({events.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB-MENU 1: LANÇAMENTOS & FLUXO DE CAIXA GERAL           */}
      {/* ======================================================== */}
      {activeSubTab === 'fluxo' && (
        <div className="animate-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Summary KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div
              className="card"
              style={{
                borderLeft: '4px solid var(--success)',
                background: 'var(--bg-secondary)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Entradas Realizadas
                  </span>
                  <h3 style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--text-primary)' }}>
                    {formatCurrency(totalInflow)}
                  </h3>
                </div>
                <div
                  style={{
                    background: 'var(--success-soft)',
                    color: 'var(--success)',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <ArrowUpRight size={22} />
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                {transactions.filter((t) => t.type === 'entrada').length} receitas registradas
              </span>
            </div>

            <div
              className="card"
              style={{
                borderLeft: '4px solid var(--danger)',
                background: 'var(--bg-secondary)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Saídas / Despesas
                  </span>
                  <h3 style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--text-primary)' }}>
                    {formatCurrency(totalOutflow)}
                  </h3>
                </div>
                <div
                  style={{
                    background: 'var(--danger-soft)',
                    color: 'var(--danger)',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <ArrowDownRight size={22} />
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                {transactions.filter((t) => t.type === 'saida').length} despesas quitadas
              </span>
            </div>

            <div
              className="card"
              style={{
                borderLeft: `4px solid ${netBalance >= 0 ? 'var(--accent-gold)' : 'var(--danger)'}`,
                background: 'var(--bg-secondary)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Saldo Operacional Consolidado
                  </span>
                  <h3
                    style={{
                      fontSize: '1.65rem',
                      fontWeight: 800,
                      marginTop: '0.35rem',
                      color: netBalance >= 0 ? 'var(--text-primary)' : 'var(--danger)',
                    }}
                  >
                    {formatCurrency(netBalance)}
                  </h3>
                </div>
                <div
                  style={{
                    background: 'var(--accent-gold-soft)',
                    color: 'var(--accent-gold)',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <DollarSign size={22} />
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                Distribuído em {bankAccounts.length} contas bancárias
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div
            className="card"
            style={{
              display: 'flex',
              gap: '0.85rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              padding: '1rem',
            }}
          >
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Buscar por descrição, membro ou recibo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.4rem', fontSize: '0.88rem' }}
              />
            </div>

            {/* Type Filter */}
            <div style={{ minWidth: '130px' }}>
              <select
                className="form-input"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                style={{ fontSize: '0.88rem' }}
              >
                <option value="todos">Todos os Tipos</option>
                <option value="entrada">Entradas (+)</option>
                <option value="saida">Saídas (-)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div style={{ minWidth: '160px' }}>
              <select
                className="form-input"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ fontSize: '0.88rem' }}
              >
                <option value="todos">Todas as Categorias</option>
                {financialCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.type === 'entrada' ? '+' : '-'})
                  </option>
                ))}
              </select>
            </div>

            {/* Account Filter */}
            <div style={{ minWidth: '160px' }}>
              <select
                className="form-input"
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                style={{ fontSize: '0.88rem' }}
              >
                <option value="todos">Todas as Contas</option>
                {bankAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Filter */}
            <div style={{ minWidth: '160px' }}>
              <select
                className="form-input"
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                style={{ fontSize: '0.88rem' }}
              >
                <option value="todos">Todos os Eventos</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>DATA</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>DESCRIÇÃO & VÍNCULO</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>CATEGORIA</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>CONTA / CAIXA</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>MEMBRO / FORNECEDOR</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>MÉTODO</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right' }}>VALOR</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'center' }}>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Nenhum lançamento encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const account = bankAccounts.find((a) => a.id === tx.bankAccountId) || defaultAccount;
                      const isEventTx = !!tx.eventId || !!tx.registrationId;

                      return (
                        <tr
                          key={tx.id}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                            {formatDate(tx.date)}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{tx.description}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                              {tx.receiptNumber && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                  #{tx.receiptNumber}
                                </span>
                              )}
                              {isEventTx && (
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--accent-gold-soft)',
                                    color: 'var(--accent-gold)',
                                    fontWeight: 700,
                                  }}
                                >
                                  🎪 {tx.eventName || 'Evento'}
                                </span>
                              )}
                              {tx.description.includes('Camisa') && (
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'rgba(59, 130, 246, 0.15)',
                                    color: 'var(--accent-blue-light)',
                                    fontWeight: 700,
                                  }}
                                >
                                  👕 Camisa
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{
                                padding: '0.25rem 0.6rem',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                background: tx.type === 'entrada' ? 'var(--success-soft)' : 'var(--danger-soft)',
                                color: tx.type === 'entrada' ? 'var(--success)' : 'var(--danger)',
                              }}
                            >
                              {tx.category}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                            {account ? (
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                🏦 {account.name}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Padrão</span>
                            )}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                            {tx.memberOrVendor}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                              {tx.paymentMethod}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: '0.85rem 1rem',
                              textAlign: 'right',
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                              color: tx.type === 'entrada' ? 'var(--success)' : 'var(--danger)',
                            }}
                          >
                            {tx.type === 'entrada' ? `+ ${formatCurrency(tx.amount)}` : `- ${formatCurrency(tx.amount)}`}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                              <button
                                type="button"
                                onClick={() => setReceiptTx(tx)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.35rem 0.6rem' }}
                                title="Visualizar e Imprimir Recibo"
                              >
                                <FileText size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditTxModal(tx)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.35rem 0.6rem' }}
                                title="Editar Lançamento"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTransaction(tx)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.35rem 0.6rem', color: 'var(--danger)' }}
                                title="Excluir Lançamento"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-MENU 2: CONTAS BANCÁRIAS & CAIXAS                    */}
      {/* ======================================================== */}
      {activeSubTab === 'contas' && (
        <div className="animate-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Contas Bancárias, Caixas e Cofres
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Gerencie as contas bancárias da igreja, caixas físicos e chaves PIX com saldo atualizado em tempo real.
              </p>
            </div>

            <button
              type="button"
              onClick={openNewAccountModal}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.45rem' }}
            >
              <Plus size={16} />
              <span>Nova Conta Bancária</span>
            </button>
          </div>

          {/* Accounts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {bankAccounts.map((acc) => {
              const liveBalance = getAccountLiveBalance(acc);
              const isDefault = !!acc.isDefault;

              return (
                <div
                  key={acc.id}
                  className="card"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: isDefault ? '2px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isDefault ? '0 4px 18px var(--accent-gold-glow)' : 'var(--shadow-sm)',
                    position: 'relative',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: acc.color ? `${acc.color}20` : 'var(--accent-gold-soft)',
                            color: acc.color || 'var(--accent-gold)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {acc.accountType === 'caixa_fisico' ? <Wallet size={20} /> : <Building size={20} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                            {acc.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {acc.bankName} • {acc.accountType === 'corrente' ? 'Conta Corrente' : (acc.accountType === 'caixa_fisico' ? 'Caixa Físico' : 'Poupança')}
                          </div>
                        </div>
                      </div>

                      {isDefault && (
                        <span
                          style={{
                            background: 'var(--accent-gold-soft)',
                            color: 'var(--accent-gold)',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--accent-gold)',
                          }}
                        >
                          Padrão
                        </span>
                      )}
                    </div>

                    {/* Account Details */}
                    <div
                      style={{
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                        fontSize: '0.82rem',
                        marginBottom: '1rem',
                      }}
                    >
                      {(acc.agency || acc.accountNumber) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Agência / Conta:</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {acc.agency ? `Ag: ${acc.agency} ` : ''} {acc.accountNumber ? `CC: ${acc.accountNumber}` : ''}
                          </span>
                        </div>
                      )}

                      {acc.pixKey && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Chave PIX:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-gold)' }}>
                              {acc.pixKey}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyPix(acc)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                              title="Copiar Chave PIX"
                            >
                              {copiedPixId === acc.id ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Saldo Inicial:</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(acc.initialBalance)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Balance and Actions */}
                  <div>
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Saldo Atual Conciliado
                      </span>
                      <div
                        style={{
                          fontSize: '1.65rem',
                          fontWeight: 800,
                          color: liveBalance >= 0 ? 'var(--text-primary)' : 'var(--danger)',
                          marginTop: '0.15rem',
                        }}
                      >
                        {formatCurrency(liveBalance)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      {!isDefault ? (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAccount(acc)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem' }}
                        >
                          Definir Padrão
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                          ✓ Conta Principal
                        </span>
                      )}

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => openEditAccountModal(acc)}
                          className="btn btn-secondary btn-sm"
                          title="Editar Conta"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAccount(acc)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)' }}
                          title="Excluir Conta"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-MENU 3: CATEGORIAS DE RECEITAS & DESPESAS           */}
      {/* ======================================================== */}
      {activeSubTab === 'categorias' && (
        <div className="animate-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Plano de Contas da Igreja
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Organize todas as fontes de receitas e despesas. As categorias alimentam os relatórios e o balancete oficial.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openNewCategoryModal('entrada')}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.45rem' }}
            >
              <Plus size={16} />
              <span>Nova Categoria</span>
            </button>
          </div>

          {/* Two-column layout: Receitas (Left) & Despesas (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {/* INCOMES COLUMN */}
            <div
              className="card"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'var(--success-soft)',
                      color: 'var(--success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ArrowUpRight size={18} />
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Categorias de Receitas (Entradas)
                  </h4>
                </div>

                <span
                  style={{
                    background: 'var(--success-soft)',
                    color: 'var(--success)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {financialCategories.filter((c) => c.type === 'entrada').length} categorias
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {financialCategories
                  .filter((c) => c.type === 'entrada')
                  .map((cat) => {
                    const categoryTotal = transactions
                      .filter((t) => t.category === cat.name && t.type === 'entrada')
                      .reduce((s, t) => s + t.amount, 0);

                    return (
                      <div
                        key={cat.id}
                        style={{
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '4px',
                              background: cat.color || '#10b981',
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                              {cat.name}
                            </div>
                            {cat.description && (
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {cat.description}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--success)' }}>
                            {formatCurrency(categoryTotal)}
                          </span>
                          <button
                            type="button"
                            onClick={() => openEditCategoryModal(cat)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem' }}
                            title="Editar Categoria"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
                            title="Excluir Categoria"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* EXPENSES COLUMN */}
            <div
              className="card"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'var(--danger-soft)',
                      color: 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ArrowDownRight size={18} />
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Categorias de Despesas (Saídas)
                  </h4>
                </div>

                <span
                  style={{
                    background: 'var(--danger-soft)',
                    color: 'var(--danger)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {financialCategories.filter((c) => c.type === 'saida').length} categorias
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {financialCategories
                  .filter((c) => c.type === 'saida')
                  .map((cat) => {
                    const categoryTotal = transactions
                      .filter((t) => t.category === cat.name && t.type === 'saida')
                      .reduce((s, t) => s + t.amount, 0);

                    return (
                      <div
                        key={cat.id}
                        style={{
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '4px',
                              background: cat.color || '#ef4444',
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                              {cat.name}
                            </div>
                            {cat.description && (
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {cat.description}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--danger)' }}>
                            {formatCurrency(categoryTotal)}
                          </span>
                          <button
                            type="button"
                            onClick={() => openEditCategoryModal(cat)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem' }}
                            title="Editar Categoria"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
                            title="Excluir Categoria"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-MENU 4: CAIXA ESPECÍFICO DOS EVENTOS                 */}
      {/* ======================================================== */}
      {activeSubTab === 'eventos_caixa' && (
        <div className="animate-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Event Selector Card */}
          <div
            className="card"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--accent-gold-soft)',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ticket size={22} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-gold)', letterSpacing: '0.5px', display: 'block' }}>
                  Selecionar Evento para Prestação de Contas
                </label>
                <select
                  className="form-input"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    marginTop: '0.25rem',
                    minWidth: '280px',
                    padding: '0.4rem 0.8rem',
                  }}
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.isFree ? 'Gratuito' : `R$ ${ev.price?.toFixed(2)}`})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => openNewTxModal(selectedEventId)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.4rem', color: 'var(--danger)' }}
              >
                <ArrowDownRight size={15} />
                <span>Lançar Despesa do Evento</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openNewTxModal(selectedEventId);
                  setTxType('entrada');
                }}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.4rem' }}
              >
                <Plus size={15} />
                <span>Nova Receita Avulsa</span>
              </button>
            </div>
          </div>

          {/* Event Financial KPIs */}
          {currentEvent && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.15rem' }}>
              <div className="card" style={{ background: 'var(--bg-secondary)', borderLeft: '4px solid var(--success)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Receita Total Arrecadada
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', margin: '0.35rem 0 0 0' }}>
                  {formatCurrency(eventTotalRevenue)}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  {eventPaidRegistrationsCount} inscrições confirmadas
                </span>
              </div>

              <div className="card" style={{ background: 'var(--bg-secondary)', borderLeft: '4px solid #3b82f6' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  👕 Camisas Vendidas
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6', margin: '0.35rem 0 0 0' }}>
                  {eventShirtsCount} un
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  Total em camisas: {formatCurrency(eventShirtsCount * (currentEvent.shirtPrice || 0))}
                </span>
              </div>

              <div className="card" style={{ background: 'var(--bg-secondary)', borderLeft: '4px solid var(--danger)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Custos & Despesas Alocadas
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)', margin: '0.35rem 0 0 0' }}>
                  {formatCurrency(eventTotalExpenses)}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  Locação, alimentação e logística
                </span>
              </div>

              <div
                className="card"
                style={{
                  background: 'var(--bg-secondary)',
                  borderLeft: `4px solid ${eventNetBalance >= 0 ? 'var(--accent-gold)' : 'var(--danger)'}`,
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Saldo Líquido do Evento
                </span>
                <h3
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: eventNetBalance >= 0 ? 'var(--accent-gold)' : 'var(--danger)',
                    margin: '0.35rem 0 0 0',
                  }}
                >
                  {formatCurrency(eventNetBalance)}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  Resultado financeiro final
                </span>
              </div>
            </div>
          )}

          {/* Event Transactions Table */}
          <div
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                Extrato Financeiro do Evento ({eventTransactions.length} lançamentos)
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Alimentado automaticamente conforme participantes se inscrevem e pagam
              </span>
            </div>

            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>DATA</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>PARTICIPANTE / HISTÓRICO</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>TIPO & CATEGORIA</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>PAGAMENTO</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>STATUS</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right' }}>VALOR</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'center' }}>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {eventTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Nenhum lançamento financeiro registrado para este evento ainda. Conforme as inscrições forem validadas no módulo de eventos, elas surgirão automaticamente aqui.
                      </td>
                    </tr>
                  ) : (
                    eventTransactions.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                          {formatDate(tx.date)}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{tx.description}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {tx.memberOrVendor} {tx.receiptNumber ? `• Recibo: ${tx.receiptNumber}` : ''}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: tx.type === 'entrada' ? 'var(--success-soft)' : 'var(--danger-soft)',
                              color: tx.type === 'entrada' ? 'var(--success)' : 'var(--danger)',
                            }}
                          >
                            {tx.type === 'entrada' ? 'Receita' : 'Despesa'} • {tx.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          {tx.paymentMethod}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: tx.status === 'confirmado' ? 'var(--success-soft)' : 'var(--warning-soft)',
                              color: tx.status === 'confirmado' ? 'var(--success)' : 'var(--warning)',
                            }}
                          >
                            {tx.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '0.85rem 1rem',
                            textAlign: 'right',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            color: tx.type === 'entrada' ? 'var(--success)' : 'var(--danger)',
                          }}
                        >
                          {tx.type === 'entrada' ? `+ ${formatCurrency(tx.amount)}` : `- ${formatCurrency(tx.amount)}`}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => setReceiptTx(tx)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.3rem 0.55rem' }}
                              title="Ver Recibo"
                            >
                              <FileText size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTransaction(tx)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.3rem 0.55rem', color: 'var(--danger)' }}
                              title="Excluir"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: NOVO / EDITAR LANÇAMENTO FINANCEIRO               */}
      {/* ======================================================== */}
      <Modal
        isOpen={isNewTxModalOpen}
        onClose={() => setIsNewTxModalOpen(false)}
        title={editingTx ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
      >
        <form onSubmit={handleSaveTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Tipo de Lançamento *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setTxType('entrada')}
                  className="btn"
                  style={{
                    flex: 1,
                    background: txType === 'entrada' ? 'var(--success)' : 'var(--bg-tertiary)',
                    color: txType === 'entrada' ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  Entrada (+)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('saida')}
                  className="btn"
                  style={{
                    flex: 1,
                    background: txType === 'saida' ? 'var(--danger)' : 'var(--bg-tertiary)',
                    color: txType === 'saida' ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  Saída (-)
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                className="form-input"
                placeholder="0,00"
                value={txAmount || ''}
                onChange={(e) => setTxAmount(parseFloat(e.target.value) || 0)}
                style={{ fontWeight: 800, fontSize: '1.1rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição do Lançamento *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: Oferta de Culto de Domingo, Pagamento de Conta de Luz, etc."
              value={txDescription}
              onChange={(e) => setTxDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Categoria *</label>
              <select
                className="form-input"
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value)}
              >
                {financialCategories
                  .filter((c) => c.type === txType)
                  .map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Conta Bancária / Caixa *</label>
              <select
                className="form-input"
                value={txAccountId}
                onChange={(e) => setTxAccountId(e.target.value)}
              >
                {bankAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.bankName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Evento Associado (Opcional)</label>
              <select
                className="form-input"
                value={txEventId}
                onChange={(e) => setTxEventId(e.target.value)}
              >
                <option value="">Nenhum (Despesa/Receita Geral)</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Método de Pagamento</label>
              <select
                className="form-input"
                value={txPaymentMethod}
                onChange={(e) => setTxPaymentMethod(e.target.value as any)}
              >
                <option value="pix">PIX</option>
                <option value="dinheiro">Dinheiro / Espécie</option>
                <option value="cartao">Cartão de Crédito / Débito</option>
                <option value="transferencia">Transferência Bancária / TED</option>
                <option value="boleto">Boleto Bancário</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Membro ou Fornecedor</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Nome do Membro ou Razão Social"
                value={txMemberOrVendor}
                onChange={(e) => setTxMemberOrVendor(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data do Lançamento *</label>
              <input
                type="date"
                required
                className="form-input"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsNewTxModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: '0.45rem' }}>
              <CheckCircle2 size={16} />
              <span>Salvar Lançamento</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: NOVA / EDITAR CONTA BANCÁRIA                      */}
      {/* ======================================================== */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title={editingAccount ? 'Editar Conta Bancária' : 'Cadastrar Nova Conta Bancária'}
      >
        <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Nome da Conta / Identificador *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: Bradesco - Conta Corrente Principal, Nubank Secretaria, Caixa Físico"
              value={accountForm.name}
              onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Instituição / Banco *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: Banco Bradesco, Nubank, Banco do Brasil, Dinheiro"
                value={accountForm.bankName}
                onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Conta *</label>
              <select
                className="form-input"
                value={accountForm.accountType}
                onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value as any })}
              >
                <option value="corrente">Conta Corrente</option>
                <option value="poupanca">Conta Poupança</option>
                <option value="caixa_fisico">Caixa Físico / Espécie</option>
                <option value="investimento">Investimento / Reserva</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Agência (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: 3210-4"
                value={accountForm.agency || ''}
                onChange={(e) => setAccountForm({ ...accountForm, agency: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Número da Conta (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: 12345-6"
                value={accountForm.accountNumber || ''}
                onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Chave PIX (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: 92991279663 ou contato@macdp.com.br"
                value={accountForm.pixKey || ''}
                onChange={(e) => setAccountForm({ ...accountForm, pixKey: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Saldo Inicial (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                className="form-input"
                placeholder="0,00"
                value={accountForm.initialBalance || ''}
                onChange={(e) => setAccountForm({ ...accountForm, initialBalance: parseFloat(e.target.value) || 0 })}
                style={{ fontWeight: 700 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Cor de Destaque da Conta</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <input
                  type="color"
                  value={accountForm.color || '#d97706'}
                  onChange={(e) => setAccountForm({ ...accountForm, color: e.target.value })}
                  style={{ width: '46px', height: '40px', padding: '2px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-medium)' }}
                />
                <input
                  type="text"
                  className="form-input"
                  value={accountForm.color || '#d97706'}
                  onChange={(e) => setAccountForm({ ...accountForm, color: e.target.value })}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={accountForm.isDefault}
                  onChange={(e) => setAccountForm({ ...accountForm, isDefault: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Definir como Conta Padrão da Igreja</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observações / Notas</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Ex: Informações sobre finalidade da conta, autorizados a movimentar, etc."
              value={accountForm.notes || ''}
              onChange={(e) => setAccountForm({ ...accountForm, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsAccountModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: '0.45rem' }}>
              <CheckCircle2 size={16} />
              <span>Salvar Conta</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: NOVA / EDITAR CATEGORIA FINANCEIRA                */}
      {/* ======================================================== */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Editar Categoria' : 'Cadastrar Nova Categoria'}
      >
        <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Nome da Categoria *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: Dízimo, Cantina, Aluguel do Templo, Som & Mídia"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Tipo de Categoria *</label>
              <select
                className="form-input"
                value={categoryForm.type}
                onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value as any })}
              >
                <option value="entrada">Receita / Entrada (+)</option>
                <option value="saida">Despesa / Saída (-)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cor de Identificação</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <input
                  type="color"
                  value={categoryForm.color || '#10b981'}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  style={{ width: '46px', height: '40px', padding: '2px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-medium)' }}
                />
                <input
                  type="text"
                  className="form-input"
                  value={categoryForm.color || '#10b981'}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição / Finalidade</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Destinado para o sustento de missionários no campo"
              value={categoryForm.description || ''}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: '0.45rem' }}>
              <CheckCircle2 size={16} />
              <span>Salvar Categoria</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: RECIBO OFICIAL DA IGREJA                          */}
      {/* ======================================================== */}
      <Modal
        isOpen={!!receiptTx}
        onClose={() => setReceiptTx(null)}
        title="Recibo Financeiro Oficial"
        maxWidth="620px"
      >
        {receiptTx && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              id="printable-receipt"
              className="printable-area"
              style={{
                background: '#ffffff',
                color: '#0f172a',
                padding: '2rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
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
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    MINISTÉRIO APOSTÓLICO CAÇADORES DA PRESENÇA (MACDP)
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0.2rem 0 0 0' }}>
                    Rua Lagoa Grande, 382 - Canaranas, Manaus/AM • Tel/Pix: (92) 99127-9663
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#d97706', display: 'block' }}>
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
                <strong style={{ color: '#059669', fontSize: '1.05rem' }}>{formatCurrency(receiptTx.amount)}</strong>, referente a{' '}
                <strong>{receiptTx.category} ({receiptTx.description})</strong>, efetuada via{' '}
                <strong>{receiptTx.paymentMethod.toUpperCase()}</strong> na data de{' '}
                <strong>{formatDate(receiptTx.date)}</strong>.
              </p>

              {receiptTx.eventName && (
                <div style={{ background: '#fef3c7', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#92400e', marginBottom: '1rem' }}>
                  🎪 <strong>Evento Vinculado:</strong> {receiptTx.eventName}
                </div>
              )}

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px dashed #94a3b8',
                  borderRadius: '6px',
                  padding: '0.85rem',
                  margin: '1.5rem 0',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Código de Autenticação Digital:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    SHA256-{Math.random().toString(36).substring(2, 12).toUpperCase()}
                  </span>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.35rem' }}>
                  Documento emitido para fins de comprovação eclesiástica perante a tesouraria.
                </div>
              </div>

              {/* Signature Line */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginTop: '2.5rem',
                  paddingTop: '1rem',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                  Manaus - AM, {formatDate(receiptTx.date)}
                </div>
                <div style={{ textAlign: 'center', width: '220px', borderTop: '1px solid #0f172a', paddingTop: '0.4rem' }}>
                  <strong style={{ fontSize: '0.825rem', display: 'block' }}>Diretoria de Tesouraria</strong>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>MACDP Central</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setReceiptTx(null)}
                className="btn btn-secondary"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => handleOpenReceiptInNewTab(receiptTx)}
                className="btn btn-secondary"
                style={{ gap: '0.4rem' }}
                title="Visualizar em uma nova guia para salvar ou inspecionar"
              >
                <ExternalLink size={15} />
                <span>Ver em Nova Guia</span>
              </button>
              <button
                type="button"
                onClick={() => handlePrintReceipt(receiptTx)}
                className="btn btn-primary"
                style={{ gap: '0.4rem' }}
              >
                <Printer size={16} />
                <span>Imprimir / Salvar PDF</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: BALANCETE FINANCEIRO MENSAL                       */}
      {/* ======================================================== */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Balancete Financeiro Mensal Consolidado"
        maxWidth="740px"
      >
        <div style={{ fontSize: '0.9rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Demonstrativo Financeiro Consolidado</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Prestação de contas do Ministério Apostólico Caçadores da Presença (MACDP) — Exercício 2026
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ color: 'var(--success)', fontWeight: 700, marginBottom: '0.5rem' }}>Total Entradas Realizadas</h4>
              <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>{formatCurrency(totalInflow)}</p>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ color: 'var(--danger)', fontWeight: 700, marginBottom: '0.5rem' }}>Total Saídas / Despesas</h4>
              <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>{formatCurrency(totalOutflow)}</p>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Saldos por Conta Bancária:</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', padding: 0 }}>
              {bankAccounts.map((acc) => {
                const bal = getAccountLiveBalance(acc);
                return (
                  <li key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span>🏦 {acc.name} ({acc.bankName}):</span>
                    <strong style={{ color: bal >= 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                      {formatCurrency(bal)}
                    </strong>
                  </li>
                );
              })}
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setIsReportModalOpen(false)} className="btn btn-secondary">
              Fechar
            </button>
            <button onClick={handlePrintFinancialReport} className="btn btn-primary" style={{ gap: '0.4rem' }}>
              <Printer size={16} />
              <span>Imprimir Relatório</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
