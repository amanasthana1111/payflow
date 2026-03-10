import { FastifyInstance } from 'fastify';
import { create, getAll, getById, remove, trigger } from '../controllers/webhook.controller';
import { authenticate } from '../middleware/authenticate';

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/webhooks', { preHandler: authenticate }, create);
  app.get('/webhooks', { preHandler: authenticate }, getAll);
  app.post('/webhooks/trigger', trigger); // ← before /:id
  app.get('/webhooks/:id', { preHandler: authenticate }, getById);
  app.delete('/webhooks/:id', { preHandler: authenticate }, remove);
}