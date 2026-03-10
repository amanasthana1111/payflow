import { PayflowClient } from '../client';

export interface CreateRefundInput {
  payment_id: string;
  amount: number;
}

export interface Refund {
  refund_id: string;
  payment_id: string;
  amount: number;
  status: string;
  remaining_refundable: number;
  created_at: string;
}

export class RefundsModule {
  constructor(private client: PayflowClient) {}

  async create(input: CreateRefundInput): Promise<Refund> {
    return this.client.request<Refund>('POST', '/refunds', {
      payment_id: input.payment_id,
      amount: input.amount
    });
  }

  async fetch(refundId: string): Promise<Refund> {
    return this.client.request<Refund>('GET', `/refunds/${refundId}`);
  }

  async all(): Promise<Refund[]> {
    return this.client.request<Refund[]>('GET', '/refunds');
  }
}