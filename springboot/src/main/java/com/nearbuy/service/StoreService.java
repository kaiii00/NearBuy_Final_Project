package com.nearbuy.service;

import com.nearbuy.dto.StoreDTO;
import com.nearbuy.exception.ForbiddenException;
import com.nearbuy.exception.ResourceNotFoundException;
import com.nearbuy.model.Store;
import com.nearbuy.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StoreService {

    @Autowired
    private StoreRepository storeRepository;

    public List<StoreDTO.Response> getAllActiveStores() {
        return storeRepository.findByStatus(Store.StoreStatus.ACTIVE)
                .stream().map(StoreDTO.Response::from).collect(Collectors.toList());
    }

    public List<StoreDTO.Response> getAllStores() {
        return storeRepository.findAll()
                .stream().map(StoreDTO.Response::from).collect(Collectors.toList());
    }

    public StoreDTO.Response getStoreById(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));
        return StoreDTO.Response.from(store);
    }

    public List<StoreDTO.Response> getStoresByOwner(Long ownerId) {
        return storeRepository.findByOwnerId(ownerId)
                .stream().map(StoreDTO.Response::from).collect(Collectors.toList());
    }

    public List<StoreDTO.Response> searchStores(String keyword) {
        return storeRepository.searchByKeyword(keyword)
                .stream()
                .filter(s -> s.getStatus() == Store.StoreStatus.ACTIVE)
                .map(StoreDTO.Response::from)
                .collect(Collectors.toList());
    }

    public StoreDTO.Response createStore(StoreDTO.CreateRequest request, Long ownerId) {
        Store store = Store.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .barangay(request.getBarangay())
                .contactNumber(request.getContactNumber())
                .imageUrl(request.getImageUrl())
                .ownerId(ownerId)
                .deliveryFee(request.getDeliveryFee() != null ? request.getDeliveryFee() : 0.0)
                .minimumOrder(request.getMinimumOrder() != null ? request.getMinimumOrder() : 0.0)
                .estimatedDeliveryMinutes(request.getEstimatedDeliveryMinutes() != null ? request.getEstimatedDeliveryMinutes() : 30)
                .status(Store.StoreStatus.ACTIVE)
                .build();
        return StoreDTO.Response.from(storeRepository.save(store));
    }

    public StoreDTO.Response updateStore(Long storeId, StoreDTO.UpdateRequest request, Long requesterId, String role) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));

        if (!store.getOwnerId().equals(requesterId) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new ForbiddenException("You don't have permission to update this store");
        }

        if (request.getName() != null) store.setName(request.getName());
        if (request.getDescription() != null) store.setDescription(request.getDescription());
        if (request.getAddress() != null) store.setAddress(request.getAddress());
        if (request.getCity() != null) store.setCity(request.getCity());
        if (request.getBarangay() != null) store.setBarangay(request.getBarangay());
        if (request.getContactNumber() != null) store.setContactNumber(request.getContactNumber());
        if (request.getImageUrl() != null) store.setImageUrl(request.getImageUrl());
        if (request.getDeliveryFee() != null) store.setDeliveryFee(request.getDeliveryFee());
        if (request.getMinimumOrder() != null) store.setMinimumOrder(request.getMinimumOrder());
        if (request.getEstimatedDeliveryMinutes() != null) store.setEstimatedDeliveryMinutes(request.getEstimatedDeliveryMinutes());
        if (request.getStatus() != null) store.setStatus(request.getStatus());

        return StoreDTO.Response.from(storeRepository.save(store));
    }

    public void deleteStore(Long storeId, Long requesterId, String role) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));

        if (!store.getOwnerId().equals(requesterId) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new ForbiddenException("You don't have permission to delete this store");
        }
storeRepository.delete(store);
    }

    public Store getStoreEntityById(Long id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));
    }

    public void updateStoreImage(Long storeId, String imageUrl, Long requesterId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));
        store.setImageUrl(imageUrl);
        storeRepository.save(store);
    }
}