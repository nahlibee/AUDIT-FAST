package com.sapaudit.auth.service;

import com.sapaudit.auth.dto.AuthRequest;
import com.sapaudit.auth.dto.AuthResponse;
import com.sapaudit.auth.dto.CreateUserRequest;
import com.sapaudit.auth.exception.UserAlreadyExistsException;
import com.sapaudit.auth.model.Role;
import com.sapaudit.auth.model.User;
import com.sapaudit.auth.repository.RoleRepository;
import com.sapaudit.auth.repository.UserRepository;
import com.sapaudit.auth.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Override
    public AuthResponse authenticateUser(AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtProvider.generateJwtToken(authentication);
        
        org.springframework.security.core.userdetails.User userDetails = 
                (org.springframework.security.core.userdetails.User) authentication.getPrincipal();
        
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                roles
        );
    }

    @Override
    @Transactional
    public AuthResponse registerUser(CreateUserRequest registerRequest) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new UserAlreadyExistsException("username", registerRequest.getUsername());
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new UserAlreadyExistsException("email", registerRequest.getEmail());
        }

        // Create new user's account
        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .dateOfBirth(registerRequest.getDateOfBirth())
                .phoneNumber(registerRequest.getPhoneNumber())
                .accountEnabled(true)
                .build();

        Set<String> strRoles = registerRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        // If no roles are specified, assign the default "ROLE_AUDITOR" role
        if (strRoles == null || strRoles.isEmpty()) {
            Role auditorRole = roleRepository.findByName(Role.ROLE_AUDITOR)
                    .orElseThrow(() -> new RuntimeException("Error: Role AUDITOR is not found."));
            roles.add(auditorRole);
        } else {
            strRoles.forEach(role -> {
                switch (role.toUpperCase()) {
                    case "ADMIN":
                        Role adminRole = roleRepository.findByName(Role.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role ADMIN is not found."));
                        roles.add(adminRole);
                        break;
                    case "MANAGER":
                        Role managerRole = roleRepository.findByName(Role.ROLE_MANAGER)
                                .orElseThrow(() -> new RuntimeException("Error: Role MANAGER is not found."));
                        roles.add(managerRole);
                        break;
                    default:
                        Role auditorRole = roleRepository.findByName(Role.ROLE_AUDITOR)
                                .orElseThrow(() -> new RuntimeException("Error: Role AUDITOR is not found."));
                        roles.add(auditorRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        // Authenticate the newly registered user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(registerRequest.getUsername(), registerRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtProvider.generateJwtToken(authentication);

        List<String> userRoles = roles.stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                userRoles
        );
    }
}