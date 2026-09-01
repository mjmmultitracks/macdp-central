import React, { useState } from 'react';
import { CellGroup } from '../../types';
import { addCell, updateCell, deleteCell } from '../../services/db';
import { Modal } from '../common/Modal';
import {
  Compass,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Users,
  MessageCircle,
  Edit2,
  Trash2,
  Phone,
  Home,
  Calendar,
} from 'lucide-react';

interface CellsManagerProps {
  cells: CellGroup[];
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const CellsManager: React.FC<CellsManagerProps> = ({ cells, onNotify }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<string>('todos');
  const [selectedDay, setSelectedDay] = useState<string>('todos');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<CellGroup | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('92984509989');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Quinta-feira');
  const [time, setTime] = useState('20:00');
  const [targetAudience, setTargetAudience] = useState<CellGroup['targetAudience']>('Mista');
  const [membersCount, setMembersCount] = useState<number>(12);

  const openNewCellModal = () => {
    setEditingCell(null);
    setName('');
    setLeaderName('');
    setLeaderPhone('92984509989');
    setNeighborhood('Conj. Canaranas / Cidade Nova');
    setAddress('Rua Lagoa Grande, 382');
    setDayOfWeek('Quinta-feira');
    setTime('20:00');
    setTargetAudience('Mista');
    setMembersCount(12);
    setIsModalOpen(true);
  };

  const openEditCellModal = (cell: CellGroup) => {
    setEditingCell(cell);
    setName(cell.name);
    setLeaderName(cell.leaderName);
    setLeaderPhone(cell.leaderPhone);
    setNeighborhood(cell.neighborhood);
    setAddress(cell.address);
    setDayOfWeek(cell.dayOfWeek);
    setTime(cell.time);
    setTargetAudience(cell.targetAudience);
    setMembersCount(cell.membersCount || 10);
    setIsModalOpen(true);
  };

  const handleSaveCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !leaderName.trim() || !neighborhood.trim()) {
      onNotify('error', 'Preencha o nome da célula, o líder e o bairro.');
      return;
    }

    if (editingCell) {
      updateCell(editingCell.id, {
        name,
        leaderName,
        leaderPhone,
        neighborhood,
        address,
        dayOfWeek,
        time,
        targetAudience,
        membersCount: Number(membersCount) || 1,
      });
      onNotify('success', `Célula "${name}" atualizada com sucesso!`);
    } else {
      addCell({
        name,
        leaderName,
        leaderPhone,
        neighborhood,
        address,
        dayOfWeek,
        time,
        targetAudience,
        membersCount: Number(membersCount) || 1,
        latitude: -3.038,
        longitude: -60.003,
      });
      onNotify('success', `Célula "${name}" cadastrada com sucesso!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteCell = (cell: CellGroup) => {
    if (window.confirm(`Deseja realmente remover a célula "${cell.name}" da liderança de ${cell.leaderName}?`)) {
      deleteCell(cell.id);
      onNotify('info', `Célula "${cell.name}" foi removida.`);
    }
  };

  const filteredCells = cells.filter((c) => {
    const matchSearch =
      !searchTerm ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());

    const matchAudience = selectedAudience === 'todos' || c.targetAudience === selectedAudience;
    const matchDay = selectedDay === 'todos' || c.dayOfWeek.toLowerCase().includes(selectedDay.toLowerCase());

    return matchSearch && matchAudience && matchDay;
  });

  const totalMembersInCells = cells.reduce((acc, c) => acc + (c.membersCount || 0), 0);

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
              <Compass size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Células & Pequenos Grupos (MACDP)</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Cadastre, edite líderes e gerencie os pequenos grupos espalhados por bairros de Manaus
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-gold">
              {cells.length} Células Ativas
            </span>
            <span className="badge badge-success">
              ~{totalMembersInCells} Discípulos em Comunhão
            </span>
          </div>
          <button
            onClick={openNewCellModal}
            className="btn btn-primary"
            style={{ gap: '0.45rem', fontSize: '0.875rem' }}
          >
            <Plus size={16} />
            <span>Nova Célula</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
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
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '400px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Buscar por célula, líder ou bairro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Público:</span>
            <select
              className="form-select"
              style={{ width: '150px' }}
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value)}
            >
              <option value="todos">Todos os Públicos</option>
              <option value="Mista">Mista</option>
              <option value="Jovens">Jovens</option>
              <option value="Casais">Casais</option>
              <option value="Mulheres">Mulheres</option>
              <option value="Homens">Homens</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Dia:</span>
            <select
              className="form-select"
              style={{ width: '150px' }}
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              <option value="todos">Todos os Dias</option>
              <option value="Segunda">Segunda-feira</option>
              <option value="Terça">Terça-feira</option>
              <option value="Quarta">Quarta-feira</option>
              <option value="Quinta">Quinta-feira</option>
              <option value="Sexta">Sexta-feira</option>
              <option value="Sábado">Sábado</option>
              <option value="Domingo">Domingo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cells Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filteredCells.map((cell) => {
          const cleanPhone = cell.leaderPhone.replace(/\D/g, '');
          const waLink = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
            `Olá Líder ${cell.leaderName}! Graça e paz, vi a ${cell.name} pelo site do MACDP.`
          )}`;

          return (
            <div
              key={cell.id}
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-medium)',
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: 'var(--accent-gold-light)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    Público: {cell.targetAudience}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    ~{cell.membersCount} discípulos
                  </span>
                </div>

                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  {cell.name}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Users size={16} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Líder:</strong> {cell.leaderName}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={16} color="var(--accent-blue-light)" style={{ flexShrink: 0 }} />
                    <span>
                      {cell.neighborhood} • <small>{cell.address}</small>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Clock size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    <span>
                      {cell.dayOfWeek} às <strong>{cell.time}</strong>
                    </span>
                  </div>
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
                  title="Falar com o líder via WhatsApp"
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp Líder</span>
                </a>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => openEditCellModal(cell)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.45rem 0.65rem' }}
                    title="Editar Célula"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteCell(cell)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.45rem 0.65rem', color: 'var(--status-error)' }}
                    title="Excluir Célula"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCells.length === 0 && (
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
            <Compass size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhuma célula encontrada</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Tente alterar os filtros de busca ou cadastre uma nova célula no sistema.
            </p>
            <button onClick={openNewCellModal} className="btn btn-primary btn-sm">
              <Plus size={16} /> Cadastrar Nova Célula
            </button>
          </div>
        )}
      </div>

      {/* MODAL CRIAR / EDITAR CÉLULA */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCell ? `Editar Célula: ${editingCell.name}` : 'Cadastrar Nova Célula'}
        maxWidth="620px"
      >
        <form onSubmit={handleSaveCell}>
          <div className="form-group">
            <label className="form-label">Nome da Célula *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: Célula Canaranas da Presença"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nome do Líder / Casal de Líderes *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: Lucas & Débora Oliveira"
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Bairro em Manaus *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: Cidade Nova / Canaranas"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Endereço (Rua e Número) *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: Rua Lagoa Grande, 382"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Dia da Semana *</label>
              <select
                className="form-select"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
              >
                <option value="Segunda-feira">Segunda-feira</option>
                <option value="Terça-feira">Terça-feira</option>
                <option value="Quarta-feira">Quarta-feira</option>
                <option value="Quinta-feira">Quinta-feira</option>
                <option value="Sexta-feira">Sexta-feira</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Horário *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="20:00"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Público-Alvo *</label>
              <select
                className="form-select"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
              >
                <option value="Mista">Mista</option>
                <option value="Jovens">Jovens</option>
                <option value="Casais">Casais</option>
                <option value="Mulheres">Mulheres</option>
                <option value="Homens">Homens</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Quantidade de Membros / Participantes</label>
            <input
              type="number"
              min={1}
              className="form-input"
              value={membersCount}
              onChange={(e) => setMembersCount(Number(e.target.value))}
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
              {editingCell ? 'Salvar Alterações' : 'Cadastrar Célula'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
