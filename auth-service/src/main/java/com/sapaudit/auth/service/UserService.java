package com.sapaudit.auth.service;

import com.sapaudit.auth.dto.CreateUserRequest;
import com.sapaudit.auth.dto.UpdateUserRequest;
import com.sapaudit.auth.dto.UserDto;
import com.sapaudit.auth.model.User;

import java.util.List;

public interface UserService {
    
    /**
     * Get all users
     * 
     * @return list of all users
     */
    List<UserDto> getAllUsers();
    
    /**
     * Get user by ID
     * 
     * @param id the user ID
     * @return the user DTO
     */
    UserDto getUserById(Long id);
    
    /**
     * Get user by username
     * 
     * @param username the username
     * @return the user DTO
     */
    UserDto getUserByUsername(String username);
    
    /**
     * Get user by email
     * 
     * @param email the email
     * @return the user DTO
     */
    UserDto getUserByEmail(String email);
    
    /**
     * Create a new user
     * 
     * @param createUserRequest the user creation request
     * @return the created user DTO
     */
    UserDto createUser(CreateUserRequest createUserRequest);
    
    /**
     * Update an existing user
     * 
     * @param id the user ID
     * @param updateUserRequest the user update request
     * @return the updated user DTO
     */
    UserDto updateUser(Long id, UpdateUserRequest updateUserRequest);
    
    /**
     * Delete a user
     * 
     * @param id the user ID
     */
    void deleteUser(Long id);
    
    /**
     * Check if user exists by username
     * 
     * @param username the username
     * @return true if user exists, false otherwise
     */
    boolean existsByUsername(String username);
    
    /**
     * Check if user exists by email
     * 
     * @param email the email
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);
    
    /**
     * Convert User entity to UserDto
     * 
     * @param user the user entity
     * @return the user DTO
     */
    UserDto convertToDto(User user);
}