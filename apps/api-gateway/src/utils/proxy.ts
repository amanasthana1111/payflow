import { FastifyRequest, FastifyReply } from 'fastify';
import { fetch } from 'undici';

export async function proxyRequest(
  req: FastifyRequest,
  reply: FastifyReply,
  targetUrl: string
) {
  try {
    const url = `${targetUrl}${req.url}`;
    const headers: Record<string, string> = {
      'content-type': 'application/json',
    };
    if (req.headers.authorization) {
      headers['authorization'] = req.headers.authorization;
    }
    if (req.headers['x-api-key']) {
      headers['x-api-key'] = req.headers['x-api-key'] as string;
    }
    const response = await fetch(url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined,
    });
    const data = await response.json();
    reply.status(response.status).send(data);
  } catch (err: any) {
    reply.status(502).send({ error: 'Service unavailable' });
  }
}