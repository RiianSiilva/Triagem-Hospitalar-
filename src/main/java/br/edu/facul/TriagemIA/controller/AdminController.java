package br.edu.facul.TriagemIA.controller;

import br.edu.facul.TriagemIA.dto.AuthResponse;
import br.edu.facul.TriagemIA.dto.CadastroRequest;
import br.edu.facul.TriagemIA.entity.Paciente;
import br.edu.facul.TriagemIA.entity.Triagem;
import br.edu.facul.TriagemIA.entity.Usuario;
import br.edu.facul.TriagemIA.repository.PacienteRepository;
import br.edu.facul.TriagemIA.repository.TriagemRepository;
import br.edu.facul.TriagemIA.repository.UsuarioRepository;
import br.edu.facul.TriagemIA.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final TriagemRepository triagemRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminController(UsuarioRepository usuarioRepository,
                           PacienteRepository pacienteRepository,
                           TriagemRepository triagemRepository,
                           JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.pacienteRepository = pacienteRepository;
        this.triagemRepository = triagemRepository;
        this.jwtService = jwtService;
    }

    // ─── LISTAR ───────────────────────────────────────────

    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioRepository.findAll());
    }

    @GetMapping("/pacientes")
    public ResponseEntity<List<Paciente>> listarPacientes() {
        return ResponseEntity.ok(pacienteRepository.findAll());
    }

    @GetMapping("/triagens")
    public ResponseEntity<List<Triagem>> listarTriagens() {
        return ResponseEntity.ok(triagemRepository.findAll());
    }

    // ─── CADASTRAR STAFF ──────────────────────────────────

    @PostMapping("/cadastrar/staff")
    public ResponseEntity<AuthResponse> cadastrarStaff(@RequestBody CadastroRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            return ResponseEntity.status(409).build();
        }

        Usuario.Perfil perfil;
        try {
            perfil = Usuario.Perfil.valueOf(request.perfil().toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setPerfil(perfil);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(new AuthResponse(
                jwtService.gerarToken(usuario.getEmail(), usuario.getPerfil().name()),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().name(),
                null
        ));
    }

    // ─── DELETAR ──────────────────────────────────────────

    @DeleteMapping("/usuario/{id}")
    public ResponseEntity<Void> deletarUsuario(@PathVariable Long id) {
        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        usuarioRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/paciente/{id}")
    public ResponseEntity<Void> deletarPaciente(@PathVariable Long id) {
        if (!pacienteRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        // Deleta triagens do paciente primeiro
        List<Triagem> triagens = triagemRepository
                .findByPacienteIdOrderByDataTriagemDesc(id);
        triagemRepository.deleteAll(triagens);
        pacienteRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/triagem/{id}")
    public ResponseEntity<Void> deletarTriagem(@PathVariable Long id) {
        if (!triagemRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        triagemRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/limpar/triagens")
    public ResponseEntity<Void> limparTodasTriagens() {
        triagemRepository.deleteAll();
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/limpar/tudo")
    public ResponseEntity<Void> limparTudo() {
        triagemRepository.deleteAll();
        usuarioRepository.deleteAll();
        pacienteRepository.deleteAll();
        return ResponseEntity.ok().build();
    }
}