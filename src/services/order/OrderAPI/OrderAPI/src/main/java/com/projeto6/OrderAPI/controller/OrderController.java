package main.java.com.projeto6.OrderAPI.controller;

import main.java.com.projeto6.OrderAPI.dto.OrderRequest;
import main.java.com.projeto6.OrderAPI.dto.OrderResponse;
import main.java.com.projeto6.OrderAPI.service.OrderService;
import main.java.com.projeto6.OrderAPI.model.Order;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Criar pedido
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestBody OrderRequest request) {

        return ResponseEntity.ok(orderService.createOrder(request));
    }

    // Listar todos os pedidos
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // Buscar pedido por ID
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    // Buscar pedidos por usuário
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    // Atualizar status (principal no fluxo)
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }

    // Cancelar pedido
    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }
}