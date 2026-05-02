import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = Fastify({ logger: true });

const PORT = Number(process.env.PORT) || 3010;
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://127.0.0.1:3000';
const CHECKOUT_URL = process.env.CHECKOUT_URL || 'http://127.0.0.1:3008';

const serviceUrls: Record<string, string> = {
  gateway: API_GATEWAY_URL,
  auth: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:3001',
  orders: process.env.ORDER_SERVICE_URL || 'http://127.0.0.1:3002',
  payments: process.env.PAYMENT_SERVICE_URL || 'http://127.0.0.1:3003',
  webhooks: process.env.WEBHOOK_SERVICE_URL || 'http://127.0.0.1:3004',
  refunds: process.env.REFUND_SERVICE_URL || 'http://127.0.0.1:3005',
  settlements: process.env.SETTLEMENT_SERVICE_URL || 'http://127.0.0.1:3006',
  notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://127.0.0.1:3007',
  checkout: CHECKOUT_URL
};

function dashboardHtml() {
  const filePath = path.join(process.cwd(), 'public', 'index.html');
  return fs.readFileSync(filePath, 'utf8');
}

function copyHeader(
  req: FastifyRequest,
  headers: Record<string, string>,
  name: string
) {
  const value = req.headers[name];
  if (typeof value === 'string' && value) headers[name] = value;
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

app.get('/', async (_req, reply) => {
  reply.type('text/html').send(dashboardHtml());
});

app.get('/health', async () => ({
  status: 'dashboard ok',
  timestamp: new Date().toISOString()
}));

app.get('/config', async () => ({
  apiGatewayUrl: API_GATEWAY_URL,
  checkoutUrl: CHECKOUT_URL
}));

app.get('/service-health', async () => {
  const checks = await Promise.all(
    Object.entries(serviceUrls).map(async ([name, baseUrl]) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);

      try {
        const response = await fetch(`${baseUrl}/health`, {
          signal: controller.signal
        });
        const body = await parseResponse(response);

        return {
          name,
          url: baseUrl,
          ok: response.ok,
          status: response.status,
          body
        };
      } catch (err: any) {
        return {
          name,
          url: baseUrl,
          ok: false,
          status: 0,
          body: err.message || 'unreachable'
        };
      } finally {
        clearTimeout(timeout);
      }
    })
  );

  return { services: checks };
});

app.route({
  method: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  url: '/api/*',
  handler: async (req: FastifyRequest, reply: FastifyReply) => {
    const targetPath = req.url.replace(/^\/api/, '') || '/';
    const targetUrl = `${API_GATEWAY_URL}${targetPath}`;

    const headers: Record<string, string> = {};
    copyHeader(req, headers, 'authorization');
    copyHeader(req, headers, 'x-api-key');
    copyHeader(req, headers, 'idempotency-key');

    const hasBody = !['GET', 'HEAD'].includes(req.method) && req.body !== undefined;
    if (hasBody) headers['content-type'] = 'application/json';

    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: hasBody ? JSON.stringify(req.body) : undefined
      });
      const body = await parseResponse(response);

      reply.status(response.status).send(body);
    } catch (err: any) {
      reply.status(502).send({
        error: 'Gateway unavailable',
        detail: err.message
      });
    }
  }
});

const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Dashboard running on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
