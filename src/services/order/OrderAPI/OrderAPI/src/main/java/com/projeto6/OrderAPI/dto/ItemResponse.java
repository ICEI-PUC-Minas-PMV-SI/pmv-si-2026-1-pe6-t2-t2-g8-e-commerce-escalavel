package com.projeto6.OrderAPI.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.UUID;

@Schema(description = "DTO de resposta para um item do pedido")
public class ItemResponse {

    @Schema(description = "ID do SKU")
    private UUID skuId;

    @Schema(description = "ID do produto (snapshot)")
    private UUID productId;

    @Schema(description = "Preço unitário no momento do pedido (snapshot)")
    private BigDecimal unitPrice;

    @Schema(description = "Quantidade do SKU no pedido")
    private Integer quantity;

    public UUID getSkuId() {
        return skuId;
    }

    public void setSkuId(UUID skuId) {
        this.skuId = skuId;
    }

    public UUID getProductId() {
        return productId;
    }

    public void setProductId(UUID productId) {
        this.productId = productId;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
