package com.nearbuy.repository;

import com.nearbuy.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<Order> findByStoreIdOrderByCreatedAtDesc(Long storeId);

    List<Order> findByStoreIdAndStatus(Long storeId, Order.OrderStatus status);

    List<Order> findByBuyerIdAndStatus(Long buyerId, Order.OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.store.id = :storeId AND o.store.ownerId = :ownerId ORDER BY o.createdAt DESC")
    List<Order> findByStoreOwner(@Param("storeId") Long storeId, @Param("ownerId") Long ownerId);
}