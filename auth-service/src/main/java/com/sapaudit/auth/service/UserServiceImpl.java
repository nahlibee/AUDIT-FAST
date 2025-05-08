package com.sapaudit.auth.service;

import com.sapaudit.auth.dto.CreateUserRequest;
import com.sapaudit.auth.dto.UpdateUserRequest;
import com.sapaudit.auth.dto.UserDto;
import com.sapaudit.auth.exception.ResourceNotFoundException;
import com.sapaudit.auth.exception.UserAlreadyExistsException;
import com.sapaudit.auth.model.Role;
import com.sapaudit.auth.model.User;
import com.sapaudit.auth.repository.RoleRepository;
import com.sapaudit.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Implementation of the UserService interface.
 * This service handles all business logic related to user management.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<UserDto> getAllUsers() {
        log.info("Retrieving all users");
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto getUserById(Long id) {
        log.info("Retrieving user with ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return convertToDto(user);
    }

    @Override
    public UserDto getUserByUsername(String username) {
        log.info("Retrieving user with username: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return convertToDto(user);
    }

    @Override
    public UserDto getUserByEmail(String email) {
        log.info("Retrieving user with email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return convertToDto(user);
    }

    @Override
    @Transactional
    public UserDto createUser(CreateUserRequest createUserRequest) {
        log.info("Creating new user with username: {}", createUserRequest.getUsername());
        
        // Check if username or email already exists
        if (userRepository.existsByUsername(createUserRequest.getUsername())) {
            throw new UserAlreadyExistsException("username", createUserRequest.getUsername());
        }

        if (userRepository.existsByEmail(createUserRequest.getEmail())) {
            throw new UserAlreadyExistsException("email", createUserRequest.getEmail());
        }

        // Create new user
        User user = User.builder()
                .username(createUserRequest.getUsername())
                .email(createUserRequest.getEmail())
                .password(passwordEncoder.encode(createUserRequest.getPassword()))
                .firstName(createUserRequest.getFirstName())
                .lastName(createUserRequest.getLastName())
                .dateOfBirth(createUserRequest.getDateOfBirth())
                .phoneNumber(createUserRequest.getPhoneNumber())
                .accountEnabled(true)
                .build();

        // Assign roles to the user
        Set<Role> roles = mapRoles(createUserRequest.getRoles());
        user.setRoles(roles);

        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());
        
        return convertToDto(savedUser);
    }

    @Override
    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest updateUserRequest) {
        log.info("Updating user with ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Update username if provided and not already taken by another user
        if (updateUserRequest.getUsername() != null && !updateUserRequest.getUsername().isEmpty()) {
            if (!user.getUsername().equals(updateUserRequest.getUsername()) && 
                userRepository.existsByUsername(updateUserRequest.getUsername())) {
                throw new UserAlreadyExistsException("username", updateUserRequest.getUsername());
            }
            user.setUsername(updateUserRequest.getUsername());
        }

        // Update email if provided and not already taken by another user
        if (updateUserRequest.getEmail() != null && !updateUserRequest.getEmail().isEmpty()) {
            if (!user.getEmail().equals(updateUserRequest.getEmail()) && 
                userRepository.existsByEmail(updateUserRequest.getEmail())) {
                throw new UserAlreadyExistsException("email", updateUserRequest.getEmail());
            }
            user.setEmail(updateUserRequest.getEmail());
        }

        // Update password if provided
        if (updateUserRequest.getPassword() != null && !updateUserRequest.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updateUserRequest.getPassword()));
        }

        // Update other fields if provided
        if (updateUserRequest.getFirstName() != null) {
            user.setFirstName(updateUserRequest.getFirstName());
        }

        if (updateUserRequest.getLastName() != null) {
            user.setLastName(updateUserRequest.getLastName());
        }

        if (updateUserRequest.getDateOfBirth() != null) {
            user.setDateOfBirth(updateUserRequest.getDateOfBirth());
        }

        if (updateUserRequest.getPhoneNumber() != null) {
            user.setPhoneNumber(updateUserRequest.getPhoneNumber());
        }

        // Update account status if provided
        if (updateUserRequest.getAccountEnabled() != null) {
            user.setAccountEnabled(updateUserRequest.getAccountEnabled());
        }

        // Update roles if provided
        if (updateUserRequest.getRoles() != null && !updateUserRequest.getRoles().isEmpty()) {
            Set<Role> roles = mapRoles(updateUserRequest.getRoles());
            user.setRoles(roles);
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated successfully with ID: {}", updatedUser.getId());
        
        return convertToDto(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        log.info("Deleting user with ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        userRepository.delete(user);
        log.info("User deleted successfully with ID: {}", id);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public UserDto convertToDto(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .dateOfBirth(user.getDateOfBirth())
                .phoneNumber(user.getPhoneNumber())
                .roles(roles)
                .accountEnabled(user.isAccountEnabled())
                .build();
    }

    /**
     * Maps role names to Role entities
     * 
     * @param roleNames Set of role names
     * @return Set of Role entities
     */
    private Set<Role> mapRoles(Set<String> roleNames) {
        Set<Role> roles = new HashSet<>();
        
        // If no roles are specified, assign the default "ROLE_AUDITOR" role
        if (roleNames == null || roleNames.isEmpty()) {
            Role auditorRole = roleRepository.findByName(Role.ROLE_AUDITOR)
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "name", Role.ROLE_AUDITOR));
            roles.add(auditorRole);
            return roles;
        }
        
        // Map role names to Role entities
        for (String roleName : roleNames) {
            String formattedRoleName;
            
            // Format role name to match the format in the database (ROLE_XXX)
            if (roleName.startsWith("ROLE_")) {
                formattedRoleName = roleName.toUpperCase();
            } else {
                formattedRoleName = "ROLE_" + roleName.toUpperCase();
            }
            
            // Find role by name
            Role role = roleRepository.findByName(formattedRoleName)
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "name", formattedRoleName));
            
            roles.add(role);
        }
        
        return roles;
    }
}