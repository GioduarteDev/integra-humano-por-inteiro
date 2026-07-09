import { useEffect, useState } from 'react';
import { buscarEstatisticas } from '../../services/api.js';

export default function Dashboard({ currentUser }) {
  const [estatisticas, setEstatisticas] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function obterDados() {
      if (!currentUser?.is_admin) {
        setCarregando(false);
        return;
      }
      try {
        const dados = await buscarEstatisticas();
        setEstatisticas(dados);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setCarregando(false);
      }
    }
    obterDados();
  }, [currentUser]);

  const itensDashboard = [
    { label: 'Participantes', value: estatisticas?.total_participantes },
    { label: 'Minicursos', value: estatisticas?.total_minicursos },
    { label: 'Palestras', value: estatisticas?.total_palestras },
    { label: 'Inscrições em Minicursos', value: estatisticas?.total_inscritos_minicurso },
    { label: 'Inscrições em Palestras', value: estatisticas?.total_inscritos_palestra },
    { label: 'Certificados Emitidos', value: estatisticas?.total_certificados },
    { label: 'Presenças Confirmadas', value: estatisticas?.total_presentes },
    { label: 'Assentos Escolhidos', value: estatisticas?.total_assentos_escolhidos },
  ];

  return (
    <>
      {carregando ? (
        <p style={{ color: 'var(--muted)', marginTop: '2rem' }}>Carregando estatísticas...</p>
      ) : (
        <div className="dashboard-grid">
          {itensDashboard.map((item, index) => (
            <div key={index} className="dashboard-stat-card">
              <span className="dashboard-stat-number">{item.value ?? 0}</span>
              <span className="dashboard-stat-label">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.2rem;
          margin-top: 1rem;
        }
        .dashboard-stat-card {
          background-color: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          transition: transform var(--transition), border-color var(--transition);
        }
        .dashboard-stat-card:hover {
          transform: translateY(-3px);
          border-color: var(--gold);
        }
        .dashboard-stat-number {
          font-family: var(--font-display);
          font-size: 2.4rem;
          font-weight: 800;
          color: var(--navy-deep);
          line-height: 1.1;
        }
        .dashboard-stat-label {
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
      `}</style>
    </>
  );
}