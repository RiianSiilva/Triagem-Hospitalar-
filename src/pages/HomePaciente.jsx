import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../services/api'
import './HomePaciente.css'

const COR_EMOJI = {
  VERMELHO: '🔴', LARANJA: '🟠', AMARELO: '🟡', VERDE: '🟢', AZUL: '🔵'
}

const COR_CLASSE = {
  VERMELHO: 'cor-vermelho', LARANJA: 'cor-laranja',
  AMARELO: 'cor-amarelo', VERDE: 'cor-verde', AZUL: 'cor-azul'
}

function HomePaciente() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [avisoIA, setAvisoIA] = useState(true)

  useEffect(() => {
    const dados = localStorage.getItem('usuario')
    if (!dados) { navigate('/'); return }
    const user = JSON.parse(dados)
    if (user.perfil !== 'PACIENTE') { navigate('/painel'); return }
    setUsuario(user)
    carregarHistorico(user.cpf)
  }, [])

  async function carregarHistorico(cpf) {
    if (!cpf) return
    setCarregando(true)
    try {
      const { data } = await api.get(`/triagem/historico/${cpf}`)
      setHistorico(data)
    } catch (e) {
      console.error('Erro ao carregar histórico:', e)
    } finally {
      setCarregando(false)
    }
  }

  function sair() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/')
  }

  return (
    <div className="home-container">

      {/* Header */}
      <div className="home-header">
        <div>
          <h1>👋 Olá, {usuario?.nome?.split(' ')[0]}!</h1>
          <p>Bem-vindo ao sistema de triagem hospitalar</p>
        </div>
        <button className="btn-sair" onClick={sair}>Sair</button>
      </div>

      {/* Aviso de IA */}
      {avisoIA && (
        <div className="aviso-ia">
          <div className="aviso-ia-icone">🤖</div>
          <div className="aviso-ia-texto">
            <h3>⚠️ Aviso Importante</h3>
            <p>
              A triagem é realizada por uma <strong>Inteligência Artificial</strong> baseada
              no Protocolo de Manchester. Os resultados são uma <strong>orientação inicial</strong> e
              não substituem a avaliação de um profissional de saúde.
            </p>
            <button className="btn-fechar-aviso" onClick={() => setAvisoIA(false)}>
              Entendi ✓
            </button>
          </div>
        </div>
      )}

      {/* Botão principal */}
      <div className="home-card-triagem" onClick={() => navigate('/totem')}>
        <div className="card-triagem-icone">🏥</div>
        <div>
          <h2>Iniciar Triagem</h2>
          <p>Informe seus sintomas e receba sua classificação de urgência</p>
        </div>
        <span className="card-seta">→</span>
      </div>

      {/* Histórico */}
      <div className="home-historico">
        <h3>📋 Meu Histórico de Triagens</h3>

        {carregando ? (
          <p className="historico-vazio">Carregando...</p>
        ) : historico.length === 0 ? (
          <p className="historico-vazio">Nenhuma triagem realizada ainda.</p>
        ) : (
          <div className="historico-lista">
            {historico.map(t => (
              <div key={t.id} className="historico-item">
                <div className={`historico-cor ${COR_CLASSE[t.cor]}`}>
                  {COR_EMOJI[t.cor]} {t.cor}
                </div>
                <div className="historico-info">
                  <p><strong>{t.prioridade}</strong></p>
                  <p className="historico-sintomas">{t.sintomas}</p>
                  <p className="historico-data">
                    {new Date(t.dataTriagem).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="historico-tempo">
                  {t.tempoEspera === 0 ? 'Imediato' : `${t.tempoEspera} min`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Protocolo */}
      <div className="home-protocolo">
        <h3>📊 Classificações de Urgência</h3>
        <div className="protocolo-lista">
          {[
            { cor: 'vermelho', emoji: '🔴', label: 'Vermelho', desc: 'Emergência — Atendimento imediato' },
            { cor: 'laranja',  emoji: '🟠', label: 'Laranja',  desc: 'Muito urgente — até 10 minutos' },
            { cor: 'amarelo',  emoji: '🟡', label: 'Amarelo',  desc: 'Urgente — até 60 minutos' },
            { cor: 'verde',    emoji: '🟢', label: 'Verde',    desc: 'Pouco urgente — até 120 minutos' },
            { cor: 'azul',     emoji: '🔵', label: 'Azul',     desc: 'Não urgente — até 240 minutos' },
          ].map(item => (
            <div key={item.cor} className={`protocolo-item ${item.cor}`}>
              <span>{item.emoji} {item.label}</span>
              <span>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé */}
      <div className="home-rodape">
        <p>🤖 Powered by IA — Llama 3.3 70B via Groq</p>
        <p>Os resultados da triagem são salvos automaticamente</p>
      </div>

    </div>
  )
}

export default HomePaciente