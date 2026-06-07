package br.edu.facul.TriagemIA.repository;

import br.edu.facul.TriagemIA.entidades.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// JpaRepository<Paciente, Long> É uma interface do Spring Data JPA. Quando você escreve isso,
// o Spring automaticamente gera para você todos os métodos básicos de banco de dados

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long>{

    Optional<Paciente> findByCpf(String cpf);
    //  findByCpf(String cpf) SELECT * FROM pacientes WHERE cpf = ?

    Optional<Paciente> findByNomeIgnoreCase(String nome);
    // findByNomeIgnoreCase(String nome) SELECT * FROM pacientes WHERE UPPER(nome) = UPPER(?)
    //  o IgnoreCase faz a busca sem diferenciar maiúsculas/minúsculas
}
