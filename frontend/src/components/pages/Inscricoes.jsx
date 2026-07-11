export default function Inscricoes({
  currentUser,
  navigate,
  openMinicurso,
  minicursos,
  minhasMcInscricoes,
  cancelarInscricaoMinicurso,
}) {
  if (!currentUser) {
    return (
      <div className="page active">
        <div className="inscricoes-page">
          <div className="inscricoes-hero">
            <div className="section-label">Sua Conta</div>
            <h1 className="section-title">Minhas Inscrições</h1>
          </div>
          <div className="inscricoes-body">
            <div className="empty-state">
              <p>Faça login para ver suas inscrições no evento e nos minicursos.</p>
              <button className="btn-primary" onClick={() => navigate('page-auth')}>
                Entrar ou criar conta
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const meusMinicursos = minhasMcInscricoes
    .map((i) => ({
      ...i,
      mc: minicursos.find((m) => m.id === i.minicurso_id),
    }))
    .filter((i) => i.mc);

  return (
    <div className="page active">
      <div className="inscricoes-page">
        <div className="inscricoes-hero">
          <div className="section-label">Sua Conta</div>
          <h1 className="section-title">Minhas Inscrições</h1>
        </div>

        <div className="inscricoes-body">
          <div className="status-card">
            <div className="status-left">
              <span className="status-dot"></span>
              <div>
                <div className="status-title">Conta confirmada</div>
                <div className="status-sub">
                  {currentUser.nome} · {currentUser.email}
                </div>
              </div>
            </div>
            <span className="sch-tag tag-green">Confirmado</span>
          </div>

          <h2 className="mcd-section-label" style={{ marginBottom: '1rem' }}>
            Meus Minicursos
          </h2>

          {meusMinicursos.length === 0 && (
            <div className="empty-state">
              <p>
                Você ainda não se inscreveu em nenhum minicurso. Escolha um e
                garanta sua vaga.
              </p>
              <button className="btn-primary" onClick={() => navigate('page-minicursos')}>
                Ver minicursos disponíveis
              </button>
            </div>
          )}

          {meusMinicursos.map(({ mc, presente }) => (
            <div className="inscricao-item" key={mc.id}>
              <div className="inscricao-info">
                <div className="titulo">{mc.titulo}</div>
                <div className="meta">
                  {mc.horario_inicio?.slice(0, 5)} - {mc.horario_fim?.slice(0, 5)}
                  &nbsp;·&nbsp; {mc.carga_horaria}h
                  {presente && <> &nbsp;·&nbsp; Concluído</>}
                </div>
              </div>
              <div className="inscricao-actions">
                <button className="btn-link-action" onClick={() => openMinicurso(mc.id)}>
                  Ver detalhes
                </button>
                {!presente && (
                  <button
                    className="btn-link-action danger"
                    onClick={() => cancelarInscricaoMinicurso(mc.id)}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}