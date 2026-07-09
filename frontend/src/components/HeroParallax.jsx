import { useEffect, useRef, useState } from 'react';
import videoEvento from '../Íntegra__Humano_por_Inteiro1.mp4';
import { contarInscritos } from '../services/api.js';

export default function HeroParallax({ onEntrar, onVerMinicursos }) {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [totalInscritos, setTotalInscritos] = useState(null);
  const [contadorExibido, setContadorExibido] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const p = Math.min(1, Math.max(0, scrolled / total));
      setProgress(p);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    contarInscritos(1)
      .then((data) => setTotalInscritos(data.total))
      .catch(() => setTotalInscritos(0));
  }, []);

  useEffect(() => {
    if (totalInscritos === null) return;
    let atual = 0;
    const passo = Math.max(1, Math.ceil(totalInscritos / 25));
    const iv = setInterval(() => {
      atual += passo;
      if (atual >= totalInscritos) {
        atual = totalInscritos;
        clearInterval(iv);
      }
      setContadorExibido(atual);
    }, 25);
    return () => clearInterval(iv);
  }, [totalInscritos]);

  const faixa = (de, ate, valorInicial, valorFinal) => {
    if (progress <= de) return valorInicial;
    if (progress >= ate) return valorFinal;
    const t = (progress - de) / (ate - de);
    return valorInicial + (valorFinal - valorInicial) * t;
  };

  // Intro fica visível por mais tempo antes de sumir
  const introOpacity = 1 - faixa(0.4, 0.58, 0, 1);
  const introTranslate = -faixa(0.4, 0.58, 0, 40);

  // Vídeo só aparece bem mais tarde na rolagem, e de forma mais suave
  const videoOpacity = faixa(0.62, 0.85, 0, 1);
  const videoScale = faixa(0.62, 0.98, 0.88, 1);

  const glowX = 50 + faixa(0, 1, -8, 8);
  const glowY = 20 + faixa(0, 1, 0, 30);

  const destaque = '#B1BBC8';
  const dourado = '#C9A227';

  return (
    <section ref={sectionRef} style={{ position: 'relative', height: '340vh' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background:
            'linear-gradient(180deg, #000008 0%, #000014 18%, #04044A 40%, #0C2264 56%, #2A4D88 72%, #7C94B8 87%, #B1BBC8 96%, var(--bg) 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 60% 45% at ${glowX}% ${glowY}%, rgba(201,162,39,0.10), transparent 60%)`,
            pointerEvents: 'none',
          }}
        />

        <svg
          width="70"
          height="16"
          style={{ position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)', opacity: 0.6, zIndex: 2 }}
          aria-hidden="true"
        >
          <line x1="0" y1="8" x2="24" y2="8" stroke={dourado} strokeWidth="1" />
          <circle cx="28" cy="8" r="2.5" fill="none" stroke={dourado} strokeWidth="1" />
          <line x1="32" y1="8" x2="42" y2="8" stroke={dourado} strokeWidth="1" />
          <circle cx="46" cy="8" r="2.5" fill="none" stroke={dourado} strokeWidth="1" />
          <line x1="50" y1="8" x2="70" y2="8" stroke={dourado} strokeWidth="1" />
        </svg>

        <div
          style={{
            position: 'absolute',
            textAlign: 'center',
            zIndex: 2,
            padding: '0 5%',
            opacity: introOpacity,
            transform: `translateY(${introTranslate}px)`,
            pointerEvents: introOpacity > 0.5 ? 'auto' : 'none',
          }}
        >
          <div
            className="integra-fade"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.3rem',
              fontWeight: 700,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              marginBottom: '.5rem',
              animationDelay: '.1s',
            }}
          >
            Íntegra
            <div
              style={{
                width: '36px',
                height: '2px',
                background: dourado,
                margin: '.5rem auto 0',
                borderRadius: '2px',
              }}
            />
          </div>

          <h1
            className="integra-fade"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 700,
              fontSize: 'clamp(3.2rem, 8vw, 5.8rem)',
              lineHeight: 1.05,
              color: '#FFFFFF',
              margin: 0,
              animationDelay: '.3s',
              display: 'inline-block',
              paddingBottom: '.4rem',
              borderBottom: `1px solid ${dourado}33`,
            }}
          >
            Humano
            <br />
            por Inteiro
          </h1>

          <p
            className="integra-fade"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.05rem',
              color: '#E9EEF9',
              marginTop: '1.6rem',
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
              animationDelay: '.5s',
            }}
          >
            Tecnologia e precisão para transformar a sua qualidade de vida
          </p>

          <div
            className="integra-fade"
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              marginTop: '2rem',
              flexWrap: 'wrap',
              animationDelay: '.7s',
            }}
          >
            <button
              onClick={onEntrar}
              style={{
                fontFamily: 'Inter, sans-serif',
                background: '#FFFFFF',
                color: '#04044A',
                border: 'none',
                padding: '.95rem 2.3rem',
                borderRadius: '99px',
                fontSize: '.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform .2s ease, box-shadow .2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Inscrever-se no evento
            </button>
            <button
              onClick={onVerMinicursos}
              style={{
                fontFamily: 'Inter, sans-serif',
                background: '#FFFFFF',
                color: '#04044A',
                border: 'none',
                padding: '.95rem 2.3rem',
                borderRadius: '99px',
                fontSize: '.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform .2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Ver minicursos
            </button>
          </div>

          <div className="integra-fade" style={{ marginTop: '2.2rem', fontSize: '.72rem', color: '#E9EEF9', opacity: 0.7, animationDelay: '.9s' }}>
            ↓ role para assistir
          </div>
        </div>

        <div style={{ position: 'absolute', right: '4%', bottom: '8%', width: '110px', height: '110px', zIndex: 2, animation: 'integraFloat 4s ease-in-out infinite' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${dourado}B3`, animation: 'integraPulse 2.4s ease-out infinite' }} />
          <div
            style={{
              position: 'absolute',
              inset: '6px',
              borderRadius: '50%',
              background: 'var(--navy-deep)',
              border: `2px solid ${dourado}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF' }}>
              {contadorExibido}
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '.56rem', color: dourado, textTransform: 'uppercase', letterSpacing: '.04em', lineHeight: 1.3, padding: '0 .3rem' }}>
              inscritos
            </span>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            width: 'min(72vw, 780px)',
            zIndex: 3,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 30px 70px rgba(14,20,40,0.35)',
            border: `1px solid ${dourado}40`,
            opacity: videoOpacity,
            transform: `scale(${videoScale})`,
            pointerEvents: videoOpacity > 0.5 ? 'auto' : 'none',
          }}
        >
          <video
            src={videoEvento}
            controls
            style={{ width: '100%', display: 'block', aspectRatio: '16/9', background: '#000' }}
          />
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap');
        .integra-fade {
          opacity: 0;
          animation: integraFadeUp .6s ease forwards;
        }
        @keyframes integraFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes integraFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes integraPulse {
          0% { transform: scale(1); opacity: .7; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </section>
  );
}