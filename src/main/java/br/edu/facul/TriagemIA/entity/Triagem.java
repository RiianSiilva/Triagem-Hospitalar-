package br.edu.facul.TriagemIA.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "triagens")
public class Triagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    private String cor;
    private String prioridade;

    @Column(length = 1000)
    private String justificativa;

    @Column(name = "conduta_recomendada", length = 1000)
    private String condutaRecomendada;

    @Column(name = "alerta_urgente")
    private boolean alertaUrgente;

    @Column(name = "tempo_espera")
    private int tempoEspera;

    @Column(name = "sintomas", length = 500)
    private String sintomas;

    @Column(name = "nivel_dor")
    private String nivelDor;

    private Double temperatura;

    @Column(name = "pressao_sistolica")
    private Integer pressaoSistolica;

    @Column(name = "pressao_diastolica")
    private Integer pressaoDiastolica;

    @Column(name = "saturacao_o2")
    private Integer saturacaoO2;

    @Column(name = "data_triagem")
    private LocalDateTime dataTriagem;

    @PrePersist
    public void prePersist() {
        this.dataTriagem = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public String getCor() {
        return cor;
    }

    public void setCor(String cor) {
        this.cor = cor;
    }

    public String getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(String prioridade) {
        this.prioridade = prioridade;
    }

    public String getJustificativa() {
        return justificativa;
    }

    public void setJustificativa(String justificativa) {
        this.justificativa = justificativa;
    }

    public String getCondutaRecomendada() {
        return condutaRecomendada;
    }

    public void setCondutaRecomendada(String condutaRecomendada) {
        this.condutaRecomendada = condutaRecomendada;
    }

    public boolean isAlertaUrgente() {
        return alertaUrgente;
    }

    public void setAlertaUrgente(boolean alertaUrgente) {
        this.alertaUrgente = alertaUrgente;
    }

    public int getTempoEspera() {
        return tempoEspera;
    }

    public void setTempoEspera(int tempoEspera) {
        this.tempoEspera = tempoEspera;
    }

    public String getSintomas() {
        return sintomas;
    }

    public void setSintomas(String sintomas) {
        this.sintomas = sintomas;
    }

    public String getNivelDor() {
        return nivelDor;
    }

    public void setNivelDor(String nivelDor) {
        this.nivelDor = nivelDor;
    }

    public Double getTemperatura() {
        return temperatura;
    }

    public void setTemperatura(Double temperatura) {
        this.temperatura = temperatura;
    }

    public Integer getPressaoSistolica() {
        return pressaoSistolica;
    }

    public void setPressaoSistolica(Integer pressaoSistolica) {
        this.pressaoSistolica = pressaoSistolica;
    }

    public Integer getPressaoDiastolica() {
        return pressaoDiastolica;
    }

    public void setPressaoDiastolica(Integer pressaoDiastolica) {
        this.pressaoDiastolica = pressaoDiastolica;
    }

    public Integer getSaturacaoO2() {
        return saturacaoO2;
    }

    public void setSaturacaoO2(Integer saturacaoO2) {
        this.saturacaoO2 = saturacaoO2;
    }

    public LocalDateTime getDataTriagem() {
        return dataTriagem;
    }

    public void setDataTriagem(LocalDateTime dataTriagem) {
        this.dataTriagem = dataTriagem;
    }

}
