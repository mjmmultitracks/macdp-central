import React, { useState } from 'react';
import { CellGroup, Ministry } from '../../types';
import {
  Compass,
  MapPin,
  Clock,
  Users,
  MessageCircle,
  Smile,
  Search,
} from 'lucide-react';

interface CellsLocatorProps {
  cells: CellGroup[];
  ministries?: Ministry[];
  onVolunteerMinistry?: (ministryName: string) => void;
}

export const CellsLocator: React.FC<CellsLocatorProps> = ({ cells, ministries }) => {
  const [searchNeighborhood, setSearchNeighborhood] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<string>('todos');
  const [selectedDay, setSelectedDay] = useState<string>('todos');

  const defaultMinistries = [
    { name: 'Caçadores da Presença Music (Ministério de Louvor)', description: 'Ministério de louvor da MACDP, que conduz a igreja em adoração.' },
    { name: 'Hope Dance (Ministério de Dança)', description: 'Ministério de dança que expressa adoração por meio do movimento.' },
    { name: 'HOPART (Ministério de Artes)', description: 'Ministério de artes da MACDP.' },
    { name: 'Ministério de Serviço', description: 'Serve a igreja e os irmãos nos cultos e eventos.' },
    { name: 'Comunicação e Mídia', description: 'Transmissão ao vivo, fotos, vídeos e redes sociais da MACDP.' },
    { name: 'Rede UP (Rede de Jovens Unidade e Propósito)', description: 'Rede de jovens da MACDP: unidade e propósito.' },
    { name: 'Rede de Casais', description: 'Encontros e cuidado para os casais da igreja.' },
    { name: 'Rede de Homens', description: 'Encontros e discipulado para os homens da igreja.' },
    { name: 'Rede de Mulheres', description: 'Encontros e discipulado para as mulheres da igreja.' },
  ];

  const ministriesList = ministries && ministries.length > 0
    ? ministries.map((m) => ({ name: m.name, description: m.description }))
    : defaultMinistries;

  const filteredCells = cells.filter((c) => {
    const matchNeighborhood =
      !searchNeighborhood ||
      c.neighborhood.toLowerCase().includes(searchNeighborhood.toLowerCase()) ||
      c.name.toLowerCase().includes(searchNeighborhood.toLowerCase());

    const matchAudience =
      selectedAudience === 'todos' || c.targetAudience.toLowerCase() === selectedAudience.toLowerCase();

    const matchDay =
      selectedDay === 'todos' || c.dayOfWeek.toLowerCase().includes(selectedDay.toLowerCase());

    return matchNeighborhood && matchAudience && matchDay;
  });

  return (
    <section id="celulas" className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Ministérios: lista limpa, sem botões */}
        <div id="ministerios" className="mins-head">
          <span className="mins-tag">Ministérios</span>
          <h2 className="mins-title">Encontre seu lugar para servir</h2>
          <p className="mins-lead">Cada membro tem dons para abençoar vidas. Conheça os ministérios da MACDP.</p>
        </div>

        <ol className="mins-list">
          {ministriesList.map((min, index) => (
            <li key={min.name + index} className="mins-item">
              <span className="mins-n">{String(index + 1).padStart(2, '0')}</span>
              <span className="mins-text">
                <strong>{min.name}</strong>
                {min.description && <span>{min.description}</span>}
              </span>
            </li>
          ))}
        </ol>

        <style>{`
          .mins-head { text-align: center; max-width: 40rem; margin: 0 auto 3rem; }
          .mins-tag { display: block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent-gold); margin-bottom: 0.9rem; }
          .mins-title { font-size: clamp(1.9rem, 4vw, 3rem); margin: 0 0 1rem; }
          .mins-lead { font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary); margin: 0; }
          .mins-list { list-style: none; margin: 0 auto 6rem; padding: 0; max-width: 960px; display: grid; grid-template-columns: 1fr 1fr; column-gap: 3rem; border-top: 1px solid var(--border-medium); }
          .mins-item { display: grid; grid-template-columns: 2.5rem 1fr; gap: 0.75rem; padding: 1.4rem 0; border-bottom: 1px solid var(--border-subtle); }
          .mins-n { font-family: var(--font-display); font-weight: 800; font-size: 0.9rem; color: var(--accent-gold); padding-top: 0.15rem; }
          .mins-text { display: flex; flex-direction: column; gap: 0.3rem; min-width: 0; }
          .mins-text strong { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); line-height: 1.35; }
          .mins-text span { font-size: 0.9rem; line-height: 1.55; color: var(--text-secondary); }
          @media (max-width: 760px) { .mins-list { grid-template-columns: 1fr; } }
        `}</style>

        {/* Cells Locator Header */}
        <div className="section-header">
          <span className="section-tag">
            <Compass size={14} /> Pequenos Grupos
          </span>
          <h2 className="section-title">Localizador de Células</h2>
          <p className="section-subtitle">
            A vida da igreja acontece nas casas! Participe de uma célula perto de você para criar amizades verdadeiras, orar em comunidade e estudar a Bíblia.
          </p>
        </div>

        {/* Filters Bar */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '2.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          {/* Search input */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Buscar por bairro em Manaus (ex: Canaranas, Ponta Negra, Flores...)"
              value={searchNeighborhood}
              onChange={(e) => setSearchNeighborhood(e.target.value)}
            />
          </div>

          {/* Audience select */}
          <div>
            <select
              className="form-select"
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value)}
            >
              <option value="todos">Todos os Públicos</option>
              <option value="Mista">Células Mistas (Famílias)</option>
              <option value="Jovens">Conexão Jovem</option>
              <option value="Casais">Aliança de Casais</option>
              <option value="Mulheres">Mulheres Vitoriosas</option>
              <option value="Homens">Homens de Honra</option>
            </select>
          </div>

          {/* Day of Week select */}
          <div>
            <select
              className="form-select"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              <option value="todos">Qualquer Dia da Semana</option>
              <option value="segunda">Segunda-feira</option>
              <option value="terça">Terça-feira</option>
              <option value="quarta">Quarta-feira</option>
              <option value="quinta">Quinta-feira</option>
              <option value="sexta">Sexta-feira</option>
              <option value="sábado">Sábado</option>
            </select>
          </div>
        </div>

        {/* Cells Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '1.75rem',
          }}
        >
          {filteredCells.map((cell) => {
            const encodedMsg = encodeURIComponent(
              `Olá, líder ${cell.leaderName}! Graça e paz! Encontrei a "${cell.name}" no site oficial do Ministério Apostólico Caçadores da Presença (MACDP) e gostaria muito de visitar o próximo encontro!`
            );
            const waUrl = `https://wa.me/55${cell.leaderPhone}?text=${encodedMsg}`;

            return (
              <div key={cell.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-gold">{cell.targetAudience}</span>
                  <span className="badge badge-blue">
                    <Users size={12} /> {cell.membersCount} participantes
                  </span>
                </div>

                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {cell.name}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={15} color="var(--accent-gold)" />
                    <span><strong>{cell.neighborhood}</strong> • {cell.address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={15} color="var(--accent-gold)" />
                    <span>Toda {cell.dayOfWeek} às {cell.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <Smile size={15} color="var(--accent-gold)" />
                    <span>Líderes: {cell.leaderName}</span>
                  </div>
                </div>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ width: '100%', gap: '0.5rem' }}
                >
                  <MessageCircle size={17} />
                  <span>Falar com o Líder no WhatsApp</span>
                </a>
              </div>
            );
          })}

          {filteredCells.length === 0 && (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '3rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border-medium)',
              }}
            >
              <Compass size={42} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Nenhuma célula encontrada para estes filtros
              </h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Experimente alterar o bairro ou o público-alvo para ver outras opções disponíveis.
              </p>
              <button
                onClick={() => {
                  setSearchNeighborhood('');
                  setSelectedAudience('todos');
                  setSelectedDay('todos');
                }}
                className="btn btn-secondary"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
