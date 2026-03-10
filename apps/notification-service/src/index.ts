import Fastify from 'fastify';
import dotenv from 'dotenv';
import { sendPaymentSuccessWhatsApp, sendPaymentFailedWhatsApp } from './services/whatsapp.service';

dotenv.config();

const app = Fastify({ logger: true });

// Internal route — called by payment-service
app.post('/notify/payment-success', async (req, reply) => {
  const data = req.body as any;
  try {
    const result = await sendPaymentSuccessWhatsApp(data);
    reply.send(result);
  } catch (err: any) {
    console.error('WhatsApp error:', err.message);
    reply.status(500).send({ error: err.message });
  }
});

app.post('/notify/payment-failed', async (req, reply) => {
  const data = req.body as any;
  try {
    const result = await sendPaymentFailedWhatsApp(data);
    reply.send(result);
  } catch (err: any) {
    console.error('WhatsApp error:', err.message);
    reply.status(500).send({ error: err.message });
  }
});

app.get('/health', async () => ({ status: 'notification-service ok' }));

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3007, host: '0.0.0.0' });
    console.log('✅ Notification service running on port 3007');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();