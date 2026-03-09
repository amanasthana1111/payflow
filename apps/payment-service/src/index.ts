import Fastify from 'fastify';
import fjwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { paymentRoutes } from './routes/payment.routes';

dotenv.config();

const app = Fastify({ logger: true });

app.register(fjwt, { secret: process.env.JWT_SECRET || 'secret' });
app.register(paymentRoutes);

app.get('/health', async () => ({ status: 'payment-service ok' }));

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3003, host: '0.0.0.0' });
    console.log('✅ Payment service running on port 3003');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();