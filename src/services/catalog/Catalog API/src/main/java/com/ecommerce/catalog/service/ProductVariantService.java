package com.ecommerce.catalog.service;

import com.ecommerce.catalog.DTO.ProductVariantRequestDTO;
import com.ecommerce.catalog.DTO.ProductVariantResponseDTO;
import com.ecommerce.catalog.DTO.SkuResponseDTO;
import com.ecommerce.catalog.model.Product;
import com.ecommerce.catalog.model.ProductVariant;
import com.ecommerce.catalog.model.Sku;
import com.ecommerce.catalog.repository.ProductRepository;
import com.ecommerce.catalog.repository.ProductVariantRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;

    public ProductVariantService(ProductVariantRepository variantRepository, ProductRepository productRepository) {
        this.variantRepository = variantRepository;
        this.productRepository = productRepository;
    }

    public List<ProductVariantResponseDTO> findByProductId(UUID productId) {
        return variantRepository.findByProductId(productId).stream().map(this::toResponseDTO).toList();
    }

    public ProductVariantResponseDTO findById(UUID id) {
        return toResponseDTO(variantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Variante não encontrada")));
    }

    public ProductVariantResponseDTO save(UUID productId, ProductVariantRequestDTO dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setColor(dto.getColor());
        return toResponseDTO(variantRepository.save(variant));
    }

    public ProductVariantResponseDTO update(UUID id, ProductVariantRequestDTO dto) {
        ProductVariant existing = variantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Variante não encontrada"));
        existing.setColor(dto.getColor());
        return toResponseDTO(variantRepository.save(existing));
    }

    public void delete(UUID id) {
        variantRepository.deleteById(id);
    }

    private ProductVariantResponseDTO toResponseDTO(ProductVariant variant) {
        ProductVariantResponseDTO dto = new ProductVariantResponseDTO();
        dto.setId(variant.getId());
        dto.setProductId(variant.getProduct().getId());
        dto.setColor(variant.getColor());
        List<Sku> skus = variant.getSkus() != null ? variant.getSkus() : Collections.emptyList();
        dto.setSkus(skus.stream().map(this::toSkuDTO).toList());
        return dto;
    }

    private SkuResponseDTO toSkuDTO(Sku sku) {
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
