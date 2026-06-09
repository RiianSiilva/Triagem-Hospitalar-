import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../services/api'
import './HomePaciente.css'

const COR_EMOJI = {
  VERMELHO: '🔴', LARANJA: '🟠', AMARELO: '🟡', VERDE: '🟢', AZUL: '🔵'
}

function HomePaciente() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [historico, setHistorico] = useState([])
  const [avisoIA, setAvisoIA] = useState(true)

  useEffect(() => {
    const dados = localStorage.getItem('usuario')
    if (!dados) { navigate('/'); return }
    const user = JSON.parse(dados)
    if (user.perfil !== 'PACIENTE') { navigate('/painel'); return }
    setUsuario(user)
  }, [])

  function sair() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/')
  }

  function irParaTriagem() {
    setAvisoIA(false)
    navigate('/totem')
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
              A triagem a seguir é realizada por uma <strong>Inteligência Artificial</strong> baseada
              no Protocolo de Manchester. Os resultados são uma <strong>orientação inicial</strong> e
              não substituem a avaliação presencial de um profissional de saúde.
              Um médico ou enfermeira irá confirmar sua classificação.
            </p>
          </div>
        </div>
      )}

      {/* Botão principal */}
      <div className="home-card-triagem" onClick={irParaTriagem}>
        <div className="card-triagem-icone">🏥</div>
        <div>
          <h2>Iniciar Triagem</h2>
          <p>Informe seus sintomas e receba sua classificação de urgência</p>
        </div>
        <span className="card-seta">→</span>
      </div>

      {/* Informações do protocolo */}
      <div className="home-protocolo">
        <h3>📋 Classificações de Urgência</h3>
        <div className="protocolo-lista">
          <div className="protocolo-item vermelho">
            <span>🔴 Vermelho</span>
            <span>Emergência — Atendimento imediato</span>
          </div>
          <div className="protocolo-item laranja">
            <span>🟠 Laranja</span>
            <span>Muito urgente — até 10 minutos</span>
          </div>
          <div className="protocolo-item amarelo">
            <span>🟡 Amarelo</span>
            <span>Urgente — até 60 minutos</span>
          </div>
          <div className="protocolo-item verde">
            <span>🟢 Verde</span>
            <span>Pouco urgente — até 120 minutos</span>
          </div>
          <div className="protocolo-item azul">
            <span>🔵 Azul</span>
            <span>Não urgente — até 240 minutos</span>
          </div>
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