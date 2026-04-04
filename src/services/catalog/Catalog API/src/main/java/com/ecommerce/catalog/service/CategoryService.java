package com.ecommerce.catalog.service;

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

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    public Category findById(UUID id) {
        return categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
    }

    public Category update(UUID id, Category category) {
        Category categoriaExistente = findById(id);
        categoriaExistente.setName(category.getName());
        return categoryRepository.save(categoriaExistente);
    }

    public Category save(Category category) {
        return categoryRepository.save(category);
    }

    public void delete(UUID id) {
        categoryRepository.deleteById(id);
    }
}
