package com.nearbuy.controller;

import com.nearbuy.dto.AuthDTO;
import com.nearbuy.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthDTO.AuthResponse> register(
            @Valid @RequestBody AuthDTO.RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDTO.AuthResponse> login(
            @Valid @RequestBody AuthDTO.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    @PutMapping("/oauth2/complete-profile")
    public ResponseEntity<?> completeOAuthProfile(
            @RequestBody AuthDTO.CompleteProfileRequest request) {
        return ResponseEntity.ok(authService.completeOAuthProfile(request));
    }
    
}
    