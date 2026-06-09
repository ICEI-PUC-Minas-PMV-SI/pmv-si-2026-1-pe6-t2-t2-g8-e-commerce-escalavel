package com.ecommerce.catalog.service;

import com.ecommerce.catalog.DTO.CategoryResponseDTO;
import com.ecommerce.catalog.DTO.ProductRequestDTO;
import com.ecommerce.catalog.DTO.ProductResponseDTO;
import com.ecommerce.catalog.DTO.ProductVariantResponseDTO;
import com.ecommerce.catalog.DTO.SkuResponseDTO;
import com.ecommerce.catalog.model.Category;
import com.ecommerce.catalog.model.Product;
import com.ecommerce.catalog.model.ProductVariant;
import com.ecommerce.catalog.model.Sku;
import com.ecommerce.catalog.repository.CategoryRepository;
import com.ecommerce.catalog.repository.ProductRepository;
import com.ecommerce.catalog.repository.ProductSpecification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<ProductResponseDTO> findAll(String name, UUID categoryId, BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findAll(ProductSpecification.filter(name, categoryId, minPrice, maxPrice))
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public ProductResponseDTO findById(UUID id) {
        return toResponseDTO(productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado")));
    }

    public ProductResponseDTO save(ProductRequestDTO dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setUrlImg(dto.getUrlImg());
        product.setActive(dto.getActive());
        product.setCategory(category);
        return toResponseDTO(productRepository.save(product));
    }

    public ProductResponseDTO update(UUID id, ProductRequestDTO dto) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setUrlImg(dto.getUrlImg());
        existing.setActive(dto.getActive());
        existing.setCategory(category);
        return toResponseDTO(productRepository.save(existing));
    }

    public void delete(UUID id) {
        productRepository.deleteById(id);
    }

    private ProductResponseDTO toResponseDTO(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setUrlImg(product.getUrlImg());
        dto.setActive(product.getActive());
        dto.setCreatedAt(product.getCreatedAt());

        if (product.getCategory() != null) {
            CategoryResponseDTO categoryDTO = new CategoryResponseDTO();
            categoryDTO.setId(product.getCategory().getId());
            categoryDTO.setName(product.getCategory().getName());
            categoryDTO.setActive(product.getCategory().getActive());
            dto.setCategory(categoryDTO);
        }

        List<ProductVariant> variants = product.getVariants() != null ? product.getVariants() : Collections.emptyList();
        dto.setVariants(variants.stream().map(this::toVariantDTO).toList());

        return dto;
    }

    private ProductVariantResponseDTO toVariantDTO(ProductVariant variant) {
        ProductVariantResponseDTO dto = new ProductVariantResponseDTO();
        dto.setId(variant.getId());
        dto.setProductId(variant.getProduct().getId());
        dto.setColor(variant.getColor());
        dto.setUrlImg(variant.getUrlImg());
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
