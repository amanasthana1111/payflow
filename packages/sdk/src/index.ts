import { PayflowClient, PayflowConfig } from './client';
import { OrdersModule } from './modules/orders';
import { PaymentsModule } from './modules/payments';
import { RefundsModule } from './modules/refunds';
import { WebhooksModule } from './modules/webhooks';
import { SettlementsModule } from './modules/settlements';
import { PaymentLinksModule } from './modules/paymentLinks';

export class Payflow {
  orders: OrdersModule;
  payments: PaymentsModule;
  refunds: RefundsModule;
  webhooks: WebhooksModule;
  settlements: SettlementsModule;
  paymentLinks: PaymentLinksModule;

  private client: PayflowClient;

  constructor(config: PayflowConfig) {
    this.client = new PayflowClient(config);

    // Initialize all modules
    this.orders      = new OrdersModule(this.client);
    this.payments    = new PaymentsModule(this.client);
    this.refunds     = new RefundsModule(this.client);
    this.webhooks    = new WebhooksModule(this.client);
    this.settlements = new SettlementsModule(this.client);
    this.paymentLinks = new PaymentLinksModule(this.client);
  }
}

// Export types
export * from './client';
export * from './modules/orders';
export * from './modules/payments';
export * from './modules/refunds';
export * from './modules/webhooks';
export * from './modules/settlements';
export * from './modules/paymentLinks';

export default Payflow;