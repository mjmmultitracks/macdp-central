import React, { useState, useEffect } from 'react';
import { SermonNote } from '../../types';
import {
  FileText,
  Plus,
  Trash2,
  Share2,
  Calendar,
  BookOpen,
  Edit2,
  Check,
  X,
  Search,
} from 'lucide-react';

interface AppSermonNotesViewProps {
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

const STORAGE_KEY = 'macdp_app_sermon_notes';

export const AppSermonNotesView: React.FC<AppSermonNotesViewProps> = ({ onNotify }) => {
  const [notes, setNotes] = useState<SermonNote[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        id: 'note_init',
        title: 'Mensagem da Conferência da Presença',
        preacher: 'Pr. Oziel Gomes Maduro',
        passage: 'Isaías 55:6',
        date: '2026-09-01',
        content:
          '1. A presença de Deus transforma vidas.\n2. Não podemos nos conformar com a religiosidade fria.\n3. Buscar a Deus no secreto gera autoridade pública.',
        updatedAt: '2026-09-01T20:00:00Z',
      },
    ];
  });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [preacher, setPreacher] = useState('');
  const [passage, setPassage] = useState('');
  const [content, setContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const saveToStorage = (updated: SermonNote[]) => {
    setNotes(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setTitle('');
    setPreacher('');
    setPassage('');
    setContent('');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (note: SermonNote) => {
    setEditingId(note.id);
    setTitle(note.title);
    setPreacher(note.preacher || '');
    setPassage(note.passage || '');
    setContent(note.content);
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    saveToStorage(updated);
    onNotify('info', 'Anotação excluída.');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      onNotify('error', 'Preencha o título e o conteúdo da anotação.');
      return;
    }

    if (editingId) {
      const updated = notes.map((n) =>
        n.id === editingId
          ? {
              ...n,
              title,
              preacher,
              passage,
              content,
              updatedAt: new Date().toISOString(),
            }
          : n
      );
      saveToStorage(updated);
      onNotify('success', 'Anotação atualizada com sucesso!');
    } else {
      const newNote: SermonNote = {
        id: `note_${Date.now()}`,
        title,
        preacher,
        passage,
        content,
        date: new Date().toLocaleDateString('pt-BR'),
        updatedAt: new Date().toISOString(),
      };
      saveToStorage([newNote, ...notes]);
      onNotify('success', 'Nova anotação salva no seu caderno!');
    }

    setIsEditorOpen(false);
  };

  const handleShare = (note: SermonNote) => {
    const text = `📝 Anotações do Culto: "${note.title}"\n${note.preacher ? `Pregador: ${note.preacher}\n` : ''}${note.passage ? `Texto Bíblico: ${note.passage}\n` : ''}\n${note.content}\n\n📲 Ministério Apostólico Caçadores da Presença`;
    if (navigator.share) {
      navigator.share({ title: note.title, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      onNotify('success', 'Anotações copiadas para o WhatsApp!');
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.preacher && n.preacher.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
          borderRadius: '20px',
          padding: '1.25rem',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
            Caderno de Sermões
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {notes.length} anotações salvas no seu celular
          </span>
        </div>

        <button onClick={handleOpenNew} className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
          <Plus size={16} />
          <span>Nova Nota</span>
        </button>
      </div>

      {/* Busca */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--bg-secondary)',
          padding: '0.6rem 0.85rem',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Buscar nas suas anotações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            outline: 'none',
            fontSize: '0.875rem',
          }}
        />
      </div>

      {/* Lista de Notas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {note.title}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={12} /> {note.date}
              </span>
            </div>

            {(note.preacher || note.passage) && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--accent-gold)', marginBottom: '0.75rem', fontWeight: 600 }}>
                {note.preacher && <span>Pregador: {note.preacher}</span>}
                {note.passage && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <BookOpen size={13} /> {note.passage}
                  </span>
                )}
              </div>
            )}

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line', margin: '0 0 1rem 0' }}>
              {note.content}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <button
                onClick={() => handleShare(note)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem', fontSize: '0.75rem' }}
              >
                <Share2 size={14} />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => handleOpenEdit(note)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem', fontSize: '0.75rem' }}
              >
                <Edit2 size={14} />
                <span>Editar</span>
              </button>

              <button
                onClick={() => handleDelete(note.id)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem', fontSize: '0.75rem', color: '#EF4444' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(5, 8, 16, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsEditorOpen(false)}
        >
          <div
            className="animate-page-enter"
            style={{
              width: '100%',
              maxWidth: '500px',
              background: 'var(--bg-secondary)',
              borderRadius: '24px',
              border: '1px solid var(--border-subtle)',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                {editingId ? 'Editar Anotação' : 'Nova Anotação de Sermão'}
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNote} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Tema / Título da Mensagem *
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Ex: Vivendo na Dimensão da Fé"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Pregador
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Pr. Oziel Maduro"
                    value={preacher}
                    onChange={(e) => setPreacher(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Passagem Bíblica
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Hebreus 11:1"
                    value={passage}
                    onChange={(e) => setPassage(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Suas Anotações e Revelações *
                </label>
                <textarea
                  rows={6}
                  required
                  className="form-textarea"
                  placeholder="Escreva os pontos principais ministrados pelo pastor..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar no Caderno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
