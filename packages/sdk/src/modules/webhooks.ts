import { PayflowClient } from '../client';
import crypto from 'crypto';

export interface CreateWebhookInput {
  url: string;
}

export interface Webhook {
  webhook_id: string;
  url: string;
  secret: string;
  created_at: string;
}

export class WebhooksModule {
  constructor(private client: PayflowClient) {}

  async create(input: CreateWebhookInput): Promise<Webhook> {
    return this.client.request<Webhook>('POST', '/webhooks', {
      url: input.url
    });
  }

  async fetch(webhookId: string): Promise<Webhook> {
    return this.client.request<Webhook>('GET', `/webhooks/${webhookId}`);
  }

  async all(): Promise<Webhook[]> {
    return this.client.request<Webhook[]>('GET', '/webhooks');
  }

  async delete(webhookId: string): Promise<void> {
    return this.client.request<void>('DELETE', `/webhooks/${webhookId}`);
  }

  // Verify webhook signature — merchant uses this on their server
  verify(payload: string, secret: string, signature: string): boolean {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(signature)
      );
    } catch {
      return false;
    }
  }
}