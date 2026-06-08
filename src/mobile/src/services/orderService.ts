import { HttpClient, authHeader } from './httpClient';
import { API_URL } from '@/src/config/env';

export enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export interface OrderItemResponse {
  skuId: string;
  productId: string;
  unitPrice: number;
  quantity: number;
}

export interface CreateOrderItem {
  skuId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  customerId: string;
  items: CreateOrderItem[];
}

export interface Order {
  id: string;
  customerId: string;
  status: string;
  transactionId?: string;
  items: OrderItemResponse[];
}

export interface CreateOrderItem {
  skuId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  customerId: string;
  items: CreateOrderItem[];
}

class OrderService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(API_URL);
  }

  async createOrder(
    payload: CreateOrderPayload,
    signal?: AbortSignal
  ): Promise<Order> {
    return this.httpClient.post<Order>(
      '/orders',
      payload,
      {
        signal,
        headers: await authHeader(),
      }
    );
  }

  async getOrderById(
    orderId: string,
    signal?: AbortSignal
  ): Promise<Order> {
    return this.httpClient.get<Order>(
      `/orders/${orderId}`,
      {
        signal,
        headers: await authHeader(),
      }
    );
  }

  async getOrdersByUserId(
    userId: string,
    signal?: AbortSignal
  ): Promise<Order[]> {
    return this.httpClient.get<Order[]>(
      `/orders/user/${userId}`,
      {
        signal,
        headers: await authHeader(),
      }
    );
  }

  async cancelOrder(
    orderId: string,
    signal?: AbortSignal
  ): Promise<void> {
    return this.httpClient.post<void>(
      `/orders/${orderId}/cancel`,
      undefined,
      {
        signal,
        headers: await authHeader(),
      }
    );
  }

  async payOrder(
    orderId: string,
    paymentMethod?: string,
    signal?: AbortSignal
  ): Promise<{ order: Order; declined: boolean }> {
    const headers = new Headers(await authHeader() as HeadersInit);
    headers.set('Content-Type', 'application/json');
    const res = await fetch(
      `${API_URL}/orders/${orderId}/pay`,
      {
        method: 'POST',
        signal,
        headers,
        body: paymentMethod ? JSON.stringify({ paymentMethod }) : undefined,
      }
    );
    const order: Order = await res.json();
    return { order, declined: res.status === 402 };
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
    signal?: AbortSignal
  ): Promise<Order> {
    return this.httpClient.patch<Order>(
      `/orders/${orderId}/status?status=${status}`,
      undefined,
      {
        signal,
        headers: await authHeader(),
      }
    );
  }
}

export const orderService = new OrderService();