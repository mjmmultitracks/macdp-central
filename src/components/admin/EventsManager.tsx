import React, { useState } from 'react';
import {
  checkInGuest,
  addEventRegistration,
  updateEventRegistrationPayment,
  addEvent,
  updateEvent,
  deleteEvent,
  deleteEventRegistration,
} from '../../services/db';
import { GoogleLocationPicker } from './GoogleLocationPicker';
import { ChurchEvent, EventCustomQuestion, EventQuestionType, EventLocationDetails, EventRegistration } from '../../types';
import { formatDate, formatCurrency, calculateAge, formatEventDateRange } from '../../utils/formatters';
import { generateEventRegistrationsListPDF } from '../../utils/pdfGenerator';
import { Modal } from '../common/Modal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Plus,
  QrCode,
  Building,
  Check,
  Search,
  Edit2,
  Trash2,
  DollarSign,
  X,
  HelpCircle,
  ListPlus,
  Mic,
  Tag,
  GripVertical,
  ArrowUpDown,
  List,
  LayoutGrid,
  Download,
  Printer,
  MessageCircle,
  AlertTriangle,
  ArrowLeft,
  Eye,
  CalendarRange,
} from 'lucide-react';

interface RoomItem {
  id: string;
  name: string;
  capacity: string;
  status: string;
}

interface EventsManagerProps {
  events: ChurchEvent[];
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const EventsManager: React.FC<EventsManagerProps> = ({ events, onNotify }) => {
  // Check-in modal state
  const [selectedEventForCheckin, setSelectedEventForCheckin] = useState<ChurchEvent | null>(null);
  const [searchGuest, setSearchGuest] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [checkinFilter, setCheckinFilter] = useState<'all' | 'present' | 'waiting' | 'pending_payment'>('all');
  const [checkinDisplayMode, setCheckinDisplayMode] = useState<'cards' | 'table'>('cards');
  const [viewingFormReg, setViewingFormReg] = useState<EventRegistration | null>(null);

  // Event modal state (New / Edit)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [eventViewMode, setEventViewMode] = useState<'list' | 'grid'>('list');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:30');
  const [location, setLocation] = useState('Rua Lagoa Grande, 382 - Conj. Canaranas - Cidade Nova, Manaus - AM');
  const [locationDetails, setLocationDetails] = useState<EventLocationDetails | undefined>(undefined);
  const [roomReserved, setRoomReserved] = useState('Auditório Principal');
  const [category, setCategory] = useState<ChurchEvent['category']>('Conferência');
  const [imageUrl, setImageUrl] = useState('/images/hero.jpg');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState<number>(0);
  const [totalCapacity, setTotalCapacity] = useState<number>(300);
  const [speakerName, setSpeakerName] = useState('');
  const [detailedSchedule, setDetailedSchedule] = useState('');

  // Custom Questions Builder state
  const [customQuestions, setCustomQuestions] = useState<EventCustomQuestion[]>([]);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newQLabel, setNewQLabel] = useState('');
  const [newQType, setNewQType] = useState<EventQuestionType>('select');
  const [newQOptions, setNewQOptions] = useState('');
  const [newQRequired, setNewQRequired] = useState(true);

  // Drag & drop reorder state
  const [draggedQIndex, setDraggedQIndex] = useState<number | null>(null);
  const [dragOverQIndex, setDragOverQIndex] = useState<number | null>(null);

  // Dynamic Rooms state
  const [rooms, setRooms] = useState<RoomItem[]>([
    { id: 'rm_1', name: 'Auditório Principal (Templo)', capacity: '850 lugares', status: 'Ocupado - Domingos / Conferências' },
    { id: 'rm_2', name: 'Salão Social & Cafeteria', capacity: '200 pessoas', status: 'Livre para eventos' },
    { id: 'rm_3', name: 'Sala 1 - Berçário & Kids', capacity: '40 crianças', status: 'Reservado aos domingos' },
    { id: 'rm_4', name: 'Sala 2 - Reuniões & Conselho', capacity: '25 pessoas', status: 'Disponível' },
    { id: 'rm_5', name: 'Sala 3 - Ensino & Discipulado', capacity: '50 alunos', status: 'Disponível' },
  ]);

  // Room modal state
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null);
  const [roomName, setRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState('');
  const [roomStatus, setRoomStatus] = useState('Disponível');

  const openNewEventModal = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    const todayStr = new Date().toISOString().split('T')[0];
    setDate(todayStr);
    setEndDate(todayStr);
    setTime('19:30');
    setLocation('Rua Lagoa Grande, 382 - Conj. Canaranas - Cidade Nova, Manaus - AM, 69098-000');
    setLocationDetails({
      placeName: 'Templo Sede MACDP (Igreja Central)',
      formattedAddress: 'Rua Lagoa Grande, 382 - Conj. Canaranas - Cidade Nova, Manaus - AM, 69098-000',
      neighborhood: 'Canaranas / Cidade Nova',
      city: 'Manaus',
      state: 'AM',
      latitude: -3.038142,
      longitude: -60.003215,
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=-3.038142,-60.003215',
    });
    setRoomReserved('Auditório Principal');
    setCategory('Conferência');
    setImageUrl('/images/hero.jpg');
    setIsFree(true);
    setPrice(0);
    setTotalCapacity(300);
    setSpeakerName('Pr. Oziel Gomes Maduro & Preletores Convidados');
    setDetailedSchedule('');
    setCustomQuestions([]);
    setEditingQuestionId(null);
    setIsAddingQuestion(false);
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (evt: ChurchEvent) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setDescription(evt.description);
    setDate(evt.date);
    setEndDate(evt.endDate || evt.date);
    setTime(evt.time);
    setLocation(evt.location);
    setLocationDetails(
      evt.locationDetails || {
        placeName: evt.location,
        formattedAddress: evt.location,
        city: 'Manaus',
        state: 'AM',
        latitude: -3.038142,
        longitude: -60.003215,
        googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(evt.location)}`,
      }
    );
    setRoomReserved(evt.roomReserved || 'Auditório Principal');
    setCategory(evt.category);
    setImageUrl(evt.imageUrl);
    setIsFree(evt.isFree);
    setPrice(evt.price || 0);
    setTotalCapacity(evt.totalCapacity);
    setSpeakerName(evt.speakerName || '');
    setDetailedSchedule(evt.detailedSchedule || '');
    setCustomQuestions(evt.customQuestions || []);
    setEditingQuestionId(null);
    setIsAddingQuestion(false);
    setIsEventModalOpen(true);
  };

  const handleStartEditQuestion = (q: EventCustomQuestion) => {
    setEditingQuestionId(q.id);
    setNewQLabel(q.label);
    setNewQType(q.type);
    setNewQOptions(q.options ? q.options.join(', ') : '');
    setNewQRequired(q.required);
    setIsAddingQuestion(true);
  };

  const handleCancelQuestionEdit = () => {
    setEditingQuestionId(null);
    setNewQLabel('');
    setNewQOptions('');
    setNewQRequired(true);
    setIsAddingQuestion(false);
  };

  const handleSaveQuestion = () => {
    if (!newQLabel.trim()) {
      onNotify('error', 'Digite a pergunta antes de salvar.');
      return;
    }

    const optionsList = ['select', 'radio', 'checkbox'].includes(newQType)
      ? newQOptions.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    if (['select', 'radio', 'checkbox'].includes(newQType) && (!optionsList || optionsList.length === 0)) {
      onNotify('error', 'Informe as opções separadas por vírgula (ex: P, M, G).');
      return;
    }

    if (editingQuestionId) {
      setCustomQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestionId
            ? {
                ...q,
                label: newQLabel.trim(),
                type: newQType,
                options: optionsList,
                required: newQRequired,
              }
            : q
        )
      );
      onNotify('success', 'Pergunta atualizada com sucesso!');
    } else {
      const q: EventCustomQuestion = {
        id: `q_${Date.now()}`,
        label: newQLabel.trim(),
        type: newQType,
        options: optionsList,
        required: newQRequired,
      };
      setCustomQuestions([...customQuestions, q]);
      onNotify('success', 'Pergunta adicionada ao formulário do evento!');
    }

    setEditingQuestionId(null);
    setNewQLabel('');
    setNewQOptions('');
    setNewQRequired(true);
    setIsAddingQuestion(false);
  };

  const handleRemoveQuestion = (id: string) => {
    if (editingQuestionId === id) {
      handleCancelQuestionEdit();
    }
    setCustomQuestions(customQuestions.filter((q) => q.id !== id));
    onNotify('info', 'Pergunta removida.');
  };

  const handleAddPresetQuestion = (label: string, type: EventQuestionType, options?: string[]) => {
    const q: EventCustomQuestion = {
      id: `q_${Date.now()}`,
      label,
      type,
      options,
      required: true,
    };
    setCustomQuestions([...customQuestions, q]);
    onNotify('success', `Pergunta "${label}" adicionada!`);
  };

  const handleMoveQuestion = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= customQuestions.length) return;
    const updated = [...customQuestions];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setCustomQuestions(updated);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedQIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverQIndex !== index) {
      setDragOverQIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedQIndex === null || draggedQIndex === targetIndex) {
      setDraggedQIndex(null);
      setDragOverQIndex(null);
      return;
    }
    handleMoveQuestion(draggedQIndex, targetIndex);
    setDraggedQIndex(null);
    setDragOverQIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedQIndex(null);
    setDragOverQIndex(null);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onNotify('error', 'Informe o título do evento.');
      return;
    }

    if (endDate && endDate < date) {
      onNotify('error', 'A data de término não pode ser anterior à data de início.');
      return;
    }

    const finalEndDate = endDate || date;

    if (editingEvent) {
      updateEvent(editingEvent.id, {
        title,
        description,
        date,
        endDate: finalEndDate,
        time,
        location,
        locationDetails,
        roomReserved,
        category,
        imageUrl,
        isFree,
        price: isFree ? 0 : Number(price),
        totalCapacity: Number(totalCapacity) || 100,
        registeredCount: editingEvent.registrations.length,
        speakerName,
        detailedSchedule,
        customQuestions,
      });
      onNotify('success', `Evento "${title}" atualizado com sucesso!`);
    } else {
      addEvent({
        title,
        description,
        date,
        endDate: finalEndDate,
        time,
        location,
        locationDetails,
        roomReserved,
        category,
        imageUrl,
        isFree,
        price: isFree ? 0 : Number(price),
        totalCapacity: Number(totalCapacity) || 100,
        speakerName,
        detailedSchedule,
        customQuestions,
      });
      onNotify('success', `Evento "${title}" criado com sucesso!`);
    }

    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = (evt: ChurchEvent) => {
    if (window.confirm(`Deseja realmente remover o evento "${evt.title}"? Todas as inscrições associadas serão perdidas.`)) {
      deleteEvent(evt.id);
      onNotify('info', `Evento "${evt.title}" removido com sucesso.`);
    }
  };

  const handleToggleCheckin = (eventId: string, regId: string, name: string) => {
    checkInGuest(eventId, regId);
    onNotify('success', `Check-in de ${name} atualizado!`);
    const updated = events.find((e) => e.id === eventId);
    if (updated) setSelectedEventForCheckin({ ...updated });
  };

  const handleDeleteRegistration = (eventId: string, regId: string, name: string) => {
    if (window.confirm(`Deseja cancelar a inscrição de ${name}?`)) {
      deleteEventRegistration(eventId, regId);
      onNotify('info', `Inscrição de ${name} cancelada.`);
      const updated = events.find((e) => e.id === eventId);
      if (updated) setSelectedEventForCheckin({ ...updated });
    }
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForCheckin || !guestName.trim()) return;

    addEventRegistration(selectedEventForCheckin.id, {
      name: guestName,
      phone: guestPhone,
      email: guestEmail,
    });

    onNotify('success', `Inscrição de ${guestName} realizada com sucesso!`);
    setIsAddGuestModalOpen(false);
    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');

    const updated = events.find((ev) => ev.id === selectedEventForCheckin.id);
    if (updated) setSelectedEventForCheckin({ ...updated });
  };

  const handleApprovePayment = (eventId: string, regId: string, regName: string) => {
    updateEventRegistrationPayment(eventId, regId, 'confirmed');
    onNotify('success', `Pagamento de ${regName} aprovado com sucesso!`);
    const updated = events.find((e) => e.id === eventId);
    if (updated) setSelectedEventForCheckin({ ...updated });
  };

  // Rooms CRUD
  const openNewRoomModal = () => {
    setEditingRoom(null);
    setRoomName('');
    setRoomCapacity('30 pessoas');
    setRoomStatus('Disponível');
    setIsRoomModalOpen(true);
  };

  const openEditRoomModal = (room: RoomItem) => {
    setEditingRoom(room);
    setRoomName(room.name);
    setRoomCapacity(room.capacity);
    setRoomStatus(room.status);
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    if (editingRoom) {
      setRooms((prev) =>
        prev.map((r) => (r.id === editingRoom.id ? { ...r, name: roomName, capacity: roomCapacity, status: roomStatus } : r))
      );
      onNotify('success', `Espaço "${roomName}" atualizado!`);
    } else {
      const newR: RoomItem = {
        id: `rm_${Date.now()}`,
        name: roomName,
        capacity: roomCapacity,
        status: roomStatus,
      };
      setRooms((prev) => [...prev, newR]);
      onNotify('success', `Espaço "${roomName}" cadastrado com sucesso!`);
    }
    setIsRoomModalOpen(false);
  };

  const handleDeleteRoom = (room: RoomItem) => {
    if (window.confirm(`Deseja remover o espaço "${room.name}"?`)) {
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
      onNotify('info', `Espaço "${room.name}" removido.`);
    }
  };

  // ==================== PÁGINA DEDICADA: INSCRITOS & CHECK-IN DO EVENTO ====================
  if (selectedEventForCheckin) {
    const totalRegs = selectedEventForCheckin.registrations.length;
    const presentRegs = selectedEventForCheckin.registrations.filter((r) => r.checkedIn).length;
    const waitingRegs = totalRegs - presentRegs;
    const pendingPaymentsCount = selectedEventForCheckin.registrations.filter(
      (r) => !selectedEventForCheckin.isFree && (r.paymentStatus === 'pending' || r.paymentMethod === 'manual')
    ).length;

    // Cálculo das idades
    const ages: number[] = [];
    selectedEventForCheckin.registrations.forEach((r) => {
      if (r.customAnswers) {
        for (const [k, v] of Object.entries(r.customAnswers)) {
          const qFound = selectedEventForCheckin.customQuestions?.find((q) => q.id === k);
          if (
            qFound?.type === 'date' ||
            qFound?.label.toLowerCase().includes('nasc') ||
            qFound?.label.toLowerCase().includes('data')
          ) {
            const age = calculateAge(String(v));
            if (age !== null) ages.push(age);
            break;
          }
        }
      }
    });
    const avgAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null;

    // Lista filtrada
    const filteredRegistrations = selectedEventForCheckin.registrations.filter((r) => {
      if (searchGuest.trim()) {
        const q = searchGuest.toLowerCase();
        const matchName = r.name.toLowerCase().includes(q);
        const matchPhone = r.phone?.includes(q);
        const matchEmail = r.email?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail) return false;
      }
      if (checkinFilter === 'present') return r.checkedIn;
      if (checkinFilter === 'waiting') return !r.checkedIn;
      if (checkinFilter === 'pending_payment') {
        return !selectedEventForCheckin.isFree && (r.paymentStatus === 'pending' || r.paymentMethod === 'manual');
      }
      return true;
    });

    return (
      <div key={selectedEventForCheckin.id} className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%', minHeight: '85vh', paddingBottom: '3rem' }}>
        {/* Barra Superior de Navegação & Voltar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'var(--bg-secondary)',
            padding: '1.1rem 1.5rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setSelectedEventForCheckin(null)}
              className="btn btn-secondary"
              style={{
                gap: '0.6rem',
                fontWeight: 800,
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.92rem',
              }}
            >
              <ArrowLeft size={18} />
              <span>Voltar para Eventos</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <span>Eventos</span>
              <span>›</span>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{selectedEventForCheckin.title}</span>
              <span>›</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Inscritos & Credenciamento</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                generateEventRegistrationsListPDF(selectedEventForCheckin);
                onNotify('success', 'PDF da lista de inscritos gerado com sucesso!');
              }}
              className="btn btn-secondary"
              style={{
                gap: '0.55rem',
                background: 'rgba(245, 158, 11, 0.12)',
                borderColor: 'var(--accent-gold)',
                color: 'var(--accent-gold)',
                fontWeight: 800,
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.92rem',
              }}
              title="Baixar Lista Oficial para Portaria e Impressão (Formato A4 Paisagem)"
            >
              <Download size={17} />
              <span>Gerar PDF da Lista</span>
            </button>

            <button
              onClick={() => setIsAddGuestModalOpen(true)}
              className="btn btn-primary"
              style={{
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                fontWeight: 800,
                borderRadius: 'var(--radius-md)',
                fontSize: '0.92rem',
              }}
            >
              <Plus size={17} />
              <span>Adicionar Participante</span>
            </button>
          </div>
        </div>

        {/* Card Banner do Evento com Dados Principais */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, var(--bg-secondary) 100%)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-medium)',
            padding: '1.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.18)',
                  color: 'var(--accent-gold)',
                  padding: '0.3rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {selectedEventForCheckin.category}
              </span>
              <span
                style={{
                  background: selectedEventForCheckin.isFree ? 'rgba(16, 185, 129, 0.18)' : 'rgba(59, 130, 246, 0.18)',
                  color: selectedEventForCheckin.isFree ? 'var(--status-success)' : 'var(--accent-blue-light)',
                  padding: '0.3rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                }}
              >
                {selectedEventForCheckin.isFree ? 'Entrada Gratuita' : formatCurrency(selectedEventForCheckin.price || 0)}
              </span>
            </div>

            <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, lineHeight: 1.25 }}>
              {selectedEventForCheckin.title}
            </h1>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', fontSize: '0.96rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="var(--accent-gold)" />
                <strong style={{ color: 'var(--text-primary)' }}>{formatEventDateRange(selectedEventForCheckin.date, selectedEventForCheckin.endDate)}</strong> às {selectedEventForCheckin.time}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} color="var(--accent-blue-light)" />
                <span>{selectedEventForCheckin.location} {selectedEventForCheckin.roomReserved ? `• ${selectedEventForCheckin.roomReserved}` : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Cards de Métricas e Indicadores no Topo */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Card 1: Total de Inscritos */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.25rem 1.4rem',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
              Total de Inscritos
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.3rem' }}>
              {totalRegs}
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '0.45rem' }}>
                / {selectedEventForCheckin.totalCapacity} vagas
              </span>
            </div>
          </div>

          {/* Card 2: Presentes (Credenciados) */}
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.25rem 1.4rem',
              border: '1.5px solid rgba(16, 185, 129, 0.35)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--status-success)', textTransform: 'uppercase', fontWeight: 800 }}>
              ✓ Presentes (Credenciados)
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--status-success)', marginTop: '0.3rem' }}>
              {presentRegs}
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--status-success)', marginLeft: '0.45rem' }}>
                ({totalRegs > 0 ? Math.round((presentRegs / totalRegs) * 100) : 0}%)
              </span>
            </div>
          </div>

          {/* Card 3: Aguardando Entrada */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.25rem 1.4rem',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
              Aguardando Entrada
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
              {waitingRegs}
            </div>
          </div>

          {/* Card 4: Pagamentos Pendentes */}
          {!selectedEventForCheckin.isFree && (
            <div
              style={{
                background: pendingPaymentsCount > 0 ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-secondary)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.25rem 1.4rem',
                border: `1.5px solid ${pendingPaymentsCount > 0 ? 'var(--accent-gold)' : 'var(--border-medium)'}`,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: pendingPaymentsCount > 0 ? 'var(--accent-gold)' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                ⏳ Pagamento Manual Pendente
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: pendingPaymentsCount > 0 ? 'var(--accent-gold)' : 'var(--text-primary)', marginTop: '0.3rem' }}>
                {pendingPaymentsCount}
                {pendingPaymentsCount > 0 && (
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginLeft: '0.45rem' }}>
                    Contatar participante!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Card 5: Média de Idade */}
          {avgAge !== null && (
            <div
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.25rem 1.4rem',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                🎂 Média de Idade
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-gold)', marginTop: '0.3rem' }}>
                {avgAge} <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>anos</span>
              </div>
            </div>
          )}
        </div>

        {/* Barra de Filtros, Busca & Seletor de Modo (Cards vs Tabela) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'var(--bg-secondary)',
            padding: '1.1rem 1.4rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Campo de Busca Amplo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 360px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.75rem', fontSize: '0.95rem', paddingRight: searchGuest ? '2.5rem' : '1rem' }}
                placeholder="Buscar por nome, WhatsApp ou e-mail..."
                value={searchGuest}
                onChange={(e) => setSearchGuest(e.target.value)}
              />
              {searchGuest && (
                <button
                  type="button"
                  onClick={() => setSearchGuest('')}
                  style={{
                    position: 'absolute',
                    right: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Exibindo <strong>{filteredRegistrations.length}</strong> de {totalRegs} inscritos
            </span>
          </div>

          {/* Filtros de Status & Seletor de Modo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Pílulas de Filtro */}
            <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', gap: '0.25rem' }}>
              <button
                type="button"
                onClick={() => setCheckinFilter('all')}
                className={`btn btn-sm ${checkinFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', borderRadius: '6px' }}
              >
                Todos ({totalRegs})
              </button>
              <button
                type="button"
                onClick={() => setCheckinFilter('present')}
                className={`btn btn-sm ${checkinFilter === 'present' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', borderRadius: '6px' }}
              >
                Presentes ({presentRegs})
              </button>
              <button
                type="button"
                onClick={() => setCheckinFilter('waiting')}
                className={`btn btn-sm ${checkinFilter === 'waiting' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', borderRadius: '6px' }}
              >
                Aguardando ({waitingRegs})
              </button>
              {!selectedEventForCheckin.isFree && pendingPaymentsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setCheckinFilter('pending_payment')}
                  className={`btn btn-sm ${checkinFilter === 'pending_payment' ? 'btn-warning' : 'btn-ghost'}`}
                  style={{
                    padding: '0.45rem 0.9rem',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    color: checkinFilter === 'pending_payment' ? '#000' : 'var(--accent-gold)',
                    fontWeight: 700,
                  }}
                >
                  ⏳ Pendentes ({pendingPaymentsCount})
                </button>
              )}
            </div>

            {/* Alternador de Visualização: Cards vs Tabela */}
            <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', gap: '0.25rem' }}>
              <button
                type="button"
                onClick={() => setCheckinDisplayMode('cards')}
                className={`btn btn-sm ${checkinDisplayMode === 'cards' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', gap: '0.4rem', borderRadius: '6px' }}
                title="Exibição em Cards Grandes e Legíveis para Portaria"
              >
                <LayoutGrid size={15} />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setCheckinDisplayMode('table')}
                className={`btn btn-sm ${checkinDisplayMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', gap: '0.4rem', borderRadius: '6px' }}
                title="Exibição em Tabela Completa"
              >
                <List size={15} />
                <span>Tabela</span>
              </button>
            </div>
          </div>
        </div>

        {/* Container da Lista de Inscritos (Espaço Amplo, Sem Restrição de Altura) */}
        <div>
          {filteredRegistrations.length === 0 ? (
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px dashed var(--border-medium)',
                borderRadius: 'var(--radius-xl)',
                padding: '4.5rem 2rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <Search size={44} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Nenhum participante encontrado
              </h3>
              <p style={{ fontSize: '0.92rem', margin: '0.45rem 0 0 0' }}>
                {searchGuest ? `Nenhum resultado para "${searchGuest}". Verifique o termo digitado ou limpe a busca.` : 'Nenhum participante com o filtro selecionado.'}
              </p>
            </div>
          ) : checkinDisplayMode === 'cards' ? (
            /* Modo Cards: Amplo, Confortável e Altamente Legível */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {filteredRegistrations.map((reg) => {
                let birthDateVal: string | null = null;
                if (reg.customAnswers) {
                  for (const [k, v] of Object.entries(reg.customAnswers)) {
                    const qFound = selectedEventForCheckin.customQuestions?.find((q) => q.id === k);
                    if (
                      qFound?.type === 'date' ||
                      qFound?.label.toLowerCase().includes('nasc') ||
                      qFound?.label.toLowerCase().includes('data')
                    ) {
                      birthDateVal = String(v);
                      break;
                    }
                  }
                }
                const age = birthDateVal ? calculateAge(birthDateVal) : null;
                const isPendingPayment = !selectedEventForCheckin.isFree && (reg.paymentStatus === 'pending' || reg.paymentMethod === 'manual');

                return (
                  <div
                    key={reg.id}
                    style={{
                      background: reg.checkedIn ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)',
                      border: `1.5px solid ${reg.checkedIn ? 'rgba(16, 185, 129, 0.5)' : isPendingPayment ? 'rgba(245, 158, 11, 0.45)' : 'var(--border-medium)'}`,
                      borderRadius: 'var(--radius-xl)',
                      padding: '1.4rem 1.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Linha 1: Avatar, Nome, WhatsApp, Idade e Botão de Check-in */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', gap: '1.15rem', alignItems: 'center' }}>
                        {/* Avatar */}
                        <div
                          style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '50%',
                            background: reg.checkedIn ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                            color: reg.checkedIn ? 'var(--status-success)' : 'var(--accent-gold)',
                            fontWeight: 800,
                            fontSize: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `2px solid ${reg.checkedIn ? 'var(--status-success)' : 'var(--accent-gold)'}`,
                            flexShrink: 0,
                          }}
                        >
                          {reg.name.substring(0, 2).toUpperCase()}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                              {reg.name}
                            </h3>
                            {reg.checkedIn ? (
                              <span
                                style={{
                                  background: 'rgba(16, 185, 129, 0.15)',
                                  color: 'var(--status-success)',
                                  border: '1px solid var(--status-success)',
                                  padding: '0.25rem 0.8rem',
                                  borderRadius: 'var(--radius-full)',
                                  fontSize: '0.82rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                }}
                              >
                                <CheckCircle2 size={15} /> Presente na Portaria
                              </span>
                            ) : (
                              <span
                                style={{
                                  background: 'rgba(148, 163, 184, 0.12)',
                                  color: 'var(--text-muted)',
                                  padding: '0.25rem 0.8rem',
                                  borderRadius: 'var(--radius-full)',
                                  fontSize: '0.82rem',
                                  fontWeight: 600,
                                }}
                              >
                                Aguardando Entrada
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.45rem', fontSize: '0.94rem', color: 'var(--text-secondary)', flexWrap: 'wrap', alignItems: 'center' }}>
                            {reg.phone && (
                              <a
                                href={`https://wa.me/55${reg.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#22c55e', textDecoration: 'none', fontWeight: 700 }}
                                title="Abrir WhatsApp"
                              >
                                <MessageCircle size={16} />
                                <span>{reg.phone}</span>
                              </a>
                            )}
                            {reg.email && <span>✉️ {reg.email}</span>}
                            {birthDateVal && (
                              <span
                                style={{
                                  background: 'rgba(245, 158, 11, 0.12)',
                                  color: 'var(--accent-gold)',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '6px',
                                  fontWeight: 800,
                                  fontSize: '0.88rem',
                                }}
                              >
                                🎂 {age !== null ? `${age} anos` : ''} ({formatDate(birthDateVal)})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botão de Check-in em Destaque Grande */}
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleCheckin(selectedEventForCheckin.id, reg.id, reg.name)}
                          className={`btn ${reg.checkedIn ? 'btn-secondary' : 'btn-primary'}`}
                          style={{
                            padding: '0.7rem 1.5rem',
                            fontSize: '0.98rem',
                            fontWeight: 800,
                            gap: '0.55rem',
                            borderRadius: '8px',
                            minWidth: '200px',
                            justifyContent: 'center',
                            borderColor: reg.checkedIn ? 'var(--status-success)' : undefined,
                            color: reg.checkedIn ? 'var(--status-success)' : undefined,
                          }}
                        >
                          {reg.checkedIn ? (
                            <>
                              <Check size={18} />
                              <span>Presente (Desfazer)</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={18} />
                              <span>Confirmar Presença</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteRegistration(selectedEventForCheckin.id, reg.id, reg.name)}
                          className="btn btn-secondary"
                          style={{ padding: '0.7rem 0.95rem', color: 'var(--status-error)' }}
                          title="Excluir Inscrição"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>

                    {/* Linha 2: Respostas do Questionário Personalizado & Pagamento */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '0.9rem',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      {/* Botão com Olhinho para Ver Formulário Preenchido */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {reg.customAnswers && Object.keys(reg.customAnswers).length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setViewingFormReg(reg)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              padding: '0.45rem 0.95rem',
                              fontSize: '0.88rem',
                              borderRadius: '6px',
                              background: 'rgba(245, 158, 11, 0.08)',
                              borderColor: 'rgba(245, 158, 11, 0.35)',
                              color: 'var(--accent-gold)',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                            title="Visualizar respostas completas do formulário"
                          >
                            <Eye size={16} />
                            <span>Ver Formulário ({Object.keys(reg.customAnswers).length} resposta{Object.keys(reg.customAnswers).length > 1 ? 's' : ''})</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Sem questionário adicional
                          </span>
                        )}
                      </div>

                      {/* Status de Pagamento & Ações */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {selectedEventForCheckin.isFree ? (
                          <span className="badge badge-success" style={{ fontSize: '0.88rem', padding: '0.45rem 0.9rem' }}>
                            Entrada Gratuita
                          </span>
                        ) : isPendingPayment ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <span
                              style={{
                                background: 'rgba(245, 158, 11, 0.18)',
                                color: 'var(--accent-gold)',
                                border: '1px solid var(--accent-gold)',
                                borderRadius: '6px',
                                padding: '0.45rem 0.85rem',
                                fontSize: '0.88rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              <Clock size={16} /> Pagamento Pendente (Manual)
                            </span>

                            <button
                              type="button"
                              onClick={() => handleApprovePayment(selectedEventForCheckin.id, reg.id, reg.name)}
                              className="btn btn-sm"
                              style={{
                                background: 'rgba(16, 185, 129, 0.18)',
                                color: 'var(--status-success)',
                                border: '1px solid var(--status-success)',
                                fontWeight: 800,
                                fontSize: '0.88rem',
                                padding: '0.45rem 0.95rem',
                                gap: '0.4rem',
                              }}
                            >
                              <Check size={16} />
                              <span>Aprovar Pagamento</span>
                            </button>

                            <a
                              href={`https://wa.me/55${reg.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Graça e Paz, ${reg.name}! Entramos em contato da secretaria do Ministério Apostólico Caçadores da Presença (MACDP) sobre sua inscrição no evento "${selectedEventForCheckin.title}". Você optou pelo pagamento manual. Como prefere realizar o acerto do valor?`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.4)', fontSize: '0.88rem', gap: '0.4rem', padding: '0.45rem 0.85rem' }}
                              title="Chamar no WhatsApp"
                            >
                              <MessageCircle size={16} />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        ) : (
                          <span className="badge badge-success" style={{ fontSize: '0.88rem', padding: '0.45rem 0.9rem' }}>
                            ✓ Confirmado ({formatCurrency(selectedEventForCheckin.price || 0)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Modo Tabela Completa */
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-medium)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <table className="table" style={{ fontSize: '0.96rem', width: '100%' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)' }}>
                    <th style={{ padding: '1.1rem 1.3rem' }}>Participante</th>
                    <th style={{ padding: '1.1rem 1.3rem' }}>WhatsApp</th>
                    <th style={{ padding: '1.1rem 1.3rem' }}>Idade / Nasc.</th>
                    <th style={{ padding: '1.1rem 1.3rem' }}>Pagamento</th>
                    <th style={{ padding: '1.1rem 1.3rem' }}>Questionário</th>
                    <th style={{ padding: '1.1rem 1.3rem' }}>Portaria</th>
                    <th style={{ padding: '1.1rem 1.3rem', textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((reg) => {
                    let birthDateVal: string | null = null;
                    if (reg.customAnswers) {
                      for (const [k, v] of Object.entries(reg.customAnswers)) {
                        const qFound = selectedEventForCheckin.customQuestions?.find((q) => q.id === k);
                        if (
                          qFound?.type === 'date' ||
                          qFound?.label.toLowerCase().includes('nasc') ||
                          qFound?.label.toLowerCase().includes('data')
                        ) {
                          birthDateVal = String(v);
                          break;
                        }
                      }
                    }
                    const age = birthDateVal ? calculateAge(birthDateVal) : null;
                    const isPendingPayment = !selectedEventForCheckin.isFree && (reg.paymentStatus === 'pending' || reg.paymentMethod === 'manual');

                    return (
                      <tr key={reg.id} style={{ background: reg.checkedIn ? 'rgba(16, 185, 129, 0.04)' : undefined, borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '1.1rem 1.3rem' }}>
                          <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{reg.name}</strong>
                          {reg.email && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{reg.email}</div>}
                        </td>
                        <td style={{ padding: '1.1rem 1.3rem', whiteSpace: 'nowrap' }}>
                          {reg.phone ? (
                            <a
                              href={`https://wa.me/55${reg.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                            >
                              <MessageCircle size={16} />
                              <span>{reg.phone}</span>
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td style={{ padding: '1.1rem 1.3rem', whiteSpace: 'nowrap' }}>
                          {birthDateVal ? (
                            <div>
                              <span
                                style={{
                                  background: 'rgba(245, 158, 11, 0.15)',
                                  color: 'var(--accent-gold)',
                                  padding: '0.3rem 0.75rem',
                                  borderRadius: '6px',
                                  fontWeight: 800,
                                  fontSize: '0.88rem',
                                }}
                              >
                                🎂 {age !== null ? `${age} anos` : ''}
                              </span>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                                {formatDate(birthDateVal)}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '1.1rem 1.3rem' }}>
                          {selectedEventForCheckin.isFree ? (
                            <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>Gratuito</span>
                          ) : isPendingPayment ? (
                            <div>
                              <span
                                className="badge badge-warning"
                                style={{
                                  background: 'rgba(245, 158, 11, 0.18)',
                                  color: 'var(--accent-gold)',
                                  border: '1px solid var(--accent-gold)',
                                  fontSize: '0.85rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                }}
                              >
                                <Clock size={13} /> Pendente (Manual)
                              </span>
                              <div style={{ fontSize: '0.78rem', color: '#f59e0b', marginTop: '0.35rem', fontWeight: 600 }}>
                                ⚠️ Contatar participante
                              </div>
                            </div>
                          ) : (
                            <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>
                              ✓ Confirmado ({formatCurrency(selectedEventForCheckin.price || 0)})
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '1.1rem 1.3rem', whiteSpace: 'nowrap' }}>
                          {reg.customAnswers && Object.keys(reg.customAnswers).length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setViewingFormReg(reg)}
                              className="btn btn-secondary btn-sm"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.35rem 0.75rem',
                                fontSize: '0.82rem',
                                color: 'var(--accent-gold)',
                                borderColor: 'rgba(245, 158, 11, 0.35)',
                                background: 'rgba(245, 158, 11, 0.08)',
                                fontWeight: 700,
                              }}
                              title="Visualizar respostas do formulário"
                            >
                              <Eye size={15} />
                              <span>Ver Respostas ({Object.keys(reg.customAnswers).length})</span>
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '1.1rem 1.3rem' }}>
                          {reg.checkedIn ? (
                            <span className="badge badge-success" style={{ fontSize: '0.88rem', padding: '0.4rem 0.85rem' }}>Presente</span>
                          ) : (
                            <span className="badge badge-secondary" style={{ opacity: 0.7, fontSize: '0.88rem', padding: '0.4rem 0.85rem' }}>Aguardando</span>
                          )}
                        </td>
                        <td style={{ padding: '1.1rem 1.3rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
                            {isPendingPayment && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprovePayment(selectedEventForCheckin.id, reg.id, reg.name)}
                                  className="btn btn-sm"
                                  style={{
                                    background: 'rgba(16, 185, 129, 0.18)',
                                    color: 'var(--status-success)',
                                    border: '1px solid var(--status-success)',
                                    padding: '0.45rem 0.8rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 800,
                                    gap: '0.35rem',
                                  }}
                                  title="Aprovar pagamento manual"
                                >
                                  <Check size={14} />
                                  <span>Aprovar</span>
                                </button>

                                <a
                                  href={`https://wa.me/55${reg.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Graça e Paz, ${reg.name}! Entramos em contato da secretaria do Ministério Apostólico Caçadores da Presença (MACDP) sobre sua inscrição no evento "${selectedEventForCheckin.title}". Você optou pelo pagamento manual. Como prefere realizar o acerto do valor?`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.4)', gap: '0.35rem' }}
                                >
                                  <MessageCircle size={14} />
                                  <span>WhatsApp</span>
                                </a>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => handleToggleCheckin(selectedEventForCheckin.id, reg.id, reg.name)}
                              className={`btn btn-sm ${reg.checkedIn ? 'btn-secondary' : 'btn-primary'}`}
                              style={{ padding: '0.5rem 0.95rem', fontSize: '0.88rem', fontWeight: 800 }}
                            >
                              {reg.checkedIn ? <Check size={15} /> : 'Check-in'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRegistration(selectedEventForCheckin.id, reg.id, reg.name)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--status-error)', padding: '0.5rem 0.75rem' }}
                              title="Remover Inscrição"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Barra Inferior com Informações e Botões */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedEventForCheckin(null)}
            className="btn btn-secondary"
            style={{ gap: '0.6rem', fontWeight: 800, padding: '0.65rem 1.25rem' }}
          >
            <ArrowLeft size={17} />
            <span>Voltar para Lista de Eventos</span>
          </button>

          <button
            type="button"
            onClick={() => {
              generateEventRegistrationsListPDF(selectedEventForCheckin);
              onNotify('success', 'PDF da lista de inscritos gerado com sucesso!');
            }}
            className="btn btn-secondary"
            style={{
              gap: '0.6rem',
              color: 'var(--accent-gold)',
              borderColor: 'var(--accent-gold)',
              fontWeight: 800,
              padding: '0.65rem 1.25rem',
            }}
          >
            <Printer size={17} />
            <span>Imprimir / Salvar PDF da Lista</span>
          </button>
        </div>

        {/* Modal Adicionar Participante Manualmente */}
        <Modal
          isOpen={isAddGuestModalOpen}
          onClose={() => setIsAddGuestModalOpen(false)}
          title="Adicionar Participante Manualmente"
          maxWidth="500px"
        >
          <form onSubmit={handleAddGuest}>
            <div className="form-group">
              <label className="form-label">Nome Completo *</label>
              <input
                type="text"
                required
                className="form-input"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ex: João da Silva"
              />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp *</label>
              <input
                type="tel"
                required
                className="form-input"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="(92) 99999-9999"
              />
            </div>
            <div className="form-group">
              <label className="form-label">E-mail (opcional)</label>
              <input
                type="email"
                className="form-input"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="joao@gmail.com"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setIsAddGuestModalOpen(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar Inscrição
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Visualização das Respostas do Formulário (Olhinho) */}
        <Modal
          isOpen={!!viewingFormReg}
          onClose={() => setViewingFormReg(null)}
          title={viewingFormReg ? `Formulário de Inscrição: ${viewingFormReg.name}` : 'Formulário do Inscrito'}
          maxWidth="620px"
        >
          {viewingFormReg && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Header do Participante */}
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '1.1rem 1.35rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.85rem',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {viewingFormReg.name}
                  </h4>
                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                    {viewingFormReg.phone && (
                      <a
                        href={`https://wa.me/55${viewingFormReg.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <MessageCircle size={15} />
                        <span>{viewingFormReg.phone}</span>
                      </a>
                    )}
                    {viewingFormReg.email && <span>✉️ {viewingFormReg.email}</span>}
                  </div>
                </div>

                <span
                  style={{
                    background: viewingFormReg.checkedIn ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                    color: viewingFormReg.checkedIn ? 'var(--status-success)' : 'var(--text-muted)',
                    border: `1px solid ${viewingFormReg.checkedIn ? 'var(--status-success)' : 'var(--border-subtle)'}`,
                    padding: '0.35rem 0.8rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  {viewingFormReg.checkedIn ? (
                    <>
                      <CheckCircle2 size={14} /> Presente no Evento
                    </>
                  ) : (
                    'Aguardando Entrada'
                  )}
                </span>
              </div>

              {/* Lista das Perguntas e Respostas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-gold)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Respostas do Questionário
                  </h5>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {viewingFormReg.customAnswers ? Object.keys(viewingFormReg.customAnswers).length : 0} pergunta(s) respondida(s)
                  </span>
                </div>

                {viewingFormReg.customAnswers && Object.keys(viewingFormReg.customAnswers).length > 0 ? (
                  Object.entries(viewingFormReg.customAnswers).map(([qId, val], idx) => {
                    const question = selectedEventForCheckin?.customQuestions?.find((q) => q.id === qId);
                    const questionLabel = question?.label || qId;
                    const answerText = Array.isArray(val) ? val.join(', ') : String(val);

                    const isDateType = question?.type === 'date' || questionLabel.toLowerCase().includes('nasc') || questionLabel.toLowerCase().includes('data');
                    const ageCalculated = isDateType ? calculateAge(answerText) : null;

                    return (
                      <div
                        key={qId}
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1.1rem 1.25rem',
                        }}
                      >
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                            #{idx + 1}
                          </span>
                          <span>{questionLabel}</span>
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {isDateType && ageCalculated !== null ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                              <span>{formatDate(answerText)}</span>
                              <span
                                style={{
                                  background: 'rgba(245, 158, 11, 0.15)',
                                  color: 'var(--accent-gold)',
                                  padding: '0.2rem 0.65rem',
                                  borderRadius: '6px',
                                  fontSize: '0.85rem',
                                  fontWeight: 800,
                                }}
                              >
                                🎂 {ageCalculated} anos
                              </span>
                            </div>
                          ) : (
                            answerText || <em style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Não respondido</em>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-medium)' }}>
                    Nenhuma resposta registrada para este participante.
                  </div>
                )}
              </div>

              {/* Rodapé com Botão Fechar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setViewingFormReg(null)}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1.4rem', fontWeight: 700 }}
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }

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
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Eventos, Inscrições & Reservas</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Gerencie congressos, conferências, credenciamento na porta e ocupação de salas
          </p>
        </div>

        <button
          onClick={openNewEventModal}
          className="btn btn-primary"
          style={{ gap: '0.45rem', fontSize: '0.875rem' }}
        >
          <Plus size={16} />
          <span>Novo Evento</span>
        </button>
      </div>

      {/* Events List / Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Eventos Cadastrados ({events.length})
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              Gerencie inscrições, check-in e detalhes dos eventos da igreja
            </p>
          </div>

          {/* View Mode Toggle: Lista vs Colunas */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-tertiary)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setEventViewMode('list')}
              className={`btn btn-sm ${eventViewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
              title="Exibir em Linhas / Lista"
            >
              <List size={14} />
              <span>Lista</span>
            </button>
            <button
              onClick={() => setEventViewMode('grid')}
              className={`btn btn-sm ${eventViewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
              title="Exibir em Colunas / Grade"
            >
              <LayoutGrid size={14} />
              <span>Colunas</span>
            </button>
          </div>
        </div>

        {eventViewMode === 'list' ? (
          /* ==================== MODO LISTA (HORIZONTAL) ==================== */
          <div key="list-mode" className="animate-fade-scale" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {events.map((evt) => {
              const checkedInCount = evt.registrations.filter((r) => r.checkedIn).length;
              const percentage = Math.round((evt.registeredCount / Math.max(1, evt.totalCapacity)) * 100);

              return (
                <div
                  key={evt.id}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: '1.15rem 1.35rem',
                    gap: '1.35rem',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-lg)',
                    flexWrap: 'wrap',
                    background: 'var(--bg-secondary)',
                  }}
                >
                  {/* Thumbnail Banner */}
                  <div
                    style={{
                      width: '150px',
                      height: '100px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={evt.imageUrl}
                      alt={evt.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '0.35rem',
                        left: '0.35rem',
                        background: 'rgba(11, 17, 32, 0.85)',
                        color: 'var(--accent-gold)',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontWeight: 800,
                        fontSize: '0.68rem',
                      }}
                    >
                      {evt.category}
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '0.35rem',
                        right: '0.35rem',
                        background: 'rgba(11, 17, 32, 0.85)',
                        color: '#ffffff',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                      }}
                    >
                      {evt.isFree ? 'Gratuito' : formatCurrency(evt.price || 0)}
                    </span>
                  </div>

                  {/* Information Details */}
                  <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                        {evt.title}
                      </h4>
                      {evt.customQuestions && evt.customQuestions.length > 0 && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            background: 'rgba(245, 158, 11, 0.12)',
                            color: 'var(--accent-gold)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontWeight: 700,
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                          }}
                        >
                          {evt.customQuestions.length} perguntas
                        </span>
                      )}
                      {evt.roomReserved && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            background: 'rgba(59, 130, 246, 0.12)',
                            color: 'var(--accent-blue-light)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontWeight: 600,
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                          }}
                        >
                          {evt.roomReserved}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} color="var(--accent-gold)" />
                        <span>{formatEventDateRange(evt.date, evt.endDate)} às {evt.time}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} color="var(--accent-blue-light)" />
                        <span>{evt.location}</span>
                      </div>
                      {evt.speakerName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                          <Mic size={13} color="var(--accent-gold)" />
                          <span>{evt.speakerName}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress and Check-in Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                      <div style={{ flex: '1 1 200px', maxWidth: '380px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                          <span>Inscrições: <strong>{evt.registeredCount}</strong> / {evt.totalCapacity} ({evt.totalCapacity - evt.registeredCount} vagas livres)</span>
                          <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{percentage}%</span>
                        </div>
                        <div className="progress-bar-bg" style={{ height: '6px' }}>
                          <div className="progress-bar-fill" style={{ width: `${Math.min(100, percentage)}%` }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <CheckCircle2 size={14} color="var(--status-success)" />
                        <span><strong>{checkedInCount}</strong> credenciados na portaria</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      onClick={() => setSelectedEventForCheckin(evt)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '0.4rem', padding: '0.5rem 0.85rem' }}
                    >
                      <QrCode size={15} />
                      <span>Check-in ({evt.registrations.length})</span>
                    </button>

                    <button
                      onClick={() => openEditEventModal(evt)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '0.35rem', padding: '0.5rem 0.75rem' }}
                      title="Editar Evento"
                    >
                      <Edit2 size={14} />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleDeleteEvent(evt)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--status-error)', padding: '0.5rem 0.65rem' }}
                      title="Excluir Evento"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ==================== MODO GRADE / COLUNAS ==================== */
          <div
            key="grid-mode"
            className="animate-fade-scale"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {events.map((evt) => {
              const checkedInCount = evt.registrations.filter((r) => r.checkedIn).length;
              const percentage = Math.round((evt.registeredCount / Math.max(1, evt.totalCapacity)) * 100);

              return (
                <div
                  key={evt.id}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    padding: 0,
                    border: '1px solid var(--border-medium)',
                  }}
                >
                  <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={evt.imageUrl}
                      alt={evt.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(11,17,32,0.85) 0%, transparent 60%)',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        background: 'var(--accent-gold)',
                        color: '#0B1120',
                        padding: '0.2rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                      }}
                    >
                      {evt.category}
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'rgba(11, 17, 32, 0.8)',
                        color: '#ffffff',
                        padding: '0.2rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {evt.isFree ? 'Gratuito' : formatCurrency(evt.price || 0)}
                    </span>

                    <div style={{ position: 'absolute', bottom: '0.85rem', left: '1.25rem', right: '1.25rem' }}>
                      <h4 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.2 }}>
                        {evt.title}
                      </h4>
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={15} color="var(--accent-gold)" />
                        <span>{formatEventDateRange(evt.date, evt.endDate)} às {evt.time}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={15} color="var(--accent-blue-light)" />
                        <span>{evt.location}</span>
                      </div>
                    </div>

                    {/* Occupancy bar */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        <span>Inscrições: <strong>{evt.registeredCount}</strong> / {evt.totalCapacity}</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{percentage}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${Math.min(100, percentage)}%` }} />
                      </div>
                    </div>

                    {/* Checkin summary */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <CheckCircle2 size={14} color="var(--status-success)" />
                      <span>{checkedInCount} credenciados na portaria</span>
                    </div>

                    {/* Action buttons */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 'auto',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--border-subtle)',
                        gap: '0.5rem',
                      }}
                    >
                      <button
                        onClick={() => setSelectedEventForCheckin(evt)}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '0.4rem', flex: 1 }}
                      >
                        <QrCode size={15} />
                        <span>Check-in ({evt.registrations.length})</span>
                      </button>

                      <button
                        onClick={() => openEditEventModal(evt)}
                        className="btn btn-secondary btn-sm"
                        title="Editar Evento"
                      >
                        <Edit2 size={15} />
                      </button>

                      <button
                        onClick={() => handleDeleteEvent(evt)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--status-error)' }}
                        title="Excluir Evento"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Temple Rooms and Spaces Manager */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} color="var(--accent-gold)" /> Espaços & Salas do Templo (MACDP)
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Controle de reservas de salas, berçário, auditório e reuniões pastorais
            </p>
          </div>

          <button
            onClick={openNewRoomModal}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            <Plus size={15} /> Novo Espaço / Sala
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {rooms.map((room) => (
            <div
              key={room.id}
              className="card card-hover"
              style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                padding: '0.95rem 1.25rem',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 280px', minWidth: 0 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.12)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    color: 'var(--accent-blue-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={18} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{room.name}</strong>
                    <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                      {room.capacity}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Status: <span style={{ color: room.status.toLowerCase().includes('disponível') || room.status.toLowerCase().includes('livre') ? '#10B981' : 'var(--accent-gold)' }}>{room.status}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                <button
                  onClick={() => openEditRoomModal(room)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.35rem', padding: '0.4rem 0.65rem' }}
                  title="Editar Espaço"
                >
                  <Edit2 size={13} />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDeleteRoom(room)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.4rem 0.6rem', color: 'var(--status-error)' }}
                  title="Excluir Espaço"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL ADICIONAR PARTICIPANTE NO EVENTO */}
      <Modal
        isOpen={isAddGuestModalOpen}
        onClose={() => setIsAddGuestModalOpen(false)}
        title="Adicionar Participante Manualmente"
        maxWidth="500px"
      >
        <form onSubmit={handleAddGuest}>
          <div className="form-group">
            <label className="form-label">Nome Completo *</label>
            <input
              type="text"
              required
              className="form-input"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp *</label>
            <input
              type="tel"
              required
              className="form-input"
              placeholder="(92) 98450-9989"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-input"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => setIsAddGuestModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Cadastrar Participante
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL CRIAR / EDITAR EVENTO */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={editingEvent ? `Editar Evento: ${editingEvent.title}` : 'Cadastrar Novo Evento'}
        maxWidth="650px"
      >
        <form onSubmit={handleSaveEvent}>
          <div className="form-group">
            <label className="form-label">Título do Evento *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: Conferência Apostólica Caçadores da Presença"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={15} color="var(--accent-gold)" />
                <span>Data de Início *</span>
              </label>
              <input
                type="date"
                required
                className="form-input"
                value={date}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setDate(newStart);
                  if (!endDate || endDate < newStart) {
                    setEndDate(newStart);
                  }
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CalendarRange size={15} color="var(--accent-gold)" />
                <span>Data de Término</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                min={date}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                Se for 1 único dia, repita a data inicial.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={15} color="var(--accent-gold)" />
                <span>Horário *</span>
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: 19:30"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Categoria *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                <option value="Conferência">Conferência</option>
                <option value="Culto Especial">Culto Especial</option>
                <option value="Acampamento">Acampamento</option>
                <option value="Capacitação">Capacitação</option>
                <option value="Ação Social">Ação Social</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1rem', alignItems: 'flex-start' }}>
            <div className="form-group">
              <GoogleLocationPicker
                value={location}
                locationDetails={locationDetails}
                onChange={(addr, details) => {
                  setLocation(addr);
                  setLocationDetails(details);
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Espaço / Sala Reservada</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Auditório Principal, Salão Social"
                value={roomReserved}
                onChange={(e) => setRoomReserved(e.target.value)}
              />
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Especifique o salão, sala temática ou espaço no local.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isFree ? '1fr 1fr' : '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Capacidade Máxima (Vagas) *</label>
              <input
                type="number"
                min={1}
                required
                className="form-input"
                placeholder="Ex: 800"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Entrada</label>
              <select
                className="form-select"
                value={isFree ? 'gratuito' : 'pago'}
                onChange={(e) => setIsFree(e.target.value === 'gratuito')}
              >
                <option value="gratuito">Gratuito</option>
                <option value="pago">Inscrição Paga</option>
              </select>
            </div>

            {!isFree && (
              <div className="form-group">
                <label className="form-label">Valor (R$) *</label>
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  className="form-input"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Descrição do Evento *</label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              placeholder="Descreva o propósito do evento, preletores convidados, etc..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Preletores & Ministração (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Pr. Oziel Gomes Maduro & Pr. Jaziel Maduro"
                value={speakerName}
                onChange={(e) => setSpeakerName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Programação Detalhada (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Sexta 19h30, Sábado 16h, Domingo 18h"
                value={detailedSchedule}
                onChange={(e) => setDetailedSchedule(e.target.value)}
              />
            </div>
          </div>

          {/* ==================== BUILDER DE PERGUNTAS PERSONALIZADAS ==================== */}
          <div
            style={{
              marginTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ marginBottom: 0, fontWeight: 800 }}>
                  Perguntas Personalizadas do Formulário de Inscrição ({customQuestions.length})
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Estas perguntas aparecerão na Etapa 2 para quem for se inscrever neste evento.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingQuestion(!isAddingQuestion)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem', fontSize: '0.78rem' }}
              >
                <Plus size={14} />
                <span>Nova Pergunta</span>
              </button>
            </div>

            {/* Presets Toolbar */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Adicionar modelo:</span>
              <button
                type="button"
                onClick={() => handleAddPresetQuestion('Tamanho da Camiseta Oficial', 'select', ['P', 'M', 'G', 'GG', 'XGG'])}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                + Camiseta
              </button>
              <button
                type="button"
                onClick={() => handleAddPresetQuestion('Você participa de alguma Célula?', 'radio', ['Sim, participo', 'Não participo'])}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                + Célula
              </button>
              <button
                type="button"
                onClick={() => handleAddPresetQuestion('Possui restrição alimentar ou alergia?', 'text')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                + Restrição Alimentar
              </button>
              <button
                type="button"
                onClick={() => handleAddPresetQuestion('Data de Nascimento', 'date')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', background: 'rgba(245, 158, 11, 0.15)', borderColor: 'var(--accent-gold)' }}
              >
                🎂 + Data de Nascimento
              </button>
              <button
                type="button"
                onClick={() => handleAddPresetQuestion('Vai utilizar o transporte da igreja?', 'radio', ['Sim, vou de ônibus', 'Não, transporte próprio'])}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                + Transporte
              </button>
            </div>

            {/* Add / Edit Question Inline Form */}
            {isAddingQuestion && (
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--accent-gold)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.12)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {editingQuestionId ? <Edit2 size={14} /> : <Plus size={14} />}
                    <span>{editingQuestionId ? 'Editar Pergunta do Formulário' : 'Configurar Nova Pergunta Personalizada'}</span>
                  </h5>
                  <button
                    type="button"
                    onClick={handleCancelQuestionEdit}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                  >
                    <X size={15} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pergunta / Pergunta do Formulário *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Qual o tamanho da sua camiseta?"
                      value={newQLabel}
                      onChange={(e) => setNewQLabel(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tipo de Resposta</label>
                    <select
                      className="form-select"
                      value={newQType}
                      onChange={(e) => setNewQType(e.target.value as any)}
                    >
                      <option value="text">Texto Livre</option>
                      <option value="date">Data (Ex: Data de Nascimento)</option>
                      <option value="select">Lista de Seleção (Dropdown)</option>
                      <option value="radio">Escolha Única (Radio)</option>
                      <option value="checkbox">Múltipla Escolha (Checkbox)</option>
                      <option value="number">Número</option>
                    </select>
                  </div>
                </div>

                {['select', 'radio', 'checkbox'].includes(newQType) && (
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Opções de Resposta (separadas por vírgula) *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: P, M, G, GG ou Opção 1, Opção 2"
                      value={newQOptions}
                      onChange={(e) => setNewQOptions(e.target.value)}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newQRequired}
                      onChange={(e) => setNewQRequired(e.target.checked)}
                      style={{ accentColor: 'var(--accent-gold)' }}
                    />
                    <span>Resposta Obrigatória</span>
                  </label>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={handleCancelQuestionEdit}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveQuestion}
                      className="btn btn-primary btn-sm"
                    >
                      {editingQuestionId ? 'Salvar Alterações' : 'Adicionar Pergunta'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Questions List with Drag and Drop Reordering */}
            {customQuestions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.74rem',
                    color: 'var(--accent-gold)',
                    marginBottom: '0.25rem',
                    background: 'rgba(245, 158, 11, 0.08)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                  }}
                >
                  <ArrowUpDown size={13} />
                  <span>
                    <strong>Dica:</strong> Arraste cada pergunta para cima ou para baixo pelo ícone da esquerda para alterar a ordem no formulário.
                  </span>
                </div>

                {customQuestions.map((q, idx) => {
                  const isDragging = draggedQIndex === idx;
                  const isOver = dragOverQIndex === idx && draggedQIndex !== idx;

                  return (
                    <div
                      key={q.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      style={{
                        background: isOver ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-tertiary)',
                        border: isOver
                          ? '1px dashed var(--accent-gold)'
                          : isDragging
                          ? '1px dashed rgba(245, 158, 11, 0.5)'
                          : '1px solid var(--border-subtle)',
                        opacity: isDragging ? 0.45 : 1,
                        borderRadius: '6px',
                        padding: '0.65rem 0.85rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'grab',
                        transition: 'background 0.15s ease, border 0.15s ease, transform 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1 }}>
                        <div
                          title="Arraste para reposicionar a pergunta"
                          style={{
                            cursor: 'grab',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--text-muted)',
                            padding: '0.2rem',
                          }}
                        >
                          <GripVertical size={16} />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                              {idx + 1}. {q.label}
                            </span>
                            {q.required && (
                              <span style={{ color: 'var(--status-error)', fontSize: '0.75rem', fontWeight: 800 }}>
                                *
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: '0.68rem',
                                background: 'rgba(245, 158, 11, 0.12)',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                color: 'var(--accent-gold)',
                                fontWeight: 700,
                              }}
                            >
                              {q.type}
                            </span>
                          </div>
                          {q.options && q.options.length > 0 && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              Opções: {q.options.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {/* Edit Question */}
                        <button
                          type="button"
                          onClick={() => handleStartEditQuestion(q)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            color: 'var(--accent-gold)',
                            padding: '0.25rem 0.45rem',
                            border: editingQuestionId === q.id ? '1px solid var(--accent-gold)' : undefined,
                            background: editingQuestionId === q.id ? 'rgba(245, 158, 11, 0.18)' : undefined,
                          }}
                          title="Editar pergunta"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete Question */}
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--status-error)', padding: '0.25rem 0.45rem' }}
                          title="Excluir pergunta"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  textAlign: 'center',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                }}
              >
                Nenhuma pergunta personalizada adicionada. O formulário solicitará apenas Nome, WhatsApp e E-mail.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsEventModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingEvent ? 'Salvar Alterações' : 'Cadastrar Evento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL CRIAR / EDITAR SALA */}
      <Modal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        title={editingRoom ? `Editar Espaço: ${editingRoom.name}` : 'Novo Espaço / Sala'}
        maxWidth="500px"
      >
        <form onSubmit={handleSaveRoom}>
          <div className="form-group">
            <label className="form-label">Nome do Espaço / Sala *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: Sala 4 - Aconselhamento Pastoral"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Capacidade *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: 30 pessoas"
              value={roomCapacity}
              onChange={(e) => setRoomCapacity(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status de Ocupação</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Disponível / Reservado aos Sábados"
              value={roomStatus}
              onChange={(e) => setRoomStatus(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsRoomModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar Espaço
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
