package com.ecommerce.catalog.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRequestDTO {
    private String name;
    private Boolean active;
}