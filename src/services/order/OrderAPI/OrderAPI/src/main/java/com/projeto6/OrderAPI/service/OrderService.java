package com.projeto6.OrderAPI.service;

import com.projeto6.OrderAPI.dto.ItemRequest;
import com.projeto6.OrderAPI.dto.ItemResponse;
import com.projeto6.OrderAPI.dto.OrderRequest;
import com.projeto6.OrderAPI.dto.OrderResponse;
import com.projeto6.OrderAPI.model.Order;
import com.projeto6.OrderAPI.model.Item;
import com.projeto6.OrderAPI.repository.OrderRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository repository;

    // Criar pedido
    public OrderResponse createOrder(OrderRequest request) {
        Order order = new Order();

        order.setCustomerId(request.getCustomerId());
        order.setItems(toItemList(request.getItems())); // conversão
        order.setStatus("CREATED");

        Order saved = repository.save(order);
        return toResponse(saved);
    }

    // Listar todos
    public List<OrderResponse> getAllOrders() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Buscar por ID
    public OrderResponse getOrderById(Long id) {
        Order order = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        return toResponse(order);
    }

    // Buscar por usuário
    public List<OrderResponse> getOrdersByUser(Long userId) {
        return repository.findByCustomerId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Atualizar status
    public OrderResponse updateStatus(Long id, String status) {
        Order order = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        order.setStatus(status);
        Order updated = repository.save(order);

        return toResponse(updated);
    }

    // Cancelar pedido
    public OrderResponse cancelOrder(Long id) {
        Order order = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        order.setStatus("CANCELLED");
        Order updated = repository.save(order);

        return toResponse(updated);
    }


    // 🔁 Conversões DTO ↔ Model

    // DTO -> Model
    private List<Item> toItemList(List<ItemRequest> itemsRequest) {
        return itemsRequest.stream().map(itemReq -> {
            Item item = new Item();
            item.setProductId(itemReq.getProductId());
            item.setQuantity(itemReq.getQuantity());
            return item;
        }).collect(Collectors.toList());
    }

    // Model <- DTO
    private List<ItemResponse> toItemResponseList(List<Item> items) {
        return items.stream().map(item -> {
            ItemResponse response = new ItemResponse();
            response.setProductId(item.getProductId());
            response.setQuantity(item.getQuantity());
            return response;
        }).collect(Collectors.toList());
    }

    // Model -> Response
    private OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();

        response.setId(order.getId());
        response.setCustomerId(order.getCustomerId());
        response.setItems(toItemResponseList(order.getItems())); // conversão
        response.setStatus(order.getStatus());

        return response;
    }
}