import { FastifyRequest, FastifyReply } from 'fastify';
import { createOrder, getOrderById, getAllOrders } from '../services/order.service';

export async function create(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  const { amount, currency, receipt } = req.body as any;
  try {
    const order = await createOrder(merchantId, amount, currency, receipt);
    reply.status(201).send(order);
  } catch (err: any) {
    reply.status(400).send({ error: err.message });
  }
}

export async function getById(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  const { id: orderId } = req.params as any;
  try {
    const order = await getOrderById(orderId, merchantId);
    reply.send(order);
  } catch (err: any) {
    reply.status(404).send({ error: err.message });
  }
}

export async function getAll(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  try {
    const orders = await getAllOrders(merchantId);
    reply.send(orders);
  } catch (err: any) {
    reply.status(500).send({ error: err.message });
  }
}