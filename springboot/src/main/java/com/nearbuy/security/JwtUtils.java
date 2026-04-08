package com.nearbuy.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;

@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    private Key getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes();
        byte[] paddedKey = new byte[Math.max(keyBytes.length, 32)];
        System.arraycopy(keyBytes, 0, paddedKey, 0, keyBytes.length);
        return Keys.hmacShaKeyFor(paddedKey);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            logger.error("Invalid JWT: {}", e.getMessage());
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Django SimpleJWT stores user ID in "user_id" claim
    public Long getUserId(String token) {
        Claims claims = getClaims(token);
        Object userId = claims.get("user_id");
        if (userId instanceof Integer) return ((Integer) userId).longValue();
        if (userId instanceof Long) return (Long) userId;
        try { return Long.parseLong(claims.getSubject()); } catch (Exception e) { return null; }
    }

    public String getRole(String token) {
        Claims claims = getClaims(token);
        return (String) claims.get("role");
    }
}