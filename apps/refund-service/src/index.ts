import Fastify from 'fastify';
import fjwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { refundRoutes } from './routes/refund.routes';

dotenv.config();

const app = Fastify({ logger: true });

app.register(fjwt, { secret: process.env.JWT_SECRET || 'secret' });
app.register(refundRoutes);

app.get('/health', async () => ({ status: 'refund-service ok' }));

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3005, host: '0.0.0.0' });
    console.log('✅ Refund service running on port 3005');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();