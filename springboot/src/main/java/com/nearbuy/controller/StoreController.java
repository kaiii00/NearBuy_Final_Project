package com.nearbuy.controller;

import com.nearbuy.dto.StoreDTO;
import com.nearbuy.security.JwtUtils;
import com.nearbuy.service.StoreService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    @Autowired
    private StoreService storeService;

    @Autowired
    private JwtUtils jwtUtils;

    // GET /api/stores — public, list all active stores
    @GetMapping
    public ResponseEntity<List<StoreDTO.Response>> getAllStores(
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(storeService.searchStores(search));
        }
        return ResponseEntity.ok(storeService.getAllActiveStores());
    }

    // GET /api/stores/{id} — public
    @GetMapping("/{id}")
    public ResponseEntity<StoreDTO.Response> getStore(@PathVariable Long id) {
        return ResponseEntity.ok(storeService.getStoreById(id));
    }

    // GET /api/stores/my — store owner's own stores
    @GetMapping("/my")
    public ResponseEntity<List<StoreDTO.Response>> getMyStores(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(storeService.getStoresByOwner(userId));
    }

    // POST /api/stores — create store (store_owner or admin)
    @PostMapping
    public ResponseEntity<StoreDTO.Response> createStore(
            @Valid @RequestBody StoreDTO.CreateRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storeService.createStore(request, userId));
    }

    // PUT /api/stores/{id} — update store
    @PutMapping("/{id}")
    public ResponseEntity<StoreDTO.Response> updateStore(
            @PathVariable Long id,
            @RequestBody StoreDTO.UpdateRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        String role = getRoleFromAuth(auth);
        return ResponseEntity.ok(storeService.updateStore(id, request, userId, role));
    }

    // DELETE /api/stores/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStore(@PathVariable Long id, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        String role = getRoleFromAuth(auth);
        storeService.deleteStore(id, userId, role);
        return ResponseEntity.noContent().build();
    }

    private String getRoleFromAuth(Authentication auth) {
        return auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }
}