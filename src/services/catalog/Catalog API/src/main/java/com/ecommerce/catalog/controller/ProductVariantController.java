package com.ecommerce.catalog.controller;

import com.ecommerce.catalog.DTO.ProductVariantRequestDTO;
import com.ecommerce.catalog.DTO.ProductVariantResponseDTO;
import com.ecommerce.catalog.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ProductVariantController {
    private final ProductVariantService variantService;

    @GetMapping("/products/{productId}/variants")
    public ResponseEntity<List<ProductVariantResponseDTO>> findByProductId(@PathVariable UUID productId) {
        return ResponseEntity.ok(variantService.findByProductId(productId));
    }

    @PostMapping("/products/{productId}/variants")
    public ResponseEntity<ProductVariantResponseDTO> save(@PathVariable UUID productId,
                                                          @RequestBody ProductVariantRequestDTO dto) {
        return ResponseEntity.status(201).body(variantService.save(productId, dto));
    }

    @GetMapping("/variants/{id}")
    public ResponseEntity<ProductVariantResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(variantService.findById(id));
    }

    @PutMapping("/variants/{id}")
    public ResponseEntity<ProductVariantResponseDTO> update(@PathVariable UUID id,
                                                            @RequestBody ProductVariantRequestDTO dto) {
        return ResponseEntity.ok(variantService.update(id, dto));
    }

    @DeleteMapping("/variants/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        variantService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
