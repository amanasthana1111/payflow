import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createOrder(
  merchantId: string,
  amount: number,
  currency: string,
  receipt?: string
) {
  if (!merchantId || !amount) throw new Error('merchantId and amount are required');
  if (amount <= 0) throw new Error('Amount must be greater than 0');

  const order = await prisma.order.create({
    data: {
      merchantId,
      amount,
      currency: currency || 'INR',
      status: 'created',
      receipt
    }
  });

  return {
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    receipt: order.receipt,
    created_at: order.createdAt
  };
}

export async function getOrderById(orderId: string, merchantId: string) {
  if (!orderId) throw new Error('Order ID required');

  const order = await prisma.order.findFirst({
    where: { id: orderId, merchantId },
    include: { payments: true }
  });

  if (!order) throw new Error('Order not found');
  return order;
}

export async function getAllOrders(merchantId: string) {
  return await prisma.order.findMany({
    where: { merchantId },
    orderBy: { createdAt: 'desc' }
  });
}