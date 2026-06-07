import { useState } from 'react'
import api from '../services/api'
import './Totem.css'

const SINTOMAS_DISPONIVEIS = [
  'Dor no peito', 'Falta de ar', 'Febre', 'Dor de cabeça',
  'Náusea', 'Vômito', 'Dor abdominal', 'Tontura',
  'Desmaio', 'Convulsão', 'Sangramento', 'Trauma/Queda',
  'Dor nas costas', 'Dificuldade para falar', 'Fraqueza',
]

const NIVEIS_DOR = ['leve', 'moderada', 'intensa', 'insuportável']

function Totem() {
  const [etapa, setEtapa] = useState(1) // 1=dados, 2=sintomas, 3=resultado
  const [carregando, setCarregando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState(null)

  const [form, setForm] = useState({
    nomePaciente: '',
    cpf: '',
    idade: '',
    nivelDor: 'leve',
    temperatura: '',
    pressaoSistolica: '',
    pressaoDiastolica: '',
    saturacaoO2: '',
    observacoes: '',
    sintomas: [],
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
      const payload = {
        ...form,
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
    setEtapa(1)
    setResultado(null)
    setErro(null)
    setForm({
      nomePaciente: '', cpf: '', idade: '', nivelDor: 'leve',
      temperatura: '', pressaoSistolica: '', pressaoDiastolica: '',
      saturacaoO2: '', observacoes: '', sintomas: [],
    })
  }

  // ETAPA 1 — Dados pessoais
  if (etapa === 1) return (
    <div className="totem-container">
      <div className="totem-card">
        <div className="totem-header">
          <h1>🏥 Triagem Hospitalar</h1>
          <p>Preencha seus dados para iniciar</p>
        </div>

        <div className="totem-form">
          <div className="campo">
            <label>Nome completo</label>
            <input
              type="text"
              placeholder="Digite seu nome"
              value={form.nomePaciente}
              onChange={e => setForm({...form, nomePaciente: e.target.value})}
            />
          </div>

          <div className="campo">
            <label>CPF</label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={e => setForm({...form, cpf: e.target.value})}
            />
          </div>

          <div className="campo">
            <label>Idade</label>
            <input
              type="number"
              placeholder="Digite sua idade"
              value={form.idade}
              onChange={e => setForm({...form, idade: e.target.value})}
            />
          </div>

          <div className="campo-linha">
            <div className="campo">
              <label>Pressão Sistólica</label>
              <input
                type="number" placeholder="ex: 120"
                value={form.pressaoSistolica}
                onChange={e => setForm({...form, pressaoSistolica: e.target.value})}
              />
            </div>
            <div className="campo">
              <label>Pressão Diastólica</label>
              <input
                type="number" placeholder="ex: 80"
                value={form.pressaoDiastolica}
                onChange={e => setForm({...form, pressaoDiastolica: e.target.value})}
              />
            </div>
          </div>

          <div className="campo-linha">
            <div className="campo">
              <label>Temperatura (°C)</label>
              <input
                type="number" placeholder="ex: 37.5"
                value={form.temperatura}
                onChange={e => setForm({...form, temperatura: e.target.value})}
              />
            </div>
            <div className="campo">
              <label>Saturação O2 (%)</label>
              <input
                type="number" placeholder="ex: 98"
                value={form.saturacaoO2}
                onChange={e => setForm({...form, saturacaoO2: e.target.value})}
              />
            </div>
          </div>

          <button
            className="btn-primario"
            onClick={() => setEtapa(2)}
            disabled={!form.nomePaciente || !form.cpf || !form.idade}
          >
            Próximo →
          </button>
        </div>
      </div>
    </div>
  )

  // ETAPA 2 — Sintomas
  if (etapa === 2) return (
    <div className="totem-container">
      <div className="totem-card">
        <div className="totem-header">
          <h1>🩺 Seus Sintomas</h1>
          <p>Selecione todos que se aplicam</p>
        </div>

        <div className="sintomas-grid">
          {SINTOMAS_DISPONIVEIS.map(sintoma => (
            <button
              key={sintoma}
              className={`btn-sintoma ${form.sintomas.includes(sintoma) ? 'selecionado' : ''}`}
              onClick={() => toggleSintoma(sintoma)}
            >
              {sintoma}
            </button>
          ))}
        </div>

        <div className="campo" style={{marginTop: '1.5rem'}}>
          <label>Nível de dor</label>
          <div className="dor-opcoes">
            {NIVEIS_DOR.map(nivel => (
              <button
                key={nivel}
                className={`btn-dor ${form.nivelDor === nivel ? 'selecionado' : ''}`}
                onClick={() => setForm({...form, nivelDor: nivel})}
              >
                {nivel}
              </button>
            ))}
          </div>
        </div>

        <div className="campo">
          <label>Observações adicionais</label>
          <textarea
            placeholder="Descreva mais detalhes se quiser..."
            value={form.observacoes}
            onChange={e => setForm({...form, observacoes: e.target.value})}
            rows={3}
          />
        </div>

        {erro && <p className="erro">{erro}</p>}

        <div className="botoes-linha">
          <button className="btn-secundario" onClick={() => setEtapa(1)}>← Voltar</button>
          <button
            className="btn-primario"
            onClick={enviarTriagem}
            disabled={form.sintomas.length === 0 || carregando}
          >
            {carregando ? 'Analisando...' : 'Enviar para Triagem'}
          </button>
        </div>
      </div>
    </div>
  )

  // ETAPA 3 — Resultado
  if (etapa === 3 && resultado) return (
    <div className="totem-container">
      <div className="totem-card">
        <div className={`resultado-header cor-${resultado.cor.toLowerCase()}`}>
          <h1>Classificação: {resultado.cor}</h1>
          <h2>{resultado.prioridade}</h2>
          <p>Tempo de espera: {resultado.tempoEspera === 0 ? 'Atendimento imediato' : `até ${resultado.tempoEspera} minutos`}</p>
        </div>

        <div className="resultado-corpo">
          <div className="resultado-secao">
            <h3>📋 Justificativa</h3>
            <p>{resultado.justificativa}</p>
          </div>

          <div className="resultado-secao">
            <h3>🏥 Conduta Recomendada</h3>
            <p>{resultado.condutaRecomendada}</p>
          </div>

          {resultado.alertaUrgente && (
            <div className="alerta-urgente">
              ⚠️ Equipe médica foi notificada sobre sua situação
            </div>
          )}
        </div>

        <button className="btn-secundario" onClick={reiniciar}>
          Nova Triagem
        </button>
      </div>
    </div>
  )
}

export default Totem