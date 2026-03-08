import { FastifyInstance } from 'fastify';
import fjwt from '@fastify/jwt';

export async function jwtPlugin(app: FastifyInstance) {
  app.register(fjwt, {
    secret: process.env.JWT_SECRET || 'secret'
  });
}