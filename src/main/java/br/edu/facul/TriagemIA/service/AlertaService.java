package br.edu.facul.TriagemIA.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class AlertaService {

    private final SimpMessagingTemplate messagingTemplate;

    public AlertaService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void enviarAlerta(String cor, String nomePaciente, String sintomas, Long triagemId) {
        Map<String, Object> alerta = Map.of(
                "cor", cor,
                "nomePaciente", nomePaciente,
                "sintomas", sintomas,
                "triagemId", triagemId,
                "mensagem", "🚨 NOVA TRIAGEM " + cor + ": " + nomePaciente
        );
        messagingTemplate.convertAndSend("/topic/alertas", alerta);
    }
}