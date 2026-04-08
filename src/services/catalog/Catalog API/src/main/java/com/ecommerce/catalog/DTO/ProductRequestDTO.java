package com.ecommerce.catalog.DTO;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.UUID;

@Getter
@Setter
public class ProductRequestDTO {
    private String name;
    private String description;
    private BigDecimal price;
    private String urlImg;
    private Boolean active;
    private UUID categoryId;
    private Timestamp createdAt;
}