package com.ecommerce.catalog.controller;

import com.ecommerce.catalog.DTO.SkuRequestDTO;
import com.ecommerce.catalog.DTO.SkuResponseDTO;
import com.ecommerce.catalog.service.SkuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SkuController {
    private final SkuService skuService;

    @GetMapping("/variants/{variantId}/skus")
    public ResponseEntity<List<SkuResponseDTO>> findByVariantId(@PathVariable UUID variantId) {
        return ResponseEntity.ok(skuService.findByVariantId(variantId));
    }

    @PostMapping("/variants/{variantId}/skus")
    public ResponseEntity<SkuResponseDTO> save(@PathVariable UUID variantId,
                                               @RequestBody SkuRequestDTO dto) {
        return ResponseEntity.status(201).body(skuService.save(variantId, dto));
    }

    @GetMapping("/skus/{id}")
    public ResponseEntity<SkuResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(skuService.findById(id));
    }

    @GetMapping("/skus/by-code/{code}")
    public ResponseEntity<SkuResponseDTO> findByCode(@PathVariable String code) {
        return ResponseEntity.ok(skuService.findByCode(code));
    }

    @PutMapping("/skus/{id}")
    public ResponseEntity<SkuResponseDTO> update(@PathVariable UUID id,
                                                 @RequestBody SkuRequestDTO dto) {
        return ResponseEntity.ok(skuService.update(id, dto));
    }

    @DeleteMapping("/skus/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        skuService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
