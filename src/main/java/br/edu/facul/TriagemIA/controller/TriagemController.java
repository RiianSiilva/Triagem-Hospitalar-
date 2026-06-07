package br.edu.facul.TriagemIA.controller;

import br.edu.facul.TriagemIA.entidades.Paciente;
import br.edu.facul.TriagemIA.entidades.Triagem;
import br.edu.facul.TriagemIA.model.TriagemRequest;
import br.edu.facul.TriagemIA.model.TriagemResponse;
import br.edu.facul.TriagemIA.repository.PacienteRepository;
import br.edu.facul.TriagemIA.repository.TriagemRepository;
import br.edu.facul.TriagemIA.service.TriagemAiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController //Diz ao Spring que esta classe vai lidar com requisições HTTP (Web) e que todas as respostas devem ser enviadas diretamente no corpo da resposta
@RequestMapping("/api/triagem") //Define o endereço (URL) para chegar aqui
@CrossOrigin(origins = "*")
public class TriagemController {

    private final TriagemAiService triagemAiService;
    private final ObjectMapper objectMapper; // Uma ferramenta poderosa do Spring (da biblioteca Jackson). Ela serve para converter textos em formato JSON para objetos Java, e vice-versa.
    private final PacienteRepository pacienteRepository;
    private final TriagemRepository triagemRepository;

    public TriagemController(TriagemAiService triagemAiService, ObjectMapper objectMapper, PacienteRepository pacienteRepository, TriagemRepository triagemRepository) {
        this.triagemAiService = triagemAiService;
        this.objectMapper = objectMapper;
        this.pacienteRepository = pacienteRepository;
        this.triagemRepository = triagemRepository;
    }

    @PostMapping //Significa que este mtodo só aceita requisições do tipo POST (usado quando queremos enviar dados para o servidor processar).
    public ResponseEntity<TriagemResponse> realizarTriagem(@RequestBody TriagemRequest request) {
        try {
            // buscar ou criar o paciente
            Paciente paciente = pacienteRepository
                    .findByNomeIgnoreCase(request.nomePaciente())
                    .orElseGet(() ->{
                        Paciente novo = new Paciente();
                        novo.setNome(request.nomePaciente());
                        novo.setIdade(request.idade());
                        novo.setCpf(request.cpf());
                        return pacienteRepository.save(novo);

                    });

            // Tente processar os dados e chamar o serviço de IA
            String jsonResposta = triagemAiService.classificarPaciente(
                    request.nomePaciente(),
                    request.idade(),
                    String.join(", ", request.sintomas()), // Junta a lista de sintomas em um texto só
                    request.nivelDor(),
                    request.temperatura() != null ? request.temperatura().toString() : "não informada",
                    request.pressaoSistolica() != null ? request.pressaoSistolica().toString() : "não informada",
                    request.pressaoDiastolica() != null ? request.pressaoDiastolica().toString() : "não informada",
                    request.saturacaoO2() != null ? request.saturacaoO2().toString() : "não informada",
                    request.observacoes() != null ? request.observacoes() : "nenhuma"
            );

            System.out.println("=== RESPOSTA BRUTA DO GROQ ===");
            System.out.println(jsonResposta);
            System.out.println("==============================");

            // Limpeza das tags Markdown da resposta
            jsonResposta = jsonResposta
                    .replaceAll("(?s)```json\\s*", "")
                    .replaceAll("(?s)```\\s*", "")
                    .trim();

            // Conversão do JSON para o objeto de resposta final
            TriagemResponse response = objectMapper.readValue(jsonResposta, TriagemResponse.class);

            // salva a triagem no banco
            Triagem triagem = new Triagem();
            triagem.setPaciente(paciente);
            triagem.setCor(response.cor());
            triagem.setPrioridade(response.prioridade());
            triagem.setJustificativa(response.justificativa());
            triagem.setCondutaRecomendada(response.condutaRecomendada());
            triagem.setAlertaUrgente(response.alertaUrgente());
            triagem.setTempoEspera(response.tempoEspera());
            triagem.setSintomas(String.join(",", request.sintomas()));
            triagem.setNivelDor(request.nivelDor());
            triagem.setTemperatura(request.temperatura());
            triagem.setPressaoSistolica(request.pressaoSistolica());
            triagem.setPressaoDiastolica(request.pressaoDiastolica());
            triagem.setSaturacaoO2(request.saturacaoO2());
            triagemRepository.save(triagem);

            // Se tudo der certo, o Spring ignora o 'catch' e envia o resultado
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("=== ERRO ===");
            System.err.println(e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }


        // O bloco try-catch é o tratamento de Exceções do java

        // REQUEST É O ENVELOPE QUE O FRONT-END PREENCHE E ENVIA PARA O BACKEND
        // RESPONSE É O ENVELOPE QUE O BACKEND PREENCHE E ENVIA PARA O FRONT-END

        // O Front-end envia um JSON combinando com o formato do TriagemRequest.
        // O Spring Boot lê esse JSON e cria o objeto Java request.
        // O seu Controller extrai os dados do request, limpa os valores e passa para a IA.
        // A IA gera um texto JSON brutos com o resultado.
        // O objectMapper pega esse texto da IA e o transforma em um objeto TriagemResponse.
        // O Controller devolve o TriagemResponse para o front-end, que chega na tela formatado

    }
    // Busca todas as triagens urgentes (vermelho e laranja) para o painel do medico
    @GetMapping("/urgentes")
    public ResponseEntity<List<Triagem>> getTriagensUrgentes() {
       List<Triagem> urgentes = triagemRepository
               .findByAlertaUrgenteOrderByDataTriagemDesc(true);
       return ResponseEntity.ok(urgentes);
    }

    // Busca triagens por cor
    @GetMapping("/cor/{cor}")
    public ResponseEntity<List<Triagem>> getTriagensPorCor(@PathVariable String cor) {
        List<Triagem> triagens = triagemRepository
                .findByCorOrderByDataTriagemDesc(cor.toUpperCase());
        return ResponseEntity.ok(triagens);
    }

    // Busca Historico de um pacciente
    @GetMapping("/paciente/{id}")
    public ResponseEntity<List<Triagem>> getTriagensPorPaciente(@PathVariable long id) {
        List<Triagem> triagens = triagemRepository
                .findByPacienteIdOrderByDataTriagemDesc(id);
        return ResponseEntity.ok(triagens);
    }

    // Lista todos os Pacientes
    @GetMapping("/pacientes")
    public ResponseEntity<List<Paciente>> getPacientes(){
        return ResponseEntity.ok(pacienteRepository.findAll());
    }





}