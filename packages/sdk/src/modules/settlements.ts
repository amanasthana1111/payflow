import { PayflowClient } from '../client';

export interface Settlement {
  settlement_id: string;
  amount: number;
  status: string;
  processed_at: string;
}

export interface SettlementSummary {
  total_payments: number;
  total_captured_amount: number;
  total_settlements: number;
  total_settled_amount: number;
  pending_settlement: number;
}

export class SettlementsModule {
  constructor(private client: PayflowClient) {}

  async create(): Promise<Settlement> {
    return this.client.request<Settlement>('POST', '/settlements');
  }

  async fetch(settlementId: string): Promise<Settlement> {
    return this.client.request<Settlement>('GET', `/settlements/${settlementId}`);
  }

  async all(): Promise<Settlement[]> {
    return this.client.request<Settlement[]>('GET', '/settlements');
  }

  async summary(): Promise<SettlementSummary> {
    return this.client.request<SettlementSummary>('GET', '/settlements/summary');
  }
}