package br.edu.facul.TriagemIA.controller;

import br.edu.facul.TriagemIA.dto.AuthResponse;
import br.edu.facul.TriagemIA.dto.CadastroRequest;
import br.edu.facul.TriagemIA.dto.LoginRequest;
import br.edu.facul.TriagemIA.entity.Usuario;
import br.edu.facul.TriagemIA.repository.PacienteRepository;
import br.edu.facul.TriagemIA.repository.UsuarioRepository;
import br.edu.facul.TriagemIA.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import br.edu.facul.TriagemIA.entity.Paciente;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UsuarioRepository usuarioRepository, PacienteRepository pacienteRepository, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.pacienteRepository = pacienteRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return usuarioRepository.findByEmail(request.email())
                .filter(u -> passwordEncoder.matches(request.senha(), u.getSenha()))
                .map(u -> {
                    String cpf = u.getPaciente() != null ? u.getPaciente().getCpf() : null;
                    return ResponseEntity.ok(new AuthResponse(
                            jwtService.gerarToken(u.getEmail(), u.getPerfil().name()),
                            u.getNome(),
                            u.getEmail(),
                            u.getPerfil().name(),
                            cpf
                    ));

                })
                .orElse(ResponseEntity.status(401).build());
    }

    @PostMapping("/cadastro/paciente")
    public ResponseEntity<AuthResponse> cadastrarPaciente(@RequestBody CadastroRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            return ResponseEntity.status(409).build(); // email já existe
        }


        // Cria ou busca o Paciente pelo CPF
        Paciente paciente = pacienteRepository
                .findByCpf(request.cpf())
                .orElseGet(() -> {
                    Paciente novo = new Paciente();
                    novo.setNome(request.nome());
                    novo.setCpf(request.cpf());
                    return pacienteRepository.save(novo);
                });


        Usuario usuario = new Usuario();
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setPerfil(Usuario.Perfil.PACIENTE);
        usuario.setPaciente(paciente);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(new AuthResponse(
                jwtService.gerarToken(usuario.getEmail(), usuario.getPerfil().name()),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().name(),
                paciente.getCpf()
        ));
    }

    @PostMapping("/cadastro/staff")
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

        if (perfil == Usuario.Perfil.PACIENTE) {
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

    // Busca perfil do usuário logado
    @GetMapping("/perfil")
    public ResponseEntity<AuthResponse> getPerfil(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.replace("Bearer ", "");
            String email = jwtService.extrairEmail(jwt);
            return usuarioRepository.findByEmail(email)
                    .map(u -> {
                        String cpf = u.getPaciente() != null ? u.getPaciente().getCpf() : null;
                        return ResponseEntity.ok(new AuthResponse(
                                null, u.getNome(), u.getEmail(), u.getPerfil().name(), cpf
                        ));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    // Atualiza perfil do usuário
    @PutMapping("/perfil")
    public ResponseEntity<AuthResponse> atualizarPerfil(
            @RequestHeader("Authorization") String token,
            @RequestBody CadastroRequest request) {
        try {
            String jwt = token.replace("Bearer ", "");
            String email = jwtService.extrairEmail(jwt);
            return usuarioRepository.findByEmail(email)
                    .map(u -> {
                        u.setNome(request.nome());
                        if (request.senha() != null && !request.senha().isEmpty()) {
                            u.setSenha(passwordEncoder.encode(request.senha()));
                        }
                        // Atualiza CPF no paciente vinculado
                        if (u.getPaciente() != null && request.cpf() != null) {
                            u.getPaciente().setCpf(request.cpf());
                            pacienteRepository.save(u.getPaciente());
                        }
                        usuarioRepository.save(u);
                        String cpf = u.getPaciente() != null ? u.getPaciente().getCpf() : null;
                        return ResponseEntity.ok(new AuthResponse(
                                null, u.getNome(), u.getEmail(), u.getPerfil().name(), cpf
                        ));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

}