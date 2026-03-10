import Fastify from 'fastify';
import fjwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { settlementRoutes } from './routes/settlement.routes';

dotenv.config();

const app = Fastify({ logger: true });

app.register(fjwt, { secret: process.env.JWT_SECRET || 'secret' });
app.register(settlementRoutes);

app.get('/health', async () => ({ status: 'settlement-service ok' }));

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3006, host: '0.0.0.0' });
    console.log('✅ Settlement service running on port 3006');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();