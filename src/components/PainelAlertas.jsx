import './PainelAlertas.css'

function PainelAlertas({ alertas, removerAlerta }) {
  if (alertas.length === 0) return null

  return (
    <div className="painel-alertas">
      {alertas.map((alerta, index) => (
        <div key={index} className={`alerta-card alerta-${alerta.cor.toLowerCase()}`}>
          <div className="alerta-conteudo">
            <div className="alerta-icone">
              {alerta.cor === 'VERMELHO' ? '🔴' : '🟠'}
            </div>
            <div className="alerta-info">
              <strong>🚨 NOVA TRIAGEM {alerta.cor}</strong>
              <p>{alerta.nomePaciente}</p>
              <p className="alerta-sintomas">{alerta.sintomas}</p>
            </div>
          </div>
          <button className="alerta-fechar" onClick={() => removerAlerta(index)}>✕</button>
        </div>
      ))}
    </div>
  )
}

export default PainelAlertas