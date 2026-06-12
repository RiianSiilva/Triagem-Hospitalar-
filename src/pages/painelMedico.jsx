import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './PainelMedico.css'
import { useAlertas } from '../hooks/useAlertas'
import PainelAlertas from '../components/PainelAlertas'

const COR_CLASSE = {
  VERMELHO: 'cor-vermelho', LARANJA: 'cor-laranja',
  AMARELO:  'cor-amarelo',  VERDE:   'cor-verde', AZUL: 'cor-azul'
}

const COR_EMOJI = {
  VERMELHO: '🔴', LARANJA: '🟠', AMARELO: '🟡', VERDE: '🟢', AZUL: '🔵'
}

const STATUS_CLASSE = {
  AGUARDANDO:      'status-aguardando',
  EM_ATENDIMENTO:  'status-em-atendimento',
  ALTA:            'status-alta'
}

const STATUS_LABEL = {
  AGUARDANDO:     '⏳ Aguardando',
  EM_ATENDIMENTO: '🩺 Em Atendimento',
  ALTA:           '✅ Alta'
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
      console.error('Erro ao carregar triagens:', e)
    } finally {
      setCarregando(false)
    }
  }

  async function atualizarStatus(id, status) {
    try {
      await api.put(`/triagem/${id}/status?status=${status}`)
      carregarTriagens()
    } catch (e) {
      console.error('Erro ao atualizar status:', e)
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
    <div className="painel-container">
      <PainelAlertas alertas={alertas} removerAlerta={removerAlerta} />

      {/* Header */}
      <div className="painel-header">
        <div>
          <h1>🏥 Painel de Triagem</h1>
          <p>Olá, {usuario?.nome} — {usuario?.perfil}</p>
        </div>
        <div className="painel-header-acoes">
          <button className="btn-atualizar" onClick={carregarTriagens}>🔄 Atualizar</button>
          <button className="btn-sair" onClick={sair}>Sair</button>
          <button className="btn-relatorio" onClick={() => navigate('/relatorio')}>📊 Relatório</button>
        </div>
      </div>

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

      {/* Filtros de cor */}
      <div className="filtros">
        {['URGENTES', 'TODAS', 'VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL'].map(f => (
          <button
            key={f}
            className={`btn-filtro ${filtro === f ? 'ativo' : ''} ${COR_CLASSE[f] || ''}`}
            onClick={() => setFiltro(f)}
          >
            {COR_EMOJI[f] || (f === 'URGENTES' ? '⚠️' : '📋')} {f}
          </button>
        ))}
      </div>

      {/* Filtros de status */}
      <div className="filtros-status">
        {['TODOS', 'AGUARDANDO', 'EM_ATENDIMENTO', 'ALTA'].map(s => (
          <button
            key={s}
            className={`btn-status-filtro ${filtroStatus === s ? 'ativo' : ''}`}
            onClick={() => setFiltroStatus(s)}
          >
            {s === 'TODOS' ? 'Todos' : STATUS_LABEL[s]}
            {s !== 'TODOS' && (
              <span className="contador-badge">{contadores[s] || 0}</span>
            )}
          </button>
        ))}
      </div>

      {/* Lista de triagens */}
      {carregando ? (
        <div className="carregando">Carregando...</div>
      ) : triagensFiltradas.length === 0 ? (
        <div className="vazio">Nenhuma triagem encontrada.</div>
      ) : (
        <div className="triagens-lista">
          {triagensFiltradas.map(t => (
            <div key={t.id} className={`cartao ${COR_CLASSE[t.cor]} ${t.status === 'ALTA' ? 'cartao-alta' : ''}`}>
              <div className="cartao-header">
                <span>{COR_EMOJI[t.cor]} {t.cor}</span>
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
                    {t.temperatura && <span>🌡️ {t.temperatura}°C</span>}
                    <span>💉 {t.pressaoSistolica}/{t.pressaoDiastolica} mmHg</span>
                    {t.saturacaoO2 && <span>🫁 O2: {t.saturacaoO2}%</span>}
                  </div>
                )}

                <p className="cartao-data">
                  {new Date(t.dataTriagem).toLocaleString('pt-BR')}
                </p>

                {/* Status e ações */}
                <div className="cartao-status-area">
                  <span className={`status-badge ${STATUS_CLASSE[t.status] || 'status-aguardando'}`}>
                    {STATUS_LABEL[t.status] || '⏳ Aguardando'}
                  </span>

                  <div className="cartao-acoes">
                    {t.status !== 'EM_ATENDIMENTO' && t.status !== 'ALTA' && (
                      <button
                        className="btn-acao btn-atender"
                        onClick={() => atualizarStatus(t.id, 'EM_ATENDIMENTO')}
                      >
                        🩺 Iniciar Atendimento
                      </button>
                    )}
                    {t.status === 'EM_ATENDIMENTO' && (
                      <button
                        className="btn-acao btn-alta"
                        onClick={() => atualizarStatus(t.id, 'ALTA')}
                      >
                        ✅ Dar Alta
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
  )
}

export default PainelMedico