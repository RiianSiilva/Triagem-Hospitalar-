package br.edu.facul.TriagemIA.dto;

public record AuthResponse(
        String token,
        String nome,
        String email,
        String perfil,
        String cpf
) { }
