import React, { useState } from 'react';
import { PrayerRequest, PrayerStatus, PrayerCategory } from '../../types';
import {
  updatePrayerStatus,
  addPrayerRequest,
  updatePrayerRequest,
  deletePrayerRequest,
} from '../../services/db';
import { formatDateTime } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import {
  HeartHandshake,
  Filter,
  CheckCircle2,
  Clock,
  MessageCircle,
  Lock,
  Phone,
  Mail,
  Edit,
  Edit2,
  Trash2,
  Sparkles,
  Search,
  Plus,
} from 'lucide-react';

interface PrayerCentralProps {
  prayers: PrayerRequest[];
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const PrayerCentral: React.FC<PrayerCentralProps> = ({ prayers, onNotify }) => {
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Note Modal
  const [selectedPrayerForNote, setSelectedPrayerForNote] = useState<PrayerRequest | null>(null);
  const [noteText, setNoteText] = useState('');
  const [targetStatus, setTargetStatus] = useState<PrayerStatus>('em_oracao');

  // Create / Edit Prayer Modal
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<PrayerRequest | null>(null);

  const [requesterName, setRequesterName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('Família');
  const [message, setMessage] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [requestPastoralContact, setRequestPastoralContact] = useState(false);

  const openNewPrayerModal = () => {
    setEditingPrayer(null);
    setRequesterName('');
    setPhone('');
    setEmail('');
    setCategory('Família');
    setMessage('');
    setIsPrivate(false);
    setRequestPastoralContact(false);
    setIsPrayerModalOpen(true);
  };

  const openEditPrayerModal = (prayer: PrayerRequest) => {
    setEditingPrayer(prayer);
    setRequesterName(prayer.requesterName);
    setPhone(prayer.phone || '');
    setEmail(prayer.email || '');
    setCategory(prayer.category);
    setMessage(prayer.message);
    setIsPrivate(!!prayer.isPrivate);
    setRequestPastoralContact(prayer.requestPastoralContact);
    setIsPrayerModalOpen(true);
  };

  const handleSavePrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requesterName.trim() || !message.trim()) {
      onNotify('error', 'Preencha o nome do solicitante e o pedido de oração.');
      return;
    }

    if (editingPrayer) {
      updatePrayerRequest(editingPrayer.id, {
        requesterName,
        phone,
        email,
        category,
        message,
        isPrivate,
        requestPastoralContact,
      });
      onNotify('success', `Pedido de ${requesterName} atualizado com sucesso!`);
    } else {
      addPrayerRequest({
        requesterName,
        phone,
        email,
        category,
        message,
        isAnonymous: false,
        isPrivate,
        requestPastoralContact,
      });
      onNotify('success', `Pedido de oração para ${requesterName} cadastrado com sucesso!`);
    }

    setIsPrayerModalOpen(false);
  };

  const handleDeletePrayer = (prayer: PrayerRequest) => {
    if (window.confirm(`Deseja realmente excluir o pedido de oração de ${prayer.requesterName}?`)) {
      deletePrayerRequest(prayer.id);
      onNotify('info', `Pedido de ${prayer.requesterName} foi removido.`);
    }
  };

  const handleOpenNoteModal = (prayer: PrayerRequest) => {
    setSelectedPrayerForNote(prayer);
    setNoteText(prayer.pastoralNotes || '');
    setTargetStatus(prayer.status);
  };

  const handleSavePastoralCare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrayerForNote) return;

    updatePrayerStatus(selectedPrayerForNote.id, targetStatus, noteText);
    onNotify('success', 'Anotações pastorais e status atualizados com sucesso!');
    setSelectedPrayerForNote(null);
  };

  const handleQuickStatus = (prayerId: string, status: PrayerStatus) => {
    updatePrayerStatus(prayerId, status);
    onNotify('info', `Status do pedido atualizado para: ${status.replace('_', ' ').toUpperCase()}`);
  };

  const filteredPrayers = prayers.filter((p) => {
    const matchStatus = statusFilter === 'todos' || p.status === statusFilter;
    const matchCat = categoryFilter === 'todos' || p.category === categoryFilter;
    const matchSearch =
      !searchTerm ||
      p.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchStatus && matchCat && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
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
          gap: '1rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Central de Oração & Triagem Pastoral</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Acompanhe pedidos enviados pelo portal público, registre novos clamores e direcione o cuidado pastoral
          </p>
        </div>

        <button
          onClick={openNewPrayerModal}
          className="btn btn-primary"
          style={{ gap: '0.45rem', fontSize: '0.875rem' }}
        >
          <Plus size={16} />
          <span>Novo Pedido de Oração</span>
        </button>
      </div>

      {/* Filters Toolbar */}
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
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Buscar por nome ou motivo de oração..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</span>
            <select
              className="form-select"
              style={{ width: '150px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="novo">Novo</option>
              <option value="em_oracao">Em Oração</option>
              <option value="atendido">Atendido</option>
              <option value="testemunho">Testemunho</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Categoria:</span>
            <select
              className="form-select"
              style={{ width: '150px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="todos">Todas</option>
              <option value="Saúde">Saúde</option>
              <option value="Família">Família</option>
              <option value="Finanças">Finanças</option>
              <option value="Espiritual">Espiritual</option>
              <option value="Libertação">Libertação</option>
              <option value="Gratidão">Gratidão</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prayers List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredPrayers.map((prayer) => {
          const cleanPhone = prayer.phone ? prayer.phone.replace(/\D/g, '') : '';
          const waLink = cleanPhone
            ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                `Olá ${prayer.requesterName}! Graça e paz, somos da Equipe Pastoral do MACDP. Estamos em oração pelo seu pedido.`
              )}`
            : null;

          return (
            <div
              key={prayer.id}
              className="card"
              style={{
                borderLeft: `4px solid ${
                  prayer.status === 'novo'
                    ? 'var(--accent-gold)'
                    : prayer.status === 'testemunho'
                    ? 'var(--status-success)'
                    : 'var(--border-medium)'
                }`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{prayer.requesterName}</h4>
                    {prayer.isPrivate && (
                      <span
                        className="badge badge-warning"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}
                      >
                        <Lock size={10} /> Privado (Apenas Pastores)
                      </span>
                    )}
                    <span className="badge badge-gold">{prayer.category}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {formatDateTime(prayer.createdAt)}
                  </span>
                  <span
                    className={`badge ${
                      prayer.status === 'novo'
                        ? 'badge-gold'
                        : prayer.status === 'testemunho'
                        ? 'badge-success'
                        : 'badge-blue'
                    }`}
                  >
                    {prayer.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Message */}
              <p
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                  marginBottom: '1rem',
                  background: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  fontStyle: 'italic',
                }}
              >
                "{prayer.message}"
              </p>

              {/* Contact info & Pastoral Notes */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', alignItems: 'center', flexWrap: 'wrap' }}>
                  {prayer.phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Phone size={14} color="var(--accent-gold)" /> {prayer.phone}
                    </span>
                  )}
                  {prayer.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={14} color="var(--accent-blue-light)" /> {prayer.email}
                    </span>
                  )}
                  {prayer.requestPastoralContact && (
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
                      ⚠️ Solicitou contato pastoral
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-secondary"
                      style={{ color: '#10B981', gap: '0.35rem' }}
                      title="Chamar no WhatsApp"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  {prayer.status === 'novo' && (
                    <button
                      onClick={() => handleQuickStatus(prayer.id, 'em_oracao')}
                      className="btn btn-sm btn-secondary"
                    >
                      Mover p/ Em Oração
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenNoteModal(prayer)}
                    className="btn btn-sm btn-primary"
                    style={{ gap: '0.35rem' }}
                    title="Anotação Pastoral & Status"
                  >
                    <Edit size={14} />
                    <span>Pastoral</span>
                  </button>

                  <button
                    onClick={() => openEditPrayerModal(prayer)}
                    className="btn btn-sm btn-secondary"
                    title="Editar Pedido"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    onClick={() => handleDeletePrayer(prayer)}
                    className="btn btn-sm btn-secondary"
                    style={{ color: 'var(--status-error)' }}
                    title="Excluir Pedido"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {prayer.pastoralNotes && (
                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.825rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <strong>Histórico Pastoral:</strong> {prayer.pastoralNotes}
                </div>
              )}
            </div>
          );
        })}

        {filteredPrayers.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-medium)',
            }}
          >
            <HeartHandshake size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhum pedido encontrado</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Tente alterar os filtros ou registre um novo pedido de clamor.
            </p>
            <button onClick={openNewPrayerModal} className="btn btn-primary btn-sm">
              <Plus size={16} /> Novo Pedido de Oração
            </button>
          </div>
        )}
      </div>

      {/* MODAL NOTAS PASTORAIS & STATUS */}
      <Modal
        isOpen={!!selectedPrayerForNote}
        onClose={() => setSelectedPrayerForNote(null)}
        title={selectedPrayerForNote ? `Cuidado Pastoral: ${selectedPrayerForNote.requesterName}` : ''}
        maxWidth="550px"
      >
        {selectedPrayerForNote && (
          <form onSubmit={handleSavePastoralCare}>
            <div className="form-group">
              <label className="form-label">Atualizar Status do Pedido</label>
              <select
                className="form-select"
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as PrayerStatus)}
              >
                <option value="novo">Novo / Não Lida</option>
                <option value="em_oracao">Em Oração com a Equipe</option>
                <option value="atendido">Atendido / Cuidado Prestado</option>
                <option value="testemunho">Testemunho / Milagre Alcançado</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Anotações Internas da Liderança Pastoral</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Ex: Realizada visita hospitalar; pastores oraram no altar; solicitou batismo..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedPrayerForNote(null)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar Triagem
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL CRIAR / EDITAR PEDIDO DE ORAÇÃO */}
      <Modal
        isOpen={isPrayerModalOpen}
        onClose={() => setIsPrayerModalOpen(false)}
        title={editingPrayer ? `Editar Pedido: ${editingPrayer.requesterName}` : 'Cadastrar Pedido de Oração'}
        maxWidth="580px"
      >
        <form onSubmit={handleSavePrayer}>
          <div className="form-group">
            <label className="form-label">Nome Completo do Solicitante *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: Ana Paula Ferreira"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">WhatsApp</label>
              <input
                type="tel"
                className="form-input"
                placeholder="(92) 98450-9989"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                className="form-input"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Categoria do Clamor *</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as PrayerCategory)}
            >
              <option value="Família">Família</option>
              <option value="Saúde">Saúde</option>
              <option value="Finanças">Finanças</option>
              <option value="Espiritual">Espiritual</option>
              <option value="Libertação">Libertação</option>
              <option value="Gratidão">Gratidão</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Pedido de Oração / Motivo *</label>
            <textarea
              required
              rows={4}
              className="form-textarea"
              placeholder="Descreva o motivo de oração detalhadamente..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <span>Manter como <strong>Privado</strong> (visível apenas aos Pastores)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={requestPastoralContact}
                onChange={(e) => setRequestPastoralContact(e.target.checked)}
              />
              <span>Solicita ligação ou visita pastoral</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsPrayerModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingPrayer ? 'Salvar Alterações' : 'Cadastrar Pedido'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
