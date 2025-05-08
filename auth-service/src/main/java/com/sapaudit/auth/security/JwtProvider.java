package com.sapaudit.auth.security;

import com.sapaudit.auth.config.JwtConfig;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.function.Function;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtProvider {

    private final JwtConfig jwtConfig;

    /**
     * Generate a JWT token for an authenticated user.
     *
     * @param authentication the authentication object containing user details
     * @return the generated JWT token string
     */
    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(userPrincipal.getUsername())
                .issuedAt(Date.from(now))
                .issuer(jwtConfig.getIssuer())
                .expiration(Date.from(now.plus(jwtConfig.getExpiration(), ChronoUnit.MILLIS)))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extract username from JWT token.
     *
     * @param token the JWT token
     * @return the username
     */
    public String getUsernameFromJwtToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (Exception e) {
            log.error("Error extracting username from token: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get expiration date from JWT token.
     *
     * @param token the JWT token
     * @return the expiration date
     */
    public Date getExpirationDateFromToken(String token) {
        try {
            return getClaimFromToken(token, Claims::getExpiration);
        } catch (Exception e) {
            log.error("Error getting expiration date from token: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Extract a specific claim from JWT token.
     *
     * @param token the JWT token
     * @param claimsResolver function to extract a specific claim
     * @return the extracted claim
     */
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        try {
            final Claims claims = getAllClaimsFromToken(token);
            return claimsResolver.apply(claims);
        } catch (Exception e) {
            log.error("Error extracting claim from token: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Extract all claims from JWT token.
     *
     * @param token the JWT token
     * @return all claims
     */
    private Claims getAllClaimsFromToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.error("Error extracting claims from token: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Check if JWT token is expired.
     *
     * @param token the JWT token
     * @return true if token is expired, false otherwise
     */
    private Boolean isTokenExpired(String token) {
        try {
            final Date expiration = getExpirationDateFromToken(token);
            return expiration.before(Date.from(Instant.now()));
        } catch (Exception e) {
            log.error("Error checking token expiration: {}", e.getMessage());
            return true;
        }
    }

    /**
     * Validate JWT token.
     *
     * @param authToken the JWT token
     * @return true if token is valid, false otherwise
     */
    public boolean validateJwtToken(String authToken) {
        try {
            log.debug("Validating token: {}", authToken);
            
            if (authToken == null || authToken.trim().isEmpty()) {
                log.error("Token is null or empty");
                return false;
            }

            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(authToken);
                
            log.debug("Token validation successful");
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error validating token: {}", e.getMessage());
        }

        return false;
    }
    
    /**
     * Create a key for signing tokens from the configured secret.
     *
     * @return signing key
     */
    private SecretKey getSigningKey() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(jwtConfig.getSecret());
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            log.error("Error creating signing key: {}", e.getMessage());
            throw e;
        }
    }
}