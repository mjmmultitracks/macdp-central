import React from 'react';
import { DatabaseSchema, ChurchStats, UserSession } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { isUserModuleAllowed } from '../../services/authService';
import { Plus } from 'lucide-react';

interface DashboardHomeProps {
  db: DatabaseSchema;
  stats: ChurchStats;
  onNavigateTab: (tab: string) => void;
  onOpenNewMemberModal: () => void;
  onOpenNewTransactionModal: () => void;
  currentUser?: UserSession;
}

const panel: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 8,
};

const Kpi: React.FC<{ label: string; value: React.ReactNode; hint?: string; color?: string; onClick?: () => void }> = ({
  label,
  value,
  hint,
  color,
  onClick,
}) => (
  <div
    onClick={onClick}
    style={{ ...panel, padding: '1.1rem 1.25rem', cursor: onClick ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
  >
    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
    <span style={{ fontSize: '1.7rem', fontWeight: 800, lineHeight: 1.1, color: color || 'var(--text-primary)' }}>{value}</span>
    {hint && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{hint}</span>}
  </div>
);

const SectionHead: React.FC<{ title: string; action?: { label: string; onClick: () => void } }> = ({ title, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{title}</h4>
    {action && (
      <button onClick={action.onClick} className="btn btn-sm btn-secondary">
        {action.label}
      </button>
    )}
  </div>
);

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  db,
  stats,
  onNavigateTab,
  onOpenNewMemberModal,
  onOpenNewTransactionModal,
  currentUser,
}) => {
  const isFinanceAllowed = !currentUser || isUserModuleAllowed(currentUser, 'financeiro');
  const isMembersAllowed = !currentUser || isUserModuleAllowed(currentUser, 'membros');
  const isPrayerAllowed = !currentUser || isUserModuleAllowed(currentUser, 'oracao_admin');

  const pendingPrayers = db.prayers.filter((p) => p.status === 'novo');
  const recentTransactions = db.transactions.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
        {isMembersAllowed && (
          <button onClick={onOpenNewMemberModal} className="btn btn-sm btn-primary" style={{ gap: '0.35rem' }}>
            <Plus size={15} /> Novo membro
          </button>
        )}
        {isFinanceAllowed && (
          <button onClick={onOpenNewTransactionModal} className="btn btn-sm btn-secondary" style={{ gap: '0.35rem' }}>
            <Plus size={15} /> Novo lançamento
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <Kpi label="Membros ativos" value={stats.totalActiveMembers.toLocaleString('pt-BR')} onClick={isMembersAllowed ? () => onNavigateTab('membros') : undefined} />
        <Kpi label="Visitantes no funil" value={db.visitors.length} hint="Em acompanhamento" onClick={isMembersAllowed ? () => onNavigateTab('membros') : undefined} />
        {isPrayerAllowed && (
          <Kpi
            label="Orações a triar"
            value={pendingPrayers.length}
            color={pendingPrayers.length ? 'var(--accent-gold)' : undefined}
            onClick={() => onNavigateTab('oracao_admin')}
          />
        )}
        {isFinanceAllowed && (
          <Kpi
            label="Saldo do mês"
            value={formatCurrency(stats.netBalance)}
            color={stats.netBalance >= 0 ? 'var(--success)' : 'var(--danger)'}
            hint={`Entradas ${formatCurrency(stats.monthlyRevenue)} · Saídas ${formatCurrency(stats.monthlyExpenses)}`}
            onClick={() => onNavigateTab('financeiro')}
          />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1rem' }}>
        {isFinanceAllowed && (
          <div style={panel}>
            <SectionHead title="Últimos lançamentos" action={{ label: 'Ver todos', onClick: () => onNavigateTab('financeiro') }} />
            {recentTransactions.length === 0 ? (
              <p style={{ padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum lançamento ainda.</p>
            ) : (
              recentTransactions.map((tx, i) => (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    padding: '0.75rem 1.25rem',
                    borderTop: i ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ fontSize: '0.85rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.category}</span>
                  </div>
                  <strong style={{ fontSize: '0.88rem', whiteSpace: 'nowrap', color: tx.type === 'entrada' ? 'var(--success)' : 'var(--danger)' }}>
                    {tx.type === 'entrada' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </strong>
                </div>
              ))
            )}
          </div>
        )}

        {isPrayerAllowed && (
          <div style={panel}>
            <SectionHead title="Pedidos de oração pendentes" action={{ label: 'Abrir central', onClick: () => onNavigateTab('oracao_admin') }} />
            {pendingPrayers.length === 0 ? (
              <p style={{ padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum pedido aguardando triagem.</p>
            ) : (
              pendingPrayers.slice(0, 5).map((prayer, i) => (
                <div key={prayer.id} style={{ padding: '0.75rem 1.25rem', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <strong style={{ fontSize: '0.85rem' }}>{prayer.requesterName}</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{prayer.category}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {prayer.message}
                  </p>
                  {prayer.requestPastoralContact && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)' }}>Pediu contato pastoral</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
