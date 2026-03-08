import Fastify from 'fastify';
import dotenv from 'dotenv';
import { jwtPlugin } from './plugins/jwt.plugin';
import { rateLimitPlugin } from './plugins/rateLimit.plugin';
import { routes } from './routes/index';

dotenv.config();

const app = Fastify({ logger: true });

app.register(jwtPlugin);
app.register(rateLimitPlugin);
app.register(routes);

app.get('/health', async () => ({
  status: 'api-gateway ok',
  timestamp: new Date().toISOString()
}));

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' });
    console.log('✅ API Gateway running on port 3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();