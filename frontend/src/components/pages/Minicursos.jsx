export default function Minicursos({
  minicursos,
  currentUser,
  openMinicurso,
  isInscritoMC,
}) {
  return (
    <div className="page active">
      <div className="minicursos-page">
        <div className="minicursos-hero">
          <div className="section-label">Minicursos</div>
          <h1 className="section-title">Escolha sua Trilha</h1>
          <p className="section-body">
            Assista ao vídeo de cada minicurso e conclua pra liberar seu certificado.
          </p>
          <div className="course-count-badge">
            &nbsp;·&nbsp; {minicursos.length} opções disponíveis
          </div>
        </div>

        <div className="minicursos-body">
          <div className="notice-box">
            {currentUser ? (
              <>
                <strong>✓ Olá, {currentUser.nome.split(' ')[0]}!</strong> Os
                minicursos são gratuitos. Escolha um e garanta sua vaga com um
                clique.
              </>
            ) : (
              <>
                <strong>Faça login para se inscrever.</strong> A inscrição usa
                a sua conta — escolha um minicurso e entre ou crie sua conta
                para confirmar a vaga.
              </>
            )}
          </div>
          <div className="minicursos-grid">
            {minicursos.map((mc) => {
              const inscrito = currentUser ? isInscritoMC(mc.id) : false;

              let btnLabel = 'Ver e inscrever-se';
              let btnClass = '';

              if (inscrito) {
                btnLabel = '✓ Inscrito(a) · ver';
                btnClass = 'inscrito';
              }

              return (
                <div className="minicurso-card" key={mc.id}>
                  <div
                    className="minicurso-header"
                    onClick={() => openMinicurso(mc.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="minicurso-meta">
                      <div className="minicurso-title">{mc.titulo}</div>
                    </div>
                  </div>
                  <div className="minicurso-body">
                    <p className="minicurso-desc">{mc.descricao}</p>
                    <div className="minicurso-info">
                      <div className="info-chip">
                        <span>🕐</span> {mc.horario_inicio?.slice(0, 5)} - {mc.horario_fim?.slice(0, 5)}
                      </div>
                      <div className="info-chip">
                        <span></span> {mc.carga_horaria}h
                      </div>
                    </div>
                    <div className="minicurso-footer">
                      <button
                        className={`btn-inscrever ${btnClass}`}
                        onClick={() => openMinicurso(mc.id)}
                      >
                        {btnLabel}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}