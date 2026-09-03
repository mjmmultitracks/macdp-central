import React, { useState } from 'react';
import { MinistrySchedule, Member, VolunteerSlot } from '../../types';
import {
  updateVolunteerScheduleStatus,
  addSchedule,
  updateSchedule,
  deleteSchedule,
} from '../../services/db';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  MessageCircle,
  Edit2,
  Trash2,
  Users,
  X,
} from 'lucide-react';

interface SchedulesManagerProps {
  schedules: MinistrySchedule[];
  members: Member[];
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const SchedulesManager: React.FC<SchedulesManagerProps> = ({
  schedules,
  members,
  onNotify,
}) => {
  const [selectedMinistry, setSelectedMinistry] = useState<string>('todos');

  // Modal states for Create / Edit Schedule
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<MinistrySchedule | null>(null);

  // Form states
  const [serviceName, setServiceName] = useState('');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceTime, setServiceTime] = useState('18:30');
  const [ministry, setMinistry] = useState<MinistrySchedule['ministry']>('Louvor');
  const [notes, setNotes] = useState('');
  const [team, setTeam] = useState<VolunteerSlot[]>([]);

  // Form sub-state for adding volunteer slot
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [slotRole, setSlotRole] = useState('');

  const openNewScheduleModal = () => {
    setEditingSchedule(null);
    setServiceName('Culto de Celebração & Família');
    setServiceDate(new Date().toISOString().split('T')[0]);
    setServiceTime('18:30');
    setMinistry('Louvor');
    setNotes('');
    setTeam([]);
    setSelectedMemberId(members.length > 0 ? members[0].id : '');
    setSlotRole('Ministro / Vocal');
    setIsModalOpen(true);
  };

  const openEditScheduleModal = (sch: MinistrySchedule) => {
    setEditingSchedule(sch);
    setServiceName(sch.serviceName);
    setServiceDate(sch.serviceDate);
    setServiceTime(sch.serviceTime);
    setMinistry(sch.ministry);
    setNotes(sch.notes || '');
    setTeam([...sch.team]);
    setSelectedMemberId(members.length > 0 ? members[0].id : '');
    setSlotRole('Apoio');
    setIsModalOpen(true);
  };

  const handleAddVolunteerToTeam = () => {
    if (!selectedMemberId || !slotRole.trim()) {
      onNotify('error', 'Selecione um voluntário e informe a função dele na escala.');
      return;
    }
    const memberObj = members.find((m) => m.id === selectedMemberId);
    const memberName = memberObj ? memberObj.name : 'Voluntário Convidado';

    setTeam((prev) => [
      ...prev,
      {
        memberId: selectedMemberId,
        memberName,
        role: slotRole,
        status: 'pendente',
      },
    ]);
    setSlotRole('');
  };

  const handleRemoveVolunteerFromTeam = (index: number) => {
    setTeam((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !serviceDate || !serviceTime) {
      onNotify('error', 'Preencha o nome do culto, data e horário.');
      return;
    }

    if (editingSchedule) {
      updateSchedule(editingSchedule.id, {
        serviceName,
        serviceDate,
        serviceTime,
        ministry,
        notes,
        team,
      });
      onNotify('success', `Escala "${serviceName}" atualizada com sucesso!`);
    } else {
      addSchedule({
        serviceName,
        serviceDate,
        serviceTime,
        ministry,
        notes,
        team,
      });
      onNotify('success', `Nova escala para "${serviceName}" cadastrada com sucesso!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteSchedule = (sch: MinistrySchedule) => {
    if (window.confirm(`Deseja realmente remover a escala de "${sch.serviceName}" (${sch.ministry})?`)) {
      deleteSchedule(sch.id);
      onNotify('info', `Escala de "${sch.serviceName}" removida.`);
    }
  };

  const handleStatusChange = (
    scheduleId: string,
    memberId: string,
    newStatus: 'confirmado' | 'pendente' | 'indisponivel'
  ) => {
    updateVolunteerScheduleStatus(scheduleId, memberId, newStatus);
    onNotify(
      newStatus === 'confirmado' ? 'success' : newStatus === 'indisponivel' ? 'error' : 'info',
      `Status do voluntário atualizado para: ${newStatus.toUpperCase()}`
    );
  };

  // WhatsApp Schedule Formatter & Copier
  const handleExportWhatsApp = (sch: MinistrySchedule) => {
    let text = `📅 *ESCALA DE VOLUNTÁRIOS — ${sch.serviceName.toUpperCase()}*\n`;
    text += `🗓 *Data:* ${formatDate(sch.serviceDate)} às ${sch.serviceTime}\n`;
    text += `✨ *Ministério:* ${sch.ministry}\n\n`;
    text += `*EQUIPE ESCALADA:*\n`;

    sch.team.forEach((slot) => {
      const statusEmoji =
        slot.status === 'confirmado' ? '✅' : slot.status === 'pendente' ? '⏳' : '❌';
      text += `• *${slot.role}:* ${slot.memberName} ${statusEmoji}\n`;
    });

    if (sch.notes) {
      text += `\n📌 *Lembrete:* ${sch.notes}\n`;
    }
    text += `\n_Ministério Apostólico Caçadores da Presença (MACDP) — Confirmem presença com antecedência!_`;

    navigator.clipboard.writeText(text);
    onNotify('success', 'Texto da escala copiado para o WhatsApp! Cole no grupo da equipe.');
  };

  const filteredSchedules = schedules.filter((s) => {
    return selectedMinistry === 'todos' || s.ministry === selectedMinistry;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Filter */}
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
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Escalas de Cultos Semanais</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Cadastre novas escalas, organize equipes ministeriais e acompanhe a confirmação de presença
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filtrar Ministério:</span>
            <select
              className="form-select"
              style={{ width: '180px' }}
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
            >
              <option value="todos">Todos os Ministérios</option>
              <option value="Louvor">Louvor</option>
              <option value="Som e Mídia">Som e Mídia</option>
              <option value="Recepção">Recepção</option>
              <option value="Ministério Infantil">Ministério Infantil</option>
              <option value="Intercessão">Intercessão</option>
            </select>
          </div>

          <button
            onClick={openNewScheduleModal}
            className="btn btn-primary"
            style={{ gap: '0.45rem', fontSize: '0.875rem' }}
          >
            <Plus size={16} />
            <span>Nova Escala</span>
          </button>
        </div>
      </div>

      {/* Schedules List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredSchedules.map((sch) => {
          const confirmedCount = sch.team.filter((t) => t.status === 'confirmado').length;
          const pendingCount = sch.team.filter((t) => t.status === 'pendente').length;
          const unavailableCount = sch.team.filter((t) => t.status === 'indisponivel').length;

          return (
            <div
              key={sch.id}
              className="card"
              style={{
                padding: '1.75rem',
                borderLeft: '4px solid var(--accent-gold)',
              }}
            >
              {/* Schedule Title & Summary Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-gold">{sch.ministry}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {formatDate(sch.serviceDate)} às {sch.serviceTime}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{sch.serviceName}</h4>
                  {sch.notes && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      📌 {sch.notes}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Status pills */}
                  <span className="badge badge-success">
                    <CheckCircle2 size={12} /> {confirmedCount} confirmados
                  </span>
                  {pendingCount > 0 && (
                    <span className="badge badge-warning">
                      <Clock size={12} /> {pendingCount} pendentes
                    </span>
                  )}
                  {unavailableCount > 0 && (
                    <span className="badge badge-danger">
                      <XCircle size={12} /> {unavailableCount} indisponível
                    </span>
                  )}

                  <button
                    onClick={() => handleExportWhatsApp(sch)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.4rem', color: '#16a34a' }}
                    title="Copiar texto formatado para enviar no WhatsApp"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => openEditScheduleModal(sch)}
                    className="btn btn-secondary btn-sm"
                    title="Editar Escala"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    onClick={() => handleDeleteSchedule(sch)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--status-error)' }}
                    title="Excluir Escala"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Volunteers Grid / Table */}
              <div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                  Voluntários Escalados ({sch.team.length})
                </h5>

                {sch.team.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Nenhum voluntário escalado ainda. Clique em "Editar" para adicionar integrantes a esta escala.
                  </p>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                    }}
                  >
                    {sch.team.map((slot) => {
                      return (
                        <div
                          key={slot.memberId}
                          style={{
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.85rem 1rem',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: '0.9rem', display: 'block' }}>{slot.memberName}</strong>
                            <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)' }}>{slot.role}</span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              onClick={() => handleStatusChange(sch.id, slot.memberId, 'confirmado')}
                              title="Marcar como Confirmado"
                              style={{
                                background: slot.status === 'confirmado' ? 'var(--status-success)' : 'var(--bg-secondary)',
                                color: slot.status === 'confirmado' ? '#ffffff' : 'var(--text-muted)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '6px',
                                padding: '0.35rem 0.5rem',
                                cursor: 'pointer',
                              }}
                            >
                              <CheckCircle2 size={15} />
                            </button>

                            <button
                              onClick={() => handleStatusChange(sch.id, slot.memberId, 'pendente')}
                              title="Marcar como Pendente"
                              style={{
                                background: slot.status === 'pendente' ? 'var(--status-warning)' : 'var(--bg-secondary)',
                                color: slot.status === 'pendente' ? '#0B1120' : 'var(--text-muted)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '6px',
                                padding: '0.35rem 0.5rem',
                                cursor: 'pointer',
                              }}
                            >
                              <Clock size={15} />
                            </button>

                            <button
                              onClick={() => handleStatusChange(sch.id, slot.memberId, 'indisponivel')}
                              title="Marcar como Indisponível"
                              style={{
                                background: slot.status === 'indisponivel' ? 'var(--status-error)' : 'var(--bg-secondary)',
                                color: slot.status === 'indisponivel' ? '#ffffff' : 'var(--text-muted)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '6px',
                                padding: '0.35rem 0.5rem',
                                cursor: 'pointer',
                              }}
                            >
                              <XCircle size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredSchedules.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-medium)',
            }}
          >
            <CalendarCheck size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhuma escala encontrada</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Cadastre uma nova escala para organizar as equipes de louvor, mídia, recepção ou infantil.
            </p>
            <button onClick={openNewScheduleModal} className="btn btn-primary btn-sm">
              <Plus size={16} /> Cadastrar Nova Escala
            </button>
          </div>
        )}
      </div>

      {/* MODAL CRIAR / EDITAR ESCALA */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSchedule ? `Editar Escala: ${editingSchedule.serviceName}` : 'Nova Escala de Culto'}
        maxWidth="680px"
      >
        <form onSubmit={handleSaveSchedule}>
          <div className="form-group">
            <label className="form-label">Nome do Culto / Ocasião *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: Culto da Família - Domingo Noite"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Data do Culto *</label>
              <input
                type="date"
                required
                className="form-input"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Horário *</label>
              <input
                type="time"
                required
                className="form-input"
                value={serviceTime}
                onChange={(e) => setServiceTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ministério *</label>
              <select
                className="form-select"
                value={ministry}
                onChange={(e) => setMinistry(e.target.value as any)}
              >
                <option value="Louvor">Louvor</option>
                <option value="Som e Mídia">Som e Mídia</option>
                <option value="Recepção">Recepção</option>
                <option value="Ministério Infantil">Ministério Infantil</option>
                <option value="Intercessão">Intercessão</option>
              </select>
            </div>
          </div>

          {/* Team builder section */}
          <div
            style={{
              background: 'var(--bg-tertiary)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} color="var(--accent-gold)" /> Escalar Voluntários
            </h5>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Selecionar Membro</label>
                <select
                  className="form-select"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                  <option value="">Selecione um membro...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.ministries?.join(', ') || 'Geral'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Função no Culto</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Teclado, Recepção, Berçário"
                  value={slotRole}
                  onChange={(e) => setSlotRole(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={handleAddVolunteerToTeam}
                className="btn btn-primary btn-sm"
                style={{ height: '38px', gap: '0.35rem' }}
              >
                <Plus size={15} /> Adicionar
              </button>
            </div>

            {/* Current team list in modal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
              {team.map((slot, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-secondary)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                  }}
                >
                  <span>
                    <strong>{slot.memberName}</strong> — <span style={{ color: 'var(--accent-gold)' }}>{slot.role}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVolunteerFromTeam(idx)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--status-error)', cursor: 'pointer' }}
                    title="Remover da escala"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {team.length === 0 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Nenhum voluntário adicionado a esta escala ainda.
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Anotações / Lembretes para a Equipe</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Ex: Chegar 30 min antes para oração no altar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSchedule ? 'Salvar Alterações' : 'Criar Escala'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
