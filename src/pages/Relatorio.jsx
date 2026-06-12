import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Relatorio.css'

const CORES = ['VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL']

function Relatorio() {
  const navigate = useNavigate()
  const [triagens, setTriagens] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => { carregarDados() }, [])

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

  const total   = triagens.length
  const urgentes = triagens.filter(t => t.alertaUrgente).length
  const porStatus = {
    AGUARDANDO:     triagens.filter(t => !t.status || t.status === 'AGUARDANDO').length,
    EM_ATENDIMENTO: triagens.filter(t => t.status === 'EM_ATENDIMENTO').length,
    ALTA:           triagens.filter(t => t.status === 'ALTA').length,
  }

  const porCor = CORES.map(cor => ({
    cor,
    quantidade: triagens.filter(t => t.cor === cor).length,
    percentual: total > 0
      ? ((triagens.filter(t => t.cor === cor).length / total) * 100).toFixed(1)
      : 0
  }))

  return (
    <div className="relatorio-page">

      <nav className="relatorio-navbar">
        <div className="relatorio-navbar-logo">
          <span className="relatorio-navbar-logo-badge">+</span>
          <h1>TriagemIA — Relatório</h1>
        </div>
        <div className="relatorio-navbar-acoes">
          <button className="btn-imprimir" onClick={() => window.print()}>
            Imprimir
          </button>
          <button className="btn-voltar" onClick={() => navigate('/painel')}>
            ← Voltar ao Painel
          </button>
        </div>
      </nav>

      <div className="relatorio-content">
        {carregando ? (
          <div className="carregando">Carregando dados...</div>
        ) : (
          <>
            {/* Resumo */}
            <div className="relatorio-resumo">
              <div className="resumo-card total">
                <span className="resumo-numero">{total}</span>
                <span className="resumo-label">Total de Triagens</span>
              </div>
              <div className="resumo-card urgente">
                <span className="resumo-numero">{urgentes}</span>
                <span className="resumo-label">Casos Urgentes</span>
              </div>
              <div className="resumo-card alta">
                <span className="resumo-numero">{porStatus.ALTA}</span>
                <span className="resumo-label">Altas Dadas</span>
              </div>
              <div className="resumo-card aguardando">
                <span className="resumo-numero">{porStatus.AGUARDANDO}</span>
                <span className="resumo-label">Aguardando</span>
              </div>
            </div>

            {/* Distribuição por cor */}
            <div className="relatorio-secao">
              <div className="relatorio-secao-header">
                <h2>Distribuição por Classificação</h2>
              </div>
              <div className="relatorio-secao-body">
                <div className="distribuicao-lista">
                  {porCor.map(item => (
                    <div key={item.cor} className="distribuicao-item">
                      <div className="distribuicao-label">
                        <div className="distribuicao-cor">
                          <div className={`distribuicao-dot dot-${item.cor.toLowerCase()}`} />
                          {item.cor}
                        </div>
                        <span className="distribuicao-valor">
                          {item.quantidade} casos ({item.percentual}%)
                        </span>
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
            </div>

            {/* Status */}
            <div className="relatorio-secao">
              <div className="relatorio-secao-header">
                <h2>Status dos Atendimentos</h2>
              </div>
              <div className="relatorio-secao-body">
                <div className="status-grid">
                  <div className="status-card aguardando">
                    <span className="status-numero">{porStatus.AGUARDANDO}</span>
                    <span>Aguardando</span>
                  </div>
                  <div className="status-card atendimento">
                    <span className="status-numero">{porStatus.EM_ATENDIMENTO}</span>
                    <span>Em Atendimento</span>
                  </div>
                  <div className="status-card alta">
                    <span className="status-numero">{porStatus.ALTA}</span>
                    <span>Alta</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela */}
            <div className="relatorio-secao">
              <div className="relatorio-secao-header">
                <h2>Histórico Completo</h2>
              </div>
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
                      <td style={{color:'white', fontWeight:'500'}}>{t.paciente?.nome}</td>
                      <td>
                        <span className={`badge cor-${t.cor?.toLowerCase()}`}>
                          {t.cor}
                        </span>
                      </td>
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
    </div>
  )
}

export default Relatorio