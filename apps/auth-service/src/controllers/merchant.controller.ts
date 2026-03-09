import { FastifyRequest, FastifyReply } from 'fastify';
import { registerMerchant, loginMerchant, regenerateApiKeys } from '../services/merchant.service';
import { LoginInput, RegisterInput } from '../validation/merchant.validation';

export async function register(req: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) {
  const { name, email, password } = req.body as any;
  try {
    const result = await registerMerchant(name, email, password);
    reply.status(201).send(result);
  } catch (err: any) {
    reply.status(400).send({ error: err.message });
  }
}

export async function login(req: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
  const { email, password } = req.body as any;
  try {
    const merchant = await loginMerchant(email, password);
    const token = await reply.jwtSign({ id: merchant.id, email: merchant.email });
    reply.send({ token });
  } catch (err: any) {
    reply.status(401).send({ error: err.message });
  }
}

export async function generateKeys(req: FastifyRequest, reply: FastifyReply) {
  const { id } = (req as any).user;
  try {
    const keys = await regenerateApiKeys(id);
    reply.send(keys);
  } catch (err: any) {
    reply.status(500).send({ error: err.message });
  }
}
