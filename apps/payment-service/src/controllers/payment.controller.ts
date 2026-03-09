import { FastifyRequest, FastifyReply } from 'fastify';
import {
  initiatePayment,
  getPaymentById,
  getAllPayments,
  capturePayment
} from '../services/payment.service';

export async function initiate(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  const { order_id, method } = req.body as any;
  const idempotencyKey = req.headers['idempotency-key'] as string;

  try {
    const payment = await initiatePayment(order_id, merchantId, method, idempotencyKey);
    reply.status(201).send(payment);
  } catch (err: any) {
    reply.status(400).send({ error: err.message });
  }
}

export async function getById(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  const { id: paymentId } = req.params as any;

  try {
    const payment = await getPaymentById(paymentId, merchantId);
    reply.send(payment);
  } catch (err: any) {
    reply.status(404).send({ error: err.message });
  }
}

export async function getAll(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  try {
    const payments = await getAllPayments(merchantId);
    reply.send(payments);
  } catch (err: any) {
    reply.status(500).send({ error: err.message });
  }
}

export async function capture(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  const { id: paymentId } = req.params as any;
  try {
    const payment = await capturePayment(paymentId, merchantId);
    reply.send(payment);
  } catch (err: any) {
    reply.status(400).send({ error: err.message });
  }
}