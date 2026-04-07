package com.ecommerce.catalog.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Getter
@Setter
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private String urlImg;
    private Boolean active;
    private Timestamp createdAt;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
}
