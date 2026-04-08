package com.nearbuy.repository;

import com.nearbuy.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByStoreId(Long storeId);

    List<Product> findByStoreIdAndStatus(Long storeId, Product.ProductStatus status);

    List<Product> findByStoreIdAndCategory(Long storeId, String category);

    @Query("SELECT p FROM Product p WHERE p.store.id = :storeId AND " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByStoreAndKeyword(@Param("storeId") Long storeId,
                                          @Param("keyword") String keyword);

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.store.id = :storeId AND p.category IS NOT NULL")
    List<String> findCategoriesByStoreId(@Param("storeId") Long storeId);
}