package com.nearbuy.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nearbuy.dto.OrderDTO;
import com.nearbuy.exception.BadRequestException;
import com.nearbuy.exception.ForbiddenException;
import com.nearbuy.exception.ResourceNotFoundException;
import com.nearbuy.model.*;
import com.nearbuy.repository.OrderRepository;
import com.nearbuy.repository.ProductRepository;
import com.nearbuy.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private ProductRepository productRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Django notification endpoint (internal Docker network)
    private static final String DJANGO_NOTIF_URL = "http://django_api:8000/api/notifications/create/";

    // ── Send notification to Django ───────────────────────────────────────────
    private void sendNotification(Long userId, String type, String title, String message, Long orderId) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("user_id", userId);
            payload.put("type", type);
            payload.put("title", title);
            payload.put("message", message);
            payload.put("order_id", orderId);

            String json = objectMapper.writeValueAsString(payload);
            byte[] jsonBytes = json.getBytes(StandardCharsets.UTF_8);

            System.out.println(">>> Sending notification: userId=" + userId + ", type=" + type + ", orderId=" + orderId);
            System.out.println(">>> Payload: " + json);

            URL url = new URL(DJANGO_NOTIF_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Content-Length", String.valueOf(jsonBytes.length));
            conn.setDoOutput(true);
            conn.setFixedLengthStreamingMode(jsonBytes.length);

            try (OutputStream os = conn.getOutputStream()) {
                os.write(jsonBytes);
                os.flush();
            }

            int responseCode = conn.getResponseCode();
            System.out.println(">>> Notification response code: " + responseCode);
            conn.disconnect();

        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }

    // ── Notification messages per status ─────────────────────────────────────
    private void notifyBuyerOfStatus(Long buyerId, Order.OrderStatus status, Long orderId, String storeName) {
        switch (status) {
            case PENDING -> sendNotification(buyerId,
                "order_placed",
                "Order Placed! 📋",
                "Your order #" + orderId + " from " + storeName + " has been placed successfully.",
                orderId);
            case CONFIRMED -> sendNotification(buyerId,
                "order_confirmed",
                "Order Confirmed! ✅",
                storeName + " has confirmed your order #" + orderId + ". It will be prepared soon.",
                orderId);
            case PREPARING -> sendNotification(buyerId,
                "order_preparing",
                "Order Being Prepared 👨‍🍳",
                storeName + " is now preparing your order #" + orderId + ".",
                orderId);
            case OUT_FOR_DELIVERY -> sendNotification(buyerId,
                "order_out_for_delivery",
                "Order On the Way! 🛵",
                "Your order #" + orderId + " from " + storeName + " is out for delivery!",
                orderId);
            case DELIVERED -> sendNotification(buyerId,
                "order_delivered",
                "Order Delivered! 📦",
                "Your order #" + orderId + " from " + storeName + " has been delivered. Enjoy!",
                orderId);
            case CANCELLED -> sendNotification(buyerId,
                "order_cancelled",
                "Order Cancelled ❌",
                "Your order #" + orderId + " from " + storeName + " has been cancelled.",
                orderId);
        }
    }

    @Transactional
    public OrderDTO.Response createOrder(OrderDTO.CreateRequest request, Long buyerId) {
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + request.getStoreId()));

        if (store.getStatus() != Store.StoreStatus.ACTIVE) {
            throw new BadRequestException("Store is not currently accepting orders");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        double itemsTotal = 0.0;

        for (OrderDTO.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));

            if (!product.getStore().getId().equals(store.getId())) {
                throw new BadRequestException("Product " + product.getName() + " does not belong to this store");
            }

            if (product.getStatus() != Product.ProductStatus.AVAILABLE) {
                throw new BadRequestException("Product '" + product.getName() + "' is not available");
            }

            if (product.getStock() < itemReq.getQuantity()) {
                throw new BadRequestException("Insufficient stock for: " + product.getName());
            }

            double subtotal = product.getPrice() * itemReq.getQuantity();
            itemsTotal += subtotal;

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getPrice())
                    .subtotal(subtotal)
                    .build();
            orderItems.add(item);

            product.setStock(product.getStock() - itemReq.getQuantity());
            if (product.getStock() == 0) {
                product.setStatus(Product.ProductStatus.OUT_OF_STOCK);
            }
            productRepository.save(product);
        }

        if (itemsTotal < store.getMinimumOrder()) {
            throw new BadRequestException(
                "Order total ₱" + itemsTotal + " is below minimum order of ₱" + store.getMinimumOrder());
        }

        double totalAmount = itemsTotal + store.getDeliveryFee();

        Order order = Order.builder()
                .buyerId(buyerId)
                .store(store)
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryNotes(request.getDeliveryNotes())
                .contactNumber(request.getContactNumber())
                .totalAmount(totalAmount)
                .deliveryFee(store.getDeliveryFee())
                .status(Order.OrderStatus.PENDING)
                .estimatedDeliveryTime(LocalDateTime.now().plusMinutes(store.getEstimatedDeliveryMinutes()))
                .build();

        order = orderRepository.save(order);

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setItems(orderItems);
        order = orderRepository.save(order);

        // Notify buyer that order was placed
        notifyBuyerOfStatus(buyerId, Order.OrderStatus.PENDING, order.getId(), store.getName());

        return OrderDTO.Response.from(order);
    }

    public List<OrderDTO.Response> getMyOrders(Long buyerId) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId)
                .stream().map(OrderDTO.Response::from).collect(Collectors.toList());
    }

    public OrderDTO.Response getOrderById(Long orderId, Long requesterId, String role) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        boolean isBuyer      = order.getBuyerId().equals(requesterId);
        boolean isStoreOwner = order.getStore().getOwnerId().equals(requesterId);
        boolean isAdmin      = "ADMIN".equalsIgnoreCase(role);

        if (!isBuyer && !isStoreOwner && !isAdmin) {
            throw new ForbiddenException("Access denied");
        }

        return OrderDTO.Response.from(order);
    }

    public List<OrderDTO.Response> getStoreOrders(Long storeId, Long requesterId, String role) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + storeId));

        if (!store.getOwnerId().equals(requesterId) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Only the store owner can view store orders");
        }

        return orderRepository.findByStoreIdOrderByCreatedAtDesc(storeId)
                .stream().map(OrderDTO.Response::from).collect(Collectors.toList());
    }

    @Transactional
    public OrderDTO.Response updateOrderStatus(Long orderId, Order.OrderStatus newStatus,
                                                Long requesterId, String role) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        boolean isStoreOwner = order.getStore().getOwnerId().equals(requesterId);
        boolean isBuyer      = order.getBuyerId().equals(requesterId);
        boolean isAdmin      = "ADMIN".equalsIgnoreCase(role);

        if (isBuyer) {
            throw new ForbiddenException("Only the store owner can cancel this order");
        } else if (isStoreOwner || isAdmin) {                                            
            if (newStatus == Order.OrderStatus.CANCELLED) {
                restoreStock(order);
            }
        } else {
            throw new ForbiddenException("You don't have permission to update this order");
        }

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);

        // Notify buyer of the new status
        notifyBuyerOfStatus(
            order.getBuyerId(),
            newStatus,
            saved.getId(),
            order.getStore().getName()
        );

        return OrderDTO.Response.from(saved);
    }

    private void restoreStock(Order order) {
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                if (product.getStatus() == Product.ProductStatus.OUT_OF_STOCK) {
                    product.setStatus(Product.ProductStatus.AVAILABLE);
                }
                productRepository.save(product);
            }
        }
    }
}