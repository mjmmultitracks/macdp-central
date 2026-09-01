import React, { useState } from 'react';
import { Ministry } from '../../types';
import { addMinistry, updateMinistry, deleteMinistry } from '../../services/db';
import { Modal } from '../common/Modal';
import {
  Sparkles,
  Plus,
  Search,
  Users,
  Clock,
  Phone,
  MessageCircle,
  Edit2,
  Trash2,
  Music,
  HeartHandshake,
  Heart,
  Video,
  Flame,
  Baby,
  Shield,
} from 'lucide-react';

interface MinistriesManagerProps {
  ministries: Ministry[];
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const MinistriesManager: React.FC<MinistriesManagerProps> = ({ ministries, onNotify }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('92984509989');
  const [description, setDescription] = useState('');
  const [meetingSchedule, setMeetingSchedule] = useState('');
  const [membersCount, setMembersCount] = useState<number>(10);

  const openNewMinistryModal = () => {
    setEditingMinistry(null);
    setName('');
    setLeaderName('');
    setLeaderPhone('92984509989');
    setDescription('');
    setMeetingSchedule('Sábados às 17h');
    setMembersCount(10);
    setIsModalOpen(true);
  };

  const openEditMinistryModal = (min: Ministry) => {
    setEditingMinistry(min);
    setName(min.name);
    setLeaderName(min.leaderName);
    setLeaderPhone(min.leaderPhone);
    setDescription(min.description);
    setMeetingSchedule(min.meetingSchedule || '');
    setMembersCount(min.membersCount || 10);
    setIsModalOpen(true);
  };

  const handleSaveMinistry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !leaderName.trim()) {
      onNotify('error', 'Preencha o nome do ministério e a liderança.');
      return;
    }

    if (editingMinistry) {
      updateMinistry(editingMinistry.id, {
        name,
        leaderName,
        leaderPhone,
        description,
        meetingSchedule,
        membersCount: Number(membersCount) || 1,
      });
      onNotify('success', `Ministério "${name}" atualizado com sucesso!`);
    } else {
      addMinistry({
        name,
        leaderName,
        leaderPhone,
        description,
        meetingSchedule,
        membersCount: Number(membersCount) || 1,
      });
      onNotify('success', `Ministério "${name}" cadastrado com sucesso!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteMinistry = (min: Ministry) => {
    if (window.confirm(`Deseja realmente excluir o ministério "${min.name}" da liderança de ${min.leaderName}?`)) {
      deleteMinistry(min.id);
      onNotify('info', `Ministério "${min.name}" removido.`);
    }
  };

  const filteredMinistries = ministries.filter((m) => {
    return (
      !searchTerm ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalVolunteers = ministries.reduce((acc, m) => acc + (m.membersCount || 0), 0);

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
              <Sparkles size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Ministérios & Equipes de Serviço (MACDP)</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Cadastre novos ministérios, gerencie os líderes responsáveis e acompanhe a atuação das equipes
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-gold">
              {ministries.length} Ministérios Ativos
            </span>
            <span className="badge badge-success">
              ~{totalVolunteers} Voluntários Envolvidos
            </span>
          </div>
          <button
            onClick={openNewMinistryModal}
            className="btn btn-primary"
            style={{ gap: '0.45rem', fontSize: '0.875rem' }}
          >
            <Plus size={16} />
            <span>Novo Ministério</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: '450px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Buscar por nome do ministério, líder ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Ministries Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filteredMinistries.map((min) => {
          const cleanPhone = min.leaderPhone.replace(/\D/g, '');
          const waLink = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
            `Graça e paz, líder ${min.leaderName}! Gostaria de saber mais sobre o Ministério de ${min.name} do MACDP.`
          )}`;

          return (
            <div
              key={min.id}
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-medium)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: 'var(--accent-gold)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sparkles size={20} />
                  </div>
                  <span className="badge badge-gold">
                    ~{min.membersCount || 0} Voluntários
                  </span>
                </div>

                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>
                  {min.name}
                </h4>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {min.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Users size={16} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Liderança:</strong> {min.leaderName}
                    </span>
                  </div>

                  {min.meetingSchedule && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <Clock size={16} color="var(--accent-blue-light)" style={{ flexShrink: 0 }} />
                      <span>{min.meetingSchedule}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.4rem', color: '#10B981' }}
                  title="Falar com a liderança via WhatsApp"
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp Líder</span>
                </a>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => openEditMinistryModal(min)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.45rem 0.65rem' }}
                    title="Editar Ministério"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteMinistry(min)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.45rem 0.65rem', color: 'var(--status-error)' }}
                    title="Excluir Ministério"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMinistries.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '4rem 1rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-medium)',
            }}
          >
            <Sparkles size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhum ministério encontrado</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Tente uma busca diferente ou cadastre um novo ministério.
            </p>
            <button onClick={openNewMinistryModal} className="btn btn-primary btn-sm">
              <Plus size={16} /> Cadastrar Novo Ministério
            </button>
          </div>
        )}
      </div>

      {/* MODAL CRIAR / EDITAR MINISTÉRIO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMinistry ? `Editar Ministério: ${editingMinistry.name}` : 'Cadastrar Novo Ministério'}
        maxWidth="600px"
      >
        <form onSubmit={handleSaveMinistry}>
          <div className="form-group">
            <label className="form-label">Nome do Ministério *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: Louvor & Adoração Profética"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Líder(es) Responsável(eis) *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: Thiago Albuquerque & Mariana Costa"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp do Líder *</label>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="Ex: 92984509989"
                value={leaderPhone}
                onChange={(e) => setLeaderPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição / Propósito do Ministério *</label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              placeholder="Descreva as atividades e propósito espiritual do ministério..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Horário de Ensaios / Reuniões</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Sábados às 16:00"
                value={meetingSchedule}
                onChange={(e) => setMeetingSchedule(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Voluntários / Integrantes Ativos</label>
              <input
                type="number"
                min={1}
                className="form-input"
                value={membersCount}
                onChange={(e) => setMembersCount(Number(e.target.value))}
              />
            </div>
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
              {editingMinistry ? 'Salvar Alterações' : 'Cadastrar Ministério'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
