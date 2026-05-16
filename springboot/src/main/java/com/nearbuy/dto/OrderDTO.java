package com.nearbuy.dto;

import com.nearbuy.model.Order;
import com.nearbuy.model.OrderItem;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class OrderDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotNull(message = "Store ID is required")
        private Long storeId;

        @NotEmpty(message = "Order must have at least one item")
        private List<OrderItemRequest> items;

        @NotBlank(message = "Delivery address is required")
        private String deliveryAddress;

        private String deliveryNotes;

        private String contactNumber;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatusUpdateRequest {
        @NotNull(message = "Status is required")
        private Order.OrderStatus status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productImageUrl;
        private Integer quantity;
        private Double unitPrice;
        private Double subtotal;
        private String unit;

        public static OrderItemResponse from(OrderItem item) {
            return OrderItemResponse.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getName())
                    .productImageUrl(item.getProduct().getImageUrl())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .subtotal(item.getSubtotal())
                    .unit(item.getProduct().getUnit())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long buyerId;
        private Long storeId;
        private String storeName;
        private List<OrderItemResponse> items;
        private Order.OrderStatus status;
        private String deliveryAddress;
        private String deliveryNotes;
        private Double totalAmount;
        private Double deliveryFee;
        private LocalDateTime estimatedDeliveryTime;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String contactNumber;

        public static Response from(Order order) {
            return Response.builder()
                    .id(order.getId())
                    .buyerId(order.getBuyerId())
                    .storeId(order.getStore().getId())
                    .storeName(order.getStore().getName())
                    .contactNumber(order.getContactNumber())
                    .items(order.getItems() != null ?
                           order.getItems().stream()
                               .map(OrderItemResponse::from)
                               .collect(Collectors.toList()) : List.of())
                    .status(order.getStatus())
                    .deliveryAddress(order.getDeliveryAddress())
                    .deliveryNotes(order.getDeliveryNotes())
                    .totalAmount(order.getTotalAmount())
                    .deliveryFee(order.getDeliveryFee())
                    .estimatedDeliveryTime(order.getEstimatedDeliveryTime())
                    .createdAt(order.getCreatedAt())
                    .updatedAt(order.getUpdatedAt())
                    .build();
        }
    }
}