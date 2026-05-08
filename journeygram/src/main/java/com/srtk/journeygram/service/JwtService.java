package com.srtk.journeygram.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // Generate token
    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignKey()) // algorithm auto-detected (HS256)
                .compact();
    }

    // Extract email (subject)
    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // Validate token
    public boolean isTokenValid(String token) {
        try {
            extractEmail(token); // will throw if invalid/expired
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Generate signing key
    private SecretKey getSignKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}