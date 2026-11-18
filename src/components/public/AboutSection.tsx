import React from 'react';
import { Users, Eye, Target, Compass, Heart, BookOpen } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const pastors = [
    {
      role: 'Pastores Presidentes e Fundadores',
      names: 'Oziel e Midiã Gomes Maduro',
      photoUrl: '/images/pastors_oziel_midia.png',
      objectPosition: 'center top',
      summary: 'Fundadores e líderes à frente do MACDP em Manaus.',
    },
    {
      role: 'Pastores Auxiliares',
      names: 'Jaziel e Abda Maduro',
      photoUrl: '/images/pastors_jaziel_abda.png',
      objectPosition: 'center top',
      summary: 'Ensino da Palavra, visitação e cuidado das famílias.',
    },
    {
      role: 'Pastores Auxiliares',
      names: 'Samuel e Daniely Trindade',
      photoUrl: '/images/pastors_samuel_daniely.png',
      objectPosition: 'center 10%',
      summary: 'Discipulado, células e edificação dos lares.',
    },
  ];


  const coreValues = [
    {
      icon: BookOpen,
      title: 'Busca Apaixonada pela Presença',
      desc: 'Mais do que rituais religiosos, somos incansáveis caçadores da presença manifesta do Espírito Santo em nossas vidas.',
    },
    {
      icon: Heart,
      title: 'Hospital de Almas (Sem Julgamentos)',
      desc: '"Proibido a entrada de pessoas perfeitas." Acolhemos o ferido, o necessitado e quem busca recomeçar em Cristo.',
    },
    {
      icon: Users,
      title: 'Comunhão em Células por Manaus',
      desc: 'Crescemos juntos nas casas, compartilhando a mesa, a oração e o discipulado de perto em cada bairro.',
    },
    {
      icon: Target,
      title: 'Autoridade & Transformação Social',
      desc: 'Amor prático que impacta o Amazonas com projetos comunitários, socorro aos vulneráveis e expansão do Reino.',
    },
  ];

  return (
    <section id="sobre" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">
            <Users size={14} /> Quem Somos
          </span>
          <h2 className="section-title">Ministério Apostólico Caçadores da Presença</h2>
          <p className="section-subtitle">
            Conheça o coração pastoral de Oziel e Midiã Gomes Maduro e o chamado profético do MACDP em Manaus/AM.
          </p>
        </div>

        {/* Story & Identity Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '3rem',
            alignItems: 'center',
            marginBottom: '5rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--accent-gold)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Cidade Nova • Canaranas • Manaus / AM
            </span>
            <h3 style={{ fontSize: '2.1rem', fontWeight: 800, margin: '0.75rem 0 1.25rem 0', lineHeight: 1.2 }}>
              Uma igreja que ama a Deus e caça Sua Presença incansavelmente.
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              O <strong>Ministério Apostólico Caçadores da Presença (MACDP)</strong> nasceu com uma visão profética e acolhedora no coração da Zona Norte de Manaus. Sob a cobertura e direção dos <strong>Pastores Presidentes Oziel Gomes Maduro e Midiã Gomes Maduro</strong>, a igreja tem sido refúgio para centenas de famílias que anseiam por uma fé viva, sem hipocrisia e transbordante de amor.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
              Nosso lema é claro e libertador: <strong>"Proibido a Entrada de Pessoas Perfeitas."</strong> Se você errou, se está cansado ou machucado pela vida, há um lugar reservado para você no altar do Senhor!
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.25rem' }}>
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '3px solid var(--accent-gold)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Target size={18} color="var(--accent-gold)" />
                  <strong style={{ fontSize: '0.95rem' }}>Nossa Missão</strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Manifestar o Reino de Deus e acolher vidas com o amor incondicional da Presença.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '3px solid var(--accent-blue)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Eye size={18} color="var(--accent-blue-light)" />
                  <strong style={{ fontSize: '0.95rem' }}>Nossa Visão</strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Ser um farol apostólico em Manaus, estabelecendo células de avivamento e comunhão.
                </p>
              </div>
            </div>
          </div>

          {/* Fellowship Photo */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl), 0 0 25px rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                aspectRatio: '16 / 10',
                position: 'relative',
              }}
            >
              <img
                src="/images/macdp_adoracao_evento.jpg"
                alt="Comunhão e Oração dos Membros do Ministério Apostólico Caçadores da Presença (MACDP)"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'contrast(1.08) brightness(0.96) saturate(1.18) sepia(0.08)',
                  transition: 'transform 0.5s ease, filter 0.5s ease',
                }}
              />
              {/* Cinematic Warm Golden & Vignette Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(0, 0, 0, 0.05) 45%, rgba(11, 17, 32, 0.55) 100%)',
                  pointerEvents: 'none',
                }}
              />
              {/* Editorial Tag */}
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  background: 'rgba(11, 17, 32, 0.78)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--accent-gold-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--accent-gold)',
                  }}
                />
                <span>Comunhão & Oração • MACDP</span>
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '-1.5rem',
                right: '1.5rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.5rem',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold)', lineHeight: 1 }}>
                +14
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>
                Anos proclamando <br />o Evangelho em Manaus
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-tag">
              <Compass size={14} /> Nossos Pilares
            </span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Valores que Guiam Cada Decisão</h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {coreValues.map((val, i) => {
              const Icon = val.icon;
              return (
                <div key={i} className="card card-hover" style={{ padding: '1.75rem' }}>
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
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                    {val.title}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {val.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Corpo pastoral: fotos circulares e texto curto */}
        <div style={{ marginTop: "1rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span className="section-tag">Corpo Pastoral</span>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 700, marginTop: "0.25rem" }}>Nossos Pastores</h3>
          </div>

          <div className="pastors-row">
            {pastors.map((p) => (
              <div key={p.names} className="pastor-item">
                <div className="pastor-photo">
                  <img src={p.photoUrl} alt={p.names} style={{ objectPosition: p.objectPosition }} loading="lazy" />
                </div>
                <h4 className="pastor-name">{p.names}</h4>
                <span className="pastor-role">{p.role}</span>
                <p className="pastor-summary">{p.summary}</p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .pastors-row {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 2rem;
            max-width: 960px;
            margin: 0 auto;
          }
          .pastor-item { display: flex; flex-direction: column; align-items: center; text-align: center; }
          .pastor-photo {
            width: 160px; height: 160px; border-radius: 50%;
            overflow: hidden; margin-bottom: 1.1rem;
            border: 1px solid var(--border-medium);
            background: var(--bg-tertiary);
          }
          .pastor-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
          .pastor-name { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.2rem; }
          .pastor-role {
            font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em;
            text-transform: uppercase; color: var(--accent-gold); margin-bottom: 0.6rem;
          }
          .pastor-summary { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; max-width: 16rem; margin: 0; }
          @media (max-width: 760px) {
            .pastors-row { grid-template-columns: 1fr; gap: 2.2rem; }
          }
        `}</style>
      </div>
    </section>
  );
};
