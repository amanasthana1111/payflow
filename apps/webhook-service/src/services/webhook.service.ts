import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { webhookQueue } from '../utils/queue';

const prisma = new PrismaClient();

export async function createWebhook(merchantId: string, url: string) {
  if (!url) throw new Error('Webhook URL is required');

  // Auto generate a secret for the merchant
  const secret = crypto.randomBytes(32).toString('hex');

  const webhook = await prisma.webhook.create({
    data: { merchantId, url, secret }
  });

  return {
    webhook_id: webhook.id,
    url: webhook.url,
    secret: webhook.secret,
    created_at: webhook.createdAt
  };
}

export async function getWebhooks(merchantId: string) {
  return await prisma.webhook.findMany({
    where: { merchantId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getWebhookById(webhookId: string, merchantId: string) {
  const webhook = await prisma.webhook.findFirst({
    where: { id: webhookId, merchantId },
    include: { logs: { orderBy: { createdAt: 'desc' }, take: 10 } }
  });
  if (!webhook) throw new Error('Webhook not found');
  return webhook;
}

export async function deleteWebhook(webhookId: string, merchantId: string) {
  const webhook = await prisma.webhook.findFirst({
    where: { id: webhookId, merchantId }
  });
  if (!webhook) throw new Error('Webhook not found');

  await prisma.webhook.delete({ where: { id: webhookId } });
  return { message: 'Webhook deleted' };
}

// Called by payment-service after payment success/fail
export async function triggerWebhookEvent(
  merchantId: string,
  event: string,
  payload: object
) {
  const webhooks = await prisma.webhook.findMany({
    where: { merchantId }
  });

  // Queue delivery for each webhook URL merchant has registered
  for (const webhook of webhooks) {
    await webhookQueue.add(
      event,
      { webhookId: webhook.id, event, payload },
      {
        attempts: 3,         // retry 3 times on failure
        backoff: {
          type: 'exponential',
          delay: 2000        // 2s, 4s, 8s
        }
      }
    );
  }

  return { queued: webhooks.length };
}