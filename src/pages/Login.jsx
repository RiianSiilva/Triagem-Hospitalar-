import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [aba, setAba] = useState('login')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  const [form, setForm] = useState({
    nome: '', email: '', senha: '', cpf: ''
  })

  async function handleLogin() {
    setCarregando(true)
    setErro(null)
    try {
      const { data } = await api.post('/auth/login', {
        email: form.email,
        senha: form.senha
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data))
      if (data.perfil === 'PACIENTE') navigate('/home')
      else if (data.perfil === 'ADMIN') navigate('/admin')
      else navigate('/painel')
    } catch (e) {
      setErro('Email ou senha incorretos.')
    } finally {
      setCarregando(false)
    }
  }

  async function handleCadastro() {
    setCarregando(true)
    setErro(null)
    try {
      const { data } = await api.post('/auth/cadastro/paciente', {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        cpf: form.cpf
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data))
      navigate('/home')
    } catch (e) {
      if (e.response?.status === 409) setErro('Email já cadastrado.')
      else setErro('Erro ao cadastrar. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="login-page">

      {/* Branding */}
      <div className="login-branding">
        <div className="login-logo">
          <div className="login-logo-icone">+</div>
          <div>
            <h1>TriagemIA</h1>
            <p>Sistema Hospitalar Inteligente</p>
          </div>
        </div>

        <div className="login-tagline">
          <h2>Triagem rápida,<br />precisa e segura.</h2>
          <p>Sistema de triagem hospitalar baseado no Protocolo de Manchester com Inteligência Artificial para classificação automática de urgência.</p>
        </div>

        <div className="login-features">
          <div className="login-feature">
            <div className="login-feature-icone">IA</div>
            <span>Classificação por IA — Llama 3.3 70B</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icone">RT</div>
            <span>Alertas em tempo real para casos críticos</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icone">MP</div>
            <span>Protocolo de Manchester — 5 níveis de urgência</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icone">JWT</div>
            <span>Acesso seguro com autenticação JWT</span>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="login-form-side">
        <div className="login-card">
          <div className="login-card-header">
            <h2>{aba === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}</h2>
            <p>{aba === 'login' ? 'Entre com suas credenciais para acessar' : 'Preencha os dados para se cadastrar'}</p>
          </div>

          <div className="login-abas">
            <button className={`aba ${aba === 'login' ? 'ativa' : ''}`}
              onClick={() => { setAba('login'); setErro(null) }}>
              Entrar
            </button>
            <button className={`aba ${aba === 'cadastro' ? 'ativa' : ''}`}
              onClick={() => { setAba('cadastro'); setErro(null) }}>
              Cadastrar
            </button>
          </div>

          {aba === 'cadastro' && (
            <div className="campo">
              <label>Nome completo</label>
              <input type="text" placeholder="Seu nome completo"
                value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
            </div>
          )}

          {aba === 'cadastro' && (
            <div className="campo">
              <label>CPF</label>
              <input type="text" placeholder="000.000.000-00"
                value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} />
            </div>
          )}

          <div className="campo">
            <label>Email</label>
            <input type="email" placeholder="seu@email.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          <div className="campo">
            <label>Senha</label>
            <input type="password" placeholder="••••••••"
              value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} />
          </div>

          {erro && <div className="erro">{erro}</div>}

          <button className="btn-login"
            onClick={aba === 'login' ? handleLogin : handleCadastro}
            disabled={carregando}>
            {carregando ? 'Aguarde...' : aba === 'login' ? 'Entrar no sistema' : 'Criar conta'}
          </button>
        </div>
      </div>

    </div>
  )
}

export default Login