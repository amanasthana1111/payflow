import Fastify from 'fastify';
import fjwt from '@fastify/jwt';
import dotenv from 'dotenv';
dotenv.config();
import { webhookRoutes } from './routes/webhook.routes';
import { startWorker } from './utils/queue';

dotenv.config();

const app = Fastify({ logger: true });

app.register(fjwt, { secret: process.env.JWT_SECRET || 'secret' });
app.register(webhookRoutes);

app.get('/health', async () => ({ status: 'webhook-service ok' }));

const start = async () => {
  try {
    // Start BullMQ worker to process webhook jobs
    startWorker();
    console.log('✅ Webhook worker started');

    await app.listen({ port: Number(process.env.PORT) || 3004, host: '0.0.0.0' });
    console.log('✅ Webhook service running on port 3004');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();