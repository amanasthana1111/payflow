import { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import Redis from 'ioredis';

export async function rateLimitPlugin(app: FastifyInstance) {
  let redis: Redis | undefined;

  const url = process.env.REDIS_URL || '';

  if (url) {
    try {
      redis = new Redis(url, {
        tls: url.startsWith('rediss://') ? {} : undefined,
        maxRetriesPerRequest: 0,
        enableOfflineQueue: false,
        lazyConnect: true,
        connectTimeout: 3000,
        retryStrategy: () => null  // don't retry at all
      });

      await redis.connect();
      await redis.ping();
      app.log.info('✅ Redis connected for rate limiting');

    } catch (err) {
      app.log.warn('⚠️  Redis not available, using in-memory rate limiting');
      redis?.disconnect();  // clean up connection
      redis = undefined;
    }
  }

  await app.register(rateLimit, {
    max: 100,
    timeWindow: 60000,
    ...(redis ? { redis } : {}),
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