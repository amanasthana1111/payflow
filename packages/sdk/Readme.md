# @payflow/sdk

Official Node.js SDK for Payflow Payment Gateway.

## Installation
```bash
npm install @payflow/sdk
```

## Quick Start
```typescript
import Payflow from '@payflow/sdk';

const payflow = new Payflow({
  api_key: 'payflow_ak_xxx',
  api_secret: 'payflow_sk_xxx',
  base_url: 'http://localhost:3000'
});

// Create order
const order = await payflow.orders.create({
  amount: 50000,
  currency: 'INR'
});

// Initiate payment
const payment = await payflow.payments.initiate({
  order_id: order.order_id,
  method: 'upi',
  idempotency_key: 'unique-key-001'
});

// Create refund
const refund = await payflow.refunds.create({
  payment_id: payment.payment_id,
  amount: 20000
});

// Verify webhook
const isValid = payflow.webhooks.verify(
  JSON.stringify(req.body),
  'webhook-secret',
  req.headers['x-payflow-signature']
);
```

## Modules

| Module | Methods |
|---|---|
| `payflow.orders` | `create`, `fetch`, `all` |
| `payflow.payments` | `initiate`, `fetch`, `all`, `capture` |
| `payflow.refunds` | `create`, `fetch`, `all` |
| `payflow.webhooks` | `create`, `fetch`, `all`, `delete`, `verify` |
| `payflow.settlements` | `create`, `fetch`, `all`, `summary` |

## Payment Methods

| Method | Value |
|---|---|
| UPI | `upi` |
| Card | `card` |
| Wallet | `wallet` |
| Netbanking | `netbanking` |
| Crypto | `crypto` |

## License

MIT