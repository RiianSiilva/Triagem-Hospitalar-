import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Admin.css'

const PERFIS = ['MEDICO', 'ENFERMEIRA', 'ADMIN']

function Admin() {
  const navigate = useNavigate()
  const [aba, setAba] = useState('usuarios')
  const [usuarios, setUsuarios] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [triagens, setTriagens] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState(null)
  const [erro, setErro] = useState(null)

  const [form, setForm] = useState({
    nome: '', email: '', senha: '', perfil: 'MEDICO'
  })

  useEffect(() => { carregarDados() }, [aba])

  async function carregarDados() {
    setCarregando(true)
    try {
      if (aba === 'usuarios') {
        const { data } = await api.get('/admin/usuarios')
        setUsuarios(data)
      } else if (aba === 'pacientes') {
        const { data } = await api.get('/admin/pacientes')
        setPacientes(data)
      } else if (aba === 'triagens') {
        const { data } = await api.get('/admin/triagens')
        setTriagens(data)
      }
    } catch (e) {
      setErro('Erro ao carregar dados.')
    } finally {
      setCarregando(false)
    }
  }

  async function cadastrarStaff() {
    setErro(null); setSucesso(null)
    try {
      await api.post('/admin/cadastrar/staff', form)
      setSucesso(`${form.perfil} cadastrado com sucesso!`)
      setForm({ nome: '', email: '', senha: '', perfil: 'MEDICO' })
      carregarDados()
    } catch (e) {
      if (e.response?.status === 409) setErro('Email já cadastrado.')
      else setErro('Erro ao cadastrar.')
    }
  }

  async function deletarUsuario(id) {
    if (!confirm('Deletar este usuário?')) return
    try {
      await api.delete(`/admin/usuario/${id}`)
      setSucesso('Usuário deletado.')
      carregarDados()
    } catch (e) { setErro('Erro ao deletar.') }
  }

  async function deletarPaciente(id) {
    if (!confirm('Isso irá deletar o paciente e todas as suas triagens. Confirmar?')) return
    try {
      await api.delete(`/admin/paciente/${id}`)
      setSucesso('Paciente e triagens deletados.')
      carregarDados()
    } catch (e) { setErro('Erro ao deletar.') }
  }

  async function deletarTriagem(id) {
    if (!confirm('Deletar esta triagem?')) return
    try {
      await api.delete(`/admin/triagem/${id}`)
      setSucesso('Triagem deletada.')
      carregarDados()
    } catch (e) { setErro('Erro ao deletar.') }
  }

  async function limparTriagens() {
    if (!confirm('Deletar TODAS as triagens?')) return
    try {
      await api.delete('/admin/limpar/triagens')
      setSucesso('Todas as triagens deletadas.')
      carregarDados()
    } catch (e) { setErro('Erro ao limpar.') }
  }

  async function limparTudo() {
    if (!confirm('ATENÇÃO: Deletar TODOS os dados do sistema?')) return
    try {
      await api.delete('/admin/limpar/tudo')
      setSucesso('Todos os dados deletados.')
      carregarDados()
    } catch (e) { setErro('Erro ao limpar.') }
  }

  function sair() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/')
  }

  return (
    <div className="admin-page">

      <nav className="admin-navbar">
        <div className="admin-navbar-logo">
          <span className="admin-navbar-logo-badge">+</span>
          <h1>TriagemIA</h1>
          <span className="admin-navbar-tag">Administrador</span>
        </div>
        <button className="btn-sair" onClick={sair}>Sair</button>
      </nav>

      <div className="admin-content">

        {sucesso && <div className="admin-alerta admin-sucesso">{sucesso}</div>}
        {erro    && <div className="admin-alerta admin-erro">{erro}</div>}

        <div className="admin-abas">
          {[
            { id: 'usuarios',  label: 'Usuários' },
            { id: 'pacientes', label: 'Pacientes' },
            { id: 'triagens',  label: 'Triagens' },
            { id: 'cadastrar', label: 'Cadastrar Staff' },
          ].map(a => (
            <button key={a.id}
              className={`admin-aba ${aba === a.id ? 'ativa' : ''}`}
              onClick={() => { setAba(a.id); setSucesso(null); setErro(null) }}>
              {a.label}
            </button>
          ))}
        </div>

        {/* Usuários */}
        {aba === 'usuarios' && (
          <div className="admin-secao">
            <div className="admin-secao-header">
              <h2>Usuários cadastrados</h2>
            </div>
            <table className="admin-tabela">
              <thead>
                <tr><th>ID</th><th>Nome</th><th>Email</th><th>Perfil</th><th>Ação</th></tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td style={{color:'white', fontWeight:'500'}}>{u.nome}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge badge-${u.perfil.toLowerCase()}`}>{u.perfil}</span></td>
                    <td><button className="btn-deletar" onClick={() => deletarUsuario(u.id)}>Deletar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pacientes */}
        {aba === 'pacientes' && (
          <div className="admin-secao">
            <div className="admin-secao-header">
              <h2>Pacientes cadastrados</h2>
            </div>
            <table className="admin-tabela">
              <thead>
                <tr><th>ID</th><th>Nome</th><th>CPF</th><th>Cadastro</th><th>Ação</th></tr>
              </thead>
              <tbody>
                {pacientes.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td style={{color:'white', fontWeight:'500'}}>{p.nome}</td>
                    <td>{p.cpf}</td>
                    <td>{p.dataCadastro ? new Date(p.dataCadastro).toLocaleDateString('pt-BR') : '—'}</td>
                    <td><button className="btn-deletar" onClick={() => deletarPaciente(p.id)}>Deletar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Triagens */}
        {aba === 'triagens' && (
          <div className="admin-secao">
            <div className="admin-secao-header">
              <h2>Triagens realizadas</h2>
              <button className="btn-limpar" onClick={limparTriagens}>Limpar todas</button>
            </div>
            <table className="admin-tabela">
              <thead>
                <tr><th>ID</th><th>Paciente</th><th>Cor</th><th>Sintomas</th><th>Data</th><th>Ação</th></tr>
              </thead>
              <tbody>
                {triagens.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td style={{color:'white', fontWeight:'500'}}>{t.paciente?.nome}</td>
                    <td><span className={`badge cor-${t.cor?.toLowerCase()}`}>{t.cor}</span></td>
                    <td className="td-sintomas">{t.sintomas}</td>
                    <td>{new Date(t.dataTriagem).toLocaleDateString('pt-BR')}</td>
                    <td><button className="btn-deletar" onClick={() => deletarTriagem(t.id)}>Deletar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn-perigo" onClick={limparTudo}>
              Limpar TODOS os dados do sistema
            </button>
          </div>
        )}

        {/* Cadastrar */}
        {aba === 'cadastrar' && (
          <div className="admin-secao">
            <div className="admin-secao-header">
              <h2>Cadastrar médico ou enfermeira</h2>
            </div>
            <div className="admin-form">
              <div className="campo">
                <label>Nome completo</label>
                <input type="text" placeholder="Nome"
                  value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
              </div>
              <div className="campo">
                <label>Email</label>
                <input type="email" placeholder="email@hospital.com"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="campo">
                <label>Senha</label>
                <input type="password" placeholder="Senha"
                  value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} />
              </div>
              <div className="campo">
                <label>Perfil</label>
                <select value={form.perfil} onChange={e => setForm({...form, perfil: e.target.value})}>
                  {PERFIS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <button className="btn-cadastrar"
                onClick={cadastrarStaff}
                disabled={!form.nome || !form.email || !form.senha}>
                Cadastrar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Admin