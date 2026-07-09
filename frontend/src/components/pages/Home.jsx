import { useEffect } from 'react';
import HeroParallax from '../HeroParallax.jsx';
import MapaAssentos from '../MapaAssentos.jsx';

const SCHEDULE = [
  {
    time: '08:00 – 08:45',
    title: 'Credenciamento e Café de Boas-Vindas',
    desc: 'Entrega dos crachás e materiais do evento, com café para o pessoal se conhecer.',
    tag: 'Recepção',
    tagClass: 'tag-gray',
  },
  {
    time: '08:45 – 09:00',
    title: 'Cerimônia de Abertura',
    desc: 'Apresentação do tema do evento e das regras do dia.',
    tag: 'Abertura',
    tagClass: 'tag-teal',
  },
  {
    time: '09:00 – 10:00',
    title: 'Palestra: A Vida Além da Amputação',
    desc: 'O impacto psicológico da reabilitação e como a tecnologia serve à reintegração social. Com Dr. Drauzio Varella.',
    tag: 'Palestra de Abertura',
    tagClass: 'tag-green',
    palestraId: 1,
  },
  {
    time: '10:00 – 10:30',
    title: 'Coffee Break & Exposição de Startups',
    desc: 'Pausa e visita aos estandes com protótipos de mãos robóticas e software de modelagem 3D.',
    tag: 'Networking',
    tagClass: 'tag-gray',
  },
  {
    time: '10:30 – 11:00',
    title: 'Palestra: A Arquitetura Lógica do Movimento',
    desc: 'Algoritmos de resposta em tempo real e otimização de código para traduzir sinais neurológicos em movimento mecânico.',
    tag: 'Palestra Técnica',
    tagClass: 'tag-blue',
    palestraId: 2,
  },
  {
    time: '11:30 – 12:30',
    title: 'Painel: Acessibilidade vs. Hardware Adaptado',
    desc: 'Debate sobre soluções de baixo custo: impressão 3D, sistemas embarcados e projetos open-source para democratizar próteses.',
    tag: 'Painel de Discussão',
    tagClass: 'tag-teal',
    palestraId: 3,
  },
  {
    time: '12:30 – 14:00',
    title: 'Intervalo para Almoço',
    desc: null,
    tag: 'Pausa',
    tagClass: 'tag-gray',
  },
  {
    time: '14:00 – 15:30',
    title: 'Minicursos Simultâneos',
    desc: (
      <>
        Confira todos os minicursos disponíveis na página dedicada.
      </>
    ),
    tag: 'Minicursos',
    tagClass: 'tag-green',
  },
  {
    time: '15:30 – 16:00',
    title: 'Último Coffee Break & Networking',
    desc: null,
    tag: 'Networking',
    tagClass: 'tag-gray',
  },
  {
    time: '16:00 – 16:45',
    title: 'Palestra: O Horizonte Biónico 2030',
    desc: 'Interfaces cérebro-máquina e o futuro onde corpo e tecnologia se integram de forma indistinguível. Com Dr. Miguel Nicolelis.',
    tag: 'Palestra de Encerramento',
    tagClass: 'tag-blue',
    palestraId: 4,
  },
  {
    time: '16:45 – 17:00',
    title: 'Sorteios & Encerramento',
    desc: 'Sorteio de livros técnicos, kits de ferramentas e agradecimentos finais.',
    tag: 'Encerramento',
    tagClass: 'tag-teal',
  },
];

const SPEAKERS = [
  {
    initials: 'DV',
    gradient: 'linear-gradient(135deg,#04044A,#7C94B8)',
    name: 'Dr. Drauzio Varella',
    role: 'Médico, Cientista e Divulgador Científico',
    talk: 'Palestra de Abertura',
  },
  {
    initials: 'NH',
    gradient: 'linear-gradient(135deg,#2A4D88,#04044A)',
    name: 'Nina da Hora',
    role: 'Cientista da Computação',
    talk: 'Palestra Técnica',
  },
  {
    initials: 'LB',
    gradient: 'linear-gradient(135deg,#04044A,#B1BBC8)',
    name: 'Dra. Linamara Battistella',
    role: 'Fisiatra · Rede Lucy Montoro',
    talk: 'Painel de Discussão',
  },
  {
    initials: 'TP',
    gradient: 'linear-gradient(135deg,#2A4D88,#7C94B8)',
    name: 'Thiago Palhares',
    role: 'Engenheiro Maker / Open-Source',
    talk: 'Painel de Discussão',
  },
  {
    initials: 'MN',
    gradient: 'linear-gradient(135deg,#7C94B8,#04044A)',
    name: 'Dr. Miguel Nicolelis',
    role: 'Neurocientista · Interfaces Cérebro-Máquina',
    talk: 'Palestra de Encerramento',
  },
];

const STATS = [
  { num: '4', label: 'Palestrantes de referência nacional' },
  { num: '8', label: 'Minicursos disponíveis' },
  { num: '1', label: 'Dia inteiro de conteúdo' },
  { num: '∞', label: 'Impacto na comunidade' },
];

export default function Home({
  navigate,
  currentUser,
  inscritoCount,
  scrollTarget,
  onScrolled,
  isInscritoPalestra,
  inscreverPalestra,
  onInscreverEvento,
  meuAssento,
}) {
  useEffect(() => {
    if (!scrollTarget) return;
    const t = setTimeout(() => {
      document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'smooth' });
      onScrolled();
    }, 100);
    return () => clearTimeout(t);
  }, [scrollTarget, onScrolled]);

  return (
    <div className="page active">
      {/* HERO COM PARALLAX */}
      <HeroParallax
        onEntrar={onInscreverEvento}
        onVerMinicursos={() => navigate('page-minicursos')}
      />

      {/* ABOUT */}
      <section className="section">
        <div className="about-grid">
          <div className="about-text">
            <div className="section-label">Sobre o Evento</div>
            <h2 className="section-title">
              Por Dentro do Corpo,
              <br />
              Sem Medo do Implante
            </h2>
            <p className="section-body">
              Muitas pessoas convivem com implantes ortopédicos (pinos, placas e
              próteses) ou enfrentarão essa realidade, mas o desconhecimento
              gera medo. O Íntegra existe para transformar complexidade técnica
              em confiança para a comunidade. Um dia inteiro com médicos,
              engenheiros e especialistas, de graça, aberto a todos.
            </p>
          </div>
          <div className="about-stats">
            {STATS.map((s) => (
              <div className="stat-card" key={s.label}>
                <div className="num">{s.num}</div>
                <div className="label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="section video-section" id="video">
        <div style={{ textAlign: 'center' }}>
          <div className="section-label">Assista</div>
          <h2 className="section-title">Conheça o Evento</h2>
          <p className="section-body" style={{ margin: '0 auto 0' }}>
            Um pouco mais sobre o que vai ter no evento.
          </p>
        </div>
        <div className="video-wrapper">
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '10px' }}>
            <iframe
              src="https://www.youtube.com/embed/a2z8CE2vomY"
              title="Vídeo do evento Íntegra"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      </section>
      {/* MAPA DE ASSENTOS */}
      <section className="section" id="mapa-assentos">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="section-label">Escolha seu lugar</div>
          <h2 className="section-title">Onde Você Vai Sentar</h2>
          <p className="section-body" style={{ margin: '0 auto' }}>
            Como são muitas palestras ao longo do dia, escolha seu assento favorito
            no salão principal.
          </p>
        </div>
        <MapaAssentos currentUser={currentUser} meuAssento={meuAssento} />
      </section>

      {/* PROGRAMAÇÃO */}
      <section className="section schedule-section" id="programacao">
        <div style={{ textAlign: 'center', marginBottom: '.5rem' }}>
          <div className="section-label">Agenda</div>
          <h2 className="section-title">Programação do Dia</h2>
        </div>

        <div className="schedule-grid">
          {SCHEDULE.map((item) => {
            const inscrito = item.palestraId && currentUser
              ? isInscritoPalestra(item.palestraId)
              : false;

            return (
              <div className="schedule-item" key={item.time}>
                <div className="sch-time">{item.time}</div>
                <div>
                  <div className="sch-title">{item.title}</div>
                  {item.desc && <div className="sch-desc">{item.desc}</div>}
                  <span className={`sch-tag ${item.tagClass}`}>{item.tag}</span>

                  {item.palestraId && (
                    <div style={{ marginTop: '.6rem' }}>
                      {!currentUser && (
                        <button
                          className="btn-link-action"
                          onClick={() => navigate('page-auth')}
                        >
                          Entrar para se inscrever
                        </button>
                      )}
                      {currentUser && !inscrito && (
                        <button
                          className="btn-link-action"
                          onClick={() => inscreverPalestra(item.palestraId)}
                        >
                          Inscrever-se nesta palestra
                        </button>
                      )}
                      {currentUser && inscrito && (
                        <span className="sch-tag tag-green">✓ Inscrito(a)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PALESTRANTES */}
      <section className="section" id="palestrantes">
        <div className="section-label">Especialistas</div>
        <h2 className="section-title">Quem Vai Falar</h2>
        <div className="speakers-grid">
          {SPEAKERS.map((sp) => (
            <div className="speaker-card" key={sp.name}>
              <div className="speaker-avatar" style={{ background: sp.gradient }}>
                {sp.initials}
              </div>
              <div className="speaker-name">{sp.name}</div>
              <div className="speaker-role">
                {sp.role}
                <br />
                <span style={{ color: 'var(--calypso)' }}>{sp.talk}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          <strong>Íntegra: Humano por Inteiro</strong> · Congresso de Extensão
          <br />
          Realização: Curso de Engenharia de Software · Unidade Curricular:
          Extensão Curricularizada 2
          <br />
          Prof. Silvio Gobbi
        </p>
      </footer>
    </div>
  );
}