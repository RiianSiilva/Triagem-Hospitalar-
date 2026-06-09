package br.edu.facul.TriagemIA.controller;

import br.edu.facul.TriagemIA.dto.AuthResponse;
import br.edu.facul.TriagemIA.dto.CadastroRequest;
import br.edu.facul.TriagemIA.dto.LoginRequest;
import br.edu.facul.TriagemIA.entity.Usuario;
import br.edu.facul.TriagemIA.repository.UsuarioRepository;
import br.edu.facul.TriagemIA.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UsuarioRepository usuarioRepository, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return usuarioRepository.findByEmail(request.email())
                .filter(u -> passwordEncoder.matches(request.senha(), u.getSenha()))
                .map(u -> ResponseEntity.ok(new AuthResponse(
                        jwtService.gerarToken(u.getEmail(), u.getPerfil().name()),
                        u.getNome(),
                        u.getEmail(),
                        u.getPerfil().name()
                )))
                .orElse(ResponseEntity.status(401).build());
    }

    @PostMapping("/cadastro/paciente")
    public ResponseEntity<AuthResponse> cadastrarPaciente(@RequestBody CadastroRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            return ResponseEntity.status(409).build(); // email já existe
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setPerfil(Usuario.Perfil.PACIENTE);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(new AuthResponse(
                jwtService.gerarToken(usuario.getEmail(), usuario.getPerfil().name()),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().name()
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
                usuario.getPerfil().name()
        ));
    }
}