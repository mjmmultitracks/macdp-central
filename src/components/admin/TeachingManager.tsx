import React, { useState } from 'react';
import {
  TeachingClass,
  TeachingMaterial,
  TeachingMessageLog,
  CellGroup,
  Ministry,
  Member,
} from '../../types';
import {
  addTeachingClass,
  updateTeachingClass,
  deleteTeachingClass,
  addTeachingMaterial,
  updateTeachingMaterial,
  deleteTeachingMaterial,
  sendTeachingBroadcast,
} from '../../services/db';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import {
  GraduationCap,
  BookOpen,
  Send,
  Mail,
  MessageSquare,
  Bell,
  Sparkles,
  Plus,
  Search,
  Users,
  Clock,
  MapPin,
  FileText,
  Download,
  Share2,
  CheckCircle2,
  Edit2,
  Trash2,
  Smartphone,
  Check,
  Compass,
  AlertTriangle,
} from 'lucide-react';

interface TeachingManagerProps {
  classes: TeachingClass[];
  materials: TeachingMaterial[];
  logs: TeachingMessageLog[];
  cells: CellGroup[];
  ministries: Ministry[];
  members: Member[];
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const TeachingManager: React.FC<TeachingManagerProps> = ({
  classes,
  materials,
  logs,
  cells,
  ministries,
  members,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'messages' | 'materials'>('classes');

  // ==================== SEARCH & FILTERS ====================
  const [searchClass, setSearchClass] = useState('');
  const [classCategoryFilter, setClassCategoryFilter] = useState('todos');

  const [searchMaterial, setSearchMaterial] = useState('');
  const [materialTargetFilter, setMaterialTargetFilter] = useState('todos');

  // ==================== CLASS MODAL STATE ====================
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<TeachingClass | null>(null);
  const [className, setClassName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [schedule, setSchedule] = useState('Domingos às 09:00');
  const [room, setRoom] = useState('Sala 3 - Ensino & Discipulado');
  const [studentsCount, setStudentsCount] = useState<number>(20);
  const [classCategory, setClassCategory] = useState<TeachingClass['category']>('Liderança');
  const [classDesc, setClassDesc] = useState('');

  // Confirmação de Exclusão de Turma
  const [classToDelete, setClassToDelete] = useState<TeachingClass | null>(null);

  // ==================== MATERIAL MODAL STATE ====================
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<TeachingMaterial | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<TeachingMaterial | null>(null);
  const [matTitle, setMatTitle] = useState('');
  const [matTargetType, setMatTargetType] = useState<TeachingMaterial['targetType']>('celulas');
  const [matTargetAudience, setMatTargetAudience] = useState('Todas as Células');
  const [matAuthor, setMatAuthor] = useState('Pr. Oziel Gomes Maduro');
  const [matWeekTopic, setMatWeekTopic] = useState('Semana 01 - Alargando as Tendas');
  const [matSummary, setMatSummary] = useState('');

  // ==================== BROADCAST MATERIAL MODAL ====================
  const [selectedMatForBroadcast, setSelectedMatForBroadcast] = useState<TeachingMaterial | null>(null);

  // ==================== MESSAGE BROADCAST FORM STATE ====================
  const [msgTargetClass, setMsgTargetClass] = useState('Todas as Classes');
  const [msgChannel, setMsgChannel] = useState<'email' | 'sms' | 'push' | 'todos'>('todos');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Handlers for Classes
  const openNewClassModal = () => {
    setEditingClass(null);
    setClassName('');
    setTeacher('Pr. Oziel Gomes Maduro');
    setSchedule('Domingos às 09:00');
    setRoom('Sala 3 - Ensino & Discipulado');
    setStudentsCount(20);
    setClassCategory('Liderança');
    setClassDesc('');
    setIsClassModalOpen(true);
  };

  const openEditClassModal = (cls: TeachingClass) => {
    setEditingClass(cls);
    setClassName(cls.name);
    setTeacher(cls.teacher);
    setSchedule(cls.schedule);
    setRoom(cls.room);
    setStudentsCount(cls.studentsCount);
    setClassCategory(cls.category);
    setClassDesc(cls.description);
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim() || !teacher.trim()) {
      onNotify('error', 'Preencha o nome da turma e o professor.');
      return;
    }

    if (editingClass) {
      updateTeachingClass(editingClass.id, {
        name: className,
        teacher,
        schedule,
        room,
        studentsCount: Number(studentsCount) || 1,
        category: classCategory,
        description: classDesc,
      });
      onNotify('success', `Turma "${className}" atualizada com sucesso!`);
    } else {
      addTeachingClass({
        name: className,
        teacher,
        schedule,
        room,
        studentsCount: Number(studentsCount) || 1,
        category: classCategory,
        description: classDesc,
      });
      onNotify('success', `Turma "${className}" criada com sucesso!`);
    }

    setIsClassModalOpen(false);
  };

  const handleConfirmDeleteClass = () => {
    if (!classToDelete) return;
    const name = classToDelete.name;
    const success = deleteTeachingClass(classToDelete.id);
    if (success) {
      onNotify('success', `Turma "${name}" excluída com sucesso!`);
    } else {
      onNotify('info', `Turma "${name}" removida.`);
    }
    setClassToDelete(null);
    setIsClassModalOpen(false);
  };

  const handleConfirmDeleteMaterial = () => {
    if (!materialToDelete) return;
    const title = materialToDelete.title;
    const success = deleteTeachingMaterial(materialToDelete.id);
    if (success) {
      onNotify('success', `Material didático "${title}" excluído com sucesso!`);
    } else {
      onNotify('info', `Material "${title}" removido.`);
    }
    setMaterialToDelete(null);
    setIsMaterialModalOpen(false);
  };

  // Handlers for Materials
  const openNewMaterialModal = () => {
    setEditingMaterial(null);
    setMatTitle('');
    setMatTargetType('celulas');
    setMatTargetAudience('Todas as Células');
    setMatAuthor('Pr. Oziel Gomes Maduro');
    setMatWeekTopic('Semana Atual - Presença Sobrenatural');
    setMatSummary('');
    setIsMaterialModalOpen(true);
  };

  const openEditMaterialModal = (mat: TeachingMaterial) => {
    setEditingMaterial(mat);
    setMatTitle(mat.title);
    setMatTargetType(mat.targetType);
    setMatTargetAudience(mat.targetAudience || 'Todas as Células');
    setMatAuthor(mat.author);
    setMatWeekTopic(mat.weekTopic || '');
    setMatSummary(mat.summary);
    setIsMaterialModalOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim() || !matSummary.trim()) {
      onNotify('error', 'Preencha o título e o resumo do material de estudo.');
      return;
    }

    if (editingMaterial) {
      updateTeachingMaterial(editingMaterial.id, {
        title: matTitle,
        targetType: matTargetType,
        targetAudience: matTargetAudience,
        author: matAuthor,
        weekTopic: matWeekTopic,
        summary: matSummary,
      });
      onNotify('success', `Material "${matTitle}" atualizado com sucesso!`);
    } else {
      addTeachingMaterial({
        title: matTitle,
        targetType: matTargetType,
        targetAudience: matTargetAudience,
        author: matAuthor,
        date: new Date().toISOString().split('T')[0],
        weekTopic: matWeekTopic,
        summary: matSummary,
      });
      onNotify('success', `Material de estudo "${matTitle}" cadastrado com sucesso!`);
    }

    setIsMaterialModalOpen(false);
  };

  const handleDeleteMaterial = (mat: TeachingMaterial) => {
    if (window.confirm(`Deseja remover o material de estudo "${mat.title}"?`)) {
      deleteTeachingMaterial(mat.id);
      onNotify('info', `Material "${mat.title}" removido.`);
    }
  };

  // Dispatch Material to WhatsApp/Channels
  const handleCopyMaterialWhatsApp = (mat: TeachingMaterial) => {
    let msg = `📖 *MATERIAL DE ESTUDO & DISCIPULADO — MACDP*\n`;
    msg += `📌 *Título:* ${mat.title}\n`;
    if (mat.weekTopic) msg += `🗓 *Tema:* ${mat.weekTopic}\n`;
    msg += `✍️ *Autor:* ${mat.author}\n`;
    msg += `🎯 *Destinado a:* ${mat.targetAudience || mat.targetType}\n\n`;
    msg += `📝 *Resumo do Estudo:*\n${mat.summary}\n\n`;
    msg += `🔗 *Acesse o material completo no Portal do Discipulado:* http://localhost:5173/\n`;
    msg += `_Ministério Apostólico Caçadores da Presença (MACDP) — Edificando Vidas!_`;

    navigator.clipboard.writeText(msg);
    onNotify('success', 'Texto do estudo copiado! Pronto para colar no grupo das Células / Ministérios.');
  };

  // Send Messages / Notifications to Class Students
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgSubject.trim() || !msgBody.trim()) {
      onNotify('error', 'Preencha o assunto e a mensagem.');
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      let recipientCount = 0;
      if (msgTargetClass === 'Todas as Classes') {
        recipientCount = classes.reduce((sum, c) => sum + c.studentsCount, 0);
      } else {
        const found = classes.find((c) => c.name === msgTargetClass);
        recipientCount = found ? found.studentsCount : 25;
      }

      sendTeachingBroadcast({
        targetClass: msgTargetClass,
        channel: msgChannel,
        subject: msgSubject,
        message: msgBody,
        recipientsCount: recipientCount,
      });

      setIsSending(false);
      onNotify(
        'success',
        `Disparo realizado com sucesso para ${recipientCount} alunos via ${msgChannel.toUpperCase()}!`
      );
      setMsgSubject('');
      setMsgBody('');
    }, 900);
  };

  const totalStudents = classes.reduce((sum, c) => sum + c.studentsCount, 0);

  const filteredClasses = classes.filter((c) => {
    const matchSearch =
      !searchClass ||
      c.name.toLowerCase().includes(searchClass.toLowerCase()) ||
      c.teacher.toLowerCase().includes(searchClass.toLowerCase()) ||
      c.room.toLowerCase().includes(searchClass.toLowerCase());
    const matchCat = classCategoryFilter === 'todos' || c.category === classCategoryFilter;
    return matchSearch && matchCat;
  });

  const filteredMaterials = materials.filter((m) => {
    const matchSearch =
      !searchMaterial ||
      m.title.toLowerCase().includes(searchMaterial.toLowerCase()) ||
      m.author.toLowerCase().includes(searchMaterial.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchMaterial.toLowerCase());
    const matchTarget = materialTargetFilter === 'todos' || m.targetType === materialTargetFilter;
    return matchSearch && matchTarget;
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
              <GraduationCap size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Ensino, Discipulado & Comunicação (MACDP)</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Classes bíblicas, envio de mensagens (E-mail, SMS, Push) e disparo de materiais de estudo para Células e Ministérios
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <span className="badge badge-gold">
            {classes.length} Turmas Ativas
          </span>
          <span className="badge badge-success">
            {totalStudents} Alunos Matriculados
          </span>
          <span className="badge badge-blue">
            {materials.length} Materiais de Estudo
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
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
          onClick={() => setActiveTab('classes')}
          className={`btn btn-sm ${activeTab === 'classes' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.45rem' }}
        >
          <GraduationCap size={16} />
          <span>Turmas & Classes ({classes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`btn btn-sm ${activeTab === 'messages' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.45rem' }}
        >
          <Send size={16} />
          <span>Envio de Mensagens & Notificações</span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`btn btn-sm ${activeTab === 'materials' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.45rem' }}
        >
          <BookOpen size={16} />
          <span>Disparo de Materiais para Células & Ministérios ({materials.length})</span>
        </button>
      </div>

      {/* ==================== TAB 1: TURMAS & CLASSES ==================== */}
      {activeTab === 'classes' && (
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
            <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '380px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Buscar por nome, professor ou sala..."
                value={searchClass}
                onChange={(e) => setSearchClass(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <select
                className="form-select"
                style={{ width: '180px' }}
                value={classCategoryFilter}
                onChange={(e) => setClassCategoryFilter(e.target.value)}
              >
                <option value="todos">Todas Categorias</option>
                <option value="Liderança">Liderança</option>
                <option value="Membresia">Membresia</option>
                <option value="Discipulado">Discipulado</option>
                <option value="Teologia">Teologia</option>
                <option value="Infantil">Infantil</option>
              </select>

              <button
                onClick={openNewClassModal}
                className="btn btn-primary"
                style={{ gap: '0.45rem', fontSize: '0.875rem' }}
              >
                <Plus size={16} />
                <span>Nova Turma / Classe</span>
              </button>
            </div>
          </div>

          {/* Classes List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
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
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <GraduationCap size={22} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        {cls.name}
                      </h4>
                      <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                        {cls.category}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        • 👥 {cls.studentsCount} alunos
                      </span>
                    </div>

                    <p
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        margin: '0 0 0.4rem 0',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {cls.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', flexWrap: 'wrap', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Users size={14} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                        <span><strong>Professor:</strong> {cls.teacher}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} color="var(--accent-blue-light)" style={{ flexShrink: 0 }} />
                        <span>{cls.schedule}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        <span>{cls.room}</span>
                      </div>
                    </div>
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
                  <button
                    onClick={() => {
                      setActiveTab('messages');
                      setMsgTargetClass(cls.name);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.4rem', color: 'var(--accent-gold)' }}
                  >
                    <Send size={14} />
                    <span>Comunicado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditClassModal(cls)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.35rem', padding: '0.45rem 0.75rem' }}
                    title="Editar Turma"
                  >
                    <Edit2 size={14} />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClassToDelete(cls)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.45rem 0.65rem', color: 'var(--status-error)' }}
                    title="Excluir Turma"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: ENVIO DE MENSAGENS (EMAIL, SMS, PUSH) ==================== */}
      {activeTab === 'messages' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Dispatch Form Card */}
          <div
            className="card"
            style={{
              padding: '1.75rem',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
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
                <Send size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Enviar Comunicado para Alunos</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Dispare comunicados em massa por e-mail, SMS ou notificações para o aplicativo
                </p>
              </div>
            </div>

            <form onSubmit={handleSendMessage}>
              <div className="form-group">
                <label className="form-label">Turma / Destinatários *</label>
                <select
                  className="form-select"
                  value={msgTargetClass}
                  onChange={(e) => setMsgTargetClass(e.target.value)}
                >
                  <option value="Todas as Classes">Todas as Classes e Alunos ({totalStudents} alunos)</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.studentsCount} alunos) — Prof. {c.teacher}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Canal de Envio *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setMsgChannel('todos')}
                    className={`btn btn-sm ${msgChannel === 'todos' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ gap: '0.35rem', justifyContent: 'center' }}
                  >
                    <Sparkles size={14} /> Todos os Canais
                  </button>
                  <button
                    type="button"
                    onClick={() => setMsgChannel('email')}
                    className={`btn btn-sm ${msgChannel === 'email' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ gap: '0.35rem', justifyContent: 'center' }}
                  >
                    <Mail size={14} /> E-mail
                  </button>
                  <button
                    type="button"
                    onClick={() => setMsgChannel('sms')}
                    className={`btn btn-sm ${msgChannel === 'sms' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ gap: '0.35rem', justifyContent: 'center' }}
                  >
                    <MessageSquare size={14} /> SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setMsgChannel('push')}
                    className={`btn btn-sm ${msgChannel === 'push' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ gap: '0.35rem', justifyContent: 'center' }}
                  >
                    <Bell size={14} /> Notificação App
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assunto do Comunicado *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Ex: Lembrete da Próxima Aula & Exercício Bíblico"
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mensagem / Conteúdo *</label>
                <textarea
                  required
                  rows={4}
                  className="form-textarea"
                  placeholder="Escreva a mensagem que os alunos receberão no e-mail, SMS ou notificação do app..."
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="btn btn-primary"
                style={{ width: '100%', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}
              >
                {isSending ? (
                  <span>Enviando mensagens em segundo plano...</span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Realizar Disparo para Alunos</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Real-time Smartphone Simulation Preview & History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Live Notification Preview Box */}
            <div
              style={{
                background: '#0B1120',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>
                <Smartphone size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Prévia da Notificação no Smartphone do Aluno
                </span>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <img src="/images/logo.png" alt="MACDP" style={{ width: '18px', height: '18px', borderRadius: '4px' }} />
                    <strong style={{ fontSize: '0.8rem', color: '#ffffff' }}>MACDP Central</strong>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)' }}>agora</span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FBBF24', marginBottom: '0.2rem' }}>
                  {msgSubject || 'Assunto da Notificação'}
                </div>

                <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.4 }}>
                  {msgBody || 'O conteúdo do comunicado digitado aparecerá aqui instantaneamente na tela de bloqueio e na central do app.'}
                </p>
              </div>
            </div>

            {/* History of Dispatches */}
            <div
              className="card"
              style={{
                padding: '1.25rem',
                border: '1px solid var(--border-subtle)',
                flex: 1,
              }}
            >
              <h5 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="var(--status-success)" /> Histórico de Disparos Realizados
              </h5>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '250px', overflowY: 'auto' }}>
                {logs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      background: 'var(--bg-tertiary)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{log.subject}</strong>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        {log.recipientsCount} destinatários
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                      "{log.message}"
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Canal: <strong>{log.channel.toUpperCase()}</strong> • {log.targetClass}</span>
                      <span>{formatDateTime(log.sentAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: DISPARO DE MATERIAIS PARA CÉLULAS E MINISTÉRIOS ==================== */}
      {activeTab === 'materials' && (
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
            <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '380px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Buscar por título, autor ou tema..."
                value={searchMaterial}
                onChange={(e) => setSearchMaterial(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <select
                className="form-select"
                style={{ width: '180px' }}
                value={materialTargetFilter}
                onChange={(e) => setMaterialTargetFilter(e.target.value)}
              >
                <option value="todos">Todos os Alvos</option>
                <option value="celulas">Para Células</option>
                <option value="ministerios">Para Ministérios</option>
              </select>

              <button
                onClick={openNewMaterialModal}
                className="btn btn-primary"
                style={{ gap: '0.45rem', fontSize: '0.875rem' }}
              >
                <Plus size={16} />
                <span>Novo Material de Estudo</span>
              </button>
            </div>
          </div>

          {/* Materials List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredMaterials.map((mat) => (
              <div
                key={mat.id}
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
                      background: mat.targetType === 'celulas' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                      border: `1px solid ${mat.targetType === 'celulas' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                      color: mat.targetType === 'celulas' ? 'var(--accent-gold)' : 'var(--accent-blue-light)',
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
                        {mat.title}
                      </h4>
                      <span
                        style={{
                          background: mat.targetType === 'celulas' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: mat.targetType === 'celulas' ? 'var(--accent-gold-light)' : 'var(--accent-blue-light)',
                          border: '1px solid var(--border-subtle)',
                          padding: '0.15rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {mat.targetType === 'celulas' ? '🧭 Para Células' : '✨ Para Ministérios'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        • {formatDate(mat.date)}
                      </span>
                    </div>

                    {mat.weekTopic && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '0.25rem' }}>
                        📌 {mat.weekTopic}
                      </div>
                    )}

                    <p
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        margin: '0 0 0.35rem 0',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {mat.summary}
                    </p>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      ✍️ Autor: <strong>{mat.author}</strong>
                    </div>
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
                  <button
                    onClick={() => handleCopyMaterialWhatsApp(mat)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.4rem', color: '#10B981', background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.25)' }}
                    title="Copiar texto pronto para o WhatsApp dos líderes"
                  >
                    <Share2 size={15} />
                    <span>Disparar WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditMaterialModal(mat)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.35rem', padding: '0.45rem 0.75rem' }}
                    title="Editar Material"
                  >
                    <Edit2 size={14} />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialToDelete(mat)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.45rem 0.65rem', color: 'var(--status-error)' }}
                    title="Excluir Material"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== MODAL CRIAR / EDITAR TURMA ==================== */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title={editingClass ? `Editar Turma: ${editingClass.name}` : 'Cadastrar Nova Turma / Classe'}
        maxWidth="600px"
      >
        <form onSubmit={handleSaveClass}>
          <div className="form-group">
            <label className="form-label">Nome da Turma / Curso *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: Escola de Líderes da Presença"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Professor / Facilitador *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: Pr. Oziel Gomes Maduro"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Categoria *</label>
              <select
                className="form-select"
                value={classCategory}
                onChange={(e) => setClassCategory(e.target.value as any)}
              >
                <option value="Liderança">Liderança</option>
                <option value="Membresia">Membresia</option>
                <option value="Discipulado">Discipulado</option>
                <option value="Teologia">Teologia</option>
                <option value="Infantil">Infantil</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Horário *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Domingos às 09:00"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sala / Espaço *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Sala 3 - Ensino"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Qtd Alunos</label>
              <input
                type="number"
                min={1}
                className="form-input"
                value={studentsCount}
                onChange={(e) => setStudentsCount(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição / Ementa do Curso *</label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              placeholder="Descreva o propósito da turma, material didático e público..."
              value={classDesc}
              onChange={(e) => setClassDesc(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            {editingClass ? (
              <button
                type="button"
                onClick={() => setClassToDelete(editingClass)}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--status-error)', gap: '0.4rem' }}
              >
                <Trash2 size={15} />
                <span>Excluir Turma</span>
              </button>
            ) : <div />}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsClassModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editingClass ? 'Salvar Alterações' : 'Cadastrar Turma'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ==================== MODAL CRIAR / EDITAR MATERIAL ==================== */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        title={editingMaterial ? `Editar Material: ${editingMaterial.title}` : 'Cadastrar Material de Estudo'}
        maxWidth="620px"
      >
        <form onSubmit={handleSaveMaterial}>
          <div className="form-group">
            <label className="form-label">Título do Estudo / Roteiro *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: Roteiro de Célula: Rompendo Limites na Presença"
              value={matTitle}
              onChange={(e) => setMatTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Destinado a *</label>
              <select
                className="form-select"
                value={matTargetType}
                onChange={(e) => setMatTargetType(e.target.value as any)}
              >
                <option value="celulas">Células / Pequenos Grupos</option>
                <option value="ministerios">Ministérios & Equipes</option>
                <option value="ambos">Ambos (Igreja Geral)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Público / Grupo Alvo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Todas as Células ou Louvor"
                value={matTargetAudience}
                onChange={(e) => setMatTargetAudience(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Autor / Pastor Responsável *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: Pr. Oziel Gomes Maduro"
                value={matAuthor}
                onChange={(e) => setMatAuthor(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tema da Semana / Módulo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Semana 01 - Quebrando Limites"
                value={matWeekTopic}
                onChange={(e) => setMatWeekTopic(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Conteúdo / Resumo do Estudo Bíblico *</label>
            <textarea
              required
              rows={4}
              className="form-textarea"
              placeholder="Digite o roteiro para discussão na célula ou estudo ministerial..."
              value={matSummary}
              onChange={(e) => setMatSummary(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            {editingMaterial ? (
              <button
                type="button"
                onClick={() => setMaterialToDelete(editingMaterial)}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--status-error)', gap: '0.4rem' }}
              >
                <Trash2 size={15} />
                <span>Excluir Material</span>
              </button>
            ) : <div />}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsMaterialModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editingMaterial ? 'Salvar Alterações' : 'Cadastrar e Liberar'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ==================== MODAL CONFIRMAÇÃO DE EXCLUSÃO DE TURMA ==================== */}
      <Modal
        isOpen={!!classToDelete}
        onClose={() => setClassToDelete(null)}
        title="Excluir Turma / Curso"
        maxWidth="480px"
      >
        {classToDelete && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--status-error)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Excluir turma "{classToDelete.name}"?
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Esta ação removerá a turma permanentemente do painel de ensino e discipulado da igreja.
                </p>
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.825rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div><strong>Professor:</strong> {classToDelete.teacher}</div>
              <div><strong>Categoria:</strong> {classToDelete.category} • {classToDelete.studentsCount} alunos</div>
              <div><strong>Horário / Sala:</strong> {classToDelete.schedule} ({classToDelete.room})</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setClassToDelete(null)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteClass}
                className="btn btn-danger"
                style={{ gap: '0.45rem', background: '#ef4444', color: '#ffffff', fontWeight: 700 }}
              >
                <Trash2 size={16} />
                <span>Sim, Excluir Turma</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ==================== MODAL CONFIRMAÇÃO DE EXCLUSÃO DE MATERIAL ==================== */}
      <Modal
        isOpen={!!materialToDelete}
        onClose={() => setMaterialToDelete(null)}
        title="Excluir Material Didático"
        maxWidth="480px"
      >
        {materialToDelete && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--status-error)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Excluir material "{materialToDelete.title}"?
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Este estudo será excluído permanentemente da biblioteca de materiais da igreja.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setMaterialToDelete(null)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMaterial}
                className="btn btn-danger"
                style={{ gap: '0.45rem', background: '#ef4444', color: '#ffffff', fontWeight: 700 }}
              >
                <Trash2 size={16} />
                <span>Sim, Excluir Material</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
