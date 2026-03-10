import { FastifyInstance } from 'fastify';
import { create, getById, getAll } from '../controllers/refund.controller';
import { authenticate } from '../middleware/authenticate';

export async function refundRoutes(app: FastifyInstance) {
  app.post('/refunds', { preHandler: authenticate }, create);
  app.get('/refunds', { preHandler: authenticate }, getAll);
  app.get('/refunds/:id', { preHandler: authenticate }, getById);
}