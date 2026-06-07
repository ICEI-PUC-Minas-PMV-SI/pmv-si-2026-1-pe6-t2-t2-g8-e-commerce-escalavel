package com.projeto6.OrderAPI.service;

import com.projeto6.OrderAPI.client.CatalogClient;
import com.projeto6.OrderAPI.client.PaymentClient;
import com.projeto6.OrderAPI.client.StockClient;
import com.projeto6.OrderAPI.messaging.OrderEventPublisher;
import com.projeto6.OrderAPI.dto.ItemRequest;
import com.projeto6.OrderAPI.dto.ItemResponse;
import com.projeto6.OrderAPI.dto.OrderRequest;
import com.projeto6.OrderAPI.dto.OrderResponse;
import com.projeto6.OrderAPI.dto.PaymentResponse;
import com.projeto6.OrderAPI.dto.SkuResponse;
import com.projeto6.OrderAPI.exception.InsufficientStockException;
import com.projeto6.OrderAPI.exception.PaymentDeclinedException;
import com.projeto6.OrderAPI.model.Item;
import com.projeto6.OrderAPI.model.Order;
import com.projeto6.OrderAPI.model.OrderStatus;
import com.projeto6.OrderAPI.repository.OrderRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository repository;

    @Autowired
    private CatalogClient catalogClient;

    @Autowired
    private StockClient stockClient;

    @Autowired
    private PaymentClient paymentClient;

    @Autowired
    private OrderEventPublisher orderEventPublisher;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setItems(toItemList(request.getItems()));
        order.setStatus(OrderStatus.CREATED);

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

        if (OrderStatus.PAID.equalsIgnoreCase(status) && !OrderStatus.PAID.equalsIgnoreCase(previousStatus)) {
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

        if (OrderStatus.CANCELLED.equalsIgnoreCase(order.getStatus())) {
            return toResponse(order);
        }

        if (OrderStatus.PAID.equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Pedido já pago não pode ser cancelado por este endpoint");
        }

        for (Item item : order.getItems()) {
            stockClient.release(item.getSkuId(), order.getId(), item.getQuantity());
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order updated = repository.save(order);
        return toResponse(updated);
    }

    /**
     * Orquestra o pagamento de um pedido já criado (estoque reservado na criação):
     * calcula o total, chama a PaymentAPI e, conforme o resultado, confirma o estoque
     * (APPROVED → PAID) ou libera o estoque (DECLINED → PAYMENT_FAILED). Idempotente
     * para pedidos já pagos.
     */
    @Transactional
    public OrderResponse payOrder(UUID id, String paymentMethod) {
        Order order = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        if (OrderStatus.PAID.equalsIgnoreCase(order.getStatus())) {
            return toResponse(order);
        }
        if (OrderStatus.CANCELLED.equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Pedido cancelado não pode ser pago");
        }

        BigDecimal value = order.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        try {
            PaymentResponse payment = paymentClient.process(order.getId(), value);
            for (Item item : order.getItems()) {
                stockClient.confirm(item.getSkuId(), order.getId(), item.getQuantity());
            }
            order.setTransactionId(payment != null ? payment.getTransactionId() : null);
            order.setStatus(OrderStatus.PAID);
            orderEventPublisher.publishPaymentConfirmed(order.getId());
        } catch (PaymentDeclinedException ex) {
            for (Item item : order.getItems()) {
                try {
                    stockClient.release(item.getSkuId(), order.getId(), item.getQuantity());
                } catch (RuntimeException ignore) {
                    // best-effort compensation
                }
            }
            order.setStatus(OrderStatus.PAYMENT_FAILED);
        }

        Order saved = repository.save(order);
        return toResponse(saved);
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
        response.setTransactionId(order.getTransactionId());

        return response;
    }
}
