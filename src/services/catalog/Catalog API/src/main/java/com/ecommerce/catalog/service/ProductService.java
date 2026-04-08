package com.ecommerce.catalog.service;

import com.ecommerce.catalog.DTO.CategoryResponseDTO;
import com.ecommerce.catalog.DTO.ProductRequestDTO;
import com.ecommerce.catalog.DTO.ProductResponseDTO;
import com.ecommerce.catalog.exception.ResourceNotFoundException;
import com.ecommerce.catalog.model.Category;
import com.ecommerce.catalog.model.Product;
import com.ecommerce.catalog.repository.CategoryRepository;
import com.ecommerce.catalog.repository.ProductRepository;
import com.ecommerce.catalog.repository.ProductSpecification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado")));
    }

    public ProductResponseDTO save(ProductRequestDTO dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setUrlImg(dto.getUrlImg());
        product.setActive(dto.getActive());
        product.setCategory(category);
        return toResponseDTO(productRepository.save(product));
    }

    public ProductResponseDTO update(UUID id, ProductRequestDTO dto) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado"));
        Category category = null;

        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
        }

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPrice(dto.getPrice());
        existing.setUrlImg(dto.getUrlImg());
        existing.setActive(dto.getActive());
        existing.setCreatedAt(dto.getCreatedAt());
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
        dto.setPrice(product.getPrice());
        dto.setUrlImg(product.getUrlImg());
        dto.setActive(product.getActive());

        CategoryResponseDTO categoryDTO = new CategoryResponseDTO();
        categoryDTO.setId(product.getCategory().getId());
        categoryDTO.setName(product.getCategory().getName());
        categoryDTO.setActive(product.getCategory().getActive());
        dto.setCategory(categoryDTO);

        return dto;
    }
}
