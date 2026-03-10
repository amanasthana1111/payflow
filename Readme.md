# 💳 Payflow — Production-Grade Payment Gateway

> A Razorpay-like payment gateway built with Node.js, TypeScript, Fastify, PostgreSQL, Redis, BullMQ, and Docker — following a microservices architecture with a Turborepo monorepo.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://typescriptlang.org)
[![Fastify](https://img.shields.io/badge/Fastify-4.x-black?logo=fastify)](https://fastify.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma)](https://prisma.io)
[![Redis](https://img.shields.io/badge/Redis-Upstash-red?logo=redis)](https://upstash.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444?logo=turborepo)](https://turbo.build)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Services](#-services)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running with Docker](#-running-with-docker)
- [SDK Usage](#-sdk-usage)
- [Payment Flow](#-payment-flow)
- [Webhook System](#-webhook-system)
- [Idempotency](#-idempotency)
- [Rate Limiting](#-rate-limiting)
- [WhatsApp Notifications](#-whatsapp-notifications)
- [Testing](#-testing)

---

## 🌟 Overview

**Payflow** is a full production-grade payment gateway that allows merchants to:

- 🔐 Register and authenticate with API keys
- 📦 Create and manage orders
- 💳 Accept payments via UPI, Card, Wallet, Netbanking, Crypto
- 🔔 Receive real-time webhook notifications on payment events
- 💸 Create full and partial refunds
- 🏦 Track settlements with platform fee deductions
- 📱 Get WhatsApp notifications on payment success/failure
- 🛍️ Use a hosted checkout UI for seamless customer payments
- 📦 Integrate via the official `@payflow/sdk` npm package

---

## 🏗️ Architecture

```
                          ┌─────────────────────────────┐
                          │         CLIENT / MERCHANT    │
                          └──────────────┬──────────────┘
                                         │ HTTP Requests
                                         ▼
                          ┌─────────────────────────────┐
                          │      API GATEWAY :3000       │
                          │  • JWT Authentication         │
                          │  • Rate Limiting (100/min)    │
                          │  • Request Proxying           │
                          └──────┬──────────────┬────────┘
                                 │              │
              ┌──────────────────┼──────────────┼──────────────────┐
              │                  │              │                  │
              ▼                  ▼              ▼                  ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ auth-service │  │order-service │  │payment-svc   │  │webhook-svc   │
    │   :3001      │  │   :3002      │  │   :3003      │  │   :3004      │
    └──────────────┘  └──────────────┘  └──────┬───────┘  └──────┬───────┘
                                               │                  │
                                    ┌──────────▼──────────┐      │ BullMQ
                                    │   notification-svc   │   ┌──▼──────┐
                                    │       :3007          │   │  Redis  │
                                    │  (Twilio WhatsApp)   │   │ Upstash │
                                    └─────────────────────┘   └─────────┘
              ┌──────────────┐  ┌──────────────┐
              │refund-service│  │settlement-svc│
              │   :3005      │  │   :3006      │
              └──────────────┘  └──────────────┘
                                         │
                          ┌──────────────▼──────────────┐
                          │         PostgreSQL            │
                          │     (Prisma ORM)              │
                          └─────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Runtime** | Node.js 20 | JavaScript runtime |
| **Language** | TypeScript 5 | Type safety |
| **Framework** | Fastify 4 | HTTP server (3x faster than Express) |
| **Database** | PostgreSQL 15 | Primary data store |
| **ORM** | Prisma 5 | Type-safe DB queries + migrations |
| **Cache/Queue** | Redis (Upstash) | Idempotency, rate limiting, BullMQ |
| **Job Queue** | BullMQ | Async webhook delivery with retries |
| **Auth** | JWT (@fastify/jwt) | Stateless authentication |
| **HTTP Client** | undici | Fast HTTP proxy requests |
| **Notifications** | Twilio WhatsApp API | Payment alerts |
| **Monorepo** | Turborepo | Multi-service management |
| **Containerization** | Docker + Compose | Service orchestration |
| **Package Manager** | npm workspaces | Shared dependencies |

---

## 📁 Project Structure

```
payflow/
├── apps/
│   ├── api-gateway/          # Port 3000 — Single entry point
│   ├── auth-service/         # Port 3001 — Merchant auth & API keys
│   ├── order-service/        # Port 3002 — Order management
│   ├── payment-service/      # Port 3003 — Payment processing
│   ├── webhook-service/      # Port 3004 — Webhook delivery (BullMQ)
│   ├── refund-service/       # Port 3005 — Refund management
│   ├── settlement-service/   # Port 3006 — T+1 settlements
│   ├── notification-service/ # Port 3007 — WhatsApp via Twilio
│   └── checkout/             # Port 3008 — Hosted payment UI
├── packages/
│   ├── database/             # Shared Prisma schema
│   └── sdk/                  # @payflow/sdk npm package
├── Dockerfile.auth
├── Dockerfile.gateway
├── Dockerfile.order
├── Dockerfile.payment
├── Dockerfile.webhook
├── Dockerfile.refund
├── Dockerfile.settlement
├── Dockerfile.notification
├── Dockerfile.checkout
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## 🔧 Services

### 🚦 API Gateway (Port 3000)
Single entry point for all client requests. Handles JWT authentication, rate limiting (100 req/min per API key via Redis), and proxies requests to the correct microservice.

### 🔐 Auth Service (Port 3001)
Merchant registration, login (email+password or API key+secret), and API key generation. Returns JWT tokens used for all subsequent requests.

### 📦 Order Service (Port 3002)
Create and manage orders. An order must exist before initiating a payment. Tracks order status: `created → paid → expired`.

### 💳 Payment Service (Port 3003)
Core payment processing with:
- **Idempotency** — prevents duplicate payments via Redis
- **Payment simulation** — 85% success rate, realistic failure scenarios
- **Status flow** — `created → captured / failed → refunded`
- Auto-triggers webhooks and WhatsApp notifications on completion

### 🔔 Webhook Service (Port 3004)
Registers merchant webhook URLs and delivers events using **BullMQ job queue** with:
- 3 retry attempts on failure
- Exponential backoff (2s → 4s → 8s)
- Concurrency of 5 parallel deliveries
- **HMAC SHA-256** signatures for payload verification
- Delivery logs per webhook

### 💸 Refund Service (Port 3005)
Full and partial refunds on captured payments. Validates refund amount against remaining refundable balance. Updates payment status to `refunded` on full refund.

### 🏦 Settlement Service (Port 3006)
T+1 settlement simulation. Processes all captured payments older than 24 hours, deducts 2% platform fee, and creates settlement records.

### 📱 Notification Service (Port 3007)
Internal service (not exposed via API Gateway). Sends WhatsApp messages via Twilio on payment success/failure.

### 🛍️ Checkout (Port 3008)
Hosted payment page. Supports UPI, Card, Wallet, Netbanking. Merchants redirect customers to this URL. Shows success/failure pages after payment.

---

## 🗄️ Database Schema

```prisma
model Merchant {
  id           String    @id @default(uuid())
  name         String
  email        String    @unique
  passwordHash String
  apiKey       String    @unique
  apiSecret    String
  orders       Order[]
  payments     Payment[]
  webhooks     Webhook[]
  settlements  Settlement[]
  createdAt    DateTime  @default(now())
}

model Order {
  id         String    @id @default(uuid())
  merchantId String
  amount     Int       // in paise (50000 = ₹500)
  currency   String    @default("INR")
  receipt    String?
  status     String    @default("created")
  merchant   Merchant  @relation(fields: [merchantId], references: [id])
  payments   Payment[]
  createdAt  DateTime  @default(now())
}

model Payment {
  id            String   @id @default(uuid())
  orderId       String
  merchantId    String
  method        String
  status        String   @default("created")
  transactionId String?
  order         Order    @relation(fields: [orderId], references: [id])
  merchant      Merchant @relation(fields: [merchantId], references: [id])
  refunds       Refund[]
  createdAt     DateTime @default(now())
}

model Refund {
  id        String   @id @default(uuid())
  paymentId String
  amount    Int
  status    String   @default("processed")
  payment   Payment  @relation(fields: [paymentId], references: [id])
  createdAt DateTime @default(now())
}

model Webhook {
  id         String       @id @default(uuid())
  merchantId String
  url        String
  secret     String
  merchant   Merchant     @relation(fields: [merchantId], references: [id])
  logs       WebhookLog[]
  createdAt  DateTime     @default(now())
}

model WebhookLog {
  id             String   @id @default(uuid())
  webhookId      String
  event          String
  deliveryStatus String
  webhook        Webhook  @relation(fields: [webhookId], references: [id])
  createdAt      DateTime @default(now())
}

model Settlement {
  id          String    @id @default(uuid())
  merchantId  String
  amount      Int
  status      String    @default("processed")
  processedAt DateTime?
  merchant    Merchant  @relation(fields: [merchantId], references: [id])
  createdAt   DateTime  @default(now())
}

model PaymentLink {
  id          String    @id @default(uuid())
  merchantId  String
  amount      Int
  linkToken   String    @unique
  status      String    @default("active")
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())
}
```

---

## 📡 API Reference

All requests go through the API Gateway at `http://localhost:3000`.

### 🔐 Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/merchants/register` | ❌ | Register new merchant |
| `POST` | `/merchants/login` | ❌ | Login, receive JWT token |
| `POST` | `/merchants/api-keys` | ✅ JWT | Generate new API key & secret |

### 📦 Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/orders` | ✅ JWT | Create new order |
| `GET` | `/orders` | ✅ JWT | Get all orders |
| `GET` | `/orders/:id` | ✅ JWT | Get order by ID |

### 💳 Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/payments/initiate` | ✅ JWT | Initiate payment (supports Idempotency-Key header) |
| `GET` | `/payments` | ✅ JWT | Get all payments |
| `GET` | `/payments/:id` | ✅ JWT | Get payment with order and refunds |
| `POST` | `/payments/:id/capture` | ✅ JWT | Capture authorized payment |

### 🔔 Webhooks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/webhooks` | ✅ JWT | Register webhook URL |
| `GET` | `/webhooks` | ✅ JWT | Get all webhooks |
| `GET` | `/webhooks/:id` | ✅ JWT | Get webhook with delivery logs |
| `DELETE` | `/webhooks/:id` | ✅ JWT | Delete webhook |

### 💸 Refunds

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/refunds` | ✅ JWT | Create full or partial refund |
| `GET` | `/refunds` | ✅ JWT | Get all refunds |
| `GET` | `/refunds/:id` | ✅ JWT | Get refund by ID |

### 🏦 Settlements

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/settlements` | ✅ JWT | Trigger settlement for eligible payments |
| `GET` | `/settlements` | ✅ JWT | Get all settlements |
| `GET` | `/settlements/summary` | ✅ JWT | Get settlement summary with pending amount |
| `GET` | `/settlements/:id` | ✅ JWT | Get settlement by ID |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis (or [Upstash](https://upstash.com) cloud Redis)
- npm 9+

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/payflow.git
cd payflow
```

### 2. Install dependencies for all services

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` in each service folder and fill in values (see [Environment Variables](#-environment-variables)).

### 4. Run database migrations

```bash
cd packages/database
npx prisma migrate dev
npx prisma generate
```

### 5. Start all services

```bash
turbo run dev --concurrency=15
```

This starts all 9 services simultaneously.

### 6. Verify services are running

```
GET http://localhost:3000/health  → api-gateway ✅
GET http://localhost:3001/health  → auth-service ✅
GET http://localhost:3002/health  → order-service ✅
GET http://localhost:3003/health  → payment-service ✅
GET http://localhost:3004/health  → webhook-service ✅
GET http://localhost:3005/health  → refund-service ✅
GET http://localhost:3006/health  → settlement-service ✅
GET http://localhost:3007/health  → notification-service ✅
GET http://localhost:3008/health  → checkout ✅
```

---

## 🔑 Environment Variables

### api-gateway
```env
PORT=3000
JWT_SECRET=your_jwt_secret
REDIS_URL=rediss://default:password@host:6379
AUTH_SERVICE_URL=http://127.0.0.1:3001
ORDER_SERVICE_URL=http://127.0.0.1:3002
PAYMENT_SERVICE_URL=http://127.0.0.1:3003
WEBHOOK_SERVICE_URL=http://127.0.0.1:3004
REFUND_SERVICE_URL=http://127.0.0.1:3005
SETTLEMENT_SERVICE_URL=http://127.0.0.1:3006
```

### auth-service / order-service / refund-service / settlement-service
```env
PORT=300X
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/payment_gateway
JWT_SECRET=your_jwt_secret
```

### payment-service
```env
PORT=3003
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/payment_gateway
JWT_SECRET=your_jwt_secret
REDIS_URL=rediss://default:password@host:6379
WEBHOOK_SERVICE_URL=http://127.0.0.1:3004
NOTIFICATION_SERVICE_URL=http://127.0.0.1:3007
INTERNAL_SECRET=your_internal_secret
```

### webhook-service
```env
PORT=3004
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/payment_gateway
JWT_SECRET=your_jwt_secret
REDIS_URL=rediss://default:password@host:6379
```

### notification-service
```env
PORT=3007
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
MERCHANT_WHATSAPP_TO=whatsapp:+91xxxxxxxxxx
```

### checkout
```env
PORT=3008
API_GATEWAY_URL=http://127.0.0.1:3000
JWT_SECRET=your_jwt_secret
```

---

## 🐳 Running with Docker

### Prerequisites

Install Docker Engine via WSL2 (Windows) or Docker Desktop (Mac/Linux).

### Start all services with one command

```bash
# Create root .env with secrets
cp .env.example .env

# Build and start everything
docker compose up --build
```

This automatically:
1. Starts PostgreSQL container
2. Runs Prisma migrations
3. Starts all 9 services
4. Sets up internal Docker networking

### Stop all services

```bash
docker compose down
```

### Clean up all Docker data (free disk space)

```bash
docker system prune -a --volumes -f
```

---

## 📦 SDK Usage

Install the SDK in your project:

```bash
npm install @payflow/sdk
```

### Initialize

```typescript
import Payflow from '@payflow/sdk';

const payflow = new Payflow({
  api_key: 'payflow_ak_xxx',
  api_secret: 'payflow_sk_xxx',
  base_url: 'https://your-gateway.com' // or http://localhost:3000
});
```

### Create Order & Initiate Payment

```typescript
// Create an order
const order = await payflow.orders.create({
  amount: 50000,      // ₹500.00 in paise
  currency: 'INR',
  receipt: 'receipt_001'
});

// Initiate payment
const payment = await payflow.payments.initiate({
  order_id: order.order_id,
  method: 'upi',           // upi | card | wallet | netbanking | crypto
  idempotency_key: 'unique-key-001'  // prevents duplicate charges
});

console.log(payment.status); // 'captured'
```

### Create Refund

```typescript
const refund = await payflow.refunds.create({
  payment_id: payment.payment_id,
  amount: 20000  // partial refund of ₹200
});

console.log(refund.remaining_refundable); // 30000 (₹300 still refundable)
```

### Register & Verify Webhooks

```typescript
// Register your webhook URL
const webhook = await payflow.webhooks.create({
  url: 'https://yoursite.com/payflow-webhook'
});

// Save webhook.secret securely

// On your webhook endpoint — verify signature
app.post('/payflow-webhook', (req, res) => {
  const isValid = payflow.webhooks.verify(
    JSON.stringify(req.body),
    webhook.secret,
    req.headers['x-payflow-signature']
  );

  if (!isValid) return res.status(401).send('Invalid signature');

  const event = req.headers['x-payflow-event'];
  if (event === 'payment.success') {
    // fulfill the order
  }

  res.send({ received: true });
});
```

### Settlement Summary

```typescript
const summary = await payflow.settlements.summary();
console.log(summary);
// {
//   total_payments: 10,
//   total_captured_amount: 500000,
//   total_settlements: 2,
//   total_settled_amount: 490000,
//   pending_settlement: 10000
// }
```

---

## 💳 Payment Flow

```
1. Merchant registers → gets API key + secret
2. Merchant logs in → gets JWT token
3. Merchant creates Order → gets order_id
4. Customer visits hosted checkout:
   http://localhost:3008/checkout?order_id=xxx&token=xxx
5. Customer selects payment method → clicks Pay
6. Payment Service processes payment (85% success rate simulation)
7. On success:
   ├── Payment status → 'captured'
   ├── Order status → 'paid'
   ├── Webhook fired → merchant notified
   └── WhatsApp sent → merchant gets message
8. Merchant can refund partially or fully
9. After 24h → payment eligible for settlement
```

---

## 🔔 Webhook System

Payflow uses **BullMQ** (backed by Redis) for reliable webhook delivery.

### How it works

```
Payment succeeds
      │
      ▼
payment-service calls webhook-service
      │
      ▼
webhook-service adds job to BullMQ queue
      │
      ▼
BullMQ Worker picks up job (concurrency: 5)
      │
      ▼
HTTP POST to merchant URL with:
  • x-payflow-event: payment.success
  • x-payflow-signature: sha256_hmac
  • Body: { payment_id, order_id, amount, ... }
      │
      ├── SUCCESS → log 'delivered'
      │
      └── FAILURE → retry with exponential backoff
                    attempt 1: immediate
                    attempt 2: after 2 seconds
                    attempt 3: after 4 seconds
```

### Webhook Events

| Event | When |
|---|---|
| `payment.success` | Payment captured successfully |
| `payment.failed` | Payment declined or timed out |
| `refund.processed` | Refund created successfully |

### Verify Webhook Signature

```typescript
import crypto from 'crypto';

function verifySignature(payload: string, secret: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}
```

---

## 🔁 Idempotency

Payflow implements idempotency for payment initiation to prevent duplicate charges.

### How to use

Send a unique `Idempotency-Key` header with every payment request:

```bash
POST /payments/initiate
Authorization: Bearer <token>
Idempotency-Key: order-123-attempt-1
Content-Type: application/json

{
  "order_id": "uuid",
  "method": "upi"
}
```

- Same key within 24 hours → returns cached result (no new payment)
- Different key → processes new payment
- Generate keys using UUID or `orderId + timestamp`

---

## ⚡ Rate Limiting

API Gateway enforces rate limits per API key:

- **Limit:** 100 requests per minute
- **Storage:** Redis (works across multiple instances)
- **Response on limit:** `HTTP 429 Too Many Requests`
- **Key:** `x-api-key` header (falls back to IP)

---

## 📱 WhatsApp Notifications

Merchants receive WhatsApp messages on payment events via Twilio.

### Payment Success Message

```
💰 Payment Received!

Amount: ₹500.00
Order ID: order_xxx
Payment ID: pay_xxx
Method: UPI
Status: Captured ✅

Powered by Payflow
```

### Setup

1. Create account at [twilio.com](https://twilio.com)
2. Enable WhatsApp Sandbox
3. Send `join <sandbox-word>` from your WhatsApp to `+14155238886`
4. Add Twilio credentials to `notification-service/.env`

---

## 🧪 Testing

### Full End-to-End Test via Postman

```bash
# 1. Register merchant
POST /merchants/register
{ "name": "Test Store", "email": "test@store.com", "password": "123456" }

# 2. Login
POST /merchants/login
{ "email": "test@store.com", "password": "123456" }
# → save token

# 3. Generate API keys
POST /merchants/api-keys
Authorization: Bearer <token>
# → save api_key and api_secret

# 4. Register webhook (use https://webhook.site for testing)
POST /webhooks
Authorization: Bearer <token>
{ "url": "https://webhook.site/your-unique-url" }

# 5. Create order
POST /orders
Authorization: Bearer <token>
{ "amount": 50000, "currency": "INR", "receipt": "test_001" }
# → save order_id

# 6. Initiate payment
POST /payments/initiate
Authorization: Bearer <token>
Idempotency-Key: test-001
{ "order_id": "<order_id>", "method": "upi" }
# → check webhook.site for payment.success event

# 7. Create partial refund
POST /refunds
Authorization: Bearer <token>
{ "payment_id": "<payment_id>", "amount": 20000 }

# 8. Check settlement summary
GET /settlements/summary
Authorization: Bearer <token>
```

### Test via SDK

```typescript
import Payflow from '@payflow/sdk';

const payflow = new Payflow({
  api_key: 'payflow_ak_xxx',
  api_secret: 'payflow_sk_xxx',
  base_url: 'http://localhost:3000'
});

const order = await payflow.orders.create({ amount: 50000, currency: 'INR' });
const payment = await payflow.payments.initiate({
  order_id: order.order_id,
  method: 'upi',
  idempotency_key: `test-${Date.now()}`
});
console.log(payment.status); // 'captured'
```

### Test Hosted Checkout

```
http://localhost:3008/checkout?order_id=<order_id>&token=<jwt_token>
```

---

## 📊 Service Ports Summary

| Service | Port | External |
|---|---|---|
| api-gateway | 3000 | ✅ Public |
| auth-service | 3001 | ❌ Internal |
| order-service | 3002 | ❌ Internal |
| payment-service | 3003 | ❌ Internal |
| webhook-service | 3004 | ❌ Internal |
| refund-service | 3005 | ❌ Internal |
| settlement-service | 3006 | ❌ Internal |
| notification-service | 3007 | ❌ Internal |
| checkout | 3008 | ✅ Public |

---

## 🗺️ Roadmap

- [ ] Deploy on Render
- [ ] Publish `@payflow/sdk` to npm
- [ ] Fraud detection service
- [ ] Prometheus + Grafana monitoring
- [ ] Payment Links (shareable payment URLs)
- [ ] Multi-currency support
- [ ] Subscription/recurring payments
- [ ] Admin dashboard

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Aman Asthana**

Built with ❤️ using Node.js, TypeScript, and a lot of chai ☕

---

<div align="center">
  <strong>⭐ Star this repo if you found it helpful!</strong>
  <br/>
  <sub>Built to learn. Built to ship. Built to impress.</sub>
</div>
```

---

