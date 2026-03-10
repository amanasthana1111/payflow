import { FastifyInstance } from 'fastify';
import { proxyRequest } from '../utils/proxy';
import { authenticate } from '../middleware/authenticate';

const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:3001';
const ORDER_URL = process.env.ORDER_SERVICE_URL || 'http://127.0.0.1:3002';
const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL || 'http://127.0.0.1:3003';
const WEBHOOK_URL = process.env.WEBHOOK_SERVICE_URL || 'http://127.0.0.1:3004';
const REFUND_URL = process.env.REFUND_SERVICE_URL || 'http://127.0.0.1:3005';
const SETTLEMENT_URL = process.env.SETTLEMENT_URL || 'http://127.0.0.1:3006';

export async function routes(app: FastifyInstance) {
  // ── AUTH (public) ────────────────────────────────────────
  app.post('/merchants/register', (req, reply) => proxyRequest(req, reply, AUTH_URL));
  app.post('/merchants/login', (req, reply) => proxyRequest(req, reply, AUTH_URL));

  // ── AUTH (protected) ─────────────────────────────────────
  app.post('/merchants/api-keys', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, AUTH_URL));

  // ── ORDERS ───────────────────────────────────────────────
  app.post('/orders', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, ORDER_URL));
  app.get('/orders', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, ORDER_URL));
  app.get('/orders/:id', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, ORDER_URL));

  // ── PAYMENTS ─────────────────────────────────────────────
  app.post('/payments/initiate', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, PAYMENT_URL));
  app.get('/payments', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, PAYMENT_URL));
  app.get('/payments/:id', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, PAYMENT_URL));
  app.post('/payments/:id/capture', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, PAYMENT_URL));

  // ── WEBHOOKS ─────────────────────────────────────────────
  app.post('/webhooks', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, WEBHOOK_URL));
  app.get('/webhooks', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, WEBHOOK_URL));
  app.get('/webhooks/:id', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, WEBHOOK_URL));
  app.delete('/webhooks/:id', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, WEBHOOK_URL));
  app.post('/webhooks/trigger', { preHandler: authenticate },(req, reply) => proxyRequest(req, reply, WEBHOOK_URL)); // ← before /:id

  // ── REFUNDS ──────────────────────────────────────────────
  app.post('/refunds', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, REFUND_URL));
  app.get('/refunds', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, REFUND_URL));
  app.get('/refunds/:id', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, REFUND_URL));

  // ── SETTLEMENT ──────────────────────────────────────────────
  app.post('/settlements', { preHandler: authenticate },(req, reply) => proxyRequest(req, reply, SETTLEMENT_URL));
  app.get('/settlements', { preHandler: authenticate },(req, reply) => proxyRequest(req, reply, SETTLEMENT_URL));
  app.get('/settlements/summary', { preHandler: authenticate },(req, reply) => proxyRequest(req, reply, SETTLEMENT_URL));
  app.get('/settlements/:id', { preHandler: authenticate },(req, reply) => proxyRequest(req, reply, SETTLEMENT_URL));
}