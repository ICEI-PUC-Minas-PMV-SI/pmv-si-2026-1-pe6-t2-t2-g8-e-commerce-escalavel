package com.ecommerce.catalog.repository;

import com.ecommerce.catalog.model.Sku;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SkuRepository extends JpaRepository<Sku, UUID> {
    List<Sku> findByVariantId(UUID variantId);

    Optional<Sku> findByCode(String code);
}
