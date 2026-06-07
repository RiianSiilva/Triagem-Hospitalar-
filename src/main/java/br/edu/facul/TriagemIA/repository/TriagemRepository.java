package br.edu.facul.TriagemIA.repository;

import br.edu.facul.TriagemIA.entidades.Triagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

// JpaRepository<Triagem, Long> É uma interface do Spring Data JPA. Quando você escreve isso,
// o Spring automaticamente gera para você todos os métodos básicos de banco de dados

@Repository
public interface TriagemRepository extends JpaRepository<Triagem,Long>{

    List<Triagem> findByPacienteIdOrderByDataTriagemDesc(Long pacienteId);
    // findByPacienteIdOrderByDataTriagemDesc(Long pacienteId) SELECT * FROM triagen
    // WHERE paciente_id = ?
    // ORDER BY data_triagem DESC
    // (mais recente primeiro)

    List<Triagem> findByAlertaUrgenteOrderByDataTriagemDesc(boolean alertaUrgente);
    // findByAlertaUrgenteOrderByDataTriagemDesc(boolean alertaUrgente) SELECT * FROM triagens
    // WHERE alerta_urgente = ?
    // ORDER BY data_triagem DESC

    List<Triagem> findByCorOrderByDataTriagemDesc(String cor);
    // findByCorOrderByDataTriagemDesc(String cor) SELECT * FROM triagens
    // WHERE cor = ?
    // ORDER BY data_triagem DESC
}
