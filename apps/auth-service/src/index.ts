import Fastify from 'fastify';
import fjwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { merchantRoutes } from './routes/merchant.routes';

dotenv.config();

const app = Fastify({ logger: true });

app.register(fjwt, { secret: process.env.JWT_SECRET || 'secret' });
app.register(merchantRoutes);

app.get('/health', async () => ({ status: 'auth-service ok' }));

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' });
    console.log('✅ Auth service running on port 3001');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
