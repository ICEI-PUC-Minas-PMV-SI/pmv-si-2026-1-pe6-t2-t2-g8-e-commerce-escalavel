package main.java.com.projeto6.OrderAPI.service;

import com.projeto6.order.dto.OrderRequest;
import com.projeto6.order.dto.OrderResponse;
import com.projeto6.order.dto.OrderItemRequest;
import com.projeto6.order.model.Order;
import com.projeto6.order.model.OrderItem;
import com.projeto6.order.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;


// Contém operações de criação e consulta de pedidos.
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

 
// Cria um novo pedido.
    public OrderResponse createOrder(OrderRequest request) {

        // 1. Criar entidade Order
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setStatus("CREATED");

        // 2. Converter itens
        List<OrderItem> items = new ArrayList<>();

        for (OrderItemRequest itemRequest : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setProductId(itemRequest.getProductId());
            item.setQuantity(itemRequest.getQuantity());

            // preço mockado (temporário)
            item.setPrice(50.0);

            items.add(item);
        }

        order.setItems(items);

        // 3. Calcular total
        double total = items.stream()
                .mapToDouble(i -> i.getPrice() * i.getQuantity())
                .sum();

        order.setTotal(total);

        // 4. Salvar no banco
        Order savedOrder = orderRepository.save(order);

        // 5. Criar resposta
        OrderResponse response = new OrderResponse();
        response.setOrderId(savedOrder.getId());
        response.setStatus(savedOrder.getStatus());
        response.setTotal(savedOrder.getTotal());

        return response;
    }

//  Retorna todos os pedidos cadastrados.
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }


// Retorna um pedido específico pelo ID.
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
    }
}