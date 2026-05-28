import { HttpClient, authHeader } from './httpClient';

export enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface CreateOrderPayload {
  userId: string;
  items: OrderItem[];
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

class OrderService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(
      process.env.EXPO_PUBLIC_API_URL!
    );
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

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    signal?: AbortSignal
  ): Promise<Order> {
    return this.httpClient.patch<Order>(
      `/orders/${orderId}/status`,
      { status },
      {
        signal,
        headers: await authHeader(),
      }
    );
  }
}

export const orderService = new OrderService();