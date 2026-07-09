import { useEffect, useState } from 'react';

export default function BotaoTopo() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisivel(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visivel) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '1.5rem',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'var(--navy-deep)',
        color: '#FFFFFF',
        border: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
        boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
        zIndex: 500,
      }}
      aria-label="Voltar ao topo"
    >
      ↑
    </button>
  );
}