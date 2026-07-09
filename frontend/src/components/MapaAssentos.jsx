import { useEffect, useState } from 'react';
import { listarAssentosOcupados, escolherAssento } from '../services/api.js';

const FILEIRAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const ASSENTOS_POR_FILEIRA = 10;

export default function MapaAssentos({ currentUser, meuAssento, onEscolher }) {
  const [ocupados, setOcupados] = useState([]);
  const [selecionado, setSelecionado] = useState(meuAssento || null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    listarAssentosOcupados(1)
      .then((data) => setOcupados(data.ocupados))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSelecionado(meuAssento || null);
  }, [meuAssento]);

  const clicarAssento = async (codigo) => {
    if (!currentUser) {
      setMensagem('Faça login e inscreva-se no evento para escolher seu lugar.');
      return;
    }
    if (ocupados.includes(codigo) && codigo !== meuAssento) return;

    setSalvando(true);
    setMensagem('');
    try {
      await escolherAssento(1, codigo);
      setSelecionado(codigo);
      setOcupados((prev) => [...prev.filter((a) => a !== meuAssento), codigo]);
      if (onEscolher) onEscolher(codigo);
      setMensagem(`Assento ${codigo} confirmado!`);
    } catch (err) {
      setMensagem(err.message || 'Não foi possível escolher esse assento.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
      <div
        style={{
          background: 'var(--navy-deep)',
          color: '#FFFFFF',
          padding: '.6rem',
          borderRadius: '8px',
          fontSize: '.78rem',
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          marginBottom: '2rem',
        }}
      >
        Palco / Tela
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '1.5rem' }}>
        {FILEIRAS.map((fileira) => (
          <div key={fileira} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', justifyContent: 'center' }}>
            <span style={{ width: '18px', fontSize: '.72rem', color: 'var(--muted)', fontWeight: 700 }}>{fileira}</span>
            {Array.from({ length: ASSENTOS_POR_FILEIRA }, (_, i) => {
              const codigo = `${fileira}${i + 1}`;
              const ocupado = ocupados.includes(codigo) && codigo !== meuAssento;
              const meu = codigo === selecionado;

              let cor = '#D9D9D8'; // livre
              if (ocupado) cor = '#A6484A'; // ocupado
              if (meu) cor = '#4F7965'; // escolhido por mim

              return (
                <button
                  key={codigo}
                  onClick={() => clicarAssento(codigo)}
                  disabled={ocupado || salvando}
                  title={codigo}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '5px',
                    border: 'none',
                    background: cor,
                    cursor: ocupado ? 'not-allowed' : 'pointer',
                    transition: 'transform .15s ease, background .15s ease',
                  }}
                  onMouseEnter={(e) => { if (!ocupado) e.currentTarget.style.transform = 'scale(1.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#D9D9D8', borderRadius: 3, marginRight: 4 }} />Livre</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#A6484A', borderRadius: 3, marginRight: 4 }} />Ocupado</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#4F7965', borderRadius: 3, marginRight: 4 }} />Seu lugar</span>
      </div>

      {mensagem && <p style={{ fontSize: '.85rem', color: 'var(--navy-deep)', fontWeight: 600 }}>{mensagem}</p>}
    </div>
  );
}