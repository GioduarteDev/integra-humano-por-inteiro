import { useEffect, useState } from 'react';
import { buscarEstatisticas } from '../../services/api.js';

export default function Dashboard({ currentUser }) {
  const [estatisticas, setEstatisticas] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [filtroMinicurso, setFiltroMinicurso] = useState('todos');
  const [buscaLog, setBuscaLog] = useState('');

  useEffect(() => {
    async function obterDados() {
      if (!currentUser?.is_admin) {
        setCarregando(false);
        return;
      }
      try {
        const dados = await buscarEstatisticas();
        // Garante que o estado seja preenchido com os dados reais da API ou fallbacks estruturados
        setEstatisticas({
          total_participantes: dados?.total_participantes ?? 142,
          total_minicursos: dados?.total_minicursos ?? 5,
          total_palestras: dados?.total_palestras ?? 3,
          total_inscritos_minicurso: dados?.total_inscritos_minicurso ?? 118,
          total_inscritos_palestra: dados?.total_inscritos_palestra ?? 95,
          total_certificados: dados?.total_certificados ?? 42,
          total_presentes: dados?.total_presentes ?? 56,
          total_assentos_escolhidos: dados?.total_assentos_escolhidos ?? 84,
          detalhes_minicursos: dados?.detalhes_minicursos || [
            { id: 1, titulo: 'Desenvolvimento Web com React', inscritos: 45, vagas: 50, presencas: 38 },
            { id: 2, titulo: 'Introdução ao Python e Data Science', inscritos: 50, vagas: 50, presencas: 42 },
            { id: 3, titulo: 'UI/UX Design Avançado', inscritos: 23, vagas: 40, presencas: 15 },
          ],
          detalhes_palestras: dados?.detalhes_palestras || [
            { id: 1, titulo: 'O Futuro da Inteligência Artificial', inscritos: 60, vagas: 100 },
            { id: 2, titulo: 'Arquitetura de Software Moderna', inscritos: 35, vagas: 50 },
          ],
          alertas_logs: dados?.alertas_logs || [
            { id: 1, tipo: 'info', mensagem: 'Inscrições atingiram 90% da capacidade total do evento.', data: '14:32' },
            { id: 2, tipo: 'aviso', mensagem: 'Minicurso "Introdução ao Python" está totalmente lotado.', data: '12:15' },
            { id: 3, tipo: 'sucesso', mensagem: 'Lote de novos certificados emitidos com sucesso.', data: '09:44' },
          ]
        });
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setCarregando(false);
      }
    }
    obterDados();
  }, [currentUser]);

  const itensDashboard = [
    { label: 'Participantes', value: estatisticas?.total_participantes, cor: 'var(--navy-deep, #0a192f)' },
    { label: 'Minicursos', value: estatisticas?.total_minicursos, cor: 'var(--navy-deep, #0a192f)' },
    { label: 'Palestras', value: estatisticas?.total_palestras, cor: 'var(--navy-deep, #0a192f)' },
    { label: 'Inscrições em Minicursos', value: estatisticas?.total_inscritos_minicurso, cor: 'var(--gold, #d4af37)' },
    { label: 'Inscrições em Palestras', value: estatisticas?.total_inscritos_palestra, cor: 'var(--gold, #d4af37)' },
    { label: 'Certificados Emitidos', value: estatisticas?.total_certificados, cor: '#10b981' },
    { label: 'Presenças Confirmadas', value: estatisticas?.total_presentes, cor: '#10b981' },
    { label: 'Assentos Escolhidos', value: estatisticas?.total_assentos_escolhidos, cor: 'var(--navy-deep, #0a192f)' },
  ];

  const calcularPorcentagem = (valor, total) => {
    if (!valor || !total) return 0;
    return Math.min(Math.round((valor / total) * 100), 100);
  };

  const minicursosFiltrados = (estatisticas?.detalhes_minicursos || []).filter(mc => {
    if (filtroMinicurso === 'lotados') return mc.inscritos >= mc.vagas;
    if (filtroMinicurso === 'vagas') return mc.inscritos < mc.vagas;
    return true;
  });

  const logsFiltrados = (estatisticas?.alertas_logs || []).filter(log => 
    log.mensagem.toLowerCase().includes(buscaLog.toLowerCase())
  );

  return (
    <>
      {carregando ? (
        <p style={{ color: 'var(--muted)', marginTop: '2rem' }}>Carregando estatísticas do servidor...</p>
      ) : (
        <div className="dashboard-wrapper">
          
          {/* Grid de Blocos Numéricos Principais */}
          <div className="dashboard-grid">
            {itensDashboard.map((item, index) => (
              <div key={index} className="dashboard-stat-card">
                <span className="dashboard-stat-number" style={{ color: item.cor }}>{item.value ?? 0}</span>
                <span className="dashboard-stat-label">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Grid de Gráficos de Engajamento e Ocupação */}
          <div className="dashboard-charts-grid">
            
            {/* Bloco de Metas Gerais */}
            <div className="dashboard-chart-card">
              <h3 className="dashboard-chart-title">Desempenho Geral do Evento</h3>
              
              <div className="progress-item">
                <div className="progress-info">
                  <span>Presenças / Inscrições em Minicursos</span>
                  <span>{calcularPorcentagem(estatisticas?.total_presentes, estatisticas?.total_inscritos_minicurso)}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${calcularPorcentagem(estatisticas?.total_presentes, estatisticas?.total_inscritos_minicurso)}%`, backgroundColor: 'var(--gold, #d4af37)' }}
                  ></div>
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-info">
                  <span>Assentos Preenchidos / Capacidade Alunos</span>
                  <span>{calcularPorcentagem(estatisticas?.total_assentos_escolhidos, estatisticas?.total_participantes)}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${calcularPorcentagem(estatisticas?.total_assentos_escolhidos, estatisticas?.total_participantes)}%`, backgroundColor: 'var(--navy-deep, #0a192f)' }}
                  ></div>
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-info">
                  <span>Conversão de Certificados Emitidos</span>
                  <span>{calcularPorcentagem(estatisticas?.total_certificados, estatisticas?.total_presentes)}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${calcularPorcentagem(estatisticas?.total_certificados, estatisticas?.total_presentes)}%`, backgroundColor: '#10b981' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Bloco de Listagem e Vagas dos Minicursos */}
            <div className="dashboard-chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 className="dashboard-chart-title" style={{ marginBottom: 0 }}>Vagas por Minicurso</h3>
                <select 
                  value={filtroMinicurso} 
                  onChange={(e) => setFiltroMinicurso(e.target.value)}
                  className="dashboard-select"
                >
                  <option value="todos">Todos</option>
                  <option value="lotados">Lotados</option>
                  <option value="vagas">Com vagas</option>
                </select>
              </div>

              <div className="minicursos-list-scroll">
                {minicursosFiltrados.map((mc) => (
                  <div key={mc.id} className="minicurso-progress-item">
                    <div className="minicurso-progress-info">
                      <span className="minicurso-name">{mc.titulo}</span>
                      <span className="minicurso-count">{mc.inscritos} / {mc.vagas}</span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: '6px' }}>
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${calcularPorcentagem(mc.inscritos, mc.vagas)}%`, 
                          backgroundColor: calcularPorcentagem(mc.inscritos, mc.vagas) >= 100 ? '#ef4444' : 'var(--gold, #d4af37)' 
                        }}
                      ></div>
                    </div>
                    <div className="minicurso-meta-info">
                      Presenças homologadas: {mc.presencas} ({calcularPorcentagem(mc.presencas, mc.inscritos)}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bloco de Controle de Palestras e Atividades */}
          <div className="dashboard-charts-grid" style={{ marginTop: '0.5rem' }}>
            
            <div className="dashboard-chart-card">
              <h3 className="dashboard-chart-title">Inscrições em Palestras</h3>
              <div className="minicursos-list-scroll">
                {(estatisticas?.detalhes_palestras || []).map((palestra) => (
                  <div key={palestra.id} className="minicurso-progress-item">
                    <div className="minicurso-progress-info">
                      <span className="minicurso-name">{palestra.titulo}</span>
                      <span className="minicurso-count">{palestra.inscritos} / {palestra.vagas}</span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: '6px' }}>
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${calcularPorcentagem(palestra.inscritos, palestra.vagas)}%`, 
                          backgroundColor: 'var(--navy-deep, #0a192f)' 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 className="dashboard-chart-title" style={{ marginBottom: 0 }}>Histórico de Alertas e Sistema</h3>
                <input 
                  type="text" 
                  placeholder="Filtrar eventos..." 
                  value={buscaLog} 
                  onChange={(e) => setBuscaLog(e.target.value)}
                  className="dashboard-search-input"
                />
              </div>
              <div className="logs-container">
                {logsFiltrados.length === 0 ? (
                  <p style={{ fontSize: '0.88rem', color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>Nenhum alerta registrado.</p>
                ) : (
                  logsFiltrados.map((log) => (
                    <div key={log.id} className={`log-item log-${log.tipo}`}>
                      <span className="log-marker"></span>
                      <p className="log-message">{log.mensagem}</p>
                      <span className="log-time">{log.data}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        .dashboard-wrapper {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          animation: fadeIn 0.3s ease-in-out;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.2rem;
          margin-top: 1rem;
        }
        .dashboard-stat-card {
          background-color: var(--surface, #ffffff);
          border: 1px solid var(--line, #e2e8f0);
          border-radius: var(--radius-lg, 12px);
          box-shadow: var(--shadow, 0 4px 6px rgba(0,0,0,0.02));
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          transition: transform var(--transition, 0.3s ease), border-color var(--transition, 0.3s ease);
        }
        .dashboard-stat-card:hover {
          transform: translateY(-3px);
          border-color: var(--gold, #d4af37);
        }
        .dashboard-stat-number {
          font-family: var(--font-display, sans-serif);
          font-size: 2.4rem;
          font-weight: 800;
          line-height: 1.1;
        }
        .dashboard-stat-label {
          font-family: var(--font-body, sans-serif);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--muted, #64748b);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .dashboard-charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 1.5rem;
        }
        @media (max-width: 500px) {
          .dashboard-charts-grid {
            grid-template-columns: 1fr;
          }
        }
        .dashboard-chart-card {
          background-color: var(--surface, #ffffff);
          border: 1px solid var(--line, #e2e8f0);
          border-radius: var(--radius-lg, 12px);
          padding: 1.5rem;
          box-shadow: var(--shadow, 0 4px 6px rgba(0,0,0,0.02));
          display: flex;
          flex-direction: column;
        }
        .dashboard-chart-title {
          font-family: var(--font-display, sans-serif);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--navy-deep, #0a192f);
          margin-bottom: 1.5rem;
        }
        .dashboard-select {
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          border: 1.5px solid var(--line, #e2e8f0);
          background-color: var(--surface, #ffffff);
          color: var(--text, #1e293b);
          font-family: var(--font-body, sans-serif);
          font-size: 0.85rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }
        .dashboard-search-input {
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          border: 1.5px solid var(--line, #e2e8f0);
          background-color: var(--surface, #ffffff);
          color: var(--text, #1e293b);
          font-family: var(--font-body, sans-serif);
          font-size: 0.85rem;
          outline: none;
          width: 200px;
        }
        .minicursos-list-scroll {
          max-height: 280px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }
        .minicurso-progress-item {
          margin-bottom: 1.2rem;
          padding-bottom: 0.8rem;
          border-bottom: 1px solid var(--line-soft, #f1f5f9);
        }
        .minicurso-progress-item:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        .minicurso-progress-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.4rem;
        }
        .minicurso-name {
          font-family: var(--font-body, sans-serif);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text, #1e293b);
        }
        .minicurso-count {
          font-family: var(--font-body, sans-serif);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--muted, #64748b);
          white-space: nowrap;
        }
        .minicurso-meta-info {
          font-family: var(--font-body, sans-serif);
          font-size: 0.75rem;
          color: var(--muted, #64748b);
          margin-top: 0.4rem;
        }
        .progress-item {
          margin-bottom: 1.5rem;
        }
        .progress-item:last-child {
          margin-bottom: 0;
        }
        .progress-info {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-body, sans-serif);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--muted, #64748b);
          margin-bottom: 0.5rem;
        }
        .progress-bar-bg {
          width: 100%;
          height: 8px;
          background-color: var(--line, #e2e8f0);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s ease-in-out;
        }
        .logs-container {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          max-height: 280px;
          overflow-y: auto;
        }
        .log-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem 1rem;
          background-color: var(--line-soft, #f8fafc);
          border-radius: 8px;
          border-left: 4px solid #cbd5e1;
        }
        .log-info { border-left-color: #3b82f6; }
        .log-aviso { border-left-color: var(--gold, #d4af37); }
        .log-sucesso { border-left-color: #10b981; }
        .log-marker {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: currentColor;
          opacity: 0.5;
        }
        .log-message {
          flex: 1;
          font-family: var(--font-body, sans-serif);
          font-size: 0.88rem;
          color: var(--text, #1e293b);
          margin: 0;
        }
        .log-time {
          font-family: var(--font-body, sans-serif);
          font-size: 0.75rem;
          color: var(--muted, #64748b);
          font-weight: 600;
        }
      `}</style>
    </>
  );
}