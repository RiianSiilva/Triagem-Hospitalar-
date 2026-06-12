import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../services/api'
import './HomePaciente.css'

const COR_EMOJI = { VERMELHO: '🔴', LARANJA: '🟠', AMARELO: '🟡', VERDE: '🟢', AZUL: '🔵' }
const COR_CLASSE = { VERMELHO: 'cor-vermelho', LARANJA: 'cor-laranja', AMARELO: 'cor-amarelo', VERDE: 'cor-verde', AZUL: 'cor-azul' }

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
    if (user.cpf) carregarHistorico(user.cpf)
  }, [])

  async function carregarHistorico(cpf) {
    setCarregando(true)
    try {
      const { data } = await api.get(`/triagem/historico/${cpf}`)
      setHistorico(data)
    } catch (e) {
      console.error(e)
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
    <div className="home-page">

      {/* Navbar */}
      <nav className="home-navbar">
        <div className="home-navbar-logo">
          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white' }}>+</span>
          <h1>TriagemIA</h1>
        </div>
        <div className="home-navbar-acoes">
          <div className="home-navbar-usuario">
            <div className="home-navbar-avatar">
              {usuario?.nome?.charAt(0).toUpperCase()}
            </div>
            <span>{usuario?.nome?.split(' ')[0]}</span>
          </div>
          <button className="btn-nav btn-nav-outline" onClick={() => navigate('/perfil')}>
            👤 Perfil
          </button>
          <button className="btn-nav btn-nav-ghost" onClick={sair}>
            Sair
          </button>
        </div>
      </nav>

      <div className="home-content">

        {/* Aviso IA */}
        {avisoIA && (
          <div className="aviso-ia">

            <div className="aviso-ia-texto">
              <h3>Aviso sobre Inteligência Artificial</h3>
              <p>A triagem é realizada por uma <strong>IA baseada no Protocolo de Manchester</strong>. Os resultados são uma orientação inicial e não substituem a avaliação de um profissional de saúde.</p>
              <button className="btn-fechar-aviso" onClick={() => setAvisoIA(false)}>
                Entendi ✓
              </button>
            </div>
          </div>
        )}

        {/* Botão principal */}
        <div className="home-card-triagem" onClick={() => navigate('/totem')}>
          <div className="card-triagem-icone" style={{ fontSize: '1rem', fontWeight: '700' }}>IA</div>
          <div>
            <h2>Iniciar Triagem</h2>
            <p>Informe seus sintomas e receba sua classificação de urgência</p>
          </div>
          <span className="card-seta">→</span>
        </div>

        {/* Histórico */}
        <div className="home-secao">
          <p className="home-secao-titulo"> Meu Histórico de Triagens</p>
          {carregando ? (
            <p className="historico-vazio">Carregando...</p>
          ) : historico.length === 0 ? (
            <p className="historico-vazio">Nenhuma triagem realizada ainda.</p>
          ) : (
            <div className="historico-lista">
              {historico.map(t => (
                <div key={t.id} className="historico-item">
                  <div className={`historico-cor badge ${COR_CLASSE[t.cor]}`}>
                    {COR_EMOJI[t.cor]} {t.cor}
                  </div>
                  <div className="historico-info">
                    <p>{t.prioridade}</p>
                    <p className="historico-sintomas">{t.sintomas}</p>
                    <p className="historico-data">{new Date(t.dataTriagem).toLocaleString('pt-BR')}</p>
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
        <div className="home-secao">
          <p className="home-secao-titulo"> Classificações de Urgência</p>
          <div className="protocolo-lista">
            {[
              { cor: 'vermelho', label: 'Vermelho', desc: 'Emergência — Atendimento imediato' },
              { cor: 'laranja', label: 'Laranja', desc: 'Muito urgente — até 10 minutos' },
              { cor: 'amarelo', label: 'Amarelo', desc: 'Urgente — até 60 minutos' },
              { cor: 'verde', label: 'Verde', desc: 'Pouco urgente — até 120 minutos' },
              { cor: 'azul', label: 'Azul', desc: 'Não urgente — até 240 minutos' },
            ].map(item => (
              <div key={item.cor} className={`protocolo-item ${item.cor}`}>
                <span>{item.emoji} {item.label}</span>
                <span>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="home-rodape">
          <p>Powered by Llama 3.3 70B via Groq</p>
          <p>Triagens salvas automaticamente com segurança</p>
        </div>

      </div>
    </div>
  )
}

export default HomePaciente