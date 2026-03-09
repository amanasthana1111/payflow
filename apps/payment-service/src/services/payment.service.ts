import { PrismaClient } from '@prisma/client';
import { simulatePayment } from '../utils/simulator';
import { setIdempotencyKey, getIdempotencyKey } from '../utils/idempotency';

const prisma = new PrismaClient();

export async function initiatePayment(
  orderId: string,
  merchantId: string,
  method: string,
  idempotencyKey?: string
) {
  // Check idempotency — prevent duplicate payments
  if (idempotencyKey) {
    const existing = await getIdempotencyKey(idempotencyKey);
    if (existing) return existing;
  }

  // Validate method
  const validMethods = ['upi', 'card', 'wallet', 'netbanking','crypto'];
  if (!validMethods.includes(method)) {
    throw new Error(`Invalid payment method. Use: ${validMethods.join(', ')}`);
  }

  // Get order and validate
  const order = await prisma.order.findFirst({
    where: { id: orderId, merchantId }
  });
  if (!order) throw new Error('Order not found');
  if (order.status === 'paid') throw new Error('Order already paid');
  if (order.status === 'expired') throw new Error('Order expired');

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      orderId,
      merchantId,
      method,
      status: 'created'
    }
  });

  // Simulate payment processor
  const result = simulatePayment(method, order.amount);

  if (result.success) {
    // Update payment to captured
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'captured',
        transactionId: result.transactionId
      }
    });

    // Mark order as paid
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'paid' }
    });

    const response = {
      payment_id: updated.id,
      order_id: orderId,
      amount: order.amount,
      currency: order.currency,
      method: updated.method,
      status: updated.status,
      transaction_id: updated.transactionId,
      message: result.message
    };

    // Save to idempotency cache
    if (idempotencyKey) await setIdempotencyKey(idempotencyKey, response);
    return response;

  } else {
    // Mark payment as failed
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'failed' }
    });

    throw new Error(result.message);
  }
}

export async function getPaymentById(paymentId: string, merchantId: string) {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, merchantId },
    include: { order: true, refunds: true }
  });
  if (!payment) throw new Error('Payment not found');
  return payment;
}

export async function getAllPayments(merchantId: string) {
  return await prisma.payment.findMany({
    where: { merchantId },
    include: { order: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function capturePayment(paymentId: string, merchantId: string) {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, merchantId }
  });
  if (!payment) throw new Error('Payment not found');
  if (payment.status !== 'authorized') throw new Error('Payment not in authorized state');

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'captured' }
  });

  return updated;
}