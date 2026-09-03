import React, { useState } from 'react';
import { PastoralAppointment, PrayerRequest } from '../../types';
import {
  addPastoralAppointment,
  updatePastoralAppointment,
  deletePastoralAppointment,
  updatePrayerRequest,
  deletePrayerRequest,
} from '../../services/db';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import {
  HeartHandshake,
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Phone,
  Shield,
  FileText,
  Edit2,
  Trash2,
  ChevronRight,
  Send,
  Home,
  Activity,
  Heart,
  UserCheck,
  Check,
} from 'lucide-react';

interface PastoralManagerProps {
  appointments: PastoralAppointment[];
  prayers: PrayerRequest[];
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const PastoralManager: React.FC<PastoralManagerProps> = ({
  appointments,
  prayers,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'requests' | 'history'>('agenda');

  // Search & Filters for Agenda
  const [searchTerm, setSearchTerm] = useState('');
  const [pastorFilter, setPastorFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Search & Filters for Prayer & Visit Requests
  const [prayerSearch, setPrayerSearch] = useState('');
  const [prayerCatFilter, setPrayerCatFilter] = useState('todos');

  // Appointment Modal State
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<PastoralAppointment | null>(null);
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('92984509989');
  const [personType, setPersonType] = useState<PastoralAppointment['personType']>('Membro');
  const [assignedPastor, setAssignedPastor] = useState('Pr. Oziel Gomes Maduro & Pra. Midiã Gomes Maduro');
  const [appointmentType, setAppointmentType] = useState<PastoralAppointment['appointmentType']>('Gabinete Presencial');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('16:00');
  const [location, setLocation] = useState('Gabinete Pastoral (Templo Central)');
  const [status, setStatus] = useState<PastoralAppointment['status']>('agendado');
  const [reason, setReason] = useState('');
  const [confidentialNotes, setConfidentialNotes] = useState('');

  // Handlers for Appointments
  const openNewApptModal = (prefill?: { name?: string; phone?: string; reason?: string }) => {
    setEditingAppt(null);
    setPersonName(prefill?.name || '');
    setPersonPhone(prefill?.phone || '92984509989');
    setPersonType('Membro');
    setAssignedPastor('Pr. Oziel Gomes Maduro & Pra. Midiã Gomes Maduro');
    setAppointmentType('Gabinete Presencial');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('16:00');
    setLocation('Gabinete Pastoral (Templo Central)');
    setStatus('agendado');
    setReason(prefill?.reason || '');
    setConfidentialNotes('');
    setIsApptModalOpen(true);
  };

  const openEditApptModal = (appt: PastoralAppointment) => {
    setEditingAppt(appt);
    setPersonName(appt.personName);
    setPersonPhone(appt.personPhone);
    setPersonType(appt.personType);
    setAssignedPastor(appt.assignedPastor);
    setAppointmentType(appt.appointmentType);
    setDate(appt.date);
    setTime(appt.time);
    setLocation(appt.location);
    setStatus(appt.status);
    setReason(appt.reason);
    setConfidentialNotes(appt.confidentialNotes || '');
    setIsApptModalOpen(true);
  };

  const handleSaveAppt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || !reason.trim()) {
      onNotify('error', 'Preencha o nome da pessoa e o motivo do atendimento.');
      return;
    }

    if (editingAppt) {
      updatePastoralAppointment(editingAppt.id, {
        personName,
        personPhone,
        personType,
        assignedPastor,
        appointmentType,
        date,
        time,
        location,
        status,
        reason,
        confidentialNotes,
      });
      onNotify('success', `Atendimento de "${personName}" atualizado com sucesso!`);
    } else {
      addPastoralAppointment({
        personName,
        personPhone,
        personType,
        assignedPastor,
        appointmentType,
        date,
        time,
        location,
        status,
        reason,
        confidentialNotes,
      });
      onNotify('success', `Atendimento pastoral para "${personName}" agendado com sucesso!`);
    }

    setIsApptModalOpen(false);
  };

  const handleDeleteAppt = (appt: PastoralAppointment) => {
    if (window.confirm(`Deseja remover o agendamento de "${appt.personName}"?`)) {
      deletePastoralAppointment(appt.id);
      onNotify('info', `Agendamento de "${appt.personName}" cancelado.`);
    }
  };

  const handleMarkAsDone = (appt: PastoralAppointment) => {
    updatePastoralAppointment(appt.id, { status: 'realizado' });
    onNotify('success', `Atendimento com ${appt.personName} marcado como Realizado!`);
  };

  // WhatsApp Reminder
  const handleSendWhatsAppReminder = (appt: PastoralAppointment) => {
    const cleanPhone = appt.personPhone.replace(/\D/g, '');
    let msg = `🕊️ *LEMBRETE DE ATENDIMENTO PASTORAL — MACDP*\n\n`;
    msg += `Graça e paz, amado(a) *${appt.personName}*!\n`;
    msg += `Confirmamos seu atendimento pastoral no Ministério Apostólico Caçadores da Presença:\n\n`;
    msg += `🗓 *Data:* ${formatDate(appt.date)}\n`;
    msg += `⏰ *Horário:* ${appt.time}\n`;
    msg += `📍 *Local:* ${appt.location}\n`;
    msg += `👤 *Pastor(a) Responsável:* ${appt.assignedPastor}\n`;
    msg += `📋 *Tipo:* ${appt.appointmentType}\n\n`;
    msg += `_“Perto está o Senhor dos que têm o coração quebrantado.” (Sl 34:18)_\n`;
    msg += `Caso haja algum imprevisto, por favor nos avise. Estamos em oração por sua vida!`;

    const waLink = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waLink, '_blank');
    onNotify('info', `Abrindo WhatsApp para enviar lembrete a ${appt.personName}...`);
  };

  // Convert prayer request into pastoral appointment
  const handleConvertPrayerToAppt = (pray: PrayerRequest) => {
    openNewApptModal({
      name: pray.requesterName,
      phone: pray.phone || '92984509989',
      reason: `[Pedido de Oração - ${pray.category}] ${pray.message}`,
    });
    updatePrayerRequest(pray.id, { status: 'visita_agendada' as any });
  };

  // Metrics
  const activeApptsCount = appointments.filter((a) => a.status === 'agendado' || a.status === 'confirmado').length;
  const visitsCount = appointments.filter((a) => a.appointmentType.includes('Visita')).length;
  const completedCount = appointments.filter((a) => a.status === 'realizado').length;
  const pendingPrayers = prayers.filter((p) => p.status === 'novo').length;

  const filteredAppointments = appointments.filter((a) => {
    const matchSearch =
      !searchTerm ||
      a.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchPastor = pastorFilter === 'todos' || a.assignedPastor.includes(pastorFilter);
    const matchType = typeFilter === 'todos' || a.appointmentType === typeFilter;
    const matchStatus = statusFilter === 'todos' || a.status === statusFilter;

    return matchSearch && matchPastor && matchType && matchStatus;
  });

  const filteredPrayers = prayers.filter((p) => {
    const matchSearch =
      !prayerSearch ||
      p.requesterName.toLowerCase().includes(prayerSearch.toLowerCase()) ||
      p.message.toLowerCase().includes(prayerSearch.toLowerCase());
    const matchCat = prayerCatFilter === 'todos' || p.category === prayerCatFilter;
    return matchSearch && matchCat;
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
                background: 'var(--accent-gold-soft)',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HeartHandshake size={22} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Área Pastoral & Gabinete (MACDP)</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Gestão de atendimentos pastorais, visitas hospitalares e domiciliares, triagem de oração e agenda com lembretes via WhatsApp
          </p>
        </div>

        <button onClick={() => openNewApptModal()} className="btn btn-primary" style={{ gap: '0.45rem' }}>
          <Plus size={16} />
          <span>Novo Atendimento Pastoral</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Atendimentos Agendados</span>
            <Calendar size={18} color="var(--accent-gold)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
            {activeApptsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Previstos no gabinete e visitas
          </div>
        </div>

        <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pedidos de Oração & Visita</span>
            <AlertCircle size={18} color="var(--accent-blue-light)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-blue-light)' }}>
            {pendingPrayers}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Aguardando triagem pastoral
          </div>
        </div>

        <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Visitas Agendadas</span>
            <Home size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10B981' }}>
            {visitsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Hospitalares e lares em Manaus
          </div>
        </div>

        <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Atendimentos Concluídos</span>
            <CheckCircle2 size={18} color="var(--status-success)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--status-success)' }}>
            {completedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Vidas ministradas e aconselhadas
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setActiveTab('agenda')}
          className={`btn btn-sm ${activeTab === 'agenda' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.45rem' }}
        >
          <Calendar size={16} />
          <span>Agenda Pastoral & Lembretes ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`btn btn-sm ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.45rem' }}
        >
          <HeartHandshake size={16} />
          <span>Pedidos de Oração & Solicitação de Visitas ({prayers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.45rem' }}
        >
          <Shield size={16} />
          <span>Prontuário & Histórico Confidencial</span>
        </button>
      </div>

      {/* ==================== TAB 1: AGENDA PASTORAL & LEMBRETES ==================== */}
      {activeTab === 'agenda' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Controls Bar */}
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
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '360px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Buscar por pessoa, motivo ou local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                className="form-select"
                style={{ width: '200px' }}
                value={pastorFilter}
                onChange={(e) => setPastorFilter(e.target.value)}
              >
                <option value="todos">Todos os Pastores</option>
                <option value="Oziel">Pr. Oziel & Pra. Midiã</option>
                <option value="Jaziel">Pr. Jaziel & Pra. Abda</option>
                <option value="Samuel">Pr. Samuel & Pra. Daniely</option>
              </select>

              <select
                className="form-select"
                style={{ width: '180px' }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="todos">Todos os Tipos</option>
                <option value="Gabinete Presencial">Gabinete Presencial</option>
                <option value="Visita Domiciliar">Visita Domiciliar</option>
                <option value="Visita Hospitalar">Visita Hospitalar</option>
                <option value="Aconselhamento Matrimonial">Aconselhamento Casais</option>
                <option value="Online / Chamada">Online / Chamada</option>
              </select>

              <select
                className="form-select"
                style={{ width: '140px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="todos">Todos Status</option>
                <option value="agendado">Agendados</option>
                <option value="confirmado">Confirmados</option>
                <option value="realizado">Realizados</option>
              </select>
            </div>
          </div>

          {/* Appointments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredAppointments.map((appt) => (
              <div
                key={appt.id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.15rem 1.35rem',
                  border: `1px solid ${
                    appt.status === 'confirmado'
                      ? 'var(--status-success)'
                      : appt.status === 'realizado'
                      ? 'var(--border-subtle)'
                      : 'var(--border-medium)'
                  }`,
                  opacity: appt.status === 'realizado' ? 0.75 : 1,
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
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <UserCheck size={22} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        {appt.personName}
                      </h4>

                      <span
                        style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: 'var(--accent-gold)',
                          border: '1px solid rgba(245, 158, 11, 0.35)',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {appt.appointmentType}
                      </span>

                      <span
                        className={`badge ${
                          appt.status === 'confirmado'
                            ? 'badge-success'
                            : appt.status === 'realizado'
                            ? 'badge-gold'
                            : 'badge-blue'
                        }`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {appt.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', flexWrap: 'wrap', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                        <span>{formatDate(appt.date)} às {appt.time}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} color="var(--accent-blue-light)" style={{ flexShrink: 0 }} />
                        <span>{appt.location}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <UserCheck size={14} color="#10B981" style={{ flexShrink: 0 }} />
                        <span>Pastor(a): {appt.assignedPastor}</span>
                      </div>

                      <span>📞 {appt.personPhone}</span>
                    </div>

                    {appt.reason && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        <strong>Motivo:</strong> {appt.reason}
                      </div>
                    )}
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
                    onClick={() => handleSendWhatsAppReminder(appt)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.35rem', color: '#10B981', background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.25)' }}
                    title="Disparar Lembrete pelo WhatsApp"
                  >
                    <MessageCircle size={15} />
                    <span>Lembrete</span>
                  </button>

                  {appt.status !== 'realizado' && (
                    <button
                      onClick={() => handleMarkAsDone(appt)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--status-success)' }}
                      title="Concluir Atendimento"
                    >
                      <Check size={15} />
                    </button>
                  )}

                  <button
                    onClick={() => openEditApptModal(appt)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.35rem', padding: '0.45rem 0.75rem' }}
                    title="Editar Atendimento"
                  >
                    <Edit2 size={14} />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => handleDeleteAppt(appt)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.45rem 0.65rem', color: 'var(--status-error)' }}
                    title="Cancelar Atendimento"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {filteredAppointments.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem 1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--border-medium)',
                }}
              >
                <Calendar size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhum atendimento pastoral encontrado</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Ajuste os filtros de busca ou agende um novo atendimento no gabinete.
                </p>
                <button onClick={() => openNewApptModal()} className="btn btn-primary btn-sm">
                  <Plus size={16} /> Agendar Atendimento
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: PEDIDOS DE ORAÇÃO & VISITAS ==================== */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Controls Bar */}
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
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '360px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Buscar por solicitante ou texto do pedido..."
                value={prayerSearch}
                onChange={(e) => setPrayerSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ width: '180px' }}
              value={prayerCatFilter}
              onChange={(e) => setPrayerCatFilter(e.target.value)}
            >
              <option value="todos">Todas as Causas</option>
              <option value="Saúde">Saúde</option>
              <option value="Família">Família</option>
              <option value="Finanças">Finanças</option>
              <option value="Libertação">Libertação</option>
              <option value="Luto">Luto</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          {/* Prayer Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredPrayers.map((pray) => (
              <div
                key={pray.id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.15rem 1.35rem',
                  border: '1px solid var(--border-medium)',
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
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#EF4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <HeartHandshake size={22} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        {pray.requesterName}
                      </h4>
                      <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                        {pray.category}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        • {formatDateTime(pray.createdAt)}
                      </span>
                      {pray.phone && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold-light)' }}>
                          • 📞 {pray.phone}
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.86rem',
                        lineHeight: 1.4,
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      "{pray.message}"
                    </p>
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
                    onClick={() => handleConvertPrayerToAppt(pray)}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.35rem' }}
                    title="Agendar Visita ou Atendimento no Gabinete"
                  >
                    <Calendar size={14} />
                    <span>Agendar Gabinete</span>
                  </button>

                  <button
                    onClick={() => {
                      const clean = (pray.phone || '').replace(/\D/g, '');
                      if (!clean) return;
                      const msg = `Graça e paz, ${pray.requesterName}! Recebemos seu pedido de oração no MACDP. Os pastores estão intercedendo por você!`;
                      window.open(`https://wa.me/55${clean}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#10B981', padding: '0.45rem 0.65rem' }}
                    title="Responder pelo WhatsApp"
                  >
                    <MessageCircle size={15} />
                  </button>
                </div>
              </div>
            ))}

            {filteredPrayers.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3.5rem 1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--border-medium)',
                }}
              >
                <HeartHandshake size={36} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Nenhum pedido de oração encontrado</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Não há pedidos filtrados para esta categoria.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: PRONTUÁRIO & HISTÓRICO CONFIDENCIAL ==================== */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Shield size={20} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              <strong>Sigilo Ético e Confidencialidade Pastoral:</strong> As informações anotadas no prontuário são de acesso exclusivo do corpo pastoral do MACDP, resguardadas pelo sigilo ministerial.
            </span>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ fontSize: '0.875rem' }}>
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Pessoa Atendida</th>
                    <th>Tipo de Atendimento</th>
                    <th>Pastor(a)</th>
                    <th>Motivo & Encaminhamento</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt.id}>
                      <td>
                        <strong>{formatDate(appt.date)}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{appt.time}</div>
                      </td>
                      <td>
                        <strong>{appt.personName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{appt.personPhone}</div>
                      </td>
                      <td>
                        <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                          {appt.appointmentType}
                        </span>
                      </td>
                      <td>{appt.assignedPastor}</td>
                      <td>
                        <div style={{ maxWidth: '300px' }}>
                          <div>{appt.reason}</div>
                          {appt.confidentialNotes && (
                            <small style={{ color: 'var(--accent-gold-light)', fontStyle: 'italic' }}>
                              🔒 {appt.confidentialNotes}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            appt.status === 'confirmado'
                              ? 'badge-success'
                              : appt.status === 'realizado'
                              ? 'badge-gold'
                              : 'badge-blue'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <button
                            onClick={() => openEditApptModal(appt)}
                            className="btn btn-sm btn-secondary"
                            title="Editar"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteAppt(appt)}
                            className="btn btn-sm btn-secondary"
                            style={{ color: 'var(--status-error)' }}
                            title="Excluir"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL CRIAR / EDITAR ATENDIMENTO PASTORAL ==================== */}
      <Modal
        isOpen={isApptModalOpen}
        onClose={() => setIsApptModalOpen(false)}
        title={editingAppt ? `Editar Atendimento: ${editingAppt.personName}` : 'Agendar Novo Atendimento / Visita Pastoral'}
        maxWidth="640px"
      >
        <form onSubmit={handleSaveAppt}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nome Completo da Pessoa / Casal *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: Carlos Eduardo Neves & Tereza Cristina"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Pessoa *</label>
              <select
                className="form-select"
                value={personType}
                onChange={(e) => setPersonType(e.target.value as any)}
              >
                <option value="Membro">Membro</option>
                <option value="Visitante">Visitante</option>
                <option value="Líder">Líder / Voluntário</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Telefone / WhatsApp *</label>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="Ex: 92984509989"
                value={personPhone}
                onChange={(e) => setPersonPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pastor(a) Designado(a) *</label>
              <select
                className="form-select"
                value={assignedPastor}
                onChange={(e) => setAssignedPastor(e.target.value)}
              >
                <option value="Pr. Oziel Gomes Maduro & Pra. Midiã Gomes Maduro">Pr. Oziel & Pra. Midiã (Presidentes)</option>
                <option value="Pr. Oziel Gomes Maduro">Pr. Oziel Gomes Maduro</option>
                <option value="Pra. Midiã Gomes Maduro">Pra. Midiã Gomes Maduro</option>
                <option value="Pr. Jaziel Maduro & Pra. Abda Maduro">Pr. Jaziel & Pra. Abda (Auxiliares)</option>
                <option value="Pr. Samuel Trindade & Pra. Daniely Trindade">Pr. Samuel & Pra. Daniely (Auxiliares)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Tipo de Atendimento *</label>
              <select
                className="form-select"
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value as any)}
              >
                <option value="Gabinete Presencial">Gabinete Presencial</option>
                <option value="Visita Domiciliar">Visita Domiciliar</option>
                <option value="Visita Hospitalar">Visita Hospitalar</option>
                <option value="Aconselhamento Matrimonial">Aconselhamento Casais</option>
                <option value="Online / Chamada">Online / Chamada</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Data *</label>
              <input
                type="date"
                required
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Horário *</label>
              <input
                type="time"
                required
                className="form-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Local do Atendimento *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Gabinete Pastoral (Templo Central) ou Endereço em Manaus"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="agendado">Agendado</option>
                <option value="confirmado">Confirmado</option>
                <option value="realizado">Realizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Motivo do Atendimento / Causa da Oração *</label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              placeholder="Descreva a razão do aconselhamento, necessidades espirituais ou familiares..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notas Pastorais Confidenciais (Opcional)</label>
            <textarea
              rows={2}
              className="form-textarea"
              placeholder="Anotações de uso estrito do pastor (recomendações, orações direcionadas, acompanhamento)..."
              value={confidentialNotes}
              onChange={(e) => setConfidentialNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsApptModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingAppt ? 'Salvar Alterações' : 'Agendar Atendimento'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
