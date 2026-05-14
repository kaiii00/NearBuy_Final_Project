package com.nearbuy.service;

import com.nearbuy.dto.AuthDTO;
import com.nearbuy.exception.BadRequestException;
import com.nearbuy.model.User;
import com.nearbuy.repository.UserRepository;
import com.nearbuy.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new BadRequestException("Username is already taken.");
        if (userRepository.existsByEmail(request.getEmail()))
            throw new BadRequestException("Email is already registered.");

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : User.Role.buyer)
                .address(request.getAddress())
                .contact(request.getContact())
                .build();

        userRepository.save(user);

        String token = jwtUtils.generateToken(
                user.getUsername(),
                user.getId(),
                user.getRole().name()
        );

        return AuthDTO.AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new BadRequestException("User not found."));

        String token = jwtUtils.generateToken(
                user.getUsername(),
                user.getId(),
                user.getRole().name()
        );

        return AuthDTO.AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}