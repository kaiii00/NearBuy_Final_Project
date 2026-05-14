package com.nearbuy.controller;

import com.nearbuy.dto.StoreDTO;
import com.nearbuy.model.Store;
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

    // GET /api/stores/all — admin only, returns all stores regardless of status
    @GetMapping("/all")
    public ResponseEntity<List<StoreDTO.Response>> getAllStoresAdmin(Authentication auth) {
        return ResponseEntity.ok(storeService.getAllStores());
    }

    // GET /api/stores/{id} — public
    @GetMapping("/{id}")
    public ResponseEntity<StoreDTO.Response> getStore(@PathVariable Long id) {
        return ResponseEntity.ok(storeService.getStoreById(id));
    }

    // GET /api/stores/my — store owner's own stores
    @GetMapping("/my")
    public ResponseEntity<List<StoreDTO.Response>> getMyStores(Authentication auth) {
        Long userId = Long.parseLong((String) auth.getPrincipal());
        return ResponseEntity.ok(storeService.getStoresByOwner(userId));
    }

    // POST /api/stores — create store (store_owner or admin)
    @PostMapping
    public ResponseEntity<StoreDTO.Response> createStore(
            @Valid @RequestBody StoreDTO.CreateRequest request,
            Authentication auth) {
        Long userId = Long.parseLong((String) auth.getPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storeService.createStore(request, userId));
    }

    // PUT /api/stores/{id} — update store
    @PutMapping("/{id}")
    public ResponseEntity<StoreDTO.Response> updateStore(
            @PathVariable Long id,
            @RequestBody StoreDTO.UpdateRequest request,
            Authentication auth) {
        Long userId = Long.parseLong((String) auth.getPrincipal());
        String role = getRoleFromAuth(auth);
        return ResponseEntity.ok(storeService.updateStore(id, request, userId, role));
    }

    // DELETE /api/stores/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStore(@PathVariable Long id, Authentication auth) {
        Long userId = Long.parseLong((String) auth.getPrincipal());
        String role = getRoleFromAuth(auth);
        storeService.deleteStore(id, userId, role);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/stores/{id}/status — admin only
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

    private String getRoleFromAuth(Authentication auth) {
        return auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }
}