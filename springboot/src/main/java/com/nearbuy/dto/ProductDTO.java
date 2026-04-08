package com.nearbuy.dto;

import com.nearbuy.model.Product;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

public class ProductDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "Product name is required")
        private String name;

        private String description;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", message = "Price must be non-negative")
        private Double price;

        @Min(value = 0, message = "Stock must be non-negative")
        private Integer stock = 0;

        private String category;
        private String imageUrl;
        private String unit;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String name;
        private String description;
        private Double price;
        private Integer stock;
        private String category;
        private String imageUrl;
        private String unit;
        private Product.ProductStatus status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private Double price;
        private Integer stock;
        private String category;
        private String imageUrl;
        private String unit;
        private Long storeId;
        private String storeName;
        private Product.ProductStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response from(Product product) {
            return Response.builder()
                    .id(product.getId())
                    .name(product.getName())
                    .description(product.getDescription())
                    .price(product.getPrice())
                    .stock(product.getStock())
                    .category(product.getCategory())
                    .imageUrl(product.getImageUrl())
                    .unit(product.getUnit())
                    .storeId(product.getStore().getId())
                    .storeName(product.getStore().getName())
                    .status(product.getStatus())
                    .createdAt(product.getCreatedAt())
                    .updatedAt(product.getUpdatedAt())
                    .build();
        }
    }
}