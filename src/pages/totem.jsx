import { useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import './Totem.css'

const SINTOMAS_DISPONIVEIS = [
  'Dor no peito', 'Falta de ar', 'Febre', 'Dor de cabeça',
  'Náusea', 'Vômito', 'Dor abdominal', 'Tontura',
  'Desmaio', 'Convulsão', 'Sangramento', 'Trauma/Queda',
  'Dor nas costas', 'Dificuldade para falar', 'Fraqueza',
]

const NIVEIS_DOR = ['leve', 'moderada', 'intensa', 'insuportável']

const COR_CLASSE = {
  VERMELHO: 'cor-vermelho', LARANJA: 'cor-laranja',
  AMARELO: 'cor-amarelo', VERDE: 'cor-verde', AZUL: 'cor-azul'
}

function StepIndicator({ etapa }) {
  return (
    <div className="totem-topbar-steps">
      {[1, 2, 3].map((n, i) => (
        <>
          <div key={n} className={`totem-step ${etapa === n ? 'ativo' : etapa > n ? 'completo' : ''}`}>
            {etapa > n ? '✓' : n}
          </div>
          {i < 2 && <div className="totem-step-linha" />}
        </>
      ))}
    </div>
  )
}

function Totem() {
  const navigate = useNavigate()
  const [etapa, setEtapa] = useState(1)
  const [carregando, setCarregando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState(null)

  const [form, setForm] = useState({
    idade: '', nivelDor: 'leve',
    temperatura: '', pressaoSistolica: '', pressaoDiastolica: '',
    saturacaoO2: '', observacoes: '', sintomas: [],
  })

  function toggleSintoma(sintoma) {
    setForm(prev => ({
      ...prev,
      sintomas: prev.sintomas.includes(sintoma)
        ? prev.sintomas.filter(s => s !== sintoma)
        : [...prev.sintomas, sintoma]
    }))
  }

  async function enviarTriagem() {
    setCarregando(true)
    setErro(null)
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario'))
      const payload = {
        ...form,
        nomePaciente: usuario.nome,
        cpf: usuario.cpf,
        idade: parseInt(form.idade),
        temperatura: form.temperatura ? parseFloat(form.temperatura) : null,
        pressaoSistolica: form.pressaoSistolica ? parseInt(form.pressaoSistolica) : null,
        pressaoDiastolica: form.pressaoDiastolica ? parseInt(form.pressaoDiastolica) : null,
        saturacaoO2: form.saturacaoO2 ? parseInt(form.saturacaoO2) : null,
      }
      const { data } = await api.post('/triagem', payload)
      setResultado(data)
      setEtapa(3)
    } catch (e) {
      setErro('Erro ao realizar triagem. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  function reiniciar() {
    setEtapa(1); setResultado(null); setErro(null)
    setForm({ idade: '', nivelDor: 'leve', temperatura: '', pressaoSistolica: '',
      pressaoDiastolica: '', saturacaoO2: '', observacoes: '', sintomas: [] })
  }

  return (
    <div className="totem-page">
      <div className="totem-topbar">
        <div className="totem-topbar-logo">
          <span>+</span> TriagemIA
        </div>
        <StepIndicator etapa={etapa} />
        <div style={{width: '80px'}} />
      </div>

      <div className="totem-container">

        {/* ETAPA 1 */}
        {etapa === 1 && (
          <div className="totem-card">
            <div className="totem-card-header">
              <h1>Dados Clínicos</h1>
              <p>Informe seus sinais vitais para iniciar a triagem</p>
            </div>
            <div className="totem-form">
              <div className="campo">
                <label>Idade</label>
                <input type="number" placeholder="Ex: 35"
                  value={form.idade}
                  onChange={e => setForm({...form, idade: e.target.value})} />
              </div>
              <div className="campo-linha">
                <div className="campo">
                  <label>Pressão Sistólica</label>
                  <input type="number" placeholder="Ex: 120"
                    value={form.pressaoSistolica}
                    onChange={e => setForm({...form, pressaoSistolica: e.target.value})} />
                </div>
                <div className="campo">
                  <label>Pressão Diastólica</label>
                  <input type="number" placeholder="Ex: 80"
                    value={form.pressaoDiastolica}
                    onChange={e => setForm({...form, pressaoDiastolica: e.target.value})} />
                </div>
              </div>
              <div className="campo-linha">
                <div className="campo">
                  <label>Temperatura (°C)</label>
                  <input type="number" placeholder="Ex: 37.5"
                    value={form.temperatura}
                    onChange={e => setForm({...form, temperatura: e.target.value})} />
                </div>
                <div className="campo">
                  <label>Saturação O2 (%)</label>
                  <input type="number" placeholder="Ex: 98"
                    value={form.saturacaoO2}
                    onChange={e => setForm({...form, saturacaoO2: e.target.value})} />
                </div>
              </div>
              <button className="btn-primario"
                onClick={() => setEtapa(2)}
                disabled={!form.idade}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 2 */}
        {etapa === 2 && (
          <div className="totem-card">
            <div className="totem-card-header">
              <h1>Sintomas</h1>
              <p>Selecione todos os sintomas que você está sentindo</p>
            </div>
            <div className="totem-form">
              <div className="sintomas-grid">
                {SINTOMAS_DISPONIVEIS.map(sintoma => (
                  <button key={sintoma}
                    className={`btn-sintoma ${form.sintomas.includes(sintoma) ? 'selecionado' : ''}`}
                    onClick={() => toggleSintoma(sintoma)}>
                    {sintoma}
                  </button>
                ))}
              </div>

              <div className="campo" style={{marginTop: '1.5rem'}}>
                <label>Nível de dor</label>
                <div className="dor-opcoes">
                  {NIVEIS_DOR.map(nivel => (
                    <button key={nivel}
                      className={`btn-dor ${form.nivelDor === nivel ? 'selecionado' : ''}`}
                      onClick={() => setForm({...form, nivelDor: nivel})}>
                      {nivel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="campo">
                <label>Observações adicionais</label>
                <textarea placeholder="Descreva mais detalhes se quiser..."
                  value={form.observacoes}
                  onChange={e => setForm({...form, observacoes: e.target.value})}
                  rows={3} />
              </div>

              {erro && <p className="erro">{erro}</p>}

              <div className="botoes-linha">
                <button className="btn-secundario" onClick={() => setEtapa(1)}>← Voltar</button>
                <button className="btn-primario"
                  onClick={enviarTriagem}
                  disabled={form.sintomas.length === 0 || carregando}>
                  {carregando ? 'Analisando...' : 'Enviar para Triagem'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 3 — Resultado */}
        {etapa === 3 && resultado && (
          <div className="totem-card">
            <div className={`resultado-header ${COR_CLASSE[resultado.cor]}`}>
              <h1>Classificação: {resultado.cor}</h1>
              <h2>{resultado.prioridade}</h2>
              <p>{resultado.tempoEspera === 0 ? 'Atendimento imediato' : `Aguarde até ${resultado.tempoEspera} minutos`}</p>
            </div>

            <div className="resultado-corpo">
              <div className="resultado-secao">
                <h3>Justificativa Clínica</h3>
                <p>{resultado.justificativa}</p>
              </div>
              <div className="resultado-secao">
                <h3>Conduta Recomendada</h3>
                <p>{resultado.condutaRecomendada}</p>
              </div>
              {resultado.alertaUrgente && (
                <div className="alerta-urgente">
                  Equipe médica foi notificada sobre sua situação
                </div>
              )}
              <div className="botoes-linha">
                <button className="btn-secundario" onClick={() => navigate('/home')}>
                  Voltar ao início
                </button>
                <button className="btn-primario" onClick={reiniciar}>
                  Nova Triagem
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Totem