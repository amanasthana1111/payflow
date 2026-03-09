import { FastifyInstance } from 'fastify';
import { register, login, generateKeys } from '../controllers/merchant.controller';
import { authenticate } from '../middleware/auth.middleware';
import { loginSchema, registerSchema } from '../validation/merchant.validation';

export async function merchantRoutes(app: FastifyInstance) {
  app.post('/merchants/register',{
    schema: {
      body: registerSchema,
    },
  }, register);
  app.post('/merchants/login',{
    schema: {
      body: loginSchema,
    },
  }, login);
  app.post('/merchants/api-keys', { preHandler: authenticate }, generateKeys);
}
