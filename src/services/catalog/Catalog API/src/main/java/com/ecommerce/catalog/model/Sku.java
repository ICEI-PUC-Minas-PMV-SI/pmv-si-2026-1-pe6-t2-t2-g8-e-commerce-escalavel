package com.ecommerce.catalog.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(
        name = "sku",
        uniqueConstraints = @UniqueConstraint(name = "uk_sku_code", columnNames = "code")
)
@Getter
@Setter
public class Sku {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(nullable = false)
    private String size;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal price;
}
