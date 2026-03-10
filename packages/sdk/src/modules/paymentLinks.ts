import { PayflowClient } from '../client';

export interface CreatePaymentLinkInput {
  amount: number;
  currency?: string;
  expires_at?: string;
}

export interface PaymentLink {
  id: string;
  amount: number;
  link_token: string;
  status: string;
  expires_at?: string;
}

export class PaymentLinksModule {
  constructor(private client: PayflowClient) {}

  async create(input: CreatePaymentLinkInput): Promise<PaymentLink> {
    return this.client.request<PaymentLink>('POST', '/payment-links', {
      amount: input.amount,
      currency: input.currency || 'INR',
      expires_at: input.expires_at
    });
  }

  async fetch(linkId: string): Promise<PaymentLink> {
    return this.client.request<PaymentLink>('GET', `/payment-links/${linkId}`);
  }
}