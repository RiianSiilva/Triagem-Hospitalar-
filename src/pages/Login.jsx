import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [aba, setAba] = useState('login') // 'login' ou 'cadastro'
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  const [form, setForm] = useState({
    nome: '', email: '', senha: ''
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
        senha: form.senha
      })

      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data))
      navigate('/totem')

    } catch (e) {
      if (e.response?.status === 409) setErro('Email já cadastrado.')
      else setErro('Erro ao cadastrar. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <h1>🏥</h1>
          <h2>Triagem Hospitalar</h2>
          <p>Sistema de Triagem com IA</p>
        </div>

        <div className="login-abas">
          <button
            className={aba === 'login' ? 'aba ativa' : 'aba'}
            onClick={() => { setAba('login'); setErro(null) }}
          >
            Entrar
          </button>
          <button
            className={aba === 'cadastro' ? 'aba ativa' : 'aba'}
            onClick={() => { setAba('cadastro'); setErro(null) }}
          >
            Cadastrar
          </button>
        </div>

        <div className="login-form">
          {aba === 'cadastro' && (
            <div className="campo">
              <label>Nome completo</label>
              <input
                type="text"
                placeholder="Digite seu nome"
                value={form.nome}
                onChange={e => setForm({...form, nome: e.target.value})}
              />
            </div>
          )}

          <div className="campo">
            <label>Email</label>
            <input
              type="email"
              placeholder="Digite seu email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>

          <div className="campo">
            <label>Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={form.senha}
              onChange={e => setForm({...form, senha: e.target.value})}
            />
          </div>

          {erro && <p className="erro">{erro}</p>}

          <button
            className="btn-login"
            onClick={aba === 'login' ? handleLogin : handleCadastro}
            disabled={carregando}
          >
            {carregando ? 'Aguarde...' : aba === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login