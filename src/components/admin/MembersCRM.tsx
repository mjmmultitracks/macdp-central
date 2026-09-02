import React, { useState } from 'react';
import { Member, VisitorItem, VisitorStage, CellGroup } from '../../types';
import {
  addMember,
  updateMember,
  deleteMember,
  addVisitor,
  updateVisitor,
  deleteVisitor,
  updateVisitorStage,
} from '../../services/db';
import { formatDate, formatPhone } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import {
  Users,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  ArrowRight,
  UserCheck,
  Award,
  BookOpen,
  Link2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Share2,
  Send,
} from 'lucide-react';

interface MembersCRMProps {
  members: Member[];
  visitors: VisitorItem[];
  cells: CellGroup[];
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const MembersCRM: React.FC<MembersCRMProps> = ({ members, visitors, cells, onNotify }) => {
  const [subTab, setSubTab] = useState<'membros' | 'pipeline'>('membros');

  // Members filter & search
  const [memberSearch, setMemberSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [ministryFilter, setMinistryFilter] = useState('todos');

  // Member Modal
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form states for Member
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [roleInChurch, setRoleInChurch] = useState('Membro');
  const [status, setStatus] = useState<Member['status']>('ativo');
  const [birthDate, setBirthDate] = useState('1995-01-01');
  const [baptismDate, setBaptismDate] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<Member['maritalStatus']>('Solteiro(a)');
  const [street, setStreet] = useState('Rua Lagoa Grande, 382');
  const [neighborhood, setNeighborhood] = useState('Conj. Canaranas / Cidade Nova');
  const [city, setCity] = useState('Manaus');
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);
  const [cellGroupId, setCellGroupId] = useState('');
  const [spiritualGifts, setSpiritualGifts] = useState('');
  const [notes, setNotes] = useState('');

  // Visitor note modal
  const [selectedVisitorForNote, setSelectedVisitorForNote] = useState<VisitorItem | null>(null);
  const [visitorNoteText, setVisitorNoteText] = useState('');

  // New/Edit visitor modal
  const [isNewVisitorModalOpen, setIsNewVisitorModalOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<VisitorItem | null>(null);
  const [vName, setVName] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [vMentor, setVMentor] = useState('');
  const [vHeard, setVHeard] = useState('Culto de Domingo');
  const [vNotes, setVNotes] = useState('');

  // Auto-Registration Link Modal state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const registrationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?cadastro=membro`
      : 'https://macdp.com.br/?cadastro=membro';

  const defaultInvitationText = `Graça e Paz! Seja muito bem-vindo(a) ao Ministério Apostólico Caçadores da Presença (MACDP). 🏛️✨\n\nPara atualizar ou realizar o seu cadastro oficial de membro e se conectar à nossa família e células em Manaus, acesse o link oficial:\n🔗 ${registrationUrl}\n\n"Proibido a Entrada de Pessoas Perfeitas." Deus abençoe você e sua família!`;

  const whatsAppShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(defaultInvitationText)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopiedLink(true);
    onNotify('success', 'Link de auto-cadastro copiado!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(defaultInvitationText);
    setCopiedMsg(true);
    onNotify('success', 'Mensagem pronta para WhatsApp copiada!');
    setTimeout(() => setCopiedMsg(false), 3000);
  };

  const openNewVisitorModal = () => {
    setEditingVisitor(null);
    setVName('');
    setVPhone('');
    setVEmail('');
    setVMentor('Equipe Pastoral');
    setVHeard('Culto de Domingo');
    setVNotes('');
    setIsNewVisitorModalOpen(true);
  };

  const openEditVisitorModal = (v: VisitorItem) => {
    setEditingVisitor(v);
    setVName(v.name);
    setVPhone(v.phone);
    setVEmail(v.email || '');
    setVMentor(v.assignedMentor);
    setVHeard(v.howHeard || 'Culto de Domingo');
    setVNotes(v.notes || '');
    setIsNewVisitorModalOpen(true);
  };

  const handleDeleteVisitor = (v: VisitorItem) => {
    if (window.confirm(`Deseja realmente remover o visitante "${v.name}" do funil?`)) {
      deleteVisitor(v.id);
      onNotify('info', `Visitante ${v.name} removido.`);
    }
  };

  const openNewMemberModal = () => {
    setEditingMember(null);
    setName('');
    setEmail('');
    setPhone('');
    setPhotoUrl('');
    setRoleInChurch('Membro Comungante');
    setStatus('ativo');
    setBirthDate('1995-05-20');
    setBaptismDate('2018-04-10');
    setMaritalStatus('Casado(a)');
    setStreet('Rua Lagoa Grande, 382');
    setNeighborhood('Conj. Canaranas / Cidade Nova');
    setCity('Manaus');
    setSelectedMinistries(['Recepção']);
    setCellGroupId(cells[0]?.id || '');
    setSpiritualGifts('Hospitalidade, Ensino');
    setNotes('');
    setIsMemberModalOpen(true);
  };

  const openEditMemberModal = (m: Member) => {
    setEditingMember(m);
    setName(m.name);
    setEmail(m.email);
    setPhone(m.phone);
    setPhotoUrl(m.photoUrl);
    setRoleInChurch(m.roleInChurch);
    setStatus(m.status);
    setBirthDate(m.birthDate);
    setBaptismDate(m.baptismDate || '');
    setMaritalStatus(m.maritalStatus);
    setStreet(m.address.street);
    setNeighborhood(m.address.neighborhood);
    setCity(m.address.city);
    setSelectedMinistries(m.ministries);
    setCellGroupId(m.cellGroupId || '');
    setSpiritualGifts(m.spiritualGifts.join(', '));
    setNotes(m.notes || '');
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onNotify('error', 'Nome completo é obrigatório.');
      return;
    }

    const memberData: Omit<Member, 'id'> = {
      name,
      email,
      phone,
      photoUrl: photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=F59E0B&bold=true`,
      status,
      roleInChurch,
      birthDate,
      baptismDate: baptismDate || undefined,
      membershipDate: editingMember ? editingMember.membershipDate : new Date().toISOString().split('T')[0],
      maritalStatus,
      address: {
        street,
        neighborhood,
        city,
        zip: '69097-750',
      },
      ministries: selectedMinistries,
      cellGroupId: cellGroupId || undefined,
      spiritualGifts: spiritualGifts.split(',').map((s) => s.trim()).filter(Boolean),
      attendanceRate: editingMember ? editingMember.attendanceRate : 90,
      notes,
    };

    if (editingMember) {
      updateMember(editingMember.id, memberData);
      onNotify('success', `Cadastro de ${name} atualizado com sucesso!`);
    } else {
      addMember(memberData);
      onNotify('success', `Novo membro ${name} cadastrado com sucesso!`);
    }

    setIsMemberModalOpen(false);
  };

  const handleDeleteMember = (m: Member) => {
    if (window.confirm(`Tem certeza que deseja remover o cadastro de ${m.name}?`)) {
      deleteMember(m.id);
      onNotify('info', `Membro ${m.name} removido do sistema.`);
    }
  };

  const handleSaveNewVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName.trim()) return;

    if (editingVisitor) {
      updateVisitor(editingVisitor.id, {
        name: vName,
        phone: vPhone,
        email: vEmail,
        assignedMentor: vMentor || 'Equipe Pastoral',
        howHeard: vHeard,
        notes: vNotes,
      });
      onNotify('success', `Dados do visitante ${vName} atualizados!`);
    } else {
      addVisitor({
        name: vName,
        phone: vPhone,
        email: vEmail,
        firstVisitDate: new Date().toISOString().split('T')[0],
        stage: 'primeiro_contato',
        assignedMentor: vMentor || 'Equipe Pastoral',
        lastContactDate: new Date().toISOString().split('T')[0],
        howHeard: vHeard,
        notes: vNotes,
      });
      onNotify('success', `Visitante ${vName} adicionado ao funil de acolhimento!`);
    }

    setIsNewVisitorModalOpen(false);
    setVName('');
    setVPhone('');
    setVEmail('');
    setVNotes('');
  };

  const stagesList: Array<{ id: VisitorStage; title: string; desc: string }> = [
    { id: 'primeiro_contato', title: '1. Primeiro Contato', desc: 'Visitou no domingo' },
    { id: 'boas_vindas', title: '2. Boas-Vindas', desc: 'WhatsApp enviado' },
    { id: 'cafe_pastoral', title: '3. Café Pastoral', desc: 'Encontro com líderes' },
    { id: 'integrado_celula', title: '4. Na Célula', desc: 'Frequenta pequeno grupo' },
    { id: 'curso_membresia', title: '5. Membresia', desc: 'Em discipulado / batismo' },
  ];

  const advanceVisitor = (v: VisitorItem) => {
    const sequence: VisitorStage[] = [
      'primeiro_contato',
      'boas_vindas',
      'cafe_pastoral',
      'integrado_celula',
      'curso_membresia',
    ];
    const currentIndex = sequence.indexOf(v.stage);
    if (currentIndex < sequence.length - 1) {
      const nextStage = sequence[currentIndex + 1];
      updateVisitorStage(v.id, nextStage);
      onNotify('success', `${v.name} avançou para: ${stagesList[currentIndex + 1].title}`);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchSearch =
      !memberSearch ||
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.phone.includes(memberSearch) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase());

    const matchStatus = statusFilter === 'todos' || m.status === statusFilter;
    const matchMinistry =
      ministryFilter === 'todos' || m.ministries.includes(ministryFilter);

    return matchSearch && matchStatus && matchMinistry;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Sub Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setSubTab('membros')}
            className={`btn btn-sm ${subTab === 'membros' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '0.4rem' }}
          >
            <Users size={16} />
            <span>Membros da Igreja ({members.length})</span>
          </button>

          <button
            onClick={() => setSubTab('pipeline')}
            className={`btn btn-sm ${subTab === 'pipeline' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '0.4rem' }}
          >
            <Sparkles size={16} />
            <span>Funil de Integração de Visitantes ({visitors.length})</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {subTab === 'membros' ? (
            <>
              <button
                onClick={() => setIsLinkModalOpen(true)}
                className="btn btn-sm btn-secondary"
                style={{
                  gap: '0.4rem',
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                  color: 'var(--accent-gold)',
                  background: 'rgba(245, 158, 11, 0.08)',
                  fontWeight: 700,
                }}
              >
                <Link2 size={16} />
                <span>Gerar Link de Auto-Cadastro</span>
              </button>
              <button onClick={openNewMemberModal} className="btn btn-sm btn-primary" style={{ gap: '0.4rem' }}>
                <Plus size={16} />
                <span>Cadastrar Membro</span>
              </button>
            </>
          ) : (
            <button
              onClick={openNewVisitorModal}
              className="btn btn-sm btn-primary"
              style={{ gap: '0.4rem' }}
            >
              <Plus size={16} />
              <span>Registrar Visitante</span>
            </button>
          )}
        </div>
      </div>

      {/* SUBTAB 1: MEMBERS DIRECTORY */}
      {subTab === 'membros' && (
        <div>
          {/* Quick Registration Link Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, var(--bg-secondary) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.15rem 1.35rem',
              marginBottom: '1.25rem',
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
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.18)',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Link2 size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Link Oficial de Auto-Cadastro de Membros
                  </h4>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                    Cadastro Automático
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.81rem', margin: '0.2rem 0 0 0' }}>
                  Envie o link para o membro se cadastrar pelo WhatsApp. Os dados preenchidos entram direto no sistema!
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={handleCopyLink}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.4rem', background: 'var(--bg-tertiary)' }}
              >
                {copiedLink ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
              </button>

              <a
                href={whatsAppShareUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm"
                style={{
                  gap: '0.4rem',
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                }}
              >
                <Share2 size={14} />
                <span>Enviar no WhatsApp</span>
              </a>

              <button
                onClick={() => setIsLinkModalOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem' }}
                title="Ver detalhes e QR Code"
              >
                <QrCode size={14} />
                <span>QR Code</span>
              </button>
            </div>
          </div>
          {/* Filter Toolbar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
              background: 'var(--bg-secondary)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Buscar por nome, telefone, email..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
            </div>

            <div>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Membros Ativos</option>
                <option value="em_integracao">Em Integração / Curso</option>
                <option value="visitante">Visitantes Frequentes</option>
              </select>
            </div>

            <div>
              <select
                className="form-select"
                value={ministryFilter}
                onChange={(e) => setMinistryFilter(e.target.value)}
              >
                <option value="todos">Todos os Ministérios</option>
                <option value="Louvor">Louvor</option>
                <option value="Som e Mídia">Som e Mídia</option>
                <option value="Recepção">Recepção</option>
                <option value="Ministério Infantil">Ministério Infantil</option>
                <option value="Ação Social">Ação Social</option>
                <option value="Intercessão">Intercessão</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="table-container" style={{ background: 'var(--bg-secondary)' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Membro</th>
                  <th>Contato</th>
                  <th>Função / Ministério</th>
                  <th>Célula & Endereço</th>
                  <th>Frequência</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => {
                  const cell = cells.find((c) => c.id === m.cellGroupId);
                  return (
                    <tr key={m.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={m.photoUrl}
                            alt={m.name}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.9rem', display: 'block' }}>{m.name}</strong>
                            <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Membro desde {formatDate(m.membershipDate)}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.825rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Phone size={13} color="var(--accent-gold)" />
                            <span>{formatPhone(m.phone)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                            <Mail size={13} />
                            <span>{m.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          <strong style={{ display: 'block' }}>{m.roleInChurch}</strong>
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                            {m.ministries.map((min, idx) => (
                              <span key={idx} className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
                                {min}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.825rem' }}>
                          <span style={{ fontWeight: 600, display: 'block' }}>{cell?.name || 'Sem Célula'}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{m.address.neighborhood} - {m.address.city}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '45px', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${m.attendanceRate}%`, height: '100%', background: 'var(--success)' }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{m.attendanceRate}%</span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            m.status === 'ativo' ? 'badge-success' : 'badge-warning'
                          }`}
                        >
                          {m.status === 'ativo' ? 'Ativo' : 'Em Integração'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => openEditMemberModal(m)}
                            className="btn btn-sm btn-secondary"
                            title="Editar Dados"
                            style={{ padding: '0.35rem' }}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(m)}
                            className="btn btn-sm btn-danger"
                            title="Excluir"
                            style={{ padding: '0.35rem' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: VISITOR INTEGRATION PIPELINE (KANBAN) */}
      {subTab === 'pipeline' && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              alignItems: 'flex-start',
            }}
          >
            {stagesList.map((stage) => {
              const stageVisitors = visitors.filter((v) => v.stage === stage.id);
              return (
                <div
                  key={stage.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    minHeight: '480px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{stage.title}</strong>
                      <span className="badge badge-gold">{stageVisitors.length}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stage.desc}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                    {stageVisitors.map((v) => (
                      <div
                        key={v.id}
                        className="card card-hover"
                        style={{
                          padding: '1rem',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <strong style={{ fontSize: '0.9rem' }}>{v.name}</strong>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              onClick={() => openEditVisitorModal(v)}
                              className="btn btn-sm btn-secondary"
                              style={{ padding: '0.2rem 0.4rem' }}
                              title="Editar Visitante"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteVisitor(v)}
                              className="btn btn-sm btn-secondary"
                              style={{ padding: '0.2rem 0.4rem', color: 'var(--status-error)' }}
                              title="Excluir Visitante"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <div>📞 {formatPhone(v.phone)}</div>
                          <div>👤 Mentor: <strong>{v.assignedMentor}</strong></div>
                          <div>📅 Visitou: {formatDate(v.firstVisitDate)}</div>
                        </div>

                        {v.notes && (
                          <div
                            style={{
                              background: 'var(--bg-secondary)',
                              padding: '0.45rem 0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)',
                              fontStyle: 'italic',
                            }}
                          >
                            "{v.notes}"
                          </div>
                        )}

                        {stage.id !== 'curso_membresia' ? (
                          <button
                            onClick={() => advanceVisitor(v)}
                            className="btn btn-sm btn-primary"
                            style={{ width: '100%', marginTop: '0.35rem', gap: '0.4rem', fontSize: '0.78rem' }}
                          >
                            <span>Avançar Estágio</span>
                            <ArrowRight size={14} />
                          </button>
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.3rem',
                              color: 'var(--success)',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              marginTop: '0.4rem',
                            }}
                          >
                            <UserCheck size={16} />
                            <span>Pronto p/ Batismo</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {stageVisitors.length === 0 && (
                      <div
                        style={{
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                          fontSize: '0.8rem',
                          padding: '2rem 0',
                        }}
                      >
                        Nenhum visitante nesta etapa
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MEMBER CREATE/EDIT MODAL */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        title={editingMember ? `Editar Cadastro: ${editingMember.name}` : 'Cadastrar Novo Membro'}
        maxWidth="740px"
      >
        <form onSubmit={handleSaveMember}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nome Completo *</label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp / Telefone</label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cargo / Função na Igreja</label>
              <input
                type="text"
                className="form-input"
                value={roleInChurch}
                onChange={(e) => setRoleInChurch(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status do Membro</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="ativo">Ativo</option>
                <option value="em_integracao">Em Integração</option>
                <option value="visitante">Visitante</option>
                <option value="afastado">Afastado</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Data de Nascimento</label>
              <input
                type="date"
                className="form-input"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data de Batismo nas Águas</label>
              <input
                type="date"
                className="form-input"
                value={baptismDate}
                onChange={(e) => setBaptismDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Célula / Pequeno Grupo</label>
              <select
                className="form-select"
                value={cellGroupId}
                onChange={(e) => setCellGroupId(e.target.value)}
              >
                <option value="">Sem Célula</option>
                {cells.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.neighborhood})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Bairro / Região</label>
              <input
                type="text"
                className="form-input"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dons Espirituais (separados por vírgula)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Louvor, Ensino, Serviço"
                value={spiritualGifts}
                onChange={(e) => setSpiritualGifts(e.target.value)}
              />
            </div>
          </div>

          {/* Ministries Checkboxes */}
          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label">Ministérios em que Serve:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {['Louvor', 'Som e Mídia', 'Recepção', 'Ministério Infantil', 'Ação Social', 'Intercessão'].map(
                (min) => {
                  const isChecked = selectedMinistries.includes(min);
                  return (
                    <label key={min} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMinistries([...selectedMinistries, min]);
                          } else {
                            setSelectedMinistries(selectedMinistries.filter((m) => m !== min));
                          }
                        }}
                      />
                      <span>{min}</span>
                    </label>
                  );
                }
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Anotações Pastorais Confidenciais:</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsMemberModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar Membro
            </button>
          </div>
        </form>
      </Modal>

      {/* NEW VISITOR MODAL */}
      <Modal
        isOpen={isNewVisitorModalOpen}
        onClose={() => setIsNewVisitorModalOpen(false)}
        title={editingVisitor ? `Editar Visitante: ${editingVisitor.name}` : 'Registrar Novo Visitante / Decidido'}
      >
        <form onSubmit={handleSaveNewVisitor}>
          <div className="form-group">
            <label className="form-label">Nome do Visitante *</label>
            <input
              type="text"
              required
              className="form-input"
              value={vName}
              onChange={(e) => setVName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">WhatsApp</label>
            <input
              type="tel"
              className="form-input"
              value={vPhone}
              onChange={(e) => setVPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-input"
              value={vEmail}
              onChange={(e) => setVEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Como Conheceu a Igreja?</label>
            <select className="form-select" value={vHeard} onChange={(e) => setVHeard(e.target.value)}>
              <option value="Convidado por Amigo/Familiar">Convidado por Amigo / Familiar</option>
              <option value="Instagram / Redes Sociais">Instagram / Redes Sociais</option>
              <option value="Google Maps / Passou na frente">Google Maps / Passou na frente</option>
              <option value="Transmissão do YouTube">Transmissão do YouTube</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Mentor / Responsável pelo Acolhimento:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Pr. Jaziel / Liderança de Acolhimento"
              value={vMentor}
              onChange={(e) => setVMentor(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Observações:</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Ex: Sentou na primeira fila, gostou do louvor..."
              value={vNotes}
              onChange={(e) => setVNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsNewVisitorModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar Visitante
            </button>
          </div>
        </form>
      </Modal>

      {/* ==================== MODAL GERAR LINK DE AUTO-CADASTRO ==================== */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Gerar Link de Auto-Cadastro de Membro"
        maxWidth="640px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Envie este link para qualquer pessoa, novo convertido ou membro da igreja. Ao abrir o link no celular,
            ela preencherá sua própria ficha oficial e os dados cairão <strong>automaticamente</strong> aqui no painel de membros do MACDP!
          </p>

          {/* Link Box */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>
              Link Direto de Cadastro:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                readOnly
                className="form-input"
                value={registrationUrl}
                style={{
                  background: 'var(--bg-tertiary)',
                  fontFamily: 'monospace',
                  fontSize: '0.84rem',
                  color: 'var(--accent-gold)',
                }}
              />
              <button
                onClick={handleCopyLink}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.35rem', flexShrink: 0 }}
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
              </button>
              <a
                href={registrationUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ flexShrink: 0 }}
                title="Testar e abrir formulário"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* WhatsApp Share Card */}
          <div
            style={{
              background: 'rgba(37, 211, 102, 0.08)',
              border: '1px solid rgba(37, 211, 102, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#25D366', fontWeight: 700, fontSize: '0.9rem' }}>
                <Share2 size={16} />
                <span>Mensagem Formatada para WhatsApp</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={handleCopyMessage}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}
                >
                  {copiedMsg ? <Check size={12} color="var(--status-success)" /> : <Copy size={12} />}
                  <span>{copiedMsg ? 'Mensagem Copiada!' : 'Copiar Texto'}</span>
                </button>
                <a
                  href={whatsAppShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.65rem',
                    background: '#25D366',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                  }}
                >
                  Abrir WhatsApp
                </a>
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-primary)',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {defaultInvitationText}
            </div>
          </div>

          {/* QR Code Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&data=${encodeURIComponent(
                  registrationUrl
                )}`}
                alt="QR Code Auto-Cadastro MACDP"
                style={{ width: '110px', height: '110px', display: 'block' }}
              />
            </div>

            <div>
              <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                QR Code para Telão e Recepção
              </h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Projete este QR Code no telão durante os cultos de Domingo ou imprima na recepção da igreja para que os membros e visitantes apontem a câmera do celular e se cadastrem na hora.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={() => setIsLinkModalOpen(false)} className="btn btn-secondary">
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
