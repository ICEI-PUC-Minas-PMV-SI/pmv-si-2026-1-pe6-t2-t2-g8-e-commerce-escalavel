package com.ecommerce.catalog.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class ProductVariantResponseDTO {
    private UUID id;
    private UUID productId;
    private String color;
    private String urlImg;
    private List<SkuResponseDTO> skus;
}
