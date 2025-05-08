package com.sapaudit.auth.controller;

import com.sapaudit.auth.dto.CreateUserRequest;
import com.sapaudit.auth.dto.UpdateUserRequest;
import com.sapaudit.auth.dto.UserDto;
import com.sapaudit.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User Management API")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get all users", description = "Get a list of all users. Requires ADMIN role.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Get a user by their ID. Requires ADMIN or MANAGER role, or be the user themselves.")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or @userService.getUserById(#id).username == authentication.name")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    @Operation(summary = "Create user", description = "Create a new user. Requires ADMIN role.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest createUserRequest) {
        UserDto createdUser = userService.createUser(createUserRequest);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user", description = "Update an existing user. Requires ADMIN role, or MANAGER role for non-admin users, or be the user themselves.")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('MANAGER') and !@userService.getUserById(#id).roles.contains('ROLE_ADMIN')) or @userService.getUserById(#id).username == authentication.name")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest updateUserRequest) {
        UserDto updatedUser = userService.updateUser(id, updateUserRequest);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user", description = "Delete a user. Requires ADMIN role.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get the currently authenticated user's details.")
    public ResponseEntity<UserDto> getCurrentUser(@RequestParam String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }
}