package com.srtk.journeygram.service;

import com.srtk.journeygram.dto.*;
import com.srtk.journeygram.exception.BadRequestException;
import com.srtk.journeygram.exception.ConflictException;
import com.srtk.journeygram.exception.ResourceNotFoundException;
import com.srtk.journeygram.exception.UnauthorizedException;
import com.srtk.journeygram.model.RefreshToken;
import com.srtk.journeygram.model.User;
import com.srtk.journeygram.repository.RefreshTokenRepository;
import com.srtk.journeygram.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("Email already registered");
        }

        // Build the user object
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user = userRepository.save(user);

        // Generate tokens
        String token = jwtService.generateToken(user.getEmail());
        String refreshToken = createRefreshToken(user);

        return new AuthResponse(token, refreshToken, toUserResponse(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());
        String refreshToken = createRefreshToken(user);

        return new AuthResponse(token, refreshToken, toUserResponse(user));
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenStr) {
        if (refreshTokenStr == null || refreshTokenStr.isBlank()) {
            throw new BadRequestException("Refresh token is required");
        }

        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndRevokedFalse(refreshTokenStr)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));

        if (refreshToken.isExpired()) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new UnauthorizedException("Refresh token has expired. Please login again.");
        }

        // Revoke old refresh token (rotation)
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        String newAccessToken = jwtService.generateToken(user.getEmail());
        String newRefreshToken = createRefreshToken(user);

        return new AuthResponse(newAccessToken, newRefreshToken, toUserResponse(user));
    }

    @Transactional(readOnly = true)
    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public User updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getTravellerType() != null) user.setTravellerType(request.getTravellerType());

        return userRepository.save(user);
    }

    public UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getBio(),
                user.getTravellerType(),
                user.getTier(),
                user.getCreatedAt()
        );
    }

    private String createRefreshToken(User user) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(30)); // 30 day refresh token
        refreshToken.setCreatedAt(LocalDateTime.now());
        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }
}