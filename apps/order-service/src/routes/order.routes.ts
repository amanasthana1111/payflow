import { FastifyInstance } from 'fastify';
import { create, getById, getAll } from '../controllers/order.controller';
import { authenticate } from '../middleware/authenticate';

export async function orderRoutes(app: FastifyInstance) {
  app.post('/orders', { preHandler: authenticate }, create);
  app.get('/orders', { preHandler: authenticate }, getAll);
  app.get('/orders/:id', { preHandler: authenticate }, getById);
}