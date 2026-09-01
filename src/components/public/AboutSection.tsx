import React from 'react';
import { Users, Eye, Target, Compass, Heart, BookOpen, Quote } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const seniorPastoralCouple = {
    role: 'Pastores Presidentes & Fundadores',
    names: 'Pr. Oziel Gomes Maduro & Pra. Midiã Gomes Maduro',
    tag: 'Presidência Geral',
    photoUrl: '/images/pastors_oziel_midia.png',
    bio: 'Casal fundador e líderes apostólicos à frente do Ministério Apostólico Caçadores da Presença (MACDP) em Manaus/AM. Movidos por uma paixão inabalável pela Presença de Deus, dedicam suas vidas ao pastoreio com amor paternal e maternal, restauração de famílias, discipulado e edificação de uma igreja acolhedora e relevante.',
    quote: 'Aqui no MACDP é proibido a entrada de pessoas perfeitas. Somos um hospital de almas acolhidas pela graça de Deus.',
  };

  const assistantPastors = [
    {
      role: 'Pastores Auxiliares',
      names: 'Pr. Jaziel Maduro & Pra. Abda Maduro',
      photoUrl: '/images/pastors_jaziel_abda.png',
      objectPosition: 'center top',
      bio: 'Casal pastoral dedicado ao suporte do corpo de Cristo, ensino da Palavra, visitação, consolidação de famílias e fortalecimento espiritual dos ministérios da igreja.',
      quote: 'Servir à casa do Senhor com alegria e cuidar de cada vida com o amor de Jesus é a nossa maior honra.',
    },
    {
      role: 'Pastores Auxiliares',
      names: 'Pr. Samuel Trindade & Pra. Daniely Trindade',
      photoUrl: '/images/pastors_samuel_daniely.png',
      objectPosition: 'center 10%',
      bio: 'Casal pastoral atuante no pastoreio, acompanhamento de discípulos, células e edificação dos lares em Manaus, caminhando lado a lado com a liderança do MACDP.',
      quote: 'A Presença de Deus transforma corações comuns em testemunhas vivas do poder do Evangelho.',
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
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
                src="/images/macdp_comunhao.jpg"
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

        {/* Pastoral Team Gallery */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-tag">Corpo Pastoral</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Liderança com Coração Pastoral</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Homens e mulheres comprometidos em orar, pastorear e apoiar a sua caminhada espiritual
            </p>
          </div>

          {/* Senior Pastoral Couple (Single Featured Card) */}
          <div
            className="card"
            style={{
              marginBottom: '3.5rem',
              overflow: 'hidden',
              padding: 0,
              border: '1px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35), 0 0 25px rgba(245, 158, 11, 0.15)',
              background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                alignItems: 'stretch',
              }}
            >
              {/* Photo */}
              <div style={{ minHeight: '460px', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={seniorPastoralCouple.photoUrl}
                  alt={seniorPastoralCouple.names}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(11,17,32,0.85) 0%, transparent 55%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1.25rem',
                    left: '1.5rem',
                    right: '1.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                      color: '#0B1120',
                      padding: '0.4rem 1rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                    }}
                  >
                    👑 Pastores Presidentes & Fundadores
                  </span>
                </div>
              </div>

              {/* Information */}
              <div
                style={{
                  padding: '2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div style={{ marginBottom: '1.25rem' }}>
                  <span
                    style={{
                      color: 'var(--accent-gold)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      display: 'block',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Presidência Geral • Casal Pastoral
                  </span>
                  <h4 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.2, color: 'var(--text-primary)' }}>
                    {seniorPastoralCouple.names}
                  </h4>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                  {seniorPastoralCouple.bio}
                </p>

                <div
                  style={{
                    background: 'var(--bg-primary)',
                    borderLeft: '4px solid var(--accent-gold)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    display: 'flex',
                    gap: '0.75rem',
                    fontStyle: 'italic',
                    fontSize: '0.92rem',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <Quote size={22} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>"{seniorPastoralCouple.quote}"</span>
                </div>
              </div>
            </div>
          </div>

          {/* Auxiliary Pastors Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--accent-gold)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Liderança Pastoral
            </span>
            <h4 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.25rem' }}>Pastores Auxiliares</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
              Casais pastorais que caminham juntos na edificação, aconselhamento e cuidado das famílias do MACDP
            </p>
          </div>

          {/* Auxiliary Pastors Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {assistantPastors.map((couple, idx) => (
              <div
                key={idx}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  padding: 0,
                  border: '1px solid var(--border-medium)',
                }}
              >
                <div style={{ height: '460px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={couple.photoUrl}
                    alt={couple.names}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: couple.objectPosition || 'center top',
                      display: 'block',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(11,17,32,0.92) 0%, rgba(11,17,32,0.2) 45%, transparent 68%)',
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.5rem', right: '1.5rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        background: 'rgba(245, 158, 11, 0.2)',
                        color: 'var(--accent-gold-light)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        marginBottom: '0.4rem',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {couple.role}
                    </span>
                    <h4 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 800, lineHeight: 1.2 }}>
                      {couple.names}
                    </h4>
                  </div>
                </div>

                <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1.25rem', flex: 1 }}>
                    {couple.bio}
                  </p>

                  <div
                    style={{
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      display: 'flex',
                      gap: '0.65rem',
                      fontStyle: 'italic',
                      fontSize: '0.825rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Quote size={18} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                    <span>"{couple.quote}"</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
