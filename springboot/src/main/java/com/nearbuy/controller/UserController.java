package com.nearbuy.controller;

import com.nearbuy.dto.UserDTO;
import com.nearbuy.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users/profile
    @GetMapping("/profile")
    public ResponseEntity<UserDTO.ProfileResponse> getProfile(Authentication auth) {
        Long userId = Long.parseLong((String) auth.getPrincipal());
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    // PUT /api/users/profile
    @PutMapping("/profile")
    public ResponseEntity<UserDTO.ProfileResponse> updateProfile(
            @RequestBody UserDTO.UpdateRequest request,
            Authentication auth) {
        Long userId = Long.parseLong((String) auth.getPrincipal());
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }
}