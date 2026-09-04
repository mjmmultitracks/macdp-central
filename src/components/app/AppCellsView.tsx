import React, { useState } from 'react';
import { CellGroup } from '../../types';
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Users,
  Search,
  ExternalLink,
  Filter,
} from 'lucide-react';

interface AppCellsViewProps {
  cells: CellGroup[];
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AppCellsView: React.FC<AppCellsViewProps> = ({ cells, onNotify }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<string>('ALL');

  const filteredCells = (cells || []).filter((cell) => {
    const matchesSearch =
      cell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cell.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cell.leaderName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAudience =
      selectedAudience === 'ALL' || cell.targetAudience === selectedAudience;

    return matchesSearch && matchesAudience;
  });

  const handleOpenWhatsApp = (phone: string, cellName: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Olá líder! Vi a célula "${cellName}" no aplicativo da igreja e gostaria de participar de um encontro.`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleOpenMaps = (address: string) => {
    const query = encodeURIComponent(`${address}, Manaus - AM`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      {/* Intro Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, var(--bg-secondary) 100%)',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <Users size={20} color="var(--accent-gold)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Células & Grupos nas Casas
          </h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          Encontre uma família cristã perto de você para comunhão, oração e estudo bíblico durante a semana.
        </p>
      </div>

      {/* Busca & Filtro */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
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
            placeholder="Buscar por bairro, nome ou líder..."
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

        {/* Filtro por Perfil */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {['ALL', 'Mista', 'Jovens', 'Casais', 'Mulheres', 'Homens'].map((aud) => (
            <button
              key={aud}
              onClick={() => setSelectedAudience(aud)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '999px',
                border: 'none',
                background: selectedAudience === aud ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                color: selectedAudience === aud ? '#0B1120' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {aud === 'ALL' ? 'Todas' : aud}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Células */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredCells.map((cell) => (
          <div
            key={cell.id}
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                {cell.targetAudience}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} />
                {cell.dayOfWeek} às {cell.time}
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
              {cell.name}
            </h3>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
              Líder: <strong style={{ color: 'var(--text-primary)' }}>{cell.leaderName}</strong>
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
              <MapPin size={14} color="var(--accent-gold)" />
              <span>{cell.neighborhood} — {cell.address}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleOpenWhatsApp(cell.leaderPhone, cell.name)}
                className="btn btn-primary btn-sm"
                style={{ flex: 1, gap: '0.4rem', justifyContent: 'center' }}
              >
                <MessageCircle size={15} />
                <span>Falar no WhatsApp</span>
              </button>

              <button
                onClick={() => handleOpenMaps(cell.address)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem' }}
                title="Ver no Google Maps"
              >
                <MapPin size={15} />
                <span>Como Chegar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
