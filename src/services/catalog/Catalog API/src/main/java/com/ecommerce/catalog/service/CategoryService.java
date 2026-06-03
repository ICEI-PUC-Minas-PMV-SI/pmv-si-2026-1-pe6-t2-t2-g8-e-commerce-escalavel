package com.ecommerce.catalog.service;

import com.ecommerce.catalog.DTO.CategoryRequestDTO;
import com.ecommerce.catalog.DTO.CategoryResponseDTO;
import com.ecommerce.catalog.model.Category;
import com.ecommerce.catalog.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponseDTO> findAll() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public CategoryResponseDTO findById(UUID id) {
        return toResponseDTO(categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada")));
    }

    public CategoryResponseDTO update(UUID id, CategoryRequestDTO dto) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        existing.setName(dto.getName());
        existing.setActive(dto.getActive());
        return toResponseDTO(categoryRepository.save(existing));
    }

    public CategoryResponseDTO save(CategoryRequestDTO dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setActive(dto.getActive());
        return toResponseDTO(categoryRepository.save(category));
    }

    public void delete(UUID id) {
        categoryRepository.deleteById(id);
    }

    private CategoryResponseDTO toResponseDTO(Category category) {
        CategoryResponseDTO dto = new CategoryResponseDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setActive(category.getActive());
        return dto;
    }
}
