import { useEffect, useState } from 'react';
import Dashboard from './Dashboard.jsx';
import {
  listarParticipantes,
  criarMinicursoAdmin,
  editarMinicursoAdmin,
  apagarMinicursoAdmin,
  apagarParticipanteAdmin,
  cadastrarParticipanteAdmin,
  listarInscritosMinicurso,
  removerDeMinicursoAdmin,
  inscreverParticipanteAdmin,
} from '../../services/api.js';

const MINICURSO_VAZIO = {
  titulo: '',
  descricao: '',
  carga_horaria: 2,
  horario_inicio: '14:00',
  horario_fim: '15:30',
  video_url: '',
};

const PARTICIPANTE_VAZIO = { nome: '', email: '', senha: '', telefone: '', cpf: '' };

export default function Admin({ currentUser, minicursos, recarregarMinicursos, navigate }) {
  const [aba, setAba] = useState('minicursos');
  const [participantes, setParticipantes] = useState([]);
  const [carregandoParticipantes, setCarregandoParticipantes] = useState(false);

  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(MINICURSO_VAZIO);

  const [novoParticipante, setNovoParticipante] = useState(null);
  const [verInscritosDe, setVerInscritosDe] = useState(null);
  const [inscritosDoMinicurso, setInscritosDoMinicurso] = useState([]);
  const [carregandoInscritos, setCarregandoInscritos] = useState(false); 
  const [contatoInscrever, setContatoInscrever] = useState({ email: '', cpf: '' });
  const [formParticipante, setFormParticipante] = useState(PARTICIPANTE_VAZIO);

  const [erro, setErro] = useState('');

  const carregarParticipantes = () => {
    setCarregandoParticipantes(true);
    listarParticipantes()
      .then(setParticipantes)
      .catch(() => setErro('Não foi possível carregar os participantes.'))
      .finally(() => setCarregandoParticipantes(false));
  };

  useEffect(() => {
    if (!currentUser?.is_admin) return;
    if (aba === 'participantes') carregarParticipantes();
  }, [aba, currentUser]);

  if (!currentUser) {
    return (
      <div className="page active">
        <div className="empty-state" style={{ margin: '8rem auto', maxWidth: 480 }}>
          <p>Faça login para acessar esta página.</p>
          <button className="btn-primary" onClick={() => navigate('page-auth')}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser.is_admin) {
    return (
      <div className="page active">
        <div className="empty-state" style={{ margin: '8rem auto', maxWidth: 480 }}>
          <p>Acesso restrito à administração do evento.</p>
        </div>
      </div>
    );
  }

  // ---------- Minicursos ----------
  const abrirNovo = () => {
    setForm(MINICURSO_VAZIO);
    setEditando('novo');
    setErro('');
  };

  const abrirEdicao = (mc) => {
    setForm({
      titulo: mc.titulo,
      descricao: mc.descricao || '',
      carga_horaria: mc.carga_horaria,
      horario_inicio: mc.horario_inicio?.slice(0, 5) || '14:00',
      horario_fim: mc.horario_fim?.slice(0, 5) || '15:30',
      video_url: mc.video_url || '',
    });
    setEditando(mc.id);
    setErro('');
  };

  const salvar = async () => {
    setErro('');
    try {
      if (editando === 'novo') {
        await criarMinicursoAdmin(form);
      } else {
        await editarMinicursoAdmin(editando, form);
      }
      setEditando(null);
      recarregarMinicursos();
    } catch (err) {
      setErro(err.message || 'Não foi possível salvar.');
    }
  };

  const apagar = async (mc) => {
    if (!window.confirm(`Apagar o minicurso "${mc.titulo}"? Essa ação não pode ser desfeita.`)) return;
    try {
      await apagarMinicursoAdmin(mc.id);
      recarregarMinicursos();
    } catch (err) {
      setErro(err.message || 'Não foi possível apagar.');
    }
  };

  const abrirInscritos = (mc) => {
    if (verInscritosDe === mc.id) {
      setVerInscritosDe(null);
      return;
    }
    setVerInscritosDe(mc.id);
    setCarregandoInscritos(true);
    listarInscritosMinicurso(mc.id)
      .then(setInscritosDoMinicurso)
      .catch(() => setErro('Não foi possível carregar os inscritos.'))
      .finally(() => setCarregandoInscritos(false));
  };

  const removerInscrito = async (usuarioId) => {
    if (!window.confirm('Remover essa pessoa deste minicurso?')) return;
    try {
      await removerDeMinicursoAdmin(verInscritosDe, usuarioId);
      setInscritosDoMinicurso((prev) => prev.filter((i) => i.usuario_id !== usuarioId));
    } catch (err) {
      setErro(err.message || 'Não foi possível remover.');
    }
  };
  const inscreverPorContato = async () => {
    setErro('');
    try {
      await inscreverParticipanteAdmin(verInscritosDe, contatoInscrever);
      setContatoInscrever({ email: '', cpf: '' });
      abrirInscritos({ id: verInscritosDe });
    } catch (err) {
      setErro(err.message || 'Não foi possível inscrever.');
    }
  };

  // ---------- Participantes ----------
  const salvarParticipante = async () => {
    setErro('');
    try {
      await cadastrarParticipanteAdmin(formParticipante);
      setNovoParticipante(null);
      setFormParticipante(PARTICIPANTE_VAZIO);
      carregarParticipantes();
    } catch (err) {
      setErro(err.message || 'Não foi possível cadastrar.');
    }
  };

  const apagarParticipante = async (p) => {
    if (!window.confirm(`Remover a conta de "${p.nome}" definitivamente? Essa ação não pode ser desfeita.`)) return;
    try {
      await apagarParticipanteAdmin(p.id);
      carregarParticipantes();
    } catch (err) {
      setErro(err.message || 'Não foi possível remover.');
    }
  };

  return (
    <div className="page active">
      <div className="inscricoes-page">
        <div className="inscricoes-header">
          <div className="section-label">Administração</div>
          <h1 className="section-title">Painel do Evento</h1>
        </div>

        <div className="auth-tabs" style={{ maxWidth: 480, marginBottom: '2rem' }}>
          <button
            className={`auth-tab${aba === 'minicursos' ? ' active' : ''}`}
            onClick={() => setAba('minicursos')}
          >
            Minicursos
          </button>
          <button
            className={`auth-tab${aba === 'participantes' ? ' active' : ''}`}
            onClick={() => setAba('participantes')}
          >
            Participantes
          </button>
          <button
            className={`auth-tab${aba === 'dashboard' ? ' active' : ''}`}
            onClick={() => setAba('dashboard')}
          >
            Dashboard
          </button>
        </div>

        {erro && <div className="form-error" style={{ display: 'block', marginBottom: '1rem' }}>{erro}</div>}

        {aba === 'minicursos' && (
          <>
            <button className="btn-primary" style={{ marginBottom: '1.5rem' }} onClick={abrirNovo}>
              + Novo minicurso
            </button>

            {editando && (
              <div className="mcd-form-card" style={{ marginBottom: '2rem', maxWidth: 480 }}>
                <h3 className="mcd-form-title">
                  {editando === 'novo' ? 'Novo minicurso' : 'Editar minicurso'}
                </h3>

                <div className="field">
                  <label>Título</label>
                  <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
                </div>
                <div className="field">
                  <label>Descrição</label>
                  <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Carga horária (h)</label>
                    <input
                      type="number"
                      value={form.carga_horaria}
                      onChange={(e) => setForm({ ...form, carga_horaria: Number(e.target.value) })}
                    />
                  </div>
                  <div className="field">
                    <label>Vídeo (URL)</label>
                    <input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Início</label>
                    <input
                      type="time"
                      value={form.horario_inicio}
                      onChange={(e) => setForm({ ...form, horario_inicio: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Fim</label>
                    <input
                      type="time"
                      value={form.horario_fim}
                      onChange={(e) => setForm({ ...form, horario_fim: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '.6rem', marginTop: '.6rem' }}>
                  <button className="btn-submit" onClick={salvar}>Salvar</button>
                  <button className="btn-cancel" onClick={() => setEditando(null)}>Cancelar</button>
                </div>
              </div>
            )}

            {minicursos.map((mc) => (
              <div key={mc.id} style={{ marginBottom: '1rem' }}>
                <div className="inscricao-item">
                  <div className="inscricao-info">
                    <div className="titulo">{mc.titulo}</div>
                    <div className="meta">{mc.carga_horaria}h · {mc.horario_inicio?.slice(0, 5)} - {mc.horario_fim?.slice(0, 5)}</div>
                  </div>
                  <div className="inscricao-actions">
                    <button className="btn-link-action" onClick={() => abrirInscritos(mc)}>
                      {verInscritosDe === mc.id ? 'Fechar' : 'Ver inscritos'}
                    </button>
                    <button className="btn-link-action" onClick={() => abrirEdicao(mc)}>Editar</button>
                    <button className="btn-link-action danger" onClick={() => apagar(mc)}>Apagar</button>
                  </div>
                </div>

               {verInscritosDe === mc.id && (
                  <div style={{ background: 'var(--surface-soft)', borderRadius: '12px', padding: '1rem', marginTop: '.5rem' }}>
                    <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <input
                        placeholder="Email do participante"
                        value={contatoInscrever.email}
                        onChange={(e) => setContatoInscrever({ ...contatoInscrever, email: e.target.value })}
                        style={{ flex: 1, minWidth: 160, padding: '.5rem .8rem', borderRadius: '8px', border: '1.5px solid var(--line)' }}
                      />
                      <input
                        placeholder="ou CPF do participante"
                        value={contatoInscrever.cpf}
                        onChange={(e) => setContatoInscrever({ ...contatoInscrever, cpf: e.target.value })}
                        style={{ flex: 1, minWidth: 160, padding: '.5rem .8rem', borderRadius: '8px', border: '1.5px solid var(--line)' }}
                      />
                      <button className="btn-submit" style={{ width: 'auto', marginTop: 0 }} onClick={inscreverPorContato}>
                        Inscrever
                      </button>
                    </div>

                    {carregandoInscritos && <p>Carregando...</p>}
                    {!carregandoInscritos && inscritosDoMinicurso.length === 0 && (
                      <p style={{ fontSize: '.85rem', color: 'var(--muted)' }}>Ninguém inscrito ainda.</p>
                    )}
                    {!carregandoInscritos && inscritosDoMinicurso.map((i) => (
                      <div
                        key={i.inscricao_id}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.5rem 0', borderBottom: '1px solid var(--line-soft)' }}
                      >
                        <span style={{ fontSize: '.88rem' }}>
                          {i.nome} <span style={{ color: 'var(--muted)' }}>({i.email})</span>
                          {i.presente && <span className="sch-tag tag-green" style={{ marginLeft: '.5rem' }}>presente</span>}
                        </span>
                        <button className="btn-link-action danger" onClick={() => removerInscrito(i.usuario_id)}>
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )} 

        {aba === 'participantes' && (
          <>
            <button
              className="btn-primary"
              style={{ marginBottom: '1.5rem' }}
              onClick={() => { setNovoParticipante(true); setFormParticipante(PARTICIPANTE_VAZIO); setErro(''); }}
            >
              + Cadastrar participante
            </button>

            {novoParticipante && (
              <div className="mcd-form-card" style={{ marginBottom: '2rem', maxWidth: 480 }}>
                <h3 className="mcd-form-title">Novo participante</h3>

                <div className="field">
                  <label>Nome completo</label>
                  <input
                    value={formParticipante.nome}
                    onChange={(e) => setFormParticipante({ ...formParticipante, nome: e.target.value })}
                  />
                  {aba === 'dashboard' && <Dashboard currentUser={currentUser} />}
                </div>
                <div className="field">
                  <label>Email</label>
                  <input
                    value={formParticipante.email}
                    onChange={(e) => setFormParticipante({ ...formParticipante, email: e.target.value })}
                  />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>CPF</label>
                    <input
                      value={formParticipante.cpf}
                      onChange={(e) => setFormParticipante({ ...formParticipante, cpf: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Telefone</label>
                    <input
                      value={formParticipante.telefone}
                      onChange={(e) => setFormParticipante({ ...formParticipante, telefone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Senha provisória</label>
                  <input
                    type="text"
                    value={formParticipante.senha}
                    onChange={(e) => setFormParticipante({ ...formParticipante, senha: e.target.value })}
                    placeholder="ex: mudar123"
                  />
                </div>

                <div style={{ display: 'flex', gap: '.6rem', marginTop: '.6rem' }}>
                  <button className="btn-submit" onClick={salvarParticipante}>Cadastrar</button>
                  <button className="btn-cancel" onClick={() => setNovoParticipante(null)}>Cancelar</button>
                </div>
              </div>
            )}

            {carregandoParticipantes && <p>Carregando...</p>}
            {!carregandoParticipantes && participantes.map((p) => (
              <div className="inscricao-item" key={p.id}>
                <div className="inscricao-info">
                  <div className="titulo">
                    {p.nome} {p.is_admin && <span className="sch-tag tag-blue">admin</span>}
                  </div>
                  <div className="meta">
                    {p.email} · CPF: {p.cpf || '—'} · {p.qtd_minicursos} minicurso(s) · {p.qtd_palestras} palestra(s)
                  </div>
                </div>
                {!p.is_admin && (
                  <div className="inscricao-actions">
                    <button className="btn-link-action danger" onClick={() => apagarParticipante(p)}>
                      Remover conta
                    </button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}