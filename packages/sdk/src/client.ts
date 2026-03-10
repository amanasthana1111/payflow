import { fetch } from 'undici';

export interface PayflowConfig {
  api_key: string;
  api_secret: string;
  base_url?: string;
}

export class PayflowClient {
  private api_key: string;
  private api_secret: string;
  private base_url: string;
  private token: string | null = null;

  constructor(config: PayflowConfig) {
    if (!config.api_key) throw new Error('api_key is required');
    if (!config.api_secret) throw new Error('api_secret is required');

    this.api_key = config.api_key;
    this.api_secret = config.api_secret;
    this.base_url = config.base_url || 'http://localhost:3000';
  }

  // Login and get JWT token
  async authenticate(): Promise<void> {
    const response = await fetch(`${this.base_url}/merchants/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: this.api_key,
        api_secret: this.api_secret
      })
    });

    const data = await response.json() as any;
    if (!data.token) throw new Error('Authentication failed');
    this.token = data.token;
  }

  // Make authenticated HTTP request
  async request<T>(
    method: string,
    path: string,
    body?: object,
    idempotencyKey?: string
  ): Promise<T> {
    if (!this.token) await this.authenticate();

    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'authorization': `Bearer ${this.token}`,
      'x-api-key': this.api_key
    };

    if (idempotencyKey) {
      headers['idempotency-key'] = idempotencyKey;
    }

    const response = await fetch(`${this.base_url}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json() as any;

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data as T;
  }
}