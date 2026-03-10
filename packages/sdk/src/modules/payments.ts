import { PayflowClient } from '../client';

export type PaymentMethod = 'upi' | 'card' | 'wallet' | 'netbanking' | 'crypto';

export interface InitiatePaymentInput {
  order_id: string;
  method: PaymentMethod;
  idempotency_key?: string;
}

export interface Payment {
  payment_id: string;
  order_id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  transaction_id?: string;
  message: string;
}

export class PaymentsModule {
  constructor(private client: PayflowClient) {}

  // Initiate payment
  async initiate(input: InitiatePaymentInput): Promise<Payment> {
    return this.client.request<Payment>(
      'POST',
      '/payments/initiate',
      {
        order_id: input.order_id,
        method: input.method
      },
      input.idempotency_key
    );
  }

  // Get payment by ID
  async fetch(paymentId: string): Promise<Payment> {
    return this.client.request<Payment>('GET', `/payments/${paymentId}`);
  }

  // Get all payments
  async all(): Promise<Payment[]> {
    return this.client.request<Payment[]>('GET', '/payments');
  }

  // Capture authorized payment
  async capture(paymentId: string): Promise<Payment> {
    return this.client.request<Payment>('POST', `/payments/${paymentId}/capture`);
  }
}