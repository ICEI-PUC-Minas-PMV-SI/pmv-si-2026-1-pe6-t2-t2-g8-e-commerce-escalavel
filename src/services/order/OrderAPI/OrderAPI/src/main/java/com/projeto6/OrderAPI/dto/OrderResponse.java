package main.java.com.projeto6.OrderAPI.dto;

// DTO responsável por representar os dados de saída
public class OrderResponse {

    private Long orderId;
    private String status;
    private Double total;

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }
}