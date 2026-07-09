import { useCallback, useEffect, useState } from 'react';
import BotaoTopo from './components/BotaoTopo.jsx';
import Navbar from './components/Navbar.jsx';
import Toast from './components/Toast.jsx';
import Home from './components/pages/Home.jsx';
import Admin from './components/pages/Admin.jsx';
import Auth from './components/pages/Auth.jsx';
import Minicursos from './components/pages/Minicursos.jsx';
import MinicursoDetail from './components/pages/MinicursoDetail.jsx';
import Inscricoes from './components/pages/Inscricoes.jsx';
import Certificados from './components/pages/Certificados.jsx';
import CertificadoDetail from './components/pages/CertificadoDetail.jsx';
import {
  listarMinicursos,
  minhasInscricoes,
  inscreverMinicurso as inscreverMinicursoApi,
  concluirMinicurso as concluirMinicursoApi,
  cancelarInscricaoMinicurso as cancelarInscricaoMinicursoApi,
  inscreverPalestra as inscreverPalestraApi,
  inscreverEvento as inscreverEventoApi,
  logout as logoutApi,
  meuPerfil,
} from './services/api.js';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [minicursos, setMinicursos] = useState([]);
  const [minhasMcInscricoes, setMinhasMcInscricoes] = useState([]); 
  const [minhaInscricaoEvento, setMinhaInscricaoEvento] = useState(null);
  const [minhasPalestraInscricoes, setMinhasPalestraInscricoes] = useState([]);

  const [page, setPage] = useState('page-home');
  const [scrollTarget, setScrollTarget] = useState(null);
  const [currentMCId, setCurrentMCId] = useState(null);

  const [toast, setToast] = useState({ msg: '', visible: false });

  const showToast = useCallback((msg) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  }, []);

  const navigate = useCallback((pageId, sectionId = null) => {
    setPage(pageId);
    setScrollTarget(pageId === 'page-home' ? sectionId : null);
    if (!sectionId) window.scrollTo({ top: 0 });
  }, []);

  // Recupera o login automaticamente se já existir um token salvo
  useEffect(() => {
    const token = localStorage.getItem('integra_token');
    if (token) {
      meuPerfil()
        .then(setCurrentUser)
        .catch(() => localStorage.removeItem('integra_token'));
    }
  }, []);

  useEffect(() => {
    listarMinicursos()
      .then(setMinicursos)
      .catch(() => showToast('Não foi possível carregar os minicursos.'));
  }, [showToast]);
  const recarregarMinicursos = useCallback(() => {
    listarMinicursos()
      .then(setMinicursos)
      .catch(() => showToast('Não foi possível recarregar os minicursos.'));
  }, [showToast]);

  const carregarMinhasInscricoes = useCallback(() => {
    minhasInscricoes()
      .then((data) => {
        setMinhasMcInscricoes(data.minicursos);
        setMinhasPalestraInscricoes(data.palestras);
        setMinhaInscricaoEvento(data.eventos[0] || null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (currentUser) {
      carregarMinhasInscricoes();
    } else {
      setMinhasMcInscricoes([]);
      setMinhasPalestraInscricoes([]);
    }
  }, [currentUser, carregarMinhasInscricoes]);

  const login = useCallback((user) => setCurrentUser(user), []);

  const logout = useCallback(() => {
    logoutApi();
    setCurrentUser(null);
    setPage('page-home');
    window.scrollTo({ top: 0 });
    showToast('Você saiu da conta.');
  }, [showToast]);

  const isInscritoMC = useCallback(
    (mcId) => minhasMcInscricoes.some((i) => i.minicurso_id === mcId),
    [minhasMcInscricoes]
  );

  const isConcluidoMC = useCallback(
    (mcId) => minhasMcInscricoes.some((i) => i.minicurso_id === mcId && i.presente),
    [minhasMcInscricoes]
  );

  const inscreverMinicurso = useCallback(
    async (mcId) => {
      try {
        await inscreverMinicursoApi(mcId);
        const mc = minicursos.find((m) => m.id === mcId);
        showToast(`Inscrição confirmada: ${mc?.titulo ?? ''}!`);
        carregarMinhasInscricoes();
      } catch (err) {
        showToast(err.message || 'Não foi possível concluir a inscrição.');
      }
    },
    [minicursos, showToast, carregarMinhasInscricoes]
  );

  const concluirMinicurso = useCallback(
    async (mcId) => {
      try {
        await concluirMinicursoApi(mcId);
        showToast('Minicurso concluído! Certificado disponível.');
        carregarMinhasInscricoes();
      } catch (err) {
        showToast(err.message || 'Não foi possível concluir o minicurso.');
      }
    },
    [showToast, carregarMinhasInscricoes]
  );

  const cancelarInscricaoMinicurso = useCallback(
    async (mcId) => {
      try {
        await cancelarInscricaoMinicursoApi(mcId);
        const mc = minicursos.find((m) => m.id === mcId);
        showToast(`Inscrição em "${mc?.titulo ?? ''}" cancelada.`);
        carregarMinhasInscricoes();
      } catch (err) {
        showToast(err.message || 'Não foi possível cancelar a inscrição.');
      }
    },
    [minicursos, showToast, carregarMinhasInscricoes]
  );

  const isInscritoPalestra = useCallback(
    (palestraId) => minhasPalestraInscricoes.some((p) => p.palestra_id === palestraId),
    [minhasPalestraInscricoes]
  );

  const inscreverPalestra = useCallback(
    async (palestraId) => {
      try {
        await inscreverPalestraApi(palestraId);
        showToast('Inscrição na palestra confirmada!');
        carregarMinhasInscricoes();
      } catch (err) {
        showToast(err.message || 'Não foi possível confirmar a inscrição.');
      }
    },
    [showToast, carregarMinhasInscricoes]
  );

  const inscreverEvento = useCallback(async () => {
    if (!currentUser) {
      navigate('page-auth');
      return;
    }
    try {
      await inscreverEventoApi(1);
      showToast('Inscrição no evento confirmada!');
    } catch (err) {
      showToast(err.message || 'Você já está inscrita no evento.');
    }
  }, [currentUser, navigate, showToast]);

  const openMinicurso = useCallback(
    (mcId) => {
      setCurrentMCId(mcId);
      navigate('page-minicurso-detail');
    },
    [navigate]
  );

  const openCertificado = useCallback(
    (mcId) => {
      setCurrentMCId(mcId);
      navigate('page-certificado-detail');
    },
    [navigate]
  );

  const currentMC = minicursos.find((m) => m.id === currentMCId) ?? null;

  return (
    <>
      <Navbar
        page={page}
        navigate={navigate}
        currentUser={currentUser}
        onLogout={logout}
      />

     {page === 'page-home' && (
        <Home
          navigate={navigate}
          currentUser={currentUser}
          inscritoCount={minhasMcInscricoes.length}
          scrollTarget={scrollTarget}
          onScrolled={() => setScrollTarget(null)}
          isInscritoPalestra={isInscritoPalestra}
          inscreverPalestra={inscreverPalestra}
          onInscreverEvento={inscreverEvento}
          meuAssento={minhaInscricaoEvento?.assento}
        />
      )}

      {page === 'page-auth' && (
        <Auth login={login} navigate={navigate} />
      )}

      {page === 'page-minicursos' && (
        <Minicursos
          minicursos={minicursos}
          currentUser={currentUser}
          openMinicurso={openMinicurso}
          isInscritoMC={isInscritoMC}
        />
      )}

      {page === 'page-minicurso-detail' && currentMC && (
        <MinicursoDetail
          mc={currentMC}
          currentUser={currentUser}
          navigate={navigate}
          isInscritoMC={isInscritoMC}
          isConcluidoMC={isConcluidoMC}
          inscreverMinicurso={inscreverMinicurso}
          concluirMinicurso={concluirMinicurso}
        />
      )}

      {page === 'page-inscricoes' && (
        <Inscricoes
          currentUser={currentUser}
          navigate={navigate}
          openMinicurso={openMinicurso}
          minicursos={minicursos}
          minhasMcInscricoes={minhasMcInscricoes}
          cancelarInscricaoMinicurso={cancelarInscricaoMinicurso}
        />
      )}

      {page === 'page-certificados' && (
        <Certificados
          currentUser={currentUser}
          navigate={navigate}
          minicursos={minicursos}
          minhasMcInscricoes={minhasMcInscricoes}
          openCertificado={openCertificado}
        />
      )}

      {page === 'page-certificado-detail' && currentMC && currentUser && (
        <CertificadoDetail mc={currentMC} currentUser={currentUser} navigate={navigate} />
      )}
      {page === 'page-admin' && (
        <Admin
          currentUser={currentUser}
          minicursos={minicursos}
          recarregarMinicursos={recarregarMinicursos}
          navigate={navigate}
        />
      )}

      <Toast msg={toast.msg} visible={toast.visible} />
      <Toast msg={toast.msg} visible={toast.visible} />
      <BotaoTopo />
    </>
  );
}