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

const http = new HttpClient(API_URL);

type Envelope<T> = { data?: T };

function unwrapArray<T>(payload: T[] | Envelope<T[]>): T[] {
  if (Array.isArray(payload)) return payload;
  const inner = (payload as Envelope<T[]>)?.data;
  return Array.isArray(inner) ? inner : [];
}

function unwrapObject<T>(payload: T | Envelope<T>, fallback: T): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    const inner = (payload as Envelope<T>).data;
    return inner ?? fallback;
  }
  return (payload as T) ?? fallback;
}

export const stockService = {
  async list(signal?: AbortSignal): Promise<StockItem[]> {
    const raw = await http.get<StockItem[] | Envelope<StockItem[]>>('/stock/', {
      signal,
      headers: authHeader(),
    });
    return unwrapArray<StockItem>(raw);
  },

  async listDetailed(signal?: AbortSignal): Promise<StockItemDetailed[]> {
    const raw = await http.get<StockItemDetailed[] | Envelope<StockItemDetailed[]>>(
      '/stock/detailed-items',
      { signal, headers: authHeader() }
    );
    return unwrapArray<StockItemDetailed>(raw);
  },

  async getBySku(skuId: string, signal?: AbortSignal): Promise<StockItem | null> {
    try {
      const raw = await http.get<StockItem | Envelope<StockItem>>(`/stock/${skuId}`, {
        signal,
        headers: authHeader(),
      });
      return unwrapObject<StockItem>(raw, null as unknown as StockItem) || null;
    } catch (err) {
      if (err instanceof Error && /404/.test(err.message)) return null;
      throw err;
    }
  },

  async create(payload: CreateStockPayload): Promise<StockItem> {
    const raw = await http.post<StockItem | Envelope<StockItem>>('/stock/', payload, {
      headers: authHeader(),
    });
    return unwrapObject<StockItem>(raw, raw as StockItem);
  },

  async restock(skuId: string, payload: RestockPayload): Promise<StockItem> {
    const raw = await http.put<StockItem | Envelope<StockItem>>(
      `/stock/${skuId}/restock`,
      payload,
      { headers: authHeader() }
    );
    return unwrapObject<StockItem>(raw, raw as StockItem);
  },

  async adjust(skuId: string, payload: AdjustPayload): Promise<StockItem> {
    const raw = await http.put<StockItem | Envelope<StockItem>>(
      `/stock/${skuId}/adjust`,
      payload,
      { headers: authHeader() }
    );
    return unwrapObject<StockItem>(raw, raw as StockItem);
  },

  async history(skuId: string, signal?: AbortSignal): Promise<StockMovement[]> {
    const raw = await http.get<StockMovement[] | Envelope<StockMovement[]>>(
      `/stock/${skuId}/history`,
      { signal, headers: authHeader() }
    );
    return unwrapArray<StockMovement>(raw);
  },
};

export { authHeader };
