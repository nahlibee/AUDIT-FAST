package com.sapaudit.auth.controller;

import com.sapaudit.auth.dto.AuthRequest;
import com.sapaudit.auth.dto.AuthResponse;
import com.sapaudit.auth.dto.CreateUserRequest;
import com.sapaudit.auth.service.AuthService;
import com.sapaudit.auth.security.JwtProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication API")
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final JwtProvider jwtProvider;

    @PostMapping("/signin")
    @Operation(summary = "Authenticate user", description = "Authenticate user and generate a JWT token")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody AuthRequest authRequest) {
        AuthResponse response = authService.authenticateUser(authRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    @Operation(summary = "Register user", description = "Register a new user and generate a JWT token")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody CreateUserRequest registerRequest) {
        AuthResponse response = authService.registerUser(registerRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate-token")
    @Operation(summary = "Validate token", description = "Validate a JWT token")
    public ResponseEntity<Boolean> validateToken(@RequestBody String token) {
        try {
            // Remove any quotes or whitespace that might be present
            token = token.trim().replaceAll("^[\"']|[\"']$", "");
            
            log.debug("Validating token: {}", token);
            boolean isValid = jwtProvider.validateJwtToken(token);
            log.debug("Token validation result: {}", isValid);
            
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            log.error("Error validating token: {}", e.getMessage(), e);
            return ResponseEntity.ok(false);
        }
    }
}