package com.nearbuy.controller;

import com.nearbuy.dto.ProductDTO;
import com.nearbuy.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/stores/{storeId}/products")
    public ResponseEntity<List<ProductDTO.Response>> getAllStoreProducts(
            @PathVariable Long storeId) {
        return ResponseEntity.ok(productService.getAllProductsByStore(storeId));
    }

    @PostMapping("/stores/{storeId}/products")
    public ResponseEntity<ProductDTO.Response> createProduct(
            @PathVariable Long storeId,
            @Valid @RequestBody ProductDTO.CreateRequest request,
            Authentication auth) {

        Long userId = Long.parseLong(auth.getName());

        return ResponseEntity.ok(
                productService.createProduct(storeId, request, userId, "OWNER")
        );
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDTO.Response> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductDTO.UpdateRequest request,
            Authentication auth) {

        Long userId = Long.parseLong(auth.getName());

        return ResponseEntity.ok(
                productService.updateProduct(id, request, userId, "OWNER")
        );
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            Authentication auth) {

        Long userId = Long.parseLong(auth.getName());

        productService.deleteProduct(id, userId, "OWNER");
        return ResponseEntity.noContent().build();
    }
}