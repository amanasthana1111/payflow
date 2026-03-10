import { PrismaClient } from '@prisma/client';
import { fetch } from 'undici';
import { generateSignature } from '../utils/signature';

const prisma = new PrismaClient();

export async function deliverWebhook(
  webhookId: string,
  event: string,
  payload: object
) {
  const webhook = await prisma.webhook.findUnique({
    where: { id: webhookId }
  });
  if (!webhook) throw new Error('Webhook not found');

  const payloadString = JSON.stringify(payload);
  const signature = generateSignature(payloadString, webhook.secret);

  let deliveryStatus = 'failed';

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-payflow-signature': signature,
        'x-payflow-event': event
      },
      body: payloadString
    });

    deliveryStatus = response.ok ? 'delivered' : 'failed';

  } catch (err) {
    deliveryStatus = 'failed';
  }

  // Log the delivery attempt
  await prisma.webhookLog.create({
    data: {
      webhookId,
      event,
      payload,
      deliveryStatus
    }
  });

  if (deliveryStatus === 'failed') {
    throw new Error('Webhook delivery failed');
  }

  return { status: deliveryStatus };
}