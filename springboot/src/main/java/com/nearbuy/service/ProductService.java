package com.nearbuy.service;

import com.nearbuy.dto.ProductDTO;
import com.nearbuy.exception.ForbiddenException;
import com.nearbuy.exception.ResourceNotFoundException;
import com.nearbuy.model.Product;
import com.nearbuy.model.Store;
import com.nearbuy.repository.ProductRepository;
import com.nearbuy.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StoreRepository storeRepository;

    public List<ProductDTO.Response> getProductsByStore(Long storeId) {
        storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + storeId));
        return productRepository.findByStoreIdAndStatus(storeId, Product.ProductStatus.AVAILABLE)
                .stream().map(ProductDTO.Response::from).collect(Collectors.toList());
    }

    public List<ProductDTO.Response> getAllProductsByStore(Long storeId) {
        return productRepository.findByStoreId(storeId)
                .stream().map(ProductDTO.Response::from).collect(Collectors.toList());
    }

    public ProductDTO.Response getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        return ProductDTO.Response.from(product);
    }

    public List<String> getCategoriesByStore(Long storeId) {
        return productRepository.findCategoriesByStoreId(storeId);
    }

    public ProductDTO.Response createProduct(Long storeId, ProductDTO.CreateRequest request, Long requesterId, String role) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + storeId));

        if (!store.getOwnerId().equals(requesterId) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Only the store owner can add products");
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .unit(request.getUnit())
                .store(store)
                .status(request.getStock() != null && request.getStock() > 0
                        ? Product.ProductStatus.AVAILABLE
                        : Product.ProductStatus.OUT_OF_STOCK)
                .build();

        return ProductDTO.Response.from(productRepository.save(product));
    }

    public ProductDTO.Response updateProduct(Long productId, ProductDTO.UpdateRequest request, Long requesterId, String role) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (!product.getStore().getOwnerId().equals(requesterId) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Only the store owner can update products");
        }

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getCategory() != null) product.setCategory(request.getCategory());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getUnit() != null) product.setUnit(request.getUnit());
        if (request.getStatus() != null) product.setStatus(request.getStatus());
        if (request.getStock() != null) {
            product.setStock(request.getStock());
            if (product.getStatus() != Product.ProductStatus.DISCONTINUED) {
                product.setStatus(request.getStock() > 0
                        ? Product.ProductStatus.AVAILABLE
                        : Product.ProductStatus.OUT_OF_STOCK);
            }
        }

        return ProductDTO.Response.from(productRepository.save(product));
    }

    public void deleteProduct(Long productId, Long requesterId, String role) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (!product.getStore().getOwnerId().equals(requesterId) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Only the store owner can delete products");
        }

        productRepository.delete(product);
    }
}