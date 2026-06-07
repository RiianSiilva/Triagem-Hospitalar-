package br.edu.facul.TriagemIA.service;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import dev.langchain4j.service.spring.AiService;

//registra essa interface como um serviço de Inteligência Artificial
@AiService
public interface TriagemAiService { // interface == contrato de regras que uma classe deve seguir (implements)

    //configura o comportamento do modelo
    @SystemMessage(""" 
        Você é um especialista em triagem hospitalar treinado no Protocolo de Manchester (MTS).
        
        Sua função é classificar o paciente em uma das 5 categorias de urgência:
        
        VERMELHO  - Emergência. Risco imediato de vida. Atendimento imediato (0 min).
        LARANJA   - Muito urgente. Risco de deterioração rápida. Atendimento em 10 min.
        AMARELO   - Urgente. Situação que pode agravar. Atendimento em 60 min.
        VERDE     - Pouco urgente. Problema agudo mas não grave. Atendimento em 120 min.
        AZUL      - Não urgente. Situação crônica ou administrativa. Atendimento em 240 min.
        
        Regras críticas:
        - Saturação de O2 abaixo de 90% é critério VERMELHO automático.
        - Temperatura acima de 39.5°C em crianças menores de 2 anos é critério LARANJA.
        - Dor torácica com irradiação é critério LARANJA ou VERMELHO.
        - Sempre justifique com base nos sintomas e sinais vitais apresentados.
        - Responda APENAS em formato JSON válido, sem explicações fora do JSON.
        
        Formato obrigatório da resposta:
        {
          "cor": "VERMELHO|LARANJA|AMARELO|VERDE|AZUL",
          "prioridade": "texto da prioridade",
          "justificativa": "explicação clínica",
          "condutaRecomendada": "orientação para equipe",
          "alertaUrgente": true|false,
          "tempoEspera": número_em_minutos
        }
    """)
    // o texto que será enviado para a IA analisar
    @UserMessage("""
        Realize a triagem do seguinte paciente:
        
        Nome: {{nome}}
        Idade: {{idade}} anos
        Sintomas relatados: {{sintomas}}
        Nível de dor: {{dor}}
        Temperatura: {{temperatura}}°C
        Pressão arterial: {{paSistolica}}/{{paDiastolica}} mmHg
        Saturação O2: {{saturacao}}%
        Observações: {{observacoes}}
        
        Classifique conforme o Protocolo de Manchester.
    """)
    //O Mapeamento (@V): A anotação @V("nome") avisa ao LangChain4j que o valor
    // passado na variável Java nome deve ser injetado exatamente onde está escrito {{nome}} no seu @UserMessage.
    String classificarPaciente(
            @V("nome") String nome,
            @V("idade") int idade,
            @V("sintomas") String sintomas,
            @V("dor") String dor,
            @V("temperatura") String temperatura,
            @V("paSistolica") String paSistolica,
            @V("paDiastolica") String paDiastolica,
            @V("saturacao") String saturacao,
            @V("observacoes") String observacoes
    );
}