package br.edu.facul.TriagemIA.dto;

public record CadastroRequest(
        String nome,
        String email,
        String senha,
        String perfil
) { }
