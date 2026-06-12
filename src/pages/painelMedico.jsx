import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAlertas } from '../hooks/useAlertas'
import PainelAlertas from '../components/PainelAlertas'
import './PainelMedico.css'

const COR_CLASSE = {
  VERMELHO: 'cor-vermelho', LARANJA: 'cor-laranja',
  AMARELO:  'cor-amarelo',  VERDE:   'cor-verde', AZUL: 'cor-azul'
}

const STATUS_CLASSE = {
  AGUARDANDO:     'status-aguardando',
  EM_ATENDIMENTO: 'status-em-atendimento',
  ALTA:           'status-alta'
}

const STATUS_LABEL = {
  AGUARDANDO:     'Aguardando',
  EM_ATENDIMENTO: 'Em Atendimento',
  ALTA:           'Alta'
}

function PainelMedico() {
  const navigate = useNavigate()
  const [triagens, setTriagens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState('URGENTES')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [usuario, setUsuario] = useState(null)
  const { alertas, removerAlerta } = useAlertas()

  useEffect(() => {
    const dados = localStorage.getItem('usuario')
    if (dados) setUsuario(JSON.parse(dados))
    carregarTriagens()
    const interval = setInterval(carregarTriagens, 30000)
    return () => clearInterval(interval)
  }, [filtro])

  async function carregarTriagens() {
    setCarregando(true)
    try {
      let url = '/triagem/urgentes'
      if (filtro === 'TODAS') url = '/triagem/todas'
      else if (filtro !== 'URGENTES') url = `/triagem/cor/${filtro}`
      const { data } = await api.get(url)
      setTriagens(data)
    } catch (e) {
      console.error(e)
    } finally {
      setCarregando(false)
    }
  }

  async function atualizarStatus(id, status) {
    try {
      await api.put(`/triagem/${id}/status?status=${status}`)
      carregarTriagens()
    } catch (e) {
      console.error(e)
    }
  }

  function sair() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/')
  }

  const triagensFiltradas = triagens.filter(t =>
    filtroStatus === 'TODOS' || t.status === filtroStatus
  )

  const contadores = {
    AGUARDANDO:     triagens.filter(t => t.status === 'AGUARDANDO').length,
    EM_ATENDIMENTO: triagens.filter(t => t.status === 'EM_ATENDIMENTO').length,
    ALTA:           triagens.filter(t => t.status === 'ALTA').length,
  }

  return (
    <div className="painel-page">
      <PainelAlertas alertas={alertas} removerAlerta={removerAlerta} />

      {/* Navbar */}
      <nav className="painel-navbar">
        <div className="painel-navbar-logo">
          <span className="painel-navbar-logo-badge">+</span>
          <h1>TriagemIA</h1>
        </div>
        <div className="painel-navbar-info">
          <div className="painel-navbar-usuario">
            <div className="painel-navbar-avatar">
              {usuario?.nome?.charAt(0).toUpperCase()}
            </div>
            <span>{usuario?.nome?.split(' ')[0]}</span>
            <span className="painel-navbar-perfil">{usuario?.perfil}</span>
          </div>
          <button className="btn-nav btn-nav-primary" onClick={() => navigate('/relatorio')}>
            Relatório
          </button>
          <button className="btn-nav btn-nav-outline" onClick={carregarTriagens}>
            Atualizar
          </button>
          <button className="btn-nav btn-nav-ghost" onClick={sair}>Sair</button>
        </div>
      </nav>

      <div className="painel-content">

        {/* Contadores */}
        <div className="painel-contadores">
          <div className="contador aguardando">
            <span className="contador-numero">{contadores.AGUARDANDO}</span>
            <span className="contador-label">Aguardando</span>
          </div>
          <div className="contador em-atendimento">
            <span className="contador-numero">{contadores.EM_ATENDIMENTO}</span>
            <span className="contador-label">Em Atendimento</span>
          </div>
          <div className="contador alta">
            <span className="contador-numero">{contadores.ALTA}</span>
            <span className="contador-label">Alta</span>
          </div>
          <div className="contador total">
            <span className="contador-numero">{triagens.length}</span>
            <span className="contador-label">Total</span>
          </div>
        </div>

        {/* Filtros */}
        <div className="painel-filtros-wrapper">
          <div>
            <p className="filtros-label">Classificação</p>
            <div className="filtros-grupo">
              {['URGENTES', 'TODAS', 'VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL'].map(f => (
                <button key={f}
                  className={`btn-filtro ${filtro === f ? 'ativo' : ''} ${COR_CLASSE[f] || ''}`}
                  onClick={() => setFiltro(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="filtros-label">Status</p>
            <div className="filtros-grupo">
              {['TODOS', 'AGUARDANDO', 'EM_ATENDIMENTO', 'ALTA'].map(s => (
                <button key={s}
                  className={`btn-status-filtro ${filtroStatus === s ? 'ativo' : ''}`}
                  onClick={() => setFiltroStatus(s)}>
                  {s === 'TODOS' ? 'Todos' : STATUS_LABEL[s]}
                  {s !== 'TODOS' && (
                    <span className="contador-badge">{contadores[s] || 0}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards */}
        {carregando ? (
          <div className="carregando">Carregando triagens...</div>
        ) : triagensFiltradas.length === 0 ? (
          <div className="vazio">Nenhuma triagem encontrada.</div>
        ) : (
          <div className="triagens-lista">
            {triagensFiltradas.map(t => (
              <div key={t.id} className={`cartao ${COR_CLASSE[t.cor]} ${t.status === 'ALTA' ? 'cartao-alta' : ''}`}>
                <div className="cartao-header">
                  <span>{t.cor}</span>
                  <span className="cartao-tempo">
                    {t.tempoEspera === 0 ? 'IMEDIATO' : `${t.tempoEspera} min`}
                  </span>
                </div>
                <div className="cartao-corpo">
                  <div className="cartao-paciente">
                    <h3>{t.paciente?.nome}</h3>
                    <span>{t.paciente?.idade} anos</span>
                  </div>
                  <p><strong>Sintomas:</strong> {t.sintomas}</p>
                  <p><strong>Conduta:</strong> {t.condutaRecomendada}</p>
                  {t.pressaoSistolica && (
                    <div className="cartao-sinais">
                      {t.temperatura && <span>{t.temperatura}°C</span>}
                      <span>{t.pressaoSistolica}/{t.pressaoDiastolica} mmHg</span>
                      {t.saturacaoO2 && <span>O2: {t.saturacaoO2}%</span>}
                    </div>
                  )}
                  <p className="cartao-data">{new Date(t.dataTriagem).toLocaleString('pt-BR')}</p>
                  <div className="cartao-status-area">
                    <span className={`status-badge ${STATUS_CLASSE[t.status] || 'status-aguardando'}`}>
                      {STATUS_LABEL[t.status] || 'Aguardando'}
                    </span>
                    <div className="cartao-acoes">
                      {(!t.status || t.status === 'AGUARDANDO') && (
                        <button className="btn-acao btn-atender"
                          onClick={() => atualizarStatus(t.id, 'EM_ATENDIMENTO')}>
                          Iniciar Atendimento
                        </button>
                      )}
                      {t.status === 'EM_ATENDIMENTO' && (
                        <button className="btn-acao btn-alta"
                          onClick={() => atualizarStatus(t.id, 'ALTA')}>
                          Dar Alta
                        </button>
                      )}
                      {t.status === 'ALTA' && (
                        <span className="alta-confirmada">Alta confirmada</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PainelMedico