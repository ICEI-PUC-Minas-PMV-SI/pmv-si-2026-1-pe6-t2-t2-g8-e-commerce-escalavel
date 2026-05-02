package com.ecommerce.catalog.DTO;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class SkuRequestDTO {
    private String size;
    private String code;
    private BigDecimal price;
}
