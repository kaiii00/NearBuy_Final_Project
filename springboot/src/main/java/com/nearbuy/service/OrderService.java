package com.nearbuy.service;

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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public OrderDTO.Response createOrder(OrderDTO.CreateRequest request, Long buyerId) {
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + request.getStoreId()));

        if (store.getStatus() != Store.StoreStatus.ACTIVE) {
            throw new BadRequestException("Store is not currently accepting orders");
        }

        // Build order items and calculate total
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

            // Deduct stock
            product.setStock(product.getStock() - itemReq.getQuantity());
            if (product.getStock() == 0) {
                product.setStatus(Product.ProductStatus.OUT_OF_STOCK);
            }
            productRepository.save(product);
        }

        // Check minimum order
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
                .totalAmount(totalAmount)
                .deliveryFee(store.getDeliveryFee())
                .status(Order.OrderStatus.PENDING)
                .estimatedDeliveryTime(LocalDateTime.now().plusMinutes(store.getEstimatedDeliveryMinutes()))
                .build();

        order = orderRepository.save(order);

        // Link items to order
        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setItems(orderItems);
        order = orderRepository.save(order);

        return OrderDTO.Response.from(order);
    }

    public List<OrderDTO.Response> getMyOrders(Long buyerId) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId)
                .stream().map(OrderDTO.Response::from).collect(Collectors.toList());
    }

    public OrderDTO.Response getOrderById(Long orderId, Long requesterId, String role) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        boolean isBuyer = order.getBuyerId().equals(requesterId);
        boolean isStoreOwner = order.getStore().getOwnerId().equals(requesterId);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);

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
        boolean isBuyer = order.getBuyerId().equals(requesterId);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);

        // Buyers can only cancel their own pending orders
        if (isBuyer && newStatus == Order.OrderStatus.CANCELLED) {
            if (order.getStatus() != Order.OrderStatus.PENDING) {
                throw new BadRequestException("Can only cancel pending orders");
            }
            restoreStock(order);
        } else if (isStoreOwner || isAdmin) {
            // Store owners/admin can update to any status
            if (newStatus == Order.OrderStatus.CANCELLED) {
                restoreStock(order);
            }
        } else {
            throw new ForbiddenException("You don't have permission to update this order");
        }

        order.setStatus(newStatus);
        return OrderDTO.Response.from(orderRepository.save(order));
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