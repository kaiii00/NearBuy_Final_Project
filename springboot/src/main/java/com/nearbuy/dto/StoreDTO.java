package com.nearbuy.dto;

import com.nearbuy.model.Store;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

public class StoreDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "Store name is required")
        private String name;

        private String description;

        @NotBlank(message = "Address is required")
        private String address;

        private String city;
        private String barangay;
        private String contactNumber;
        private String imageUrl;

        @Min(0)
        private Double deliveryFee = 0.0;

        @Min(0)
        private Double minimumOrder = 0.0;

        private Integer estimatedDeliveryMinutes = 30;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String name;
        private String description;
        private String address;
        private String city;
        private String barangay;
        private String contactNumber;
        private String imageUrl;
        private Double deliveryFee;
        private Double minimumOrder;
        private Integer estimatedDeliveryMinutes;
        private Store.StoreStatus status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private String address;
        private String city;
        private String barangay;
        private String contactNumber;
        private String imageUrl;
        private Long ownerId;
        private Store.StoreStatus status;
        private Double deliveryFee;
        private Double minimumOrder;
        private Integer estimatedDeliveryMinutes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response from(Store store) {
            return Response.builder()
                    .id(store.getId())
                    .name(store.getName())
                    .description(store.getDescription())
                    .address(store.getAddress())
                    .city(store.getCity())
                    .barangay(store.getBarangay())
                    .contactNumber(store.getContactNumber())
                    .imageUrl(store.getImageUrl())
                    .ownerId(store.getOwnerId())
                    .status(store.getStatus())
                    .deliveryFee(store.getDeliveryFee())
                    .minimumOrder(store.getMinimumOrder())
                    .estimatedDeliveryMinutes(store.getEstimatedDeliveryMinutes())
                    .createdAt(store.getCreatedAt())
                    .updatedAt(store.getUpdatedAt())
                    .build();
        }
    }
}