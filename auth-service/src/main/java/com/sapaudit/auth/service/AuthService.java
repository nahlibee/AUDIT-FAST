package com.sapaudit.auth.service;

import com.sapaudit.auth.dto.AuthRequest;
import com.sapaudit.auth.dto.AuthResponse;
import com.sapaudit.auth.dto.CreateUserRequest;

public interface AuthService {
    
    /**
     * Authenticate a user and generate a JWT token
     * 
     * @param authRequest the authentication request
     * @return the authentication response with JWT token
     */
    AuthResponse authenticateUser(AuthRequest authRequest);
    
    /**
     * Register a new user
     * 
     * @param registerRequest the registration request
     * @return the authentication response with JWT token
     */
    AuthResponse registerUser(CreateUserRequest registerRequest);
}