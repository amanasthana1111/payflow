import { PayflowClient } from '../client';

export interface CreateOrderInput {
  amount: number;       // in paise (50000 = ₹500)
  currency?: string;    // default INR
  receipt?: string;
}

export interface Order {
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
  created_at: string;
}

export class OrdersModule {
  constructor(private client: PayflowClient) {}

  // Create a new order
  async create(input: CreateOrderInput): Promise<Order> {
    return this.client.request<Order>('POST', '/orders', {
      amount: input.amount,
      currency: input.currency || 'INR',
      receipt: input.receipt
    });
  }

  // Get order by ID
  async fetch(orderId: string): Promise<Order> {
    return this.client.request<Order>('GET', `/orders/${orderId}`);
  }

  // Get all orders
  async all(): Promise<Order[]> {
    return this.client.request<Order[]>('GET', '/orders');
  }
}