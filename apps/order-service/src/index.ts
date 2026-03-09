import Fastify from 'fastify';
import fjwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { orderRoutes } from './routes/order.routes';

dotenv.config();

const app = Fastify({ logger: true });

app.register(fjwt, { secret: process.env.JWT_SECRET || 'secret' });
app.register(orderRoutes);

app.get('/health', async () => ({ status: 'order-service ok' }));

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3002, host: '0.0.0.0' });
    console.log('✅ Order service running on port 3002');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();