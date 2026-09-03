import React, { useState } from 'react';
import { KidChild, KidLesson } from '../../types';
import {
  addKidChild,
  updateKidChild,
  deleteKidChild,
  checkInKidChild,
  checkOutKidChild,
  addKidLesson,
  updateKidLesson,
  deleteKidLesson,
} from '../../services/db';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import {
  Baby,
  Smile,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Users,
  Clock,
  MapPin,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  LogIn,
  BookOpen,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  Heart,
  Palette,
  Phone,
} from 'lucide-react';

interface KidsManagerProps {
  childrenList: KidChild[];
  lessons: KidLesson[];
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const KidsManager: React.FC<KidsManagerProps> = ({
  childrenList,
  lessons,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'children' | 'lessons'>('checkin');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Child Modal State (Create/Edit)
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<KidChild | null>(null);
  const [childName, setChildName] = useState('');
  const [birthDate, setBirthDate] = useState('2022-01-01');
  const [age, setAge] = useState<number>(4);
  const [room, setRoom] = useState<KidChild['room']>('Maternal (2 a 4 anos)');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('92984509989');
  const [guardianRelationship, setGuardianRelationship] = useState('Mãe');
  const [allergiesOrNotes, setAllergiesOrNotes] = useState('');

  // Lesson Modal State (Create/Edit)
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<KidLesson | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonProgram, setLessonProgram] = useState<'EBD' | 'EBF'>('EBD');
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0]);
  const [lessonRoom, setLessonRoom] = useState('Maternal & Primários');
  const [teacherName, setTeacherName] = useState('Camila Albuquerque Silva');
  const [memoryVerse, setMemoryVerse] = useState('');
  const [activities, setActivities] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');

  // Lessons Filter
  const [lessonFilter, setLessonFilter] = useState<'todos' | 'EBD' | 'EBF'>('todos');

  // Open Child Modal
  const openNewChildModal = () => {
    setEditingChild(null);
    setChildName('');
    setBirthDate('2022-01-01');
    setAge(4);
    setRoom('Maternal (2 a 4 anos)');
    setGuardianName('');
    setGuardianPhone('92984509989');
    setGuardianRelationship('Mãe');
    setAllergiesOrNotes('');
    setIsChildModalOpen(true);
  };

  const openEditChildModal = (child: KidChild) => {
    setEditingChild(child);
    setChildName(child.name);
    setBirthDate(child.birthDate);
    setAge(child.age);
    setRoom(child.room);
    setGuardianName(child.guardianName);
    setGuardianPhone(child.guardianPhone);
    setGuardianRelationship(child.guardianRelationship);
    setAllergiesOrNotes(child.allergiesOrNotes || '');
    setIsChildModalOpen(true);
  };

  const handleSaveChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim() || !guardianName.trim() || !guardianPhone.trim()) {
      onNotify('error', 'Preencha o nome da criança e os dados do responsável.');
      return;
    }

    if (editingChild) {
      updateKidChild(editingChild.id, {
        name: childName,
        birthDate,
        age: Number(age) || 1,
        room,
        guardianName,
        guardianPhone,
        guardianRelationship,
        allergiesOrNotes,
      });
      onNotify('success', `Cadastro de "${childName}" atualizado com sucesso!`);
    } else {
      addKidChild({
        name: childName,
        birthDate,
        age: Number(age) || 1,
        room,
        guardianName,
        guardianPhone,
        guardianRelationship,
        allergiesOrNotes,
      });
      onNotify('success', `Criança "${childName}" cadastrada com código de segurança gerado!`);
    }

    setIsChildModalOpen(false);
  };

  const handleDeleteChild = (child: KidChild) => {
    if (window.confirm(`Deseja realmente remover o cadastro de "${child.name}"?`)) {
      deleteKidChild(child.id);
      onNotify('info', `Cadastro de "${child.name}" removido.`);
    }
  };

  // Check-in & Check-out actions
  const handleCheckIn = (child: KidChild) => {
    checkInKidChild(child.id);
    onNotify('success', `Check-in realizado! ${child.name} direcionado(a) para: ${child.room}. Pulseira: ${child.securityCode}`);
  };

  const handleCheckOut = (child: KidChild) => {
    if (window.confirm(`Confirmar liberação e saída de ${child.name} para o responsável ${child.guardianName}?`)) {
      checkOutKidChild(child.id);
      onNotify('info', `Saída registrada com segurança para ${child.name}. Entregue a ${child.guardianName}.`);
    }
  };

  // WhatsApp Alert to Parent
  const handleAlertParent = (child: KidChild) => {
    const cleanPhone = child.guardianPhone.replace(/\D/g, '');
    const msg = `Graça e paz, ${child.guardianName}! Somos do Ministério Caçadores Kids (MACDP). Solicitamos gentilmente sua presença na sala do seu filho(a) ${child.name} (${child.room}). Pulseira: ${child.securityCode}.`;
    const waLink = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waLink, '_blank');
    onNotify('info', `Abrindo WhatsApp para chamar o responsável de ${child.name}...`);
  };

  // Lessons Handlers
  const openNewLessonModal = () => {
    setEditingLesson(null);
    setLessonTitle('');
    setLessonProgram('EBD');
    setLessonDate(new Date().toISOString().split('T')[0]);
    setLessonRoom('Maternal & Primários');
    setTeacherName('Camila Albuquerque Silva');
    setMemoryVerse('');
    setActivities('');
    setLessonDesc('');
    setIsLessonModalOpen(true);
  };

  const openEditLessonModal = (les: KidLesson) => {
    setEditingLesson(les);
    setLessonTitle(les.title);
    setLessonProgram(les.programType);
    setLessonDate(les.date);
    setLessonRoom(les.targetRoom);
    setTeacherName(les.teacherName);
    setMemoryVerse(les.memoryVerse);
    setActivities(les.activities);
    setLessonDesc(les.description);
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !teacherName.trim()) {
      onNotify('error', 'Preencha o título da aula e o professor.');
      return;
    }

    if (editingLesson) {
      updateKidLesson(editingLesson.id, {
        title: lessonTitle,
        programType: lessonProgram,
        date: lessonDate,
        targetRoom: lessonRoom,
        teacherName,
        memoryVerse,
        activities,
        description: lessonDesc,
      });
      onNotify('success', `Lição "${lessonTitle}" atualizada com sucesso!`);
    } else {
      addKidLesson({
        title: lessonTitle,
        programType: lessonProgram,
        date: lessonDate,
        targetRoom: lessonRoom,
        teacherName,
        memoryVerse,
        activities,
        description: lessonDesc,
      });
      onNotify('success', `Plano de aula "${lessonTitle}" cadastrado com sucesso!`);
    }

    setIsLessonModalOpen(false);
  };

  const handleDeleteLesson = (les: KidLesson) => {
    if (window.confirm(`Deseja remover a lição "${les.title}"?`)) {
      deleteKidLesson(les.id);
      onNotify('info', `Lição "${les.title}" removida.`);
    }
  };

  // Metrics
  const presentCount = childrenList.filter((c) => c.checkInStatus === 'presente').length;
  const checkedOutCount = childrenList.filter((c) => c.checkInStatus === 'retirada').length;

  const filteredChildren = childrenList.filter((c) => {
    const matchSearch =
      !searchTerm ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.guardianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.securityCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRoom = roomFilter === 'todos' || c.room === roomFilter;
    const matchStatus = statusFilter === 'todos' || c.checkInStatus === statusFilter;

    return matchSearch && matchRoom && matchStatus;
  });

  const filteredLessons = lessons.filter((l) => {
    return lessonFilter === 'todos' || l.programType === lessonFilter;
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
                background: 'rgba(236, 72, 153, 0.15)',
                color: '#EC4899',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Baby size={22} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Ministério KIDS & EBF (MACDP)</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Acompanhamento integral das crianças, check-in seguro com código de pulseira, direcionamento de salas e conteúdo pedagógico (EBD & EBF)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-success">
            <LogIn size={12} /> {presentCount} Presentes nas Salas
          </span>
          <span className="badge badge-gold">
            <LogOut size={12} /> {checkedOutCount} Entregues com Segurança
          </span>
          <span className="badge badge-blue">
            <Users size={12} /> {childrenList.length} Crianças Cadastradas
          </span>
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
          onClick={() => setActiveTab('checkin')}
          className={`btn btn-sm ${activeTab === 'checkin' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.45rem' }}
        >
          <ShieldCheck size={16} />
          <span>Check-in & Segurança (Entrada/Saída)</span>
        </button>

        <button
          onClick={() => setActiveTab('children')}
          className={`btn btn-sm ${activeTab === 'children' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.45rem' }}
        >
          <Baby size={16} />
          <span>Cadastro de Crianças & Responsáveis ({childrenList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lessons')}
          className={`btn btn-sm ${activeTab === 'lessons' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.45rem' }}
        >
          <BookOpen size={16} />
          <span>Conteúdo Aplicado (EBD & EBF) ({lessons.length})</span>
        </button>
      </div>

      {/* ==================== TAB 1: CHECK-IN & SEGURANÇA ==================== */}
      {activeTab === 'checkin' && (
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
                placeholder="Buscar por criança, código (ex: KID-101) ou pai..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                className="form-select"
                style={{ width: '180px' }}
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                <option value="todos">Todas as Salas</option>
                <option value="Berçário (0 a 2 anos)">Berçário (0 a 2)</option>
                <option value="Maternal (2 a 4 anos)">Maternal (2 a 4)</option>
                <option value="Primários (5 a 8 anos)">Primários (5 a 8)</option>
                <option value="Juniores (9 a 12 anos)">Juniores (9 a 12)</option>
              </select>

              <select
                className="form-select"
                style={{ width: '150px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="todos">Todos Status</option>
                <option value="presente">Presentes (Na Sala)</option>
                <option value="retirada">Retirados (Saída)</option>
                <option value="ausente">Ausentes</option>
              </select>

              <button onClick={openNewChildModal} className="btn btn-primary" style={{ gap: '0.4rem', fontSize: '0.85rem' }}>
                <Plus size={16} /> Nova Criança
              </button>
            </div>
          </div>

          {/* Children Check-in List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredChildren.map((child) => {
              return (
                <div
                  key={child.id}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.15rem 1.35rem',
                    border: `1px solid ${
                      child.checkInStatus === 'presente'
                        ? 'var(--status-success)'
                        : child.checkInStatus === 'retirada'
                        ? 'var(--border-subtle)'
                        : 'var(--border-medium)'
                    }`,
                    background: child.checkInStatus === 'presente' ? 'rgba(16, 185, 129, 0.03)' : 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    gap: '1.25rem',
                    flexWrap: 'wrap',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Left Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 360px', minWidth: 0 }}>
                    <span
                      style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: 'var(--accent-gold)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        padding: '0.4rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        letterSpacing: '0.5px',
                        flexShrink: 0,
                        textAlign: 'center',
                      }}
                    >
                      🏷️ {child.securityCode}
                    </span>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                          {child.name}
                        </h4>

                        <span
                          className={`badge ${
                            child.checkInStatus === 'presente'
                              ? 'badge-success'
                              : child.checkInStatus === 'retirada'
                              ? 'badge-gold'
                              : 'badge-danger'
                          }`}
                        >
                          {child.checkInStatus === 'presente'
                            ? 'Presente na Sala'
                            : child.checkInStatus === 'retirada'
                            ? 'Saída Registrada'
                            : 'Ausente'}
                        </span>

                        <span style={{ fontSize: '0.82rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
                          • {child.age} anos • {child.room}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', flexWrap: 'wrap', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                        <div>
                          👤 <strong>Resp:</strong> {child.guardianName} ({child.guardianRelationship})
                        </div>
                        <div>
                          📞 <strong>Tel:</strong> {child.guardianPhone}
                        </div>
                        {child.checkInTime && (
                          <div>
                            ⏰ <strong>Entrada:</strong> {child.checkInTime}
                            {child.checkOutTime && <span> • <strong>Saída:</strong> {child.checkOutTime}</span>}
                          </div>
                        )}
                      </div>

                      {child.allergiesOrNotes && (
                        <div
                          style={{
                            display: 'inline-block',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.2rem 0.55rem',
                            fontSize: '0.75rem',
                            color: '#f87171',
                            marginTop: '0.35rem',
                          }}
                        >
                          ⚠️ <strong>Alergia/Cuidado:</strong> {child.allergiesOrNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexShrink: 0,
                    }}
                  >
                    {child.checkInStatus !== 'presente' ? (
                      <button
                        onClick={() => handleCheckIn(child)}
                        className="btn btn-primary btn-sm"
                        style={{ gap: '0.35rem' }}
                      >
                        <LogIn size={15} />
                        <span>Check-in</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCheckOut(child)}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '0.35rem', color: 'var(--status-warning)' }}
                      >
                        <LogOut size={15} />
                        <span>Check-out</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleAlertParent(child)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#10B981', padding: '0.45rem 0.65rem' }}
                      title="Chamar Responsável pelo WhatsApp"
                    >
                      <MessageCircle size={15} />
                    </button>

                    <button
                      onClick={() => openEditChildModal(child)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.45rem 0.65rem' }}
                      title="Editar Criança"
                    >
                      <Edit2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredChildren.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem 1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--border-medium)',
                }}
              >
                <Baby size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhuma criança encontrada</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Tente alterar os filtros de busca ou cadastre uma nova criança.
                </p>
                <button onClick={openNewChildModal} className="btn btn-primary btn-sm">
                  <Plus size={16} /> Cadastrar Nova Criança
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: CADASTRO DE CRIANÇAS E RESPONSÁVEIS ==================== */}
      {activeTab === 'children' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Relação Completa de Crianças e Famílias</h4>
            <button onClick={openNewChildModal} className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
              <Plus size={15} /> Cadastrar Criança
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ fontSize: '0.875rem' }}>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nome da Criança</th>
                    <th>Idade / Sala</th>
                    <th>Responsável</th>
                    <th>WhatsApp Pai/Mãe</th>
                    <th>Alergias / Observações</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {childrenList.map((child) => (
                    <tr key={child.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-gold)' }}>
                          {child.securityCode}
                        </span>
                      </td>
                      <td>
                        <strong>{child.name}</strong>
                      </td>
                      <td>
                        {child.age} anos • <small>{child.room}</small>
                      </td>
                      <td>
                        {child.guardianName} ({child.guardianRelationship})
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-secondary)' }}>{child.guardianPhone}</span>
                      </td>
                      <td>
                        {child.allergiesOrNotes ? (
                          <span style={{ color: '#f87171', fontSize: '0.8rem' }}>⚠️ {child.allergiesOrNotes}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Nenhuma restrição</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            child.checkInStatus === 'presente'
                              ? 'badge-success'
                              : child.checkInStatus === 'retirada'
                              ? 'badge-gold'
                              : 'badge-danger'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {child.checkInStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <button
                            onClick={() => openEditChildModal(child)}
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '0.3rem 0.5rem' }}
                            title="Editar"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteChild(child)}
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '0.3rem 0.5rem', color: 'var(--status-error)' }}
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

      {/* ==================== TAB 3: CONTEÚDO APLICADO (EBD & EBF) ==================== */}
      {activeTab === 'lessons' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Bar */}
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setLessonFilter('todos')}
                className={`btn btn-sm ${lessonFilter === 'todos' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Todas as Aulas ({lessons.length})
              </button>
              <button
                onClick={() => setLessonFilter('EBD')}
                className={`btn btn-sm ${lessonFilter === 'EBD' ? 'btn-primary' : 'btn-secondary'}`}
              >
                EBD - Escola Dominical
              </button>
              <button
                onClick={() => setLessonFilter('EBF')}
                className={`btn btn-sm ${lessonFilter === 'EBF' ? 'btn-primary' : 'btn-secondary'}`}
              >
                EBF - Escola Bíblica de Férias
              </button>
            </div>

            <button onClick={openNewLessonModal} className="btn btn-primary" style={{ gap: '0.4rem', fontSize: '0.85rem' }}>
              <Plus size={16} /> Novo Plano de Aula / EBF
            </button>
          </div>

          {/* Lessons List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredLessons.map((les) => (
              <div
                key={les.id}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 340px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: les.programType === 'EBF' ? 'rgba(236, 72, 153, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                      border: `1px solid ${les.programType === 'EBF' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      color: les.programType === 'EBF' ? '#EC4899' : 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <BookOpen size={22} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        {les.title}
                      </h4>
                      <span
                        style={{
                          background: les.programType === 'EBF' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: les.programType === 'EBF' ? '#EC4899' : 'var(--accent-gold)',
                          border: '1px solid var(--border-subtle)',
                          padding: '0.15rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                        }}
                      >
                        {les.programType === 'EBF' ? '🏖️ EBF' : '📖 EBD'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        • {formatDate(les.date)}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.84rem', color: 'var(--accent-gold-light)', fontWeight: 600, marginBottom: '0.3rem' }}>
                      Sala: {les.targetRoom} • Tia/Prof: {les.teacherName}
                    </div>

                    {les.memoryVerse && (
                      <div
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--text-secondary)',
                          fontStyle: 'italic',
                          marginBottom: '0.3rem',
                        }}
                      >
                        🗣️ <strong>Versículo:</strong> "{les.memoryVerse}"
                      </div>
                    )}

                    <p
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.83rem',
                        margin: 0,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {les.description}
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
                    onClick={() => openEditLessonModal(les)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.35rem', padding: '0.45rem 0.75rem' }}
                    title="Editar Lição"
                  >
                    <Edit2 size={14} />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(les)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.45rem 0.65rem', color: 'var(--status-error)' }}
                    title="Excluir Lição"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== MODAL CRIAR / EDITAR CRIANÇA ==================== */}
      <Modal
        isOpen={isChildModalOpen}
        onClose={() => setIsChildModalOpen(false)}
        title={editingChild ? `Editar Criança: ${editingChild.name}` : 'Cadastrar Nova Criança no KIDS'}
        maxWidth="600px"
      >
        <form onSubmit={handleSaveChild}>
          <div className="form-group">
            <label className="form-label">Nome Completo da Criança *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: Enzo Gabriel Maduro"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Data de Nasc. *</label>
              <input
                type="date"
                required
                className="form-input"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Idade (anos) *</label>
              <input
                type="number"
                min={0}
                max={13}
                required
                className="form-input"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sala / Faixa *</label>
              <select
                className="form-select"
                value={room}
                onChange={(e) => setRoom(e.target.value as any)}
              >
                <option value="Berçário (0 a 2 anos)">Berçário (0 a 2)</option>
                <option value="Maternal (2 a 4 anos)">Maternal (2 a 4)</option>
                <option value="Primários (5 a 8 anos)">Primários (5 a 8)</option>
                <option value="Juniores (9 a 12 anos)">Juniores (9 a 12)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nome do Responsável *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: Pra. Midiã Gomes Maduro"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Parentesco *</label>
              <select
                className="form-select"
                value={guardianRelationship}
                onChange={(e) => setGuardianRelationship(e.target.value)}
              >
                <option value="Mãe">Mãe</option>
                <option value="Pai">Pai</option>
                <option value="Avó/Avô">Avó / Avô</option>
                <option value="Tio/Tia">Tio / Tia</option>
                <option value="Tutor Legal">Tutor Legal</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp do Pai/Mãe *</label>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="Ex: 92984509989"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Alergias, Restrições ou Cuidados Médicos</label>
            <textarea
              rows={2}
              className="form-textarea"
              placeholder="Ex: Alergia a leite e derivados; não deixar comer amendoim; toma medicamento às 20h..."
              value={allergiesOrNotes}
              onChange={(e) => setAllergiesOrNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsChildModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingChild ? 'Salvar Alterações' : 'Cadastrar Criança'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ==================== MODAL CRIAR / EDITAR LIÇÃO ==================== */}
      <Modal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        title={editingLesson ? `Editar Lição: ${editingLesson.title}` : 'Cadastrar Novo Plano de Aula / EBF'}
        maxWidth="600px"
      >
        <form onSubmit={handleSaveLesson}>
          <div className="form-group">
            <label className="form-label">Título da Lição / Tema *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: A Arca de Noé: O Barco da Obediência"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Programa *</label>
              <select
                className="form-select"
                value={lessonProgram}
                onChange={(e) => setLessonProgram(e.target.value as any)}
              >
                <option value="EBD">EBD (Escola Dominical)</option>
                <option value="EBF">EBF (Escola Bíblica de Férias)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Data de Aplicação *</label>
              <input
                type="date"
                required
                className="form-input"
                value={lessonDate}
                onChange={(e) => setLessonDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sala / Faixa Alvo *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: Maternal & Primários"
                value={lessonRoom}
                onChange={(e) => setLessonRoom(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Professor(a) / Tia Responsável *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: Camila Albuquerque Silva"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Versículo para Memorização</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Filhos, obedecei a vossos pais no Senhor... (Ef 6:1)"
              value={memoryVerse}
              onChange={(e) => setMemoryVerse(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Atividades Lúdicas Aplicadas</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Pintura com dedos, teatro de fantoches, gincana bíblica..."
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descrição / Objetivos Pedagógicos</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Descreva o propósito da aula bíblica e como as crianças responderam..."
              value={lessonDesc}
              onChange={(e) => setLessonDesc(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsLessonModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingLesson ? 'Salvar Alterações' : 'Cadastrar Lição'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
