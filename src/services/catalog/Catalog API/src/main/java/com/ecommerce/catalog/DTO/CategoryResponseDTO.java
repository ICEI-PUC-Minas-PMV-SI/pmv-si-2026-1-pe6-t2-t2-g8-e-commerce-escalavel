package com.ecommerce.catalog.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CategoryResponseDTO {
    private UUID id;
    private String name;
    private Boolean active;
}