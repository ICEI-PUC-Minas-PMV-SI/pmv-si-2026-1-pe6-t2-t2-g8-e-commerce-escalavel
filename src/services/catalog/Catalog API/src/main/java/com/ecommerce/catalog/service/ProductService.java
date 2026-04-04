package com.ecommerce.catalog.service;

import com.ecommerce.catalog.model.Product;
import com.ecommerce.catalog.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Product findById(UUID id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }

    public Product save(Product product) {
        return productRepository.save(product);
    }

    public void deleteById(UUID id) {
        productRepository.deleteById(id);
    }

    public Product update(UUID id, Product product) {
        Product produtoExistente = findById(id);
        produtoExistente.setName(product.getName());
        produtoExistente.setDescription(product.getDescription());
        produtoExistente.setPrice(product.getPrice());
        produtoExistente.setUrlImg(product.getUrlImg());
        produtoExistente.setActive(product.getActive());
        produtoExistente.setCategory(product.getCategory());
        return productRepository.save(produtoExistente);
    }
}
