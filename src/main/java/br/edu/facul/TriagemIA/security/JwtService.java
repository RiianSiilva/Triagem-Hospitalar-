package br.edu.facul.TriagemIA.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {
    private static final String SECRET = "triagem-hospitalar-secret-key-2026-acex-muito-seguro";
    private static final long EXPIRACAO = 1000 * 60 * 60 * 24; // 24 horas

    private Key getChave() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String gerarToken(String email, String perfil) {
        return Jwts.builder()
                .subject(email)
                .claim("perfil", perfil)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRACAO))
                .signWith(getChave())
                .compact();
    }

    public String extrairEmail(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getChave())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public String extrairPerfil(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getChave())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("perfil", String.class);
    }

    public boolean tokenValido(String token) {
        try {
            Jwts.parser()
                    .verifyWith((javax.crypto.SecretKey) getChave())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
