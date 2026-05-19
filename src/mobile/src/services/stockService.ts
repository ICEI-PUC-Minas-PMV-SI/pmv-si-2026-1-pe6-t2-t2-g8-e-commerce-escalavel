import { API_URL } from '@/src/config/env';
import type {
  AdjustPayload,
  CreateStockPayload,
  RestockPayload,
  StockItem,
  StockItemDetailed,
  StockMovement,
} from '@/src/types/stock';
import { HttpClient, authHeader } from './httpClient';

// Stubs only — surface area matches src/frontend/services/stockClientService.ts.
// Bodies will be implemented in the upcoming stock module work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const http = new HttpClient(API_URL);

function notImplemented(method: string): never {
  throw new Error(`stockService.${method} not implemented`);
}

export const stockService = {
  list(_signal?: AbortSignal): Promise<StockItem[]> {
    notImplemented('list');
  },
  listDetailed(_signal?: AbortSignal): Promise<StockItemDetailed[]> {
    notImplemented('listDetailed');
  },
  getBySku(_skuId: string, _signal?: AbortSignal): Promise<StockItem | null> {
    notImplemented('getBySku');
  },
  create(_payload: CreateStockPayload): Promise<StockItem> {
    notImplemented('create');
  },
  restock(_skuId: string, _payload: RestockPayload): Promise<StockItem> {
    notImplemented('restock');
  },
  adjust(_skuId: string, _payload: AdjustPayload): Promise<StockItem> {
    notImplemented('adjust');
  },
  history(_skuId: string, _signal?: AbortSignal): Promise<StockMovement[]> {
    notImplemented('history');
  },
};

export { authHeader };
