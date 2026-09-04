import React, { useState } from 'react';
import { SystemAccessUser, PanelModuleId } from '../../types';
import {
  addAccessUser,
  updateAccessUser,
  deleteAccessUser,
} from '../../services/db';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import {
  KeyRound,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Users,
  Plus,
  Search,
  CheckCircle2,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  Mail,
  Phone,
  LayoutDashboard,
  Compass,
  Sparkles,
  GraduationCap,
  Baby,
  Archive,
  HeartHandshake,
  DollarSign,
  Calendar,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  Building2,
} from 'lucide-react';

interface AccessManagerProps {
  accessUsers: SystemAccessUser[];
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

interface ModuleOption {
  id: PanelModuleId;
  label: string;
  icon: any;
  category: string;
}

const AVAILABLE_MODULES: ModuleOption[] = [
  { id: 'dashboard', label: 'Dashboard Geral', icon: LayoutDashboard, category: 'Geral' },
  { id: 'membros', label: 'Membros & CRM Visitantes', icon: Users, category: 'Pessoas' },
  { id: 'celulas_admin', label: 'Células & Grupos', icon: Compass, category: 'Comunhão' },
  { id: 'ministerios_admin', label: 'Ministérios', icon: Sparkles, category: 'Serviço' },
  { id: 'ensino_admin', label: 'Ensino & Discipulado', icon: GraduationCap, category: 'Ensino' },
  { id: 'kids_admin', label: 'KIDS & EBF', icon: Baby, category: 'Infantil' },
  { id: 'patrimonio_admin', label: 'Patrimônio & Bens', icon: Archive, category: 'Patrimônio' },
  { id: 'pastoral_admin', label: 'Área Pastoral & Gabinete', icon: HeartHandshake, category: 'Pastoral' },
  { id: 'financeiro', label: 'Gestão Financeira', icon: DollarSign, category: 'Administração' },
  { id: 'eventos_admin', label: 'Eventos & Reservas', icon: Calendar, category: 'Eventos' },
  { id: 'oracao_admin', label: 'Central de Oração', icon: HeartHandshake, category: 'Pastoral' },
  { id: 'acessos_admin', label: 'Gestão de Acessos', icon: KeyRound, category: 'Segurança' },
  { id: 'config_igreja', label: 'Configurações da Igreja', icon: Building2, category: 'Administração' },
];

export const AccessManager: React.FC<AccessManagerProps> = ({
  accessUsers,
  onNotify,
}) => {
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemAccessUser | null>(null);

  // Form Fields
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('macdp2026');
  const [showPassword, setShowPassword] = useState(false);
  const [userPhone, setUserPhone] = useState('92984509989');
  const [roleTitle, setRoleTitle] = useState('Pastor Auxiliar');
  const [roleType, setRoleType] = useState<SystemAccessUser['roleType']>('Pastor');
  const [userStatus, setUserStatus] = useState<SystemAccessUser['status']>('ativo');
  const [canEdit, setCanEdit] = useState<boolean>(true);
  const [allowedModules, setAllowedModules] = useState<PanelModuleId[]>([
    'dashboard',
    'membros',
    'celulas_admin',
    'pastoral_admin',
  ]);
  const [userNotes, setUserNotes] = useState('');

  // Handlers
  const openNewUserModal = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserPassword('macdp2026');
    setShowPassword(false);
    setUserPhone('92984509989');
    setRoleTitle('Pastor Auxiliar');
    setRoleType('Pastor');
    setUserStatus('ativo');
    setCanEdit(true);
    setAllowedModules(['dashboard', 'membros', 'celulas_admin', 'pastoral_admin', 'oracao_admin']);
    setUserNotes('');
    setIsModalOpen(true);
  };

  const openEditUserModal = (user: SystemAccessUser) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserPassword(user.password || 'macdp2026');
    setShowPassword(false);
    setUserPhone(user.phone || '');
    setRoleTitle(user.roleTitle);
    setRoleType(user.roleType);
    setUserStatus(user.status);
    setCanEdit(user.canEdit);
    setAllowedModules([...user.allowedModules]);
    setUserNotes(user.notes || '');
    setIsModalOpen(true);
  };

  const toggleModule = (modId: PanelModuleId) => {
    if (allowedModules.includes(modId)) {
      setAllowedModules(allowedModules.filter((m) => m !== modId));
    } else {
      setAllowedModules([...allowedModules, modId]);
    }
  };

  const selectAllModules = () => {
    setAllowedModules(AVAILABLE_MODULES.map((m) => m.id));
  };

  const clearAllModules = () => {
    setAllowedModules(['dashboard']);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      onNotify('error', 'Preencha o nome e o e-mail da pessoa.');
      return;
    }

    const trimmedPassword = userPassword.trim() || 'macdp2026';
    if (trimmedPassword.length < 6) {
      onNotify('error', 'A senha deve ter no mínimo 6 dígitos para segurança.');
      return;
    }

    if (allowedModules.length === 0) {
      onNotify('error', 'Selecione ao menos um módulo permitido para este usuário.');
      return;
    }

    if (editingUser) {
      updateAccessUser(editingUser.id, {
        name: userName,
        email: userEmail,
        password: trimmedPassword,
        phone: userPhone,
        roleTitle,
        roleType,
        status: userStatus,
        allowedModules,
        canEdit,
        notes: userNotes,
      });
      onNotify('success', `Acessos e senha de "${userName}" atualizados com sucesso!`);
    } else {
      addAccessUser({
        name: userName,
        email: userEmail,
        password: trimmedPassword,
        phone: userPhone,
        roleTitle,
        roleType,
        status: userStatus,
        allowedModules,
        canEdit,
        notes: userNotes,
      });
      onNotify('success', `Usuário "${userName}" cadastrado com senha protegida!`);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (user: SystemAccessUser) => {
    const newStatus = user.status === 'ativo' ? 'bloqueado' : 'ativo';
    updateAccessUser(user.id, { status: newStatus });
    onNotify(
      newStatus === 'ativo' ? 'success' : 'info',
      `Acesso de "${user.name}" foi ${newStatus === 'ativo' ? 'ativado' : 'bloqueado'}.`
    );
  };

  const handleDeleteUser = (user: SystemAccessUser) => {
    if (window.confirm(`Deseja revogar e excluir permanentemente o acesso de "${user.name}"?`)) {
      deleteAccessUser(user.id);
      onNotify('info', `Acesso de "${user.name}" revogado com sucesso.`);
    }
  };

  // Metrics
  const totalUsers = accessUsers.length;
  const adminCount = accessUsers.filter((u) => u.roleType === 'Administrador').length;
  const pastoralCount = accessUsers.filter((u) => u.roleType === 'Pastor').length;
  const blockedCount = accessUsers.filter((u) => u.status === 'bloqueado').length;

  const filteredUsers = accessUsers.filter((u) => {
    const matchSearch =
      !searchTerm ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.roleTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRole = roleFilter === 'todos' || u.roleType === roleFilter;
    const matchStatus = statusFilter === 'todos' || u.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Toolbar */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <KeyRound size={22} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Gestão de Acessos & Permissões (MACDP)</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Cadastre as pessoas com acesso ao painel de controle e configure suas limitações e módulos autorizados
          </p>
        </div>

        <button onClick={openNewUserModal} className="btn btn-primary" style={{ gap: '0.45rem' }}>
          <Plus size={16} />
          <span>Novo Usuário de Acesso</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Usuários com Acesso</span>
            <Users size={18} color="var(--accent-gold)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
            {totalUsers}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Liderança e colaboradores cadastrados
          </div>
        </div>

        <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Administradores Gerais</span>
            <ShieldCheck size={18} color="var(--status-success)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--status-success)' }}>
            {adminCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Controle total irrestrito
          </div>
        </div>

        <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pastores & Liderança</span>
            <UserCheck size={18} color="var(--accent-blue-light)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-blue-light)' }}>
            {pastoralCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Acesso ao cuidado de vidas
          </div>
        </div>

        <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Acessos Bloqueados</span>
            <ShieldAlert size={18} color={blockedCount > 0 ? '#EF4444' : 'var(--text-muted)'} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: blockedCount > 0 ? '#EF4444' : 'var(--text-muted)' }}>
            {blockedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Contas suspensas temporariamente
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '380px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Buscar por nome, e-mail ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="todos">Todos os Perfis</option>
            <option value="Administrador">Administrador</option>
            <option value="Pastor">Pastor</option>
            <option value="Secretaria">Secretaria</option>
            <option value="Tesouraria">Tesouraria</option>
            <option value="Liderança">Liderança</option>
            <option value="Voluntário">Voluntário</option>
          </select>

          <select
            className="form-select"
            style={{ width: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos Status</option>
            <option value="ativo">Ativos</option>
            <option value="bloqueado">Bloqueados</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="card card-hover"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.15rem 1.35rem',
              border: `1px solid ${
                user.status === 'bloqueado'
                  ? '#EF4444'
                  : user.roleType === 'Administrador'
                  ? 'var(--accent-gold)'
                  : 'var(--border-medium)'
              }`,
              opacity: user.status === 'bloqueado' ? 0.75 : 1,
              borderRadius: 'var(--radius-lg)',
              gap: '1.25rem',
              flexWrap: 'wrap',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Left Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 360px', minWidth: 0 }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background:
                    user.roleType === 'Administrador'
                      ? 'rgba(245, 158, 11, 0.12)'
                      : user.roleType === 'Pastor'
                      ? 'rgba(59, 130, 246, 0.12)'
                      : 'rgba(255, 255, 255, 0.08)',
                  border: `1px solid ${
                    user.roleType === 'Administrador'
                      ? 'rgba(245, 158, 11, 0.3)'
                      : user.roleType === 'Pastor'
                      ? 'rgba(59, 130, 246, 0.3)'
                      : 'var(--border-subtle)'
                  }`,
                  color:
                    user.roleType === 'Administrador'
                      ? 'var(--accent-gold)'
                      : user.roleType === 'Pastor'
                      ? 'var(--accent-blue-light)'
                      : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <KeyRound size={22} />
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {user.name}
                  </h4>

                  <span
                    style={{
                      background:
                        user.roleType === 'Administrador'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : user.roleType === 'Pastor'
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'rgba(255, 255, 255, 0.08)',
                      color:
                        user.roleType === 'Administrador'
                          ? 'var(--accent-gold)'
                          : user.roleType === 'Pastor'
                          ? 'var(--accent-blue-light)'
                          : 'var(--text-secondary)',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                    }}
                  >
                    {user.roleType.toUpperCase()}
                  </span>

                  <span
                    className={`badge ${user.status === 'ativo' ? 'badge-success' : 'badge-danger'}`}
                    style={{ fontSize: '0.72rem' }}
                  >
                    {user.status === 'ativo' ? 'Ativo' : 'Bloqueado'}
                  </span>

                  <span style={{ fontSize: '0.82rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
                    • {user.roleTitle}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', flexWrap: 'wrap', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={13} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                    <span>{user.email}</span>
                  </div>

                  {user.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Phone size={13} color="var(--accent-blue-light)" style={{ flexShrink: 0 }} />
                      <span>{user.phone}</span>
                    </div>
                  )}

                  <span style={{ color: 'var(--text-muted)' }}>
                    {user.canEdit ? '⚡ Acesso Total' : '👁️ Somente Leitura'}
                  </span>

                  <span style={{ color: 'var(--accent-gold-light)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <KeyRound size={12} />
                    Senha: {user.password ? 'Protegida' : 'macdp2026 (Padrão)'}
                  </span>

                  {user.lastAccess && (
                    <span style={{ color: 'var(--text-muted)' }}>
                      • Último acesso: {user.lastAccess}
                    </span>
                  )}
                </div>

                {/* Modules pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Módulos:</span>
                  {user.allowedModules.map((modId) => {
                    const found = AVAILABLE_MODULES.find((m) => m.id === modId);
                    return (
                      <span
                        key={modId}
                        style={{
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          padding: '0.1rem 0.4rem',
                          fontSize: '0.7rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {found?.label || modId}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => openEditUserModal(user)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem', padding: '0.45rem 0.75rem' }}
              >
                <Edit2 size={14} />
                <span>Editar Limitações</span>
              </button>

              <button
                onClick={() => handleToggleStatus(user)}
                className="btn btn-secondary btn-sm"
                style={{
                  color: user.status === 'ativo' ? '#EF4444' : 'var(--status-success)',
                  padding: '0.45rem 0.65rem',
                }}
                title={user.status === 'ativo' ? 'Bloquear Acesso' : 'Desbloquear Acesso'}
              >
                {user.status === 'ativo' ? <Lock size={15} /> : <Unlock size={15} />}
              </button>

              <button
                onClick={() => handleDeleteUser(user)}
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--status-error)', padding: '0.45rem 0.65rem' }}
                title="Revogar Acesso"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-medium)',
            }}
          >
            <KeyRound size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhum usuário de acesso encontrado</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Tente alterar os filtros de busca ou cadastre uma nova pessoa com permissões.
            </p>
            <button onClick={openNewUserModal} className="btn btn-primary btn-sm">
              <Plus size={16} /> Cadastrar Nova Pessoa
            </button>
          </div>
        )}
      </div>

      {/* ==================== MODAL CRIAR / EDITAR ACESSOS ==================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Editar Acessos: ${editingUser.name}` : 'Cadastrar Nova Pessoa de Acesso'}
        maxWidth="680px"
      >
        <form onSubmit={handleSaveUser}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nome Completo *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: Pr. Jaziel Maduro"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">E-mail de Login *</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="exemplo@macdp.com.br"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Senha de Acesso Individual */}
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.07)',
              border: '1px solid rgba(245, 158, 11, 0.28)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <label
                className="form-label"
                style={{
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: 0,
                }}
              >
                <KeyRound size={15} color="var(--accent-gold)" />
                <span>Senha de Acesso ao Painel *</span>
              </label>

              <button
                type="button"
                onClick={() => setUserPassword(`macdp${Math.floor(1000 + Math.random() * 9000)}`)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-gold-light)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Gerar Senha Aleatória
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="Defina uma senha com mínimo 6 dígitos"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                style={{ paddingRight: '2.8rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.73rem', color: 'var(--text-muted)' }}>
              Apenas esta senha específica concederá acesso a este usuário na tela de login administrativo.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">WhatsApp / Contato</label>
              <input
                type="tel"
                className="form-input"
                placeholder="92984509989"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Perfil de Acesso *</label>
              <select
                className="form-select"
                value={roleType}
                onChange={(e) => setRoleType(e.target.value as any)}
              >
                <option value="Administrador">Administrador</option>
                <option value="Pastor">Pastor</option>
                <option value="Secretaria">Secretaria</option>
                <option value="Tesouraria">Tesouraria</option>
                <option value="Liderança">Liderança</option>
                <option value="Voluntário">Voluntário</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                className="form-select"
                value={userStatus}
                onChange={(e) => setUserStatus(e.target.value as any)}
              >
                <option value="ativo">Ativo (Liberado)</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Título da Função / Cargo *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: Pastor Auxiliar / Líder de Células"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Permissão de Edição *</label>
              <select
                className="form-select"
                value={canEdit ? 'true' : 'false'}
                onChange={(e) => setCanEdit(e.target.value === 'true')}
              >
                <option value="true">Acesso Total (Edição)</option>
                <option value="false">Apenas Consulta (Leitura)</option>
              </select>
            </div>
          </div>

          {/* Granular Module Limitation Checklist */}
          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                Limitações & Módulos Autorizados ({allowedModules.length}/{AVAILABLE_MODULES.length})
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={selectAllModules}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  Selecionar Todos
                </button>
                <button
                  type="button"
                  onClick={clearAllModules}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  Limpar
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.5rem',
                background: 'var(--bg-tertiary)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                maxHeight: '220px',
                overflowY: 'auto',
              }}
            >
              {AVAILABLE_MODULES.map((mod) => {
                const isChecked = allowedModules.includes(mod.id);
                const IconComponent = mod.icon;
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: isChecked ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-secondary)',
                      border: `1px solid ${isChecked ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                      fontSize: '0.82rem',
                      color: isChecked ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    }}
                  >
                    {isChecked ? <CheckSquare size={15} color="var(--accent-gold)" /> : <Square size={15} color="var(--text-muted)" />}
                    <IconComponent size={14} />
                    <span style={{ fontWeight: isChecked ? 700 : 400 }}>{mod.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observações / Motivo da Liberação</label>
            <textarea
              rows={2}
              className="form-textarea"
              placeholder="Instruções sobre o escopo de atuação do colaborador..."
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingUser ? 'Salvar Limitações' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
