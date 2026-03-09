import { FastifyInstance } from 'fastify';
import { initiate, getById, getAll, capture } from '../controllers/payment.controller';
import { authenticate } from '../middleware/authenticate';

export async function paymentRoutes(app: FastifyInstance) {
  app.post('/payments/initiate', { preHandler: authenticate }, initiate);
  app.get('/payments', { preHandler: authenticate }, getAll);
  app.get('/payments/:id', { preHandler: authenticate }, getById);
  app.post('/payments/:id/capture', { preHandler: authenticate }, capture);
}