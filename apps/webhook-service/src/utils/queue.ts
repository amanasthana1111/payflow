import { Queue, Worker, Job } from 'bullmq';
import { deliverWebhook } from '../services/delivery.service';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
console.log(process.env.REDIS_URL)

// Parse URL for BullMQ connection options
function getConnection() {
  const url = new URL(redisUrl);
  return {
    host: url.hostname,
    port: Number(url.port) || 6379,
    password: url.password || undefined,
    tls: redisUrl.startsWith('rediss://') ? {} : undefined,
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => {
      if (times > 3) return null; // stop retrying after 3 attempts
      return Math.min(times * 1000, 3000);
    }
  };
}

const connection = getConnection();

// Create webhook queue
export const webhookQueue = new Queue('webhooks', { connection });

// Worker processes jobs from queue
export function startWorker() {
  const worker = new Worker(
    'webhooks',
    async (job: Job) => {
      const { webhookId, event, payload } = job.data;
      await deliverWebhook(webhookId, event, payload);
    },
    {
      connection,
      concurrency: 5
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Webhook job ${job.id} delivered`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Webhook job ${job?.id} failed:`, err.message);
  });

  return worker;
}