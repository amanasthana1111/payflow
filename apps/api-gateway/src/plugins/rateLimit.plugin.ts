import { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';

export async function rateLimitPlugin(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: 100,
    timeWindow: 60000,
    keyGenerator: (req) => {
      const apiKey = req.headers['x-api-key'] as string;
      return apiKey || req.ip;
    },
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Max 100 requests per minute.'
    })
  });
}