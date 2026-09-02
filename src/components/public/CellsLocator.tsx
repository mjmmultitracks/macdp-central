import React, { useState } from 'react';
import { CellGroup, Ministry } from '../../types';
import {
  Compass,
  Sparkles,
  MapPin,
  Clock,
  Users,
  MessageCircle,
  Music,
  Baby,
  Smile,
  HeartHandshake,
  Heart,
  Video,
  Flame,
  Search,
} from 'lucide-react';

interface CellsLocatorProps {
  cells: CellGroup[];
  ministries?: Ministry[];
  onVolunteerMinistry: (ministryName: string) => void;
}

export const CellsLocator: React.FC<CellsLocatorProps> = ({ cells, ministries, onVolunteerMinistry }) => {
  const [searchNeighborhood, setSearchNeighborhood] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<string>('todos');
  const [selectedDay, setSelectedDay] = useState<string>('todos');

  const getMinistryIcon = (mName: string) => {
    const n = mName.toLowerCase();
    if (n.includes('louvor') || n.includes('música') || n.includes('adoração')) return Music;
    if (n.includes('infantil') || n.includes('kids')) return Baby;
    if (n.includes('jovem') || n.includes('youth')) return Flame;
    if (n.includes('social') || n.includes('amor')) return HeartHandshake;
    if (n.includes('família') || n.includes('casal') || n.includes('casais')) return Heart;
    if (n.includes('mídia') || n.includes('comunicação') || n.includes('vídeo')) return Video;
    return Sparkles;
  };

  const defaultMinistries = [
    {
      name: 'Louvor & Adoração Profética',
      icon: Music,
      description: 'Músicos, cantores e ministros que conduzem a congregação à manifestação da Presença de Deus.',
      leaders: 'Ministério de Louvor MACDP',
    },
    {
      name: 'Caçadores Kids (Infantil)',
      icon: Baby,
      description: 'Cuidado amoroso e discipulado bíblico lúdico para crianças, ensinando os pequenos a caçar a Presença.',
      leaders: 'Pra. Abda Maduro & Equipe Kids',
    },
    {
      name: 'Caçadores Youth (Jovens)',
      icon: Flame,
      description: 'Comunidade dinâmica para adolescentes e jovens de Manaus viverem um avivamento autêntico.',
      leaders: 'Pr. Jaziel Maduro & Pra. Abda Maduro',
    },
    {
      name: 'Ação Social & Amor ao Próximo',
      icon: HeartHandshake,
      description: 'Assistência social e distribuição de alimentos a famílias carentes da Zona Norte de Manaus.',
      leaders: 'Pr. Samuel Trindade & Diaconia',
    },
    {
      name: 'Famílias & Casais na Presença',
      icon: Heart,
      description: 'Encontros mensais, cura de relacionamentos e blindagem dos lares com princípios apostólicos.',
      leaders: 'Pr. Oziel & Pra. Midiã Gomes Maduro',
    },
    {
      name: 'Comunicação & Mídia (MACDP Oficial)',
      icon: Video,
      description: 'Transmissão ao vivo para o YouTube, captação audiovisual, redes sociais (@_macdp) e som.',
      leaders: 'Equipe de Mídia & Transmissão @_macdp',
    },
  ];

  const ministriesList = ministries && ministries.length > 0
    ? ministries.map((m) => ({
        name: m.name,
        icon: getMinistryIcon(m.name),
        description: m.description,
        leaders: m.leaderName,
      }))
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
        {/* Ministries Section Header */}
        <div id="ministerios" className="section-header">
          <span className="section-tag">
            <Sparkles size={14} /> Ministérios Ativos
          </span>
          <h2 className="section-title">Encontre Seu Lugar para Servir</h2>
          <p className="section-subtitle">
            A igreja é um corpo onde cada membro possui dons únicos concedidos pelo Espírito Santo. Descubra onde seu talento pode abençoar vidas!
          </p>
        </div>

        {/* Ministries Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem',
            marginBottom: '6rem',
          }}
        >
          {ministriesList.map((min, index) => {
            const Icon = min.icon;
            return (
              <div key={index} className="card card-hover" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'var(--accent-gold-soft)',
                      color: 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{min.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Liderança: {min.leaders}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                  {min.description}
                </p>

                <button
                  onClick={() => onVolunteerMinistry(min.name)}
                  className="btn btn-secondary btn-sm"
                  style={{ alignSelf: 'flex-start' }}
                >
                  Quero Fazer Parte
                </button>
              </div>
            );
          })}
        </div>

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
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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
