package main.java.com.projeto6.OrderAPI.repository;

import main.java.com.projeto6.OrderAPI.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerId(Long customerId);
}