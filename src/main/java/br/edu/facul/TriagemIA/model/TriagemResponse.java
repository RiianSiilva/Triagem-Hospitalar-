package br.edu.facul.TriagemIA.model;

// criando uma classe imutavel com record, evitando tbm a necessidade de criar mtodos getter e setter e construtores
public record TriagemResponse(
        String cor,
        String prioridade,
        String justificativa,
        String condutaRecomendada,
        boolean alertaUrgente,
        int tempoEspera
) {}