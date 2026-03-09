import { FastifyInstance } from 'fastify';
import fjwt from '@fastify/jwt';
import fp from 'fastify-plugin'; 

async function jwtPlugin(app: FastifyInstance) {
  app.register(fjwt, {
    secret: process.env.JWT_SECRET || 'secret'
  });
}

export default fp(jwtPlugin);  // ✅ wrap with fp, default export