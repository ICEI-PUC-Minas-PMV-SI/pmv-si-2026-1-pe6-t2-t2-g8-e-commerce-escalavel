export interface StockItem {
  id: string;
  skuId: string;
  costPrice: number;
  quantityAvailable: number;
  quantityReserved: number;
}

export interface CatalogProductInfo {
  name: string | null;
  description: string | null;
  urlImg: string | null;
  code: string | null;
  size: string | null;
  color?: string | null;
}

export interface StockItemDetailed extends StockItem {
  product: CatalogProductInfo | null;
}

export type StockMovementType =
  | 'reserve'
  | 'release'
  | 'confirm'
  | 'restock'
  | 'adjustment';

export interface StockMovement {
  id: string;
  skuId: string;
  orderId: string | null;
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  createdAt: string;
}

export interface CreateStockPayload {
  skuId: string;
  quantity: number;
  costPrice: number;
}

export interface RestockPayload {
  quantity: number;
}

export interface AdjustPayload {
  delta: number;
  reason: string;
}
