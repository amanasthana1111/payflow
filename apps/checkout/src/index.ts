import Fastify from 'fastify';
import dotenv from 'dotenv';
import { checkoutRoutes } from './routes/checkout.routes';

dotenv.config();

const app = Fastify({ logger: true });

app.register(checkoutRoutes);

app.get('/health', async () => ({ status: 'checkout ok' }));

const start = async () => {
  try {
    await app.listen({
      port: Number(process.env.PORT) || 3008,
      host: '0.0.0.0'
    });
    console.log('✅ Checkout service running on port 3008');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();