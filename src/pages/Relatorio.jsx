import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Relatorio.css'

const COR_EMOJI = {
  VERMELHO: '🔴', LARANJA: '🟠', AMARELO: '🟡', VERDE: '🟢', AZUL: '🔵'
}

function Relatorio() {
  const navigate = useNavigate()
  const [triagens, setTriagens] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)
    try {
      const { data } = await api.get('/triagem/todas')
      setTriagens(data)
    } catch (e) {
      console.error(e)
    } finally {
      setCarregando(false)
    }
  }

  // Estatísticas
  const total = triagens.length
  const porCor = ['VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL'].map(cor => ({
    cor,
    quantidade: triagens.filter(t => t.cor === cor).length,
    percentual: total > 0 ? ((triagens.filter(t => t.cor === cor).length / total) * 100).toFixed(1) : 0
  }))

  const porStatus = {
    AGUARDANDO:     triagens.filter(t => t.status === 'AGUARDANDO').length,
    EM_ATENDIMENTO: triagens.filter(t => t.status === 'EM_ATENDIMENTO').length,
    ALTA:           triagens.filter(t => t.status === 'ALTA').length,
  }

  const urgentes = triagens.filter(t => t.alertaUrgente).length

  return (
    <div className="relatorio-container">

      <div className="relatorio-header">
        <div>
          <h1>📊 Relatório de Triagens</h1>
          <p>Visão geral do sistema</p>
        </div>
        <div className="relatorio-acoes">
          <button className="btn-imprimir" onClick={() => window.print()}>
            🖨️ Imprimir
          </button>
          <button className="btn-voltar" onClick={() => navigate('/painel')}>
            ← Voltar
          </button>
        </div>
      </div>

      {carregando ? <p className="carregando">Carregando...</p> : (
        <>
          {/* Cards de resumo */}
          <div className="relatorio-resumo">
            <div className="resumo-card azul-escuro">
              <span className="resumo-numero">{total}</span>
              <span className="resumo-label">Total de Triagens</span>
            </div>
            <div className="resumo-card vermelho">
              <span className="resumo-numero">{urgentes}</span>
              <span className="resumo-label">Casos Urgentes</span>
            </div>
            <div className="resumo-card verde">
              <span className="resumo-numero">{porStatus.ALTA}</span>
              <span className="resumo-label">Altas Dadas</span>
            </div>
            <div className="resumo-card amarelo">
              <span className="resumo-numero">{porStatus.AGUARDANDO}</span>
              <span className="resumo-label">Aguardando</span>
            </div>
          </div>

          {/* Distribuição por cor */}
          <div className="relatorio-secao">
            <h2>📋 Distribuição por Classificação</h2>
            <div className="distribuicao-lista">
              {porCor.map(item => (
                <div key={item.cor} className="distribuicao-item">
                  <div className="distribuicao-label">
                    <span>{COR_EMOJI[item.cor]} {item.cor}</span>
                    <span>{item.quantidade} casos ({item.percentual}%)</span>
                  </div>
                  <div className="distribuicao-barra-bg">
                    <div
                      className={`distribuicao-barra barra-${item.cor.toLowerCase()}`}
                      style={{ width: `${item.percentual}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="relatorio-secao">
            <h2>🩺 Status dos Atendimentos</h2>
            <div className="status-grid">
              <div className="status-card aguardando">
                <span className="status-numero">{porStatus.AGUARDANDO}</span>
                <span>⏳ Aguardando</span>
              </div>
              <div className="status-card atendimento">
                <span className="status-numero">{porStatus.EM_ATENDIMENTO}</span>
                <span>🩺 Em Atendimento</span>
              </div>
              <div className="status-card alta">
                <span className="status-numero">{porStatus.ALTA}</span>
                <span>✅ Alta</span>
              </div>
            </div>
          </div>

          {/* Tabela completa */}
          <div className="relatorio-secao">
            <h2>📄 Histórico Completo</h2>
            <table className="relatorio-tabela">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Paciente</th>
                  <th>Classificação</th>
                  <th>Sintomas</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {triagens.map(t => (
                  <tr key={t.id}>
                    <td>{new Date(t.dataTriagem).toLocaleString('pt-BR')}</td>
                    <td>{t.paciente?.nome}</td>
                    <td>{COR_EMOJI[t.cor]} {t.cor}</td>
                    <td className="td-sintomas">{t.sintomas}</td>
                    <td>{t.status || 'AGUARDANDO'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default Relatorio