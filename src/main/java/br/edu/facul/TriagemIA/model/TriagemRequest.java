package br.edu.facul.TriagemIA.model;

import java.util.List;

// criando uma classe imutavel com record, evitando tbm a necessidade de criar mtodos getter e setter e construtores
public record TriagemRequest(
        String nomePaciente,
        int idade,
        String cpf,
        List<String> sintomas,
        String nivelDor,
        Double temperatura,
        Integer pressaoSistolica,
        Integer pressaoDiastolica,
        Integer saturacaoO2,
        String observacoes
) {}