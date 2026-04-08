package com.nearbuy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "stores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @NotBlank
    @Column(nullable = false)
    private String address;

    private String city;
    private String barangay;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "image_url")
    private String imageUrl;

    @NotNull
    @Column(name = "owner_id", nullable = false)
    private Long ownerId;  // References Django user ID

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StoreStatus status = StoreStatus.ACTIVE;

    @Column(name = "delivery_fee")
    @Builder.Default
    private Double deliveryFee = 0.0;

    @Column(name = "minimum_order")
    @Builder.Default
    private Double minimumOrder = 0.0;

    @Column(name = "estimated_delivery_minutes")
    @Builder.Default
    private Integer estimatedDeliveryMinutes = 30;

    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Product> products;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum StoreStatus {
        ACTIVE, INACTIVE, SUSPENDED
    }
}