package com.projeto6.OrderAPI.service;

import com.projeto6.OrderAPI.client.PaymentClient;
import com.projeto6.OrderAPI.client.StockClient;
import com.projeto6.OrderAPI.client.UserClient;
import com.projeto6.OrderAPI.dto.ItemRequest;
import com.projeto6.OrderAPI.dto.ItemResponse;
import com.projeto6.OrderAPI.dto.OrderRequest;
import com.projeto6.OrderAPI.dto.OrderResponse;
import com.projeto6.OrderAPI.event.OrderEvent;
import com.projeto6.OrderAPI.event.OrderEventPublisher;
import com.projeto6.OrderAPI.exception.PaymentDeclinedException;
import com.projeto6.OrderAPI.exception.StockUnavailableException;
import com.projeto6.OrderAPI.model.Item;
import com.projeto6.OrderAPI.model.Order;
import com.projeto6.OrderAPI.model.OrderStatus;
import com.projeto6.OrderAPI.repository.OrderRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderRepository repository;

    @Autowired
    private StockClient stockClient;

    @Autowired
    private PaymentClient paymentClient;

    @Autowired
    private UserClient userClient;

    @Autowired
    private OrderEventPublisher publisher;

    public OrderResponse createOrder(OrderRequest request) {
        validate(request);

        BigDecimal total = calcTotal(request.getItems());

        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setItems(toItemList(request.getItems()));
        order.setTotalAmount(total);
        order.setStatus(OrderStatus.DRAFT);
        order = repository.save(order);

        UUID orderId = order.getId();

        // Passo 1: reservar estoque de cada item (com compensação)
        List<Item> reserved = new ArrayList<>();
        try {
            for (Item item : order.getItems()) {
                stockClient.reserve(item.getProductId(), orderId, item.getQuantity());
                reserved.add(item);
            }
        } catch (StockUnavailableException ex) {
            failOrder(order, reserved, OrderEvent.PAYMENT_REFUSED);
            throw ex;
        } catch (Exception ex) {
            log.error("Falha na reserva de estoque orderId={}", orderId, ex);
            failOrder(order, reserved, OrderEvent.PAYMENT_REFUSED);
            throw new StockUnavailableException("Erro ao reservar estoque: " + ex.getMessage());
        }

        order.setStatus(OrderStatus.PENDING);
        order = repository.save(order);

        // Passo 2: processar pagamento
        try {
            paymentClient.process(orderId, total);
        } catch (PaymentDeclinedException ex) {
            failOrder(order, order.getItems(), OrderEvent.PAYMENT_REFUSED);
            throw ex;
        } catch (Exception ex) {
            log.error("Falha no processamento do pagamento orderId={}", orderId, ex);
            failOrder(order, order.getItems(), OrderEvent.PAYMENT_REFUSED);
            throw new PaymentDeclinedException("Erro ao processar pagamento: " + ex.getMessage());
        }

        // Passo 3: confirmar baixa de estoque
        boolean confirmFailed = false;
        for (Item item : order.getItems()) {
            try {
                stockClient.confirm(item.getProductId(), orderId, item.getQuantity());
            } catch (Exception e) {
                confirmFailed = true;
                log.warn("ATENCAO: Falha ao confirmar estoque apos pagamento aprovado. Reserva pode ficar presa. "
                        + "productId={} orderId={}", item.getProductId(), orderId, e);
            }
        }
        if (confirmFailed) {
            log.warn("Order {} confirmada com falhas em confirm de estoque — auditoria necessaria", orderId);
        }

        order.setStatus(OrderStatus.CONFIRMED);
        order = repository.save(order);
        publishSafe(order, OrderEvent.ORDER_CONFIRMED);

        return toResponse(order);
    }

    public List<OrderResponse> getAllOrders() {
        return repository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public OrderResponse getOrderById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    public List<OrderResponse> getOrdersByUser(UUID userId) {
        return repository.findByCustomerId(userId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public OrderResponse cancelOrder(UUID id) {
        Order order = findOrThrow(id);

        if (order.getStatus() == OrderStatus.CONFIRMED
                || order.getStatus() == OrderStatus.CANCELLED
                || order.getStatus() == OrderStatus.FAILED) {
            throw new IllegalStateException(
                    "Pedido não pode ser cancelado no status " + order.getStatus());
        }

        // DRAFT pode ter reservas parciais; PENDING tem todas. Release best-effort.
        if (order.getStatus() == OrderStatus.DRAFT || order.getStatus() == OrderStatus.PENDING) {
            compensateReleases(order.getItems(), order.getId());
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order updated = repository.save(order);
        publishSafe(updated, OrderEvent.ORDER_CANCELLED);

        return toResponse(updated);
    }

    // -------- helpers --------

    private void validate(OrderRequest request) {
        if (request.getCustomerId() == null) {
            throw new IllegalArgumentException("customerId obrigatório");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Pedido precisa de pelo menos 1 item");
        }
        for (ItemRequest it : request.getItems()) {
            if (it.getProductId() == null) throw new IllegalArgumentException("productId obrigatório");
            if (it.getQuantity() == null || it.getQuantity() <= 0)
                throw new IllegalArgumentException("quantity deve ser > 0");
            if (it.getPrice() == null || it.getPrice().signum() <= 0)
                throw new IllegalArgumentException("price deve ser > 0");
        }
    }

    private BigDecimal calcTotal(List<ItemRequest> items) {
        return items.stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void compensateReleases(List<Item> items, UUID orderId) {
        if (items == null) return;
        for (Item item : items) {
            try {
                stockClient.release(item.getProductId(), orderId, item.getQuantity());
            } catch (Exception e) {
                log.error("Falha ao liberar reserva produto={} orderId={}", item.getProductId(), orderId, e);
            }
        }
    }

    private void failOrder(Order order, List<Item> itemsToRelease, String eventType) {
        compensateReleases(itemsToRelease, order.getId());
        order.setStatus(OrderStatus.FAILED);
        try {
            repository.save(order);
        } catch (Exception e) {
            log.error("Falha ao persistir status FAILED orderId={}", order.getId(), e);
        }
        publishSafe(order, eventType);
    }

    private void publishSafe(Order order, String eventType) {
        try {
            String email = userClient.fetchEmail(order.getCustomerId());
            publisher.publish(new OrderEvent(
                    order.getId(),
                    order.getCustomerId(),
                    email,
                    eventType,
                    order.getTotalAmount()
            ));
        } catch (Exception e) {
            log.error("Falha ao publicar evento {} orderId={}", eventType, order.getId(), e);
        }
    }

    private Order findOrThrow(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado: " + id));
    }

    // -------- conversões --------

    private List<Item> toItemList(List<ItemRequest> itemsRequest) {
        return itemsRequest.stream().map(req -> {
            Item item = new Item();
            item.setProductId(req.getProductId());
            item.setQuantity(req.getQuantity());
            item.setPrice(req.getPrice());
            return item;
        }).collect(Collectors.toList());
    }

    private List<ItemResponse> toItemResponseList(List<Item> items) {
        return items.stream().map(item -> {
            ItemResponse r = new ItemResponse();
            r.setProductId(item.getProductId());
            r.setQuantity(item.getQuantity());
            r.setPrice(item.getPrice());
            return r;
        }).collect(Collectors.toList());
    }

    private OrderResponse toResponse(Order order) {
        OrderResponse r = new OrderResponse();
        r.setId(order.getId());
        r.setCustomerId(order.getCustomerId());
        r.setItems(toItemResponseList(order.getItems()));
        r.setStatus(order.getStatus() != null ? order.getStatus().name() : null);
        r.setTotalAmount(order.getTotalAmount());
        return r;
    }
}
