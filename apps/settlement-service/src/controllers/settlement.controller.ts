import { FastifyRequest, FastifyReply } from 'fastify';
import {
  createSettlement,
  getAllSettlements,
  getSettlementById,
  getSettlementSummary
} from '../services/settlement.service';

export async function create(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  try {
    const settlement = await createSettlement(merchantId);
    reply.status(201).send(settlement);
  } catch (err: any) {
    reply.status(400).send({ error: err.message });
  }
}

export async function getAll(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  try {
    const settlements = await getAllSettlements(merchantId);
    reply.send(settlements);
  } catch (err: any) {
    reply.status(500).send({ error: err.message });
  }
}

export async function getById(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  const { id: settlementId } = req.params as any;
  try {
    const settlement = await getSettlementById(settlementId, merchantId);
    reply.send(settlement);
  } catch (err: any) {
    reply.status(404).send({ error: err.message });
  }
}

export async function getSummary(req: FastifyRequest, reply: FastifyReply) {
  const { id: merchantId } = (req as any).user;
  try {
    const summary = await getSettlementSummary(merchantId);
    reply.send(summary);
  } catch (err: any) {
    reply.status(500).send({ error: err.message });
  }
}