package com.nearbuy.controller;

import com.nearbuy.dto.StoreDTO;
import com.nearbuy.model.Store;
import com.nearbuy.security.JwtUtils;
import com.nearbuy.service.StoreService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    @Autowired
    private StoreService storeService;

    @Autowired
    private JwtUtils jwtUtils;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<List<StoreDTO.Response>> getAllStores(
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(storeService.searchStores(search));
        }
        return ResponseEntity.ok(storeService.getAllActiveStores());
    }

    @GetMapping("/all")
    public ResponseEntity<List<StoreDTO.Response>> getAllStoresAdmin(Authentication auth) {
        return ResponseEntity.ok(storeService.getAllStores());
    }

    @GetMapping("/my")
    public ResponseEntity<List<StoreDTO.Response>> getMyStores(Authentication auth) {
        Long userId = Long.parseLong((String) auth.getPrincipal());
        return ResponseEntity.ok(storeService.getStoresByOwner(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StoreDTO.Response> getStore(@PathVariable Long id) {
        return ResponseEntity.ok(storeService.getStoreById(id));
    }

    @PostMapping
    public ResponseEntity<StoreDTO.Response> createStore(
            @Valid @RequestBody StoreDTO.CreateRequest request,
            Authentication auth) {
        Long userId = Long.parseLong((String) auth.getPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storeService.createStore(request, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StoreDTO.Response> updateStore(
            @PathVariable Long id,
            @RequestBody StoreDTO.UpdateRequest request,
            Authentication auth) {
        Long userId = Long.parseLong((String) auth.getPrincipal());
        String role = getRoleFromAuth(auth);
        return ResponseEntity.ok(storeService.updateStore(id, request, userId, role));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStore(@PathVariable Long id, Authentication auth) {
        Long userId = Long.parseLong((String) auth.getPrincipal());
        String role = getRoleFromAuth(auth);
        storeService.deleteStore(id, userId, role);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<StoreDTO.Response> updateStoreStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body,
            Authentication auth) {
        Long userId = Long.parseLong((String) auth.getPrincipal());
        String role = getRoleFromAuth(auth);
        StoreDTO.UpdateRequest request = new StoreDTO.UpdateRequest();
        request.setStatus(Store.StoreStatus.valueOf(body.get("status")));
        return ResponseEntity.ok(storeService.updateStore(id, request, userId, role));
    }

    @PostMapping("/{id}/upload-image")
    public ResponseEntity<Map<String, String>> uploadStoreImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        try {
            Long userId = Long.parseLong((String) auth.getPrincipal());
            Store store = storeService.getStoreEntityById(id);

            if (!store.getOwnerId().equals(userId)) {
                return ResponseEntity.status(403).build();
            }

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String ext = "";
            String original = file.getOriginalFilename();
            if (original != null && original.contains("."))
                ext = original.substring(original.lastIndexOf("."));

            String filename = "store_" + id + "_" + UUID.randomUUID() + ext;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String imageUrl = "/api/stores/uploads/" + filename;
            storeService.updateStoreImage(id, imageUrl, userId);

            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (Exception e) {
            System.err.println("Store image upload error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/uploads/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> serveStoreImage(
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

    private String getRoleFromAuth(Authentication auth) {
        return auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }
}