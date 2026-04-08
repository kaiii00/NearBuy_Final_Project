package com.nearbuy.controller;

import com.nearbuy.dto.OrderDTO;
import com.nearbuy.model.Order;
import com.nearbuy.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // POST /api/orders — buyer places an order
    @PostMapping
    public ResponseEntity<OrderDTO.Response> createOrder(
            @Valid @RequestBody OrderDTO.CreateRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(request, userId));
    }

    // GET /api/orders/my — buyer's own orders
    @GetMapping("/my")
    public ResponseEntity<List<OrderDTO.Response>> getMyOrders(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(orderService.getMyOrders(userId));
    }

    // GET /api/orders/{id}
    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO.Response> getOrder(
            @PathVariable Long id, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        String role = getRoleFromAuth(auth);
        return ResponseEntity.ok(orderService.getOrderById(id, userId, role));
    }

    // GET /api/orders/store/{storeId} — store owner sees their store's orders
    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<OrderDTO.Response>> getStoreOrders(
            @PathVariable Long storeId, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        String role = getRoleFromAuth(auth);
        return ResponseEntity.ok(orderService.getStoreOrders(storeId, userId, role));
    }

    // PATCH /api/orders/{id}/status — update order status
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDTO.Response> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderDTO.StatusUpdateRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        String role = getRoleFromAuth(auth);
        return ResponseEntity.ok(
                orderService.updateOrderStatus(id, request.getStatus(), userId, role));
    }

    private String getRoleFromAuth(Authentication auth) {
        return auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }
}