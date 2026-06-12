import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './PerfilPaciente.css'

function PerfilPaciente() {
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState(null)

  const [form, setForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    senha: '',
    confirmarSenha: ''
  })

  useEffect(() => {
    const dados = localStorage.getItem('usuario')
    if (!dados) { navigate('/'); return }
    const user = JSON.parse(dados)
    setForm(prev => ({
      ...prev,
      nome: user.nome || '',
      email: user.email || '',
      cpf: user.cpf || ''
    }))
  }, [])

  async function salvar() {
    setErro(null)
    setSucesso(false)

    if (form.senha && form.senha !== form.confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setCarregando(true)
    try {
      const { data } = await api.put('/auth/perfil', {
        nome: form.nome,
        email: form.email,
        cpf: form.cpf,
        senha: form.senha || null
      })

      // Atualiza localStorage
      const usuarioAtual = JSON.parse(localStorage.getItem('usuario'))
      localStorage.setItem('usuario', JSON.stringify({
        ...usuarioAtual,
        nome: data.nome,
        cpf: data.cpf
      }))

      setSucesso(true)
      setForm(prev => ({ ...prev, senha: '', confirmarSenha: '' }))
    } catch (e) {
      setErro('Erro ao salvar. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="perfil-container">
      <div className="perfil-card">

        <div className="perfil-header">
          <button className="btn-voltar" onClick={() => navigate('/home')}>
            ← Voltar
          </button>
          <h1>👤 Meu Perfil</h1>
        </div>

        <div className="perfil-avatar">
          <div className="avatar-circulo">
            {form.nome?.charAt(0).toUpperCase()}
          </div>
          <p>{form.email}</p>
        </div>

        {sucesso && (
          <div className="perfil-sucesso">✅ Perfil atualizado com sucesso!</div>
        )}
        {erro && (
          <div className="perfil-erro">❌ {erro}</div>
        )}

        <div className="perfil-form">
          <div className="campo">
            <label>Nome completo</label>
            <input
              type="text"
              value={form.nome}
              onChange={e => setForm({...form, nome: e.target.value})}
            />
          </div>

          <div className="campo">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              disabled
              className="input-disabled"
            />
            <small>O email não pode ser alterado</small>
          </div>

          <div className="campo">
            <label>CPF</label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={e => setForm({...form, cpf: e.target.value})}
            />
          </div>

          <div className="perfil-divisor">
            <span>Alterar senha (opcional)</span>
          </div>

          <div className="campo">
            <label>Nova senha</label>
            <input
              type="password"
              placeholder="Deixe em branco para manter"
              value={form.senha}
              onChange={e => setForm({...form, senha: e.target.value})}
            />
          </div>

          <div className="campo">
            <label>Confirmar nova senha</label>
            <input
              type="password"
              placeholder="Repita a nova senha"
              value={form.confirmarSenha}
              onChange={e => setForm({...form, confirmarSenha: e.target.value})}
            />
          </div>

          <button
            className="btn-salvar"
            onClick={salvar}
            disabled={carregando || !form.nome}
          >
            {carregando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default PerfilPaciente