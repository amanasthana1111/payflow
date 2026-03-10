import { FastifyInstance } from 'fastify';
import { create, getAll, getById, getSummary } from '../controllers/settlement.controller';
import { authenticate } from '../middleware/authenticate';

export async function settlementRoutes(app: FastifyInstance) {
  app.post('/settlements', { preHandler: authenticate }, create);
  app.get('/settlements', { preHandler: authenticate }, getAll);
  app.get('/settlements/summary', { preHandler: authenticate }, getSummary);
  app.get('/settlements/:id', { preHandler: authenticate }, getById);
}