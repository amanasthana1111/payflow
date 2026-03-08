import { FastifyInstance } from 'fastify';
import { register, login, generateKeys } from '../controllers/merchant.controller';
import { authenticate } from '../middleware/auth.middleware';

export async function merchantRoutes(app: FastifyInstance) {
  app.post('/merchants/register', register);
  app.post('/merchants/login', login);
  app.post('/merchants/api-keys', { preHandler: authenticate }, generateKeys);
}
