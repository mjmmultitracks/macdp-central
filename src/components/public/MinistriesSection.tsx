import React from 'react';
import { Ministry } from '../../types';

interface MinistriesSectionProps {
  ministries?: Ministry[];
}

export const MinistriesSection: React.FC<MinistriesSectionProps> = ({ ministries }) => {
  const defaultMinistries = [
    { name: 'Caçadores da Presença Music (Ministério de Louvor)', description: 'Ministério de louvor da MACDP, que conduz a igreja em adoração.' },
    { name: 'Hop Dance (Ministério de Dança)', description: 'Ministério de dança que expressa adoração por meio do movimento.' },
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

  return (
    <section id="ministerios" className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Ministérios: lista limpa, sem botões */}
        <div className="mins-head">
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
      </div>
    </section>
  );
};
