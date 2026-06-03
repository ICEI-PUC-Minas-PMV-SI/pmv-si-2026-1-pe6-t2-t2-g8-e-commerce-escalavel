package com.projeto6.OrderAPI.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

@Schema(description = "DTO para representar um item no pedido")
public class ItemRequest {

    @Schema(
        description = "ID do SKU que será incluído no pedido",
        example = "550e8400-e29b-41d4-a716-446655440000",
        required = true
    )
    private UUID skuId;

    @Schema(
        description = "Quantidade do SKU no pedido",
        example = "2",
        required = true
    )
    private Integer quantity;

    public UUID getSkuId() {
        return skuId;
    }

    public void setSkuId(UUID skuId) {
        this.skuId = skuId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
