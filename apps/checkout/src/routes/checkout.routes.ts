import { FastifyInstance } from 'fastify';
import {
  getCheckoutPage,
  processPayment,
  successPage,
  failedPage
} from '../controllers/checkout.controller';

export async function checkoutRoutes(app: FastifyInstance) {
  app.get('/checkout', getCheckoutPage);
  app.post('/checkout/pay', processPayment);
  app.get('/checkout/success', successPage);
  app.get('/checkout/failed', failedPage);
}