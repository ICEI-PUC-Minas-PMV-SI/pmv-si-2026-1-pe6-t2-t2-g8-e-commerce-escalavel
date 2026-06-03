package com.ecommerce.catalog.service;

import com.ecommerce.catalog.DTO.SkuRequestDTO;
import com.ecommerce.catalog.DTO.SkuResponseDTO;
import com.ecommerce.catalog.model.ProductVariant;
import com.ecommerce.catalog.model.Sku;
import com.ecommerce.catalog.repository.ProductVariantRepository;
import com.ecommerce.catalog.repository.SkuRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SkuService {

    private final SkuRepository skuRepository;
    private final ProductVariantRepository variantRepository;

    public SkuService(SkuRepository skuRepository, ProductVariantRepository variantRepository) {
        this.skuRepository = skuRepository;
        this.variantRepository = variantRepository;
    }

    public List<SkuResponseDTO> findByVariantId(UUID variantId) {
        return skuRepository.findByVariantId(variantId).stream().map(this::toResponseDTO).toList();
    }

    public SkuResponseDTO findById(UUID id) {
        return toResponseDTO(skuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SKU não encontrado")));
    }

    public SkuResponseDTO findByCode(String code) {
        return toResponseDTO(skuRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("SKU não encontrado")));
    }

    public SkuResponseDTO save(UUID variantId, SkuRequestDTO dto) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variante não encontrada"));
        Sku sku = new Sku();
        sku.setVariant(variant);
        sku.setSize(dto.getSize());
        sku.setCode(dto.getCode());
        sku.setPrice(dto.getPrice());
        return toResponseDTO(skuRepository.save(sku));
    }

    public SkuResponseDTO update(UUID id, SkuRequestDTO dto) {
        Sku existing = skuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SKU não encontrado"));
        existing.setSize(dto.getSize());
        existing.setCode(dto.getCode());
        existing.setPrice(dto.getPrice());
        return toResponseDTO(skuRepository.save(existing));
    }

    public void delete(UUID id) {
        skuRepository.deleteById(id);
    }

    private SkuResponseDTO toResponseDTO(Sku sku) {
        SkuResponseDTO dto = new SkuResponseDTO();
        dto.setId(sku.getId());
        dto.setVariantId(sku.getVariant().getId());
        dto.setProductId(sku.getVariant().getProduct().getId());
        dto.setSize(sku.getSize());
        dto.setCode(sku.getCode());
        dto.setPrice(sku.getPrice());
        return dto;
    }
}
