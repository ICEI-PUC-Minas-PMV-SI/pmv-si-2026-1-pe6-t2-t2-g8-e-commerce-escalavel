package com.ecommerce.catalog.controller;

import com.ecommerce.catalog.DTO.CategoryRequestDTO;
import com.ecommerce.catalog.DTO.CategoryResponseDTO;
import com.ecommerce.catalog.model.Category;
import com.ecommerce.catalog.service.CategoryService;
import com.ecommerce.catalog.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>> findAll() {
        return ResponseEntity.ok(categoryService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(categoryService.findById(id));
    }

    @PostMapping
    public ResponseEntity<CategoryResponseDTO> save(@RequestBody CategoryRequestDTO categoryDTO) {
        return ResponseEntity.status(201).body(categoryService.save(categoryDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> update(@PathVariable UUID id, @RequestBody CategoryRequestDTO categoryDTO) {
        return ResponseEntity.ok(categoryService.update(id, categoryDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
