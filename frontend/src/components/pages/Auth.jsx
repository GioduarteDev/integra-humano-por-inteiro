import { useRef, useState } from 'react';
import { isValidEmail, isValidPhone } from '../../data/minicursos.js';
import { cadastrar, login as loginApi, meuPerfil, esqueciSenha } from '../../services/api.js';

const EMPTY_CAD = { nome: '', email: '', tel: '', cpf: '', senha: '', confirma: '' };

export default function Auth({ login, navigate }) {
  const [tab, setTab] = useState('login');

  const [loginData, setLoginData] = useState({ email: '', senha: '' });
  const [loginErrors, setLoginErrors] = useState({});
  const [loginSuccess, setLoginSuccess] = useState('');

  const [cad, setCad] = useState(EMPTY_CAD);
  const [cadErrors, setCadErrors] = useState({});
  const [cadSuccess, setCadSuccess] = useState('');

  const [showEsqueci, setShowEsqueci] = useState(false);
  const [emailEsqueci, setEmailEsqueci] = useState('');
  const [resultadoEsqueci, setResultadoEsqueci] = useState('');
  const [novaSenhaGerada, setNovaSenhaGerada] = useState('');
  const [copiado, setCopiado] = useState(false);

  const timersRef = useRef([]);
  const queueTimer = (fn, ms) => timersRef.current.push(setTimeout(fn, ms));

  const switchTab = (next) => {
    setTab(next);
    setLoginErrors({});
    setCadErrors({});
  };

  const onLoginChange = (field) => (e) => {
    setLoginData((d) => ({ ...d, [field]: e.target.value }));
    setLoginErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  const onCadChange = (field) => (e) => {
    setCad((d) => ({ ...d, [field]: e.target.value }));
    setCadErrors((errs) => ({ ...errs, [field]: undefined }));
  };


  // ============================================================
  // CADASTRO
  // ============================================================
  const handleCadastro = async (e) => {
    e.preventDefault();
    setCadSuccess('');

    const nome = cad.nome.trim();
    const email = cad.email.trim();
    const telefone = cad.tel.trim();
    const cpf = cad.cpf.trim();
    const { senha, confirma } = cad;

    const errors = {};

    if (nome.length < 3) errors.nome = 'Informe seu nome completo.';
    if (!isValidEmail(email)) errors.email = 'E-mail inválido.';
    if (cpf.replace(/\D/g, '').length !== 11) errors.cpf = 'CPF inválido. Deve ter 11 números.';
    if (!isValidPhone(telefone)) errors.tel = 'Telefone inválido. Ex: (11) 99999-9999';
    if (senha.length < 6) errors.senha = 'A senha deve ter ao menos 6 caracteres.';
    if (!confirma) {
      errors.confirma = 'Confirme sua senha.';
    } else if (senha !== confirma) {
      errors.confirma = 'As senhas não coincidem.';
    }

    if (Object.keys(errors).length > 0) {
      setCadErrors(errors);
      return;
    }

    try {
      await cadastrar({ nome, email, senha, telefone, cpf});

      setCadSuccess(
        `✓ Cadastro realizado! Bem-vindo(a), ${nome.split(' ')[0]}. Redirecionando para o login...`
      );

      setCad(EMPTY_CAD);
      setLoginData((d) => ({ ...d, email }));

      queueTimer(() => {
        setCadSuccess('');
        switchTab('login');
      }, 2000);
    } catch (err) {
      setCadErrors({ email: err.message });
    }
  };

  // ============================================================
  // LOGIN
  // ============================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginSuccess('');

    const email = loginData.email.trim();
    const { senha } = loginData;

    const errors = {};
    if (!isValidEmail(email)) errors.email = 'E-mail inválido.';
    if (!senha) errors.senha = 'Digite sua senha.';

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }

    try {
      await loginApi({ email, senha });
      const perfil = await meuPerfil();

      setLoginSuccess(`✓ Bem-vindo(a), ${perfil.nome.split(' ')[0]}! Entrando...`);
      login(perfil);

      queueTimer(() => {
        setLoginData({ email: '', senha: '' });
        setLoginSuccess('');
        navigate('page-home');
      }, 1200);
    } catch (err) {
      setLoginErrors({ email: ' ', senha: err.message });
    }
  };

  // ============================================================
  // ESQUECI MINHA SENHA
  // ============================================================
  const handleEsqueciSenha = async (e) => {
    e.preventDefault();
    setResultadoEsqueci('');
    setNovaSenhaGerada('');
    try {
      const data = await esqueciSenha(emailEsqueci);
      setResultadoEsqueci(`Sua nova senha temporária é: ${data.nova_senha}`);
      setNovaSenhaGerada(data.nova_senha);
    } catch (err) {
      setResultadoEsqueci(err.message || 'Não foi possível redefinir a senha.');
    }
  };
  const inputClass = (err) => (err ? 'error-input' : undefined);

  return (
    <div className="page active">
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-text">
              Ínte<span style={{ color: 'var(--robin)' }}>gra</span>
            </div>
            <div className="logo-sub">Humano por Inteiro — Acesse sua conta</div>
          </div>

          <div className="auth-tabs">
            <button
              className={`auth-tab${tab === 'login' ? ' active' : ''}`}
              onClick={() => switchTab('login')}
            >
              Entrar
            </button>
            <button
              className={`auth-tab${tab === 'cadastro' ? ' active' : ''}`}
              onClick={() => switchTab('cadastro')}
            >
              Criar conta
            </button>
          </div>

          {/* ── FORM: LOGIN ── */}
          {tab === 'login' && (
            <form className="auth-form active" onSubmit={handleLogin} noValidate>
              <div className="field">
                <label htmlFor="login-email">E-mail *</label>
                <input
                  type="email"
                  id="login-email"
                  placeholder="seu@email.com"
                  value={loginData.email}
                  onChange={onLoginChange('email')}
                  className={inputClass(loginErrors.email)}
                />
                <span className="form-error">{loginErrors.email}</span>
              </div>

              <div className="field">
                <label htmlFor="login-senha">Senha *</label>
                <input
                  type="password"
                  id="login-senha"
                  placeholder="••••••••"
                  value={loginData.senha}
                  onChange={onLoginChange('senha')}
                  className={inputClass(loginErrors.senha)}
                />
                <span className="form-error">{loginErrors.senha}</span>
              </div>

              <div className="form-success">{loginSuccess}</div>

              <button type="submit" className="btn-submit">
                Entrar no evento
              </button>

              <p className="auth-footnote">
                Ainda não tem conta?{' '}
                <a onClick={() => switchTab('cadastro')}>Cadastre-se aqui</a>
              </p>

              <p className="auth-footnote">
                <a onClick={() => setShowEsqueci((v) => !v)}>Esqueci minha senha</a>
              </p>

              {showEsqueci && (
                <div className="field" style={{ marginTop: '.8rem' }}>
                  <label htmlFor="esqueci-email">Digite seu e-mail cadastrado</label>
                  <input
                    type="email"
                    id="esqueci-email"
                    placeholder="seu@email.com"
                    value={emailEsqueci}
                    onChange={(e) => setEmailEsqueci(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-submit"
                    style={{ marginTop: '.5rem' }}
                    onClick={handleEsqueciSenha}
                  >
                    Redefinir senha
                  </button>
                 {resultadoEsqueci && (
                    <div className="form-success" style={{ display: 'block', marginTop: '.5rem' }}>
                      <p>{resultadoEsqueci}</p>
                      {novaSenhaGerada && (
                        <button
                          type="button"
                          className="btn-link-action"
                          onClick={() => {
                            navigator.clipboard.writeText(novaSenhaGerada);
                            setCopiado(true);
                            setTimeout(() => setCopiado(false), 1500);
                          }}
                        >
                          {copiado ? 'Copiado!' : 'Copiar senha'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </form>
          )}

          {/* ── FORM: CADASTRO ── */}
          {tab === 'cadastro' && (
            <form className="auth-form active" onSubmit={handleCadastro} noValidate>
              <div className="field">
                <label htmlFor="cad-nome">Nome completo *</label>
                <input
                  type="text"
                  id="cad-nome"
                  placeholder="Maria da Silva"
                  value={cad.nome}
                  onChange={onCadChange('nome')}
                  className={inputClass(cadErrors.nome)}
                />
                <span className="form-error">{cadErrors.nome}</span>
              </div>

              <div className="field">
                <label htmlFor="cad-email">E-mail *</label>
                <input
                  type="email"
                  id="cad-email"
                  placeholder="seu@email.com"
                  value={cad.email}
                  onChange={onCadChange('email')}
                  className={inputClass(cadErrors.email)}
                />
                <span className="form-error">{cadErrors.email}</span>
              </div>

              <div className="field">
                <label htmlFor="cad-tel">Telefone *</label>
                <input
                  type="tel"
                  id="cad-tel"
                  placeholder="(11) 99999-9999"
                  value={cad.tel}
                  onChange={onCadChange('tel')}
                  className={inputClass(cadErrors.tel)}
                />
                <span className="form-error">{cadErrors.tel}</span>
              </div> 
              <div className="field">
                <label htmlFor="cad-cpf">CPF *</label>
                <input
                  type="text"
                  id="cad-cpf"
                  placeholder="000.000.000-00"
                  value={cad.cpf}
                  onChange={onCadChange('cpf')}
                  className={inputClass(cadErrors.cpf)}
                />
                <span className="form-error">{cadErrors.cpf}</span>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="cad-senha">Senha *</label>
                  <input
                    type="password"
                    id="cad-senha"
                    placeholder="mín. 6 caracteres"
                    value={cad.senha}
                    onChange={onCadChange('senha')}
                    className={inputClass(cadErrors.senha)}
                  />
                  <span className="form-error">{cadErrors.senha}</span>
                </div>
                <div className="field">
                  <label htmlFor="cad-confirma">Confirmar senha *</label>
                  <input
                    type="password"
                    id="cad-confirma"
                    placeholder="repita a senha"
                    value={cad.confirma}
                    onChange={onCadChange('confirma')}
                    className={inputClass(cadErrors.confirma)}
                  />
                  <span className="form-error">{cadErrors.confirma}</span>
                </div>
              </div>

              <div className="form-success">{cadSuccess}</div>

              <button type="submit" className="btn-submit">
                Criar conta e se inscrever
              </button>

              <p className="auth-footnote">
                Já tem conta? <a onClick={() => switchTab('login')}>Faça login</a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}