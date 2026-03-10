import { FastifyRequest, FastifyReply } from 'fastify';
import {
  createWebhook,
  getWebhooks,
  getWebhookById,
  deleteWebhook,
  triggerWebhookEvent
} from '../services/webhook.service';

export async function create(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  const { url } = req.body as any;
  try {
    const webhook = await createWebhook(merchantId, url);
    reply.status(201).send(webhook);
  } catch (err: any) {
    reply.status(400).send({ error: err.message });
  }
}

export async function getAll(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  try {
    const webhooks = await getWebhooks(merchantId);
    reply.send(webhooks);
  } catch (err: any) {
    reply.status(500).send({ error: err.message });
  }
}

export async function getById(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  const { id: webhookId } = req.params as any;
  try {
    const webhook = await getWebhookById(webhookId, merchantId);
    reply.send(webhook);
  } catch (err: any) {
    reply.status(404).send({ error: err.message });
  }
}

export async function remove(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  const { id: webhookId } = req.params as any;
  try {
    const result = await deleteWebhook(webhookId, merchantId);
    reply.send(result);
  } catch (err: any) {
    reply.status(404).send({ error: err.message });
  }
}

export async function trigger(req: FastifyRequest, reply: FastifyReply) {
  const { merchantId, event, payload } = req.body as any;
  try {
    if (!merchantId || !event || !payload) {
      return reply.status(400).send({ error: 'merchantId, event and payload required' });
    }
    const result = await triggerWebhookEvent(merchantId, event, payload);
    reply.send(result);
  } catch (err: any) {
    reply.status(400).send({ error: err.message });
  }
}