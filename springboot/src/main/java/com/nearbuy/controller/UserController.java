package com.nearbuy.controller;

import com.nearbuy.dto.UserDTO;
import com.nearbuy.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO.ProfileResponse> getProfile(Authentication auth) {
        Long userId = Long.parseLong((String) auth.getPrincipal());
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO.ProfileResponse> updateProfile(
            @RequestBody UserDTO.UpdateRequest request,
            Authentication auth) {
        Long userId = Long.parseLong((String) auth.getPrincipal());
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    @PostMapping("/profile/upload-photo")
    public ResponseEntity<Map<String, String>> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        try {
            Long userId = Long.parseLong((String) auth.getPrincipal());

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String ext = "";
            String original = file.getOriginalFilename();
            if (original != null && original.contains("."))
                ext = original.substring(original.lastIndexOf("."));

            String filename = "profile_" + userId + "_" + UUID.randomUUID() + ext;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String photoUrl = "/api/users/profile/uploads/" + filename;
            userService.updateProfilePhoto(userId, photoUrl);

            return ResponseEntity.ok(Map.of("photoUrl", photoUrl));
        } catch (Exception e) {
            System.err.println("Photo upload error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{id}/public")
    public ResponseEntity<Map<String, String>> getPublicProfile(@PathVariable Long id) {
        try {
            UserDTO.ProfileResponse profile = userService.getProfile(id);
            return ResponseEntity.ok(Map.of(
                "displayName", profile.getDisplayName() != null ? profile.getDisplayName() : profile.getUsername(),
                "username", profile.getUsername(),
                "profilePhoto", profile.getProfilePhoto() != null ? profile.getProfilePhoto() : ""
            ));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/profile/uploads/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> servePhoto(
            @PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            org.springframework.core.io.Resource resource =
                new org.springframework.core.io.UrlResource(filePath.toUri());
            if (!resource.exists()) return ResponseEntity.notFound().build();

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/octet-stream";

            return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}