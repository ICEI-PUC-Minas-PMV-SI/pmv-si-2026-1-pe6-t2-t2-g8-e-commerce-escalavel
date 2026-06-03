package com.projeto6.OrderAPI.controller;

import com.projeto6.OrderAPI.dto.OrderRequest;
import com.projeto6.OrderAPI.dto.OrderResponse;
import com.projeto6.OrderAPI.service.OrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Pedidos", description = "Endpoints para gerenciamento de pedidos")
@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Criar pedido
    @Operation(summary = "Criar um novo pedido")
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestBody OrderRequest request) {

        return ResponseEntity.ok(orderService.createOrder(request));
    }

    // Listar todos os pedidos
    @Operation(summary = "Listar todos os pedidos")
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // Buscar pedido por ID
    @Operation(summary = "Buscar pedido pelo ID")
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(
            @Parameter(description = "ID do pedido", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID id) {

        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    // Buscar pedidos por usuário
    @Operation(summary = "Buscar pedidos por ID do usuário")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUser(
            @Parameter(description = "ID do usuário", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID userId) {

        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    // Atualizar status
    @Operation(summary = "Atualizar status do pedido")
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @Parameter(description = "ID do pedido", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID id,

            @Parameter(description = "Novo status do pedido", example = "APROVADO")
            @RequestParam String status) {

        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }

    // Cancelar pedido
    @Operation(summary = "Cancelar um pedido")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @Parameter(description = "ID do pedido", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID id) {

        return ResponseEntity.ok(orderService.cancelOrder(id));
    }
}