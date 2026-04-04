package main.java.com.projeto6.OrderAPI.repository;

import com.projeto6.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}