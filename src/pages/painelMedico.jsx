import { useState, useEffect } from 'react'
import api from '../services/api'
import './PainelMedico.css'

const COR_CLASSE = {
  VERMELHO: 'cor-vermelho',
  LARANJA:  'cor-laranja',
  AMARELO:  'cor-amarelo',
  VERDE:    'cor-verde',
  AZUL:     'cor-azul',
}

const COR_EMOJI = {
  VERMELHO: '🔴',
  LARANJA:  '🟠',
  AMARELO:  '🟡',
  VERDE:    '🟢',
  AZUL:     '🔵',
}

function PainelMedico() {
  const [triagens, setTriagens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState('TODAS')

  async function carregarTriagens() {
    setCarregando(true)
    try {
      const url = filtro === 'URGENTES'
        ? '/triagem/urgentes'
        : filtro === 'TODAS'
        ? '/triagem/pacientes'
        : `/triagem/cor/${filtro}`

      if (filtro === 'TODAS') {
        const { data } = await api.get('/triagem/urgentes')
        setTriagens(data)
      } else if (filtro === 'URGENTES') {
        const { data } = await api.get('/triagem/urgentes')
        setTriagens(data)
      } else {
        const { data } = await api.get(`/triagem/cor/${filtro}`)
        setTriagens(data)
      }
    } catch (e) {
      console.error('Erro ao carregar triagens:', e)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarTriagens()
    // Atualiza automaticamente a cada 30 segundos
    const interval = setInterval(carregarTriagens, 30000)
    return () => clearInterval(interval)
  }, [filtro])

  return (
    <div className="painel-container">
      <div className="painel-header">
        <h1>🏥 Painel de Triagem</h1>
        <button className="btn-atualizar" onClick={carregarTriagens}>
          🔄 Atualizar
        </button>
      </div>

      <div className="filtros">
        {['URGENTES', 'VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL'].map(f => (
          <button
            key={f}
            className={`btn-filtro ${filtro === f ? 'ativo' : ''} ${COR_CLASSE[f] || ''}`}
            onClick={() => setFiltro(f)}
          >
            {COR_EMOJI[f] || '⚠️'} {f}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="carregando">Carregando...</div>
      ) : triagens.length === 0 ? (
        <div className="vazio">Nenhuma triagem encontrada.</div>
      ) : (
        <div className="triagens-lista">
          {triagens.map(t => (
            <div key={t.id} className={`cartao ${COR_CLASSE[t.cor]}`}>
              <div className="cartao-header">
                <span className="cartao-cor">{COR_EMOJI[t.cor]} {t.cor}</span>
                <span className="cartao-tempo">
                  {t.tempoEspera === 0 ? 'IMEDIATO' : `${t.tempoEspera} min`}
                </span>
              </div>
              <div className="cartao-corpo">
                <h3>{t.paciente?.nome} — {t.paciente?.idade} anos</h3>
                <p><strong>Sintomas:</strong> {t.sintomas}</p>
                <p><strong>Conduta:</strong> {t.condutaRecomendada}</p>
                <p className="cartao-data">
                  {new Date(t.dataTriagem).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PainelMedico