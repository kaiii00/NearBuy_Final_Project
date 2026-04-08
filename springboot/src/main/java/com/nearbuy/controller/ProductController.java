package com.nearbuy.controller;

import com.nearbuy.dto.ProductDTO;
import com.nearbuy.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService productService;

    // GET /api/stores/{storeId}/products — public, available products only
    @GetMapping("/stores/{storeId}/products")
    public ResponseEntity<List<ProductDTO.Response>> getStoreProducts(
            @PathVariable Long storeId) {
        return ResponseEntity.ok(productService.getProductsByStore(storeId));
    }

    // GET /api/stores/{storeId}/products/all — owner/admin, all products including OOS
    @GetMapping("/stores/{storeId}/products/all")
    public ResponseEntity<List<ProductDTO.Response>> getAllStoreProducts(
            @PathVariable Long storeId,
            Authentication auth) {
        return ResponseEntity.ok(productService.getAllProductsByStore(storeId));
    }

    // GET /api/stores/{storeId}/products/categories
    @GetMapping("/stores/{storeId}/products/categories")
    public ResponseEntity<List<String>> getCategories(@PathVariable Long storeId) {
        return ResponseEntity.ok(productService.getCategoriesByStore(storeId));
    }

    // GET /api/products/{id} — public
    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDTO.Response> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // POST /api/stores/{storeId}/products — store owner only
    @PostMapping("/stores/{storeId}/products")
    public ResponseEntity<ProductDTO.Response> createProduct(
            @PathVariable Long storeId,
            @Valid @RequestBody ProductDTO.CreateRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        String role = getRoleFromAuth(auth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProduct(storeId, request, userId, role));
    }

    // PUT /api/products/{id}
    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDTO.Response> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductDTO.UpdateRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        String role = getRoleFromAuth(auth);
        return ResponseEntity.ok(productService.updateProduct(id, request, userId, role));
    }

    // DELETE /api/products/{id}
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        String role = getRoleFromAuth(auth);
        productService.deleteProduct(id, userId, role);
        return ResponseEntity.noContent().build();
    }

    private String getRoleFromAuth(Authentication auth) {
        return auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }
}