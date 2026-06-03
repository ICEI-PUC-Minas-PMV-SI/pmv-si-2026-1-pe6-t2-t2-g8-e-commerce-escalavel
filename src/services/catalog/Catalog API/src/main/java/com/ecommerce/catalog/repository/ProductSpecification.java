package com.ecommerce.catalog.repository;

import com.ecommerce.catalog.model.Product;
import com.ecommerce.catalog.model.ProductVariant;
import com.ecommerce.catalog.model.Sku;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ProductSpecification {

    public static Specification<Product> filter(String name, UUID categoryId, BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (name != null && !name.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (minPrice != null || maxPrice != null) {
                if (query != null) {
                    Subquery<UUID> sq = query.subquery(UUID.class);
                    Root<Sku> skuRoot = sq.from(Sku.class);
                    Join<Sku, ProductVariant> variantJoin = skuRoot.join("variant");
                    sq.select(variantJoin.get("product").get("id"));

                    List<Predicate> priceFilters = new ArrayList<>();
                    if (minPrice != null) {
                        priceFilters.add(cb.greaterThanOrEqualTo(skuRoot.get("price"), minPrice));
                    }
                    if (maxPrice != null) {
                        priceFilters.add(cb.lessThanOrEqualTo(skuRoot.get("price"), maxPrice));
                    }
                    sq.where(priceFilters.toArray(new Predicate[0]));

                    predicates.add(root.get("id").in(sq));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
