package com.projeto6.OrderAPI.service;

import com.projeto6.OrderAPI.client.CatalogClient;
import com.projeto6.OrderAPI.client.StockClient;
import com.projeto6.OrderAPI.dto.ItemRequest;
import com.projeto6.OrderAPI.dto.ItemResponse;
import com.projeto6.OrderAPI.dto.OrderRequest;
import com.projeto6.OrderAPI.dto.OrderResponse;
import com.projeto6.OrderAPI.dto.SkuResponse;
import com.projeto6.OrderAPI.exception.InsufficientStockException;
import com.projeto6.OrderAPI.model.Item;
import com.projeto6.OrderAPI.model.Order;
import com.projeto6.OrderAPI.repository.OrderRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final String STATUS_CREATED = "CREATED";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final String STATUS_PAID = "PAID";

    @Autowired
    private OrderRepository repository;

    @Autowired
    private CatalogClient catalogClient;

    @Autowired
    private StockClient stockClient;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setItems(toItemList(request.getItems()));
        order.setStatus(STATUS_CREATED);

        Order saved = repository.save(order);
        reserveStockOrCompensate(saved);
        return toResponse(saved);
    }

    public List<OrderResponse> getAllOrders() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(UUID id) {
        Order order = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        return toResponse(order);
    }

    public List<OrderResponse> getOrdersByUser(UUID userId) {
        return repository.findByCustomerId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse updateStatus(UUID id, String status) {
        Order order = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        String previousStatus = order.getStatus();
        order.setStatus(status);

        if (STATUS_PAID.equalsIgnoreCase(status) && !STATUS_PAID.equalsIgnoreCase(previousStatus)) {
            for (Item item : order.getItems()) {
                stockClient.confirm(item.getSkuId(), order.getId(), item.getQuantity());
            }
        }

        Order updated = repository.save(order);
        return toResponse(updated);
    }

    public OrderResponse cancelOrder(UUID id) {
        Order order = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        if (STATUS_CANCELLED.equalsIgnoreCase(order.getStatus())) {
            return toResponse(order);
        }

        if (STATUS_PAID.equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Pedido já pago não pode ser cancelado por este endpoint");
        }

        for (Item item : order.getItems()) {
            stockClient.release(item.getSkuId(), order.getId(), item.getQuantity());
        }

        order.setStatus(STATUS_CANCELLED);
        Order updated = repository.save(order);
        return toResponse(updated);
    }

    private void reserveStockOrCompensate(Order order) {
        List<Item> reserved = new ArrayList<>();
        try {
            for (Item item : order.getItems()) {
                stockClient.reserve(item.getSkuId(), order.getId(), item.getQuantity());
                reserved.add(item);
            }
        } catch (RuntimeException ex) {
            for (Item done : reserved) {
                try {
                    stockClient.release(done.getSkuId(), order.getId(), done.getQuantity());
                } catch (RuntimeException ignore) {
                    // best-effort compensation
                }
            }
            throw ex;
        }
    }

    private List<Item> toItemList(List<ItemRequest> itemsRequest) {
        return itemsRequest.stream().map(itemReq -> {
            SkuResponse sku = catalogClient.findSkuById(itemReq.getSkuId());
            if (sku == null) {
                throw new RuntimeException("SKU não encontrado: " + itemReq.getSkuId());
            }
            Item item = new Item();
            item.setSkuId(sku.getId());
            item.setProductId(sku.getProductId());
            item.setUnitPrice(sku.getPrice());
            item.setQuantity(itemReq.getQuantity());
            return item;
        }).collect(Collectors.toList());
    }

    private List<ItemResponse> toItemResponseList(List<Item> items) {
        return items.stream().map(item -> {
            ItemResponse response = new ItemResponse();
            response.setSkuId(item.getSkuId());
            response.setProductId(item.getProductId());
            response.setUnitPrice(item.getUnitPrice());
            response.setQuantity(item.getQuantity());
            return response;
        }).collect(Collectors.toList());
    }

    private OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();

        response.setId(order.getId());
        response.setCustomerId(order.getCustomerId());
        response.setItems(toItemResponseList(order.getItems()));
        response.setStatus(order.getStatus());

        return response;
    }
}
