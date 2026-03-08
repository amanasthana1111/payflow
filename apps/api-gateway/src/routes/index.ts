import { FastifyInstance } from 'fastify';
import { proxyRequest } from '../utils/proxy';
import { authenticate } from '../middleware/authenticate';

const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const ORDER_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3002';
const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003';
const WEBHOOK_URL = process.env.WEBHOOK_SERVICE_URL || 'http://localhost:3004';
const REFUND_URL = process.env.REFUND_SERVICE_URL || 'http://localhost:3005';

export async function routes(app: FastifyInstance) {
  // Public
  app.post('/merchants/register', (req, reply) => proxyRequest(req, reply, AUTH_URL));
  app.post('/merchants/login', (req, reply) => proxyRequest(req, reply, AUTH_URL));

  // Protected
  app.post('/merchants/api-keys', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, AUTH_URL));
  app.post('/orders', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, ORDER_URL));
  app.get('/orders/:id', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, ORDER_URL));
  app.post('/payments/initiate', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, PAYMENT_URL));
  app.get('/payments/:id', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, PAYMENT_URL));
  app.post('/webhooks', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, WEBHOOK_URL));
  app.post('/refunds', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, REFUND_URL));
  app.get('/refunds/:id', { preHandler: authenticate }, (req, reply) => proxyRequest(req, reply, REFUND_URL));
}