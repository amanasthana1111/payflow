# Payflow

A **microservices-based payment gateway** inspired by systems like **Razorpay and Stripe**.

Payflow allows merchants to:

* Create orders
* Process payments
* Receive webhook notifications
* Handle refunds
* Use a developer SDK

The system is designed using **modern backend architecture patterns** such as:

* Microservices
* API Gateway
* JWT Authentication
* Idempotency keys
* Redis caching
* BullMQ background jobs
* Webhooks with HMAC verification

---

# Architecture

Payflow follows a **microservices architecture** where each service performs a single responsibility and runs independently. 

```
Client
   |
   v
API Gateway (Port 3000)
   |
   |----> Auth Service (3001)
   |----> Order Service (3002)
   |----> Payment Service (3003)
   |----> Webhook Service (3004)
   |----> Refund Service (3005)
```

### Flow

```
Client -> API Gateway -> Auth -> Order -> Payment -> Webhook -> Merchant Server
```

The **API Gateway acts as the single entry point** and routes requests to the correct microservice.

---

# Project Structure

```
payflow/

apps/
  api-gateway/
  auth-service/
  order-service/
  payment-service/
  webhook-service/
  refund-service/

packages/
  database/        # Prisma schema shared by services
  sdk/             # Payflow SDK

turbo.json
package.json
docker-compose.yml
```

The project uses a **monorepo managed by Turborepo** to run all services together.

---

# Tech Stack

### Backend

* Node.js
* TypeScript
* Fastify
* Prisma ORM
* PostgreSQL

### Infrastructure

* Redis (Upstash)
* BullMQ
* Docker
* Turborepo

### Security

* JWT Authentication
* HMAC Webhook Signatures
* Idempotency Keys
* Rate Limiting

---

# Core Features

## Authentication

Merchants authenticate using **JWT tokens**.

```
Authorization: Bearer <token>
```

Tokens are issued when merchants log in and verified by each service.

---

## Idempotency (Prevent Double Payments)

Payments use **idempotency keys** to prevent duplicate transactions.

```
Idempotency-Key: unique-payment-key
```

The key is stored in Redis for **24 hours** so repeated requests return the same result instead of charging the customer twice. 

---

## Payment Processing

Payment simulation mimics real payment processors.

Success rate simulation:

```
85% -> success
7%  -> declined
8%  -> timeout
```

This allows realistic testing of payment flows.

---

## Webhooks

Merchants can register webhook URLs.

When a payment event occurs, Payflow sends:

```
POST /merchant-webhook

Headers:
x-payflow-signature
x-payflow-event
```

The payload is signed using **HMAC SHA256** to ensure authenticity.

---

## Background Jobs

Webhook delivery is handled by **BullMQ queues**.

Features:

* retry logic
* exponential backoff
* concurrency processing

This ensures reliable event delivery.

---

# API Reference

| Method | Endpoint            | Description       |
| ------ | ------------------- | ----------------- |
| POST   | /merchants/register | Register merchant |
| POST   | /merchants/login    | Login merchant    |
| POST   | /orders             | Create order      |
| GET    | /orders             | List orders       |
| POST   | /payments/initiate  | Start payment     |
| GET    | /payments           | Get payments      |
| POST   | /webhooks           | Register webhook  |
| GET    | /webhooks           | List webhooks     |

---

# Local Development

### 1 Install dependencies

```
npm install
```

---

### 2 Start services

```
npm run dev
```

Or with turborepo:

```
turbo run dev
```

---

### 3 Environment Variables

Create `.env`

```
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/payflow
JWT_SECRET=super_secret_key
REDIS_URL=redis://localhost:6379
```

Never commit `.env` to GitHub.

---

# Docker Setup

Build containers

```
docker-compose build
```

Run all services

```
docker-compose up
```

---

# Payment Flow

```
1. Merchant creates order
2. Client initiates payment
3. Payment service processes transaction
4. Order status updated
5. Webhook event triggered
6. Merchant server receives payment confirmation
```

---

# Future Improvements

Planned features:

* Refund service
* Settlement service
* Fraud detection
* Hosted checkout page
* Monitoring with Prometheus & Grafana
* CI/CD pipelines

---

# Learning Goals

This project demonstrates production backend concepts:

* Microservices architecture
* Distributed system design
* Secure payment processing
* Event-driven systems
* DevOps and containerization

---

# Inspiration

Inspired by the architecture of:

* Stripe
* Razorpay
* Modern fintech backend systems

---

# License

MIT License

