import React, { useState } from 'react';
import { Ministry, MinistrySchedule, UserSession } from '../../types';
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  ChevronRight,
  X,
  HeartHandshake,
} from 'lucide-react';

interface AppMinistriesViewProps {
  ministries: Ministry[];
  schedules?: MinistrySchedule[];
  currentUser?: UserSession;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AppMinistriesView: React.FC<AppMinistriesViewProps> = ({
  ministries,
  schedules = [],
  currentUser,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'myschedule'>('all');
  const [selectedMinistryForVolunteer, setSelectedMinistryForVolunteer] = useState<Ministry | null>(null);

  // Volunteer form state
  const [volName, setVolName] = useState(currentUser?.name || '');
  const [volPhone, setVolPhone] = useState('');
  const [volNotes, setVolNotes] = useState('');

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volName.trim() || !volPhone.trim()) {
      onNotify('error', 'Preencha seu nome e telefone.');
      return;
    }
    onNotify(
      'success',
      `Obrigado, ${volName}! Seu interesse em servir no ministério "${selectedMinistryForVolunteer?.name}" foi registrado!`
    );
    setSelectedMinistryForVolunteer(null);
    setVolNotes('');
  };

  // Mock schedules matching the logged user or general upcoming
  const mySchedules = schedules.filter((s) =>
    s.team.some((t) => t.memberName.toLowerCase().includes(currentUser?.name.toLowerCase() || ''))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      {/* Header Tabs */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          borderRadius: '16px',
          padding: '0.35rem',
          border: '1px solid var(--border-subtle)',
          gap: '0.35rem',
        }}
      >
        <button
          onClick={() => setActiveTab('all')}
          style={{
            flex: 1,
            padding: '0.6rem',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'all' ? 'var(--accent-gold)' : 'transparent',
            color: activeTab === 'all' ? '#0B1120' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
          }}
        >
          <Users size={16} />
          <span>Ministérios da Igreja</span>
        </button>

        <button
          onClick={() => setActiveTab('myschedule')}
          style={{
            flex: 1,
            padding: '0.6rem',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'myschedule' ? 'var(--accent-gold)' : 'transparent',
            color: activeTab === 'myschedule' ? '#0B1120' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
          }}
        >
          <Calendar size={16} />
          <span>Minhas Escalas</span>
        </button>
      </div>

      {activeTab === 'all' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {ministries.map((min) => (
            <div
              key={min.id}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: '20px',
                border: '1px solid var(--border-subtle)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: 'var(--text-primary)' }}>
                    {min.name}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                    Liderança: {min.leaderName}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedMinistryForVolunteer(min)}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.35rem', padding: '0.4rem 0.85rem', fontSize: '0.775rem' }}
                >
                  <HeartHandshake size={14} />
                  <span>Quero Servir</span>
                </button>
              </div>

              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>
                {min.description}
              </p>

              {min.meetingSchedule && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <Clock size={13} />
                  <span>Reuniões & Ensaios: {min.meetingSchedule}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Aba Minhas Escalas */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '18px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <UserCheck size={24} color="var(--accent-gold)" />
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
                Escalas de Voluntários
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Consulte suas escalas para os próximos cultos e confirme sua presença.
              </span>
            </div>
          </div>

          {/* Lista de Escalas */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="badge badge-gold">Próximo Domingo • 18:30</span>
              <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={13} /> Confirmado
              </span>
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
              Culto da Família • Templo Central
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
              Ministério: <strong>Louvor & Adoração</strong> • Função: <strong>Violão & Backing Vocal</strong>
            </p>

            <button
              onClick={() => onNotify('success', 'Presença na escala confirmada com a liderança!')}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem', width: '100%', justifyContent: 'center' }}
            >
              <CheckCircle2 size={15} color="#10B981" />
              <span>Confirmar Presença na Escala</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Quero Servir */}
      {selectedMinistryForVolunteer && (
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
          onClick={() => setSelectedMinistryForVolunteer(null)}
        >
          <div
            className="animate-page-enter"
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'var(--bg-secondary)',
              borderRadius: '24px',
              border: '1px solid var(--border-subtle)',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Quero Servir em {selectedMinistryForVolunteer.name}
              </h3>
              <button
                onClick={() => setSelectedMinistryForVolunteer(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleVolunteerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={volName}
                  onChange={(e) => setVolName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Seu WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  placeholder="(92) 99999-9999"
                  value={volPhone}
                  onChange={(e) => setVolPhone(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Experiência ou dons nesta área (opcional)
                </label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Ex: Toco teclado, tenho experiência com recepção, etc."
                  value={volNotes}
                  onChange={(e) => setVolNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedMinistryForVolunteer(null)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Enviar Interesse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
