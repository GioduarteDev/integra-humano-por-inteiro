import { useEffect, useState } from 'react';

function IconUser() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar({ page, navigate, currentUser, onLogout }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (page === 'page-auth') {
        setSolid(false);
        return;
      }
      if (page !== 'page-home') {
        setSolid(true);
        return;
      }
      setSolid(window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [page]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (pageId, sectionId) => {
    setOpen(false);
    navigate(pageId, sectionId);
  };

  const linkActive = (target) => page === target;

  return (
    <>
      <button
        className={`ham-btn${solid ? ' solid' : ''}${open ? ' open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={open}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`nav-center-logo${solid ? ' solid' : ''}`} onClick={() => go('page-home')}>
        Íntegra
      </div>

      {!currentUser && (
        <button
          className={`nav-login-btn${solid ? ' solid' : ''}`}
          onClick={() => go('page-auth')}
          aria-label="Entrar"
        >
          <IconUser />
        </button>
      )}

      {currentUser && (
        <div className={`nav-greeting${solid ? ' solid' : ''}`}>
          Olá, <strong>{currentUser.nome.split(' ')[0]}</strong>
        </div>
      )}

      <div className={`nav-overlay${open ? ' show' : ''}`} onClick={() => setOpen(false)} />

      <nav className={`nav-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="nav-drawer-logo">Íntegra</div>

        <ul className="nav-drawer-links">
          <li>
            <a className={linkActive('page-home') ? 'active' : undefined} onClick={() => go('page-home')}>
              Início
            </a>
          </li>
          <li>
            <a
              className={linkActive('page-home') ? 'active' : undefined}
              onClick={() => go('page-home', 'programacao')}
            >
              Programação
            </a>
          </li>
          <li>
            <a className={linkActive('page-minicursos') ? 'active' : undefined} onClick={() => go('page-minicursos')}>
              Minicursos
            </a>
          </li>
          <li>
            <a
              className={linkActive('page-home') ? 'active' : undefined}
              onClick={() => go('page-home', 'palestrantes')}
            >
              Palestrantes
            </a>
          </li>

          {currentUser && (
            <>
              <li className="nav-drawer-divider" />
              <li>
                <a
                  className={linkActive('page-inscricoes') ? 'active' : undefined}
                  onClick={() => go('page-inscricoes')}
                >
                  Minhas Inscrições
                </a>
              </li>
              <li>
                <a
                  className={linkActive('page-certificados') ? 'active' : undefined}
                  onClick={() => go('page-certificados')}
                >
                  Certificados
                </a>
              </li>
              {currentUser.is_admin && (
                <li>
                  <a
                    className={linkActive('page-admin') ? 'active' : undefined}
                    onClick={() => go('page-admin')}
                  >
                    Administração
                  </a>
                </li>
              )}
            </>
          )}
        </ul>

        {currentUser && (
          <div className="nav-drawer-foot">
            <button
              className="nav-drawer-cta ghost"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              Sair
            </button>
          </div>
        )}
      </nav>

      <style>{`
        .ham-btn {
          position: fixed; top: 22px; left: 22px; z-index: 300;
          width: 46px; height: 46px; border-radius: 50%;
          border: none; background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background .3s ease, box-shadow .3s ease;
        }
        .ham-btn span {
          position: absolute; width: 20px; height: 2px; border-radius: 2px;
          background: #FFFFFF; transition: background .3s ease, transform .3s ease, opacity .3s ease;
        }
        .ham-btn span:nth-child(1) { transform: translateY(-6px); }
        .ham-btn span:nth-child(3) { transform: translateY(6px); }
        .ham-btn.solid { background: rgba(4,4,74,0.08); }
        .ham-btn.solid span { background: var(--navy-deep); }
        .ham-btn.open span:nth-child(1) { transform: translateY(0) rotate(45deg); }
        .ham-btn.open span:nth-child(2) { opacity: 0; }
        .ham-btn.open span:nth-child(3) { transform: translateY(0) rotate(-45deg); }
        .ham-btn.open span { background: #FFFFFF !important; }

        .nav-center-logo {
          position: fixed; top: 19px; left: 50%; transform: translateX(-50%); z-index: 300;
          font-family: var(--font-display-alt); font-weight: 700; font-size: 1.2rem;
          letter-spacing: .12em; text-transform: uppercase; color: #FFFFFF;
          cursor: pointer; transition: color .3s ease; white-space: nowrap;
        }
        .nav-center-logo.solid { color: var(--navy-deep); }

        .nav-login-btn {
          position: fixed; top: 20px; right: 22px; z-index: 300;
          width: 42px; height: 42px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.55); background: transparent;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: #FFFFFF; transition: border-color .3s ease, color .3s ease;
        }
        .nav-login-btn.solid { border-color: rgba(4,4,74,0.35); color: var(--navy-deep); }

        .nav-greeting {
          position: fixed; top: 27px; right: 22px; z-index: 300;
          font-family: var(--font-body); font-size: .9rem; color: #FFFFFF;
          transition: color .3s ease;
        }
        .nav-greeting strong { font-weight: 700; }
        .nav-greeting.solid { color: var(--navy-deep); }

        .nav-overlay {
          position: fixed; inset: 0; z-index: 250;
          background: rgba(4,4,20,0.6);
          opacity: 0; pointer-events: none; transition: opacity .35s ease;
        }
        .nav-overlay.show { opacity: 1; pointer-events: auto; }

        .nav-drawer {
          position: fixed; top: 0; left: 0; height: 100vh; z-index: 290;
          width: min(320px, 86vw);
          background: var(--navy-deep);
          transform: translateX(-100%);
          transition: transform .38s cubic-bezier(.4,0,.2,1);
          padding: 2.2rem 2rem;
          display: flex; flex-direction: column;
          box-shadow: 20px 0 60px rgba(0,0,0,0.3);
          overflow-y: auto;
        }
        .nav-drawer.open { transform: translateX(0); }

        .nav-drawer-logo {
          font-family: var(--font-display-alt); font-weight: 700; font-size: 1.3rem;
          letter-spacing: .1em; text-transform: uppercase; color: #fff;
          margin-top: 2.8rem; margin-bottom: 2.5rem;
        }

        .nav-drawer-links { list-style: none; display: flex; flex-direction: column; gap: 2.2rem; flex: 1; }
        .nav-drawer-links a {
          font-family: var(--font-display); font-size: 1.3rem; font-weight: 700;
          color: rgba(255,255,255,0.82); text-decoration: none; cursor: pointer;
          transition: color .2s ease, padding-left .2s ease, border-color .2s ease;
          display: inline-block;
          padding-bottom: .35rem;
          border-bottom: 1px solid rgba(201,162,39,0.35);
        }
        .nav-drawer-links a:hover, .nav-drawer-links a.active {
          color: var(--blue-soft);
          padding-left: .3rem;
          border-bottom-color: var(--gold);
        }
        .nav-drawer-divider { height: 1px; background: rgba(255,255,255,0.14); margin: .3rem 0; }

        .nav-drawer-foot { display: flex; flex-direction: column; gap: .8rem; }
        .nav-drawer-cta {
          background: var(--blue-action); color: var(--navy-deep); border: none;
          border-radius: 99px; padding: .85rem 1.4rem; font-family: var(--font-body); font-size: .92rem;
          font-weight: 700; cursor: pointer; width: 100%;
        }
        .nav-drawer-cta.ghost { background: transparent; border: 1.5px solid rgba(255,255,255,0.3); color: #fff; }
      `}</style>
    </>
  );
}