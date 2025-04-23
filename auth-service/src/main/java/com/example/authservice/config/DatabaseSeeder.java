package com.example.authservice.config;

import com.example.authservice.model.ERole;
import com.example.authservice.model.Role;
import com.example.authservice.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialize roles if they don't exist yet
        if (roleRepository.count() == 0) {
            Arrays.asList(ERole.values()).forEach(role -> {
                Role newRole = new Role();
                newRole.setName(role);
                roleRepository.save(newRole);
            });
            
            System.out.println("Database initialized with roles");
        }
    }
}