package com.srtk.journeygram.service;

import com.srtk.journeygram.dto.LoginRequest;
import com.srtk.journeygram.dto.RegisterRequest;
import com.srtk.journeygram.model.User;
import com.srtk.journeygram.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public String register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // Build the user object
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Never store plain text password — always hash it
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Save to database
        userRepository.save(user);

        // Return a token immediately after register
        return jwtService.generateToken(user.getEmail());
    }

    public String login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Compare the password they sent with the hashed one in DB
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Everything checks out — give them a token
        return jwtService.generateToken(user.getEmail());
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}