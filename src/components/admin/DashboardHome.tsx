import React from 'react';
import { DatabaseSchema, ChurchStats } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import {
  Users,
  TrendingUp,
  HeartHandshake,
  DollarSign,
  Compass,
  AlertCircle,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  Heart,
} from 'lucide-react';

interface DashboardHomeProps {
  db: DatabaseSchema;
  stats: ChurchStats;
  onNavigateTab: (tab: string) => void;
  onOpenNewMemberModal: () => void;
  onOpenNewTransactionModal: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  db,
  stats,
  onNavigateTab,
  onOpenNewMemberModal,
  onOpenNewTransactionModal,
}) => {
  // Weekly attendance points (last 8 weeks)
  const attendanceWeeks = [
    { label: 'Sem 1', attendance: 880 },
    { label: 'Sem 2', attendance: 920 },
    { label: 'Sem 3', attendance: 890 },
    { label: 'Sem 4', attendance: 960 },
    { label: 'Sem 5', attendance: 1020 },
    { label: 'Sem 6', attendance: 1010 },
    { label: 'Sem 7', attendance: 1150 },
    { label: 'Sem 8', attendance: 1210 },
  ];
  const maxAttendance = Math.max(...attendanceWeeks.map((w) => w.attendance));

  const pendingPrayers = db.prayers.filter((p) => p.status === 'novo');
  const recentTransactions = db.transactions.slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 4 KPI Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Card 1: Membros Ativos */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Membros Ativos
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--accent-blue-soft)',
                color: 'var(--accent-blue-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>
            {stats.totalActiveMembers.toLocaleString('pt-BR')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--success)' }}>
            <ArrowUpRight size={15} />
            <span>+4.2% em relação ao mês anterior</span>
          </div>
        </div>

        {/* Card 2: Presença Média */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Presença Média nos Cultos
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--accent-gold-soft)',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>
            {stats.averageAttendance}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--success)' }}>
            <ArrowUpRight size={15} />
            <span>+{stats.attendanceGrowth}% nos últimos 60 dias</span>
          </div>
        </div>

        {/* Card 3: Visitantes do Mês */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Novos Visitantes / Decididos
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--success-soft)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HeartHandshake size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>
            {stats.monthlyVisitors}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>{db.visitors.length} no funil de integração ativa</span>
          </div>
        </div>

        {/* Card 4: Saldo Financeiro Líquido */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Saldo Financeiro Mensal
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--accent-gold-soft)',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={18} />
            </div>
          </div>
          <div
            style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              lineHeight: 1,
              color: stats.netBalance >= 0 ? 'var(--success)' : 'var(--danger)',
            }}
          >
            {formatCurrency(stats.netBalance)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Entradas: {formatCurrency(stats.monthlyRevenue)} • Saídas: {formatCurrency(stats.monthlyExpenses)}
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Ações Rápidas:
        </span>
        <button onClick={onOpenNewMemberModal} className="btn btn-sm btn-primary" style={{ gap: '0.4rem' }}>
          <PlusCircle size={15} />
          <span>Cadastrar Novo Membro</span>
        </button>
        <button onClick={onOpenNewTransactionModal} className="btn btn-sm btn-secondary" style={{ gap: '0.4rem' }}>
          <DollarSign size={15} />
          <span>Novo Lançamento Financeiro</span>
        </button>
        <button onClick={() => onNavigateTab('celulas_admin')} className="btn btn-sm btn-secondary" style={{ gap: '0.4rem' }}>
          <Compass size={15} />
          <span>Gerenciar Células & Grupos</span>
        </button>
        <button onClick={() => onNavigateTab('oracao_admin')} className="btn btn-sm btn-secondary" style={{ gap: '0.4rem' }}>
          <Heart size={15} />
          <span>Triar Pedidos de Oração ({pendingPrayers.length})</span>
        </button>
      </div>

      {/* Visual Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Chart 1: Evolução de Presença */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Evolução de Presença nos Cultos</h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Frequência total somada dos cultos (últimas 8 semanas)</span>
            </div>
            <span className="badge badge-gold">Em Alta</span>
          </div>

          {/* SVG Line / Bar Chart Representation */}
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            {attendanceWeeks.map((item, index) => {
              const heightPercent = Math.round((item.attendance / maxAttendance) * 100);
              const isLatest = index === attendanceWeeks.length - 1;
              return (
                <div
                  key={item.label}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: isLatest ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                    {item.attendance}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPercent}%`,
                      background: isLatest
                        ? 'linear-gradient(to top, var(--accent-gold), var(--accent-gold-light))'
                        : 'var(--accent-blue-soft)',
                      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Comparativo Financeiro */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Fluxo de Caixa Mensal</h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Entradas de Dízimos/Ofertas vs Saídas Operacionais</span>
            </div>
            <button onClick={() => onNavigateTab('financeiro')} className="btn btn-sm btn-secondary">
              Ver Extrato
            </button>
          </div>

          {/* Breakdown bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--success)' }}>Entradas (Dízimos & Doações)</span>
                <strong>{formatCurrency(stats.monthlyRevenue)}</strong>
              </div>
              <div style={{ height: '14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: 'var(--success)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--danger)' }}>Saídas (Contas, Ajuda Social, Manutenção)</span>
                <strong>{formatCurrency(stats.monthlyExpenses)}</strong>
              </div>
              <div style={{ height: '14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: '52%', height: '100%', background: 'var(--danger)' }} />
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.5rem',
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Superávit / Reserva do Mês:</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--success)' }}>
                +{formatCurrency(stats.netBalance)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Two columns: Recent Transactions & Pending Prayers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Recent Financial Transactions */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Últimos Lançamentos Financeiros</h4>
            <button onClick={() => onNavigateTab('financeiro')} className="btn btn-sm btn-secondary">
              Gerenciar Finanças
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.85rem', display: 'block' }}>{tx.description}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {tx.category} • {tx.memberOrVendor}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong
                    style={{
                      fontSize: '0.9rem',
                      display: 'block',
                      color: tx.type === 'entrada' ? 'var(--success)' : 'var(--danger)',
                    }}
                  >
                    {tx.type === 'entrada' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {tx.paymentMethod}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Prayer Requests for Pastoral Triage */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Central de Oração (Triagem Pendente)</h4>
            <span className="badge badge-gold">{pendingPrayers.length} novos</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingPrayers.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum pedido aguardando triagem.</p>
            ) : (
              pendingPrayers.map((prayer) => (
                <div
                  key={prayer.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    borderLeft: '3px solid var(--accent-gold)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <strong style={{ fontSize: '0.85rem' }}>{prayer.requesterName}</strong>
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                      {prayer.category}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                    "{prayer.message}"
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {prayer.requestPastoralContact ? '⚠️ Solicitou contato pastoral' : 'Apenas intercessão'}
                    </span>
                    <button
                      onClick={() => onNavigateTab('oracao_admin')}
                      className="btn btn-sm btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                    >
                      Atender Pedido
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
