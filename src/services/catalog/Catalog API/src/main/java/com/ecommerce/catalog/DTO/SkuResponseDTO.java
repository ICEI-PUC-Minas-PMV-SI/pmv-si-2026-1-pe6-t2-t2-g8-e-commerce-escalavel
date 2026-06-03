package com.ecommerce.catalog.DTO;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class SkuResponseDTO {
    private UUID id;
    private UUID variantId;
    private UUID productId;
    private String size;
    private String code;
    private BigDecimal price;
}
