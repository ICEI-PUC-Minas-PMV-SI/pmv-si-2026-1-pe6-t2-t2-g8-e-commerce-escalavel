package com.ecommerce.catalog.DTO;

import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class ProductResponseDTO {
    private UUID id;
    private String name;
    private String description;
    private String urlImg;
    private Boolean active;
    private CategoryResponseDTO category;
    private Timestamp createdAt;
    private List<ProductVariantResponseDTO> variants;
}
