import React from 'react';

export const AboutSection: React.FC = () => {
  const pastors = [
    {
      role: 'Pastores Presidentes',
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
    { title: 'Busca pela Presença', desc: 'Mais do que rituais, buscamos a presença viva do Espírito Santo em nossas vidas.' },
    { title: 'Hospital de Almas', desc: 'Acolhemos o ferido e quem busca recomeçar em Cristo, sem julgamentos.' },
    { title: 'Comunhão em Células', desc: 'Crescemos juntos nas casas, em cada bairro de Manaus, com oração e discipulado.' },
    { title: 'Amor que Transforma', desc: 'Projetos comunitários e cuidado com quem mais precisa no Amazonas.' },
  ];

  return (
    <section id="sobre" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        {/* Cabeçalho */}
        <div className="about-head">
          <span className="about-tag">Quem somos</span>
          <h2 className="about-title">Uma igreja que caça a presença de Deus.</h2>
        </div>

        {/* História e foto */}
        <div className="about-story">
          <div className="about-text">
            <p>
              O <strong>Ministério Apostólico Caçadores da Presença (MACDP)</strong> nasceu no coração da Zona Norte de Manaus,
              sob a direção dos pastores presidentes <strong>Oziel e Midiã Gomes Maduro</strong>. Somos refúgio para famílias
              que buscam uma fé viva, sem hipocrisia e cheia de amor.
            </p>
            <p className="about-motto">
              “Proibido a entrada de pessoas perfeitas.” Se você errou ou está cansado, há um lugar para você aqui.
            </p>

            <div className="about-mv">
              <div>
                <h4>Missão</h4>
                <p>Manifestar o Reino de Deus e acolher vidas com o amor da Presença.</p>
              </div>
              <div>
                <h4>Visão</h4>
                <p>Ser um farol apostólico em Manaus, com células de avivamento e comunhão.</p>
              </div>
            </div>
          </div>

          <figure className="about-photo">
            <img
              src="/images/macdp_adoracao_evento.jpg"
              alt="Comunhão e oração no Ministério Apostólico Caçadores da Presença"
              loading="lazy"
            />
            <figcaption>
              <b>+14</b> anos proclamando o Evangelho em Manaus
            </figcaption>
          </figure>
        </div>

        {/* Pilares */}
        <div className="about-values">
          <h3 className="about-sub">Nossos pilares</h3>
          <div className="about-values-grid">
            {coreValues.map((val, i) => (
              <div key={val.title} className="about-value">
                <span className="about-value-n">{String(i + 1).padStart(2, '0')}</span>
                <h4>{val.title}</h4>
                <p>{val.desc}</p>
              </div>
            ))}
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
          .about-head { text-align: center; margin: 0 auto 3.5rem; max-width: 44rem; }
          .about-tag { display: block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent-gold); margin-bottom: 0.9rem; }
          .about-title { font-size: clamp(1.9rem, 4vw, 3rem); margin: 0; }
          .about-story { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: clamp(2rem, 5vw, 4rem); align-items: center; max-width: 1100px; margin: 0 auto 5rem; }
          .about-text > p { color: var(--text-secondary); font-size: 1.05rem; line-height: 1.75; margin: 0 0 1.25rem; }
          .about-text strong { color: var(--text-primary); }
          .about-text .about-motto { color: var(--text-primary); font-family: var(--font-display); font-weight: 700; font-size: 1.15rem; line-height: 1.5; padding-left: 1.1rem; border-left: 3px solid var(--accent-gold); margin-bottom: 2rem; }
          .about-mv { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-subtle); }
          .about-mv h4 { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent-gold); margin: 0 0 0.4rem; }
          .about-mv p { font-size: 0.92rem; color: var(--text-secondary); line-height: 1.55; margin: 0; }
          .about-photo { margin: 0; }
          .about-photo img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; display: block; border-radius: var(--radius-lg); }
          .about-photo figcaption { margin-top: 0.8rem; font-size: 0.9rem; color: var(--text-secondary); }
          .about-photo figcaption b { color: var(--accent-gold); font-weight: 800; margin-right: 0.15rem; }
          .about-values { max-width: 1100px; margin: 0 auto 5rem; }
          .about-sub { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); margin: 0 0 1.25rem; }
          .about-values-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--border-medium); }
          .about-value { padding: 1.5rem 1.25rem 0 0; }
          .about-value + .about-value { padding-left: 1.25rem; border-left: 1px solid var(--border-subtle); }
          .about-value-n { display: block; font-family: var(--font-display); font-weight: 800; font-size: 0.9rem; color: var(--accent-gold); margin-bottom: 0.7rem; }
          .about-value h4 { font-size: 1.05rem; font-weight: 700; margin: 0 0 0.45rem; }
          .about-value p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.55; margin: 0; }
          @media (max-width: 900px) {
            .about-story { grid-template-columns: 1fr; }
            .about-values-grid { grid-template-columns: 1fr 1fr; }
            .about-value { padding: 1.4rem 1rem 1rem 0; border-left: 0 !important; }
            .about-value:nth-child(even) { padding-left: 1rem; border-left: 1px solid var(--border-subtle) !important; }
          }
          @media (max-width: 520px) {
            .about-mv { grid-template-columns: 1fr; }
            .about-values-grid { grid-template-columns: 1fr; }
            .about-value, .about-value:nth-child(even) { padding: 1.2rem 0 1rem 0; border-left: 0 !important; border-bottom: 1px solid var(--border-subtle); }
          }
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
