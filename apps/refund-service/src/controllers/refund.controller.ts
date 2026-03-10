import { FastifyRequest, FastifyReply } from 'fastify';
import { createRefund, getRefundById, getAllRefunds } from '../services/refund.service';

export async function create(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  const { payment_id, amount } = req.body as any;
  try {
    const refund = await createRefund(payment_id, merchantId, amount);
    reply.status(201).send(refund);
  } catch (err: any) {
    reply.status(400).send({ error: err.message });
  }
}

export async function getById(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  const { id: refundId } = req.params as any;
  try {
    const refund = await getRefundById(refundId, merchantId);
    reply.send(refund);
  } catch (err: any) {
    reply.status(404).send({ error: err.message });
  }
}

export async function getAll(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  try {
    const refunds = await getAllRefunds(merchantId);
    reply.send(refunds);
  } catch (err: any) {
    reply.status(500).send({ error: err.message });
  }
}