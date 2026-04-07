package com.ecommerce.catalog.controller;

import com.ecommerce.catalog.DTO.ProductRequestDTO;
import com.ecommerce.catalog.DTO.ProductResponseDTO;
import com.ecommerce.catalog.model.Product;
import com.ecommerce.catalog.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> findAll(@RequestParam(required = false) String name,
                                                            @RequestParam(required = false) UUID categoryId,
                                                            @RequestParam(required = false) BigDecimal minPrice,
                                                            @RequestParam(required = false) BigDecimal maxPrice) {
        return ResponseEntity.ok(productService.findAll(name, categoryId, minPrice, maxPrice));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ProductResponseDTO> save(@RequestBody ProductRequestDTO dto) {
        return ResponseEntity.status(201).body(productService.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> update(@PathVariable UUID id, @RequestBody ProductRequestDTO dto) {
        return ResponseEntity.ok(productService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
