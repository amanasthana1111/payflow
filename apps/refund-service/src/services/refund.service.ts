import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createRefund(
  paymentId: string,
  merchantId: string,
  amount: number,
) {
  if (!paymentId || !amount) {
    throw new Error("paymentId and amount are required");
  }

  if (amount <= 0) {
    throw new Error("Refund amount must be greater than 0");
  }

  // Get payment and validate
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, merchantId },
    include: { refunds: true },
  });

  if (!payment) throw new Error("Payment not found");
  if (payment.status !== "captured") {
    throw new Error("Only captured payments can be refunded");
  }

  // Get original order amount
  const order = await prisma.order.findUnique({
    where: { id: payment.orderId },
  });
  if (!order) throw new Error("Order not found");

  // Calculate total already refunded
  const totalRefunded = payment.refunds
    .filter((r) => r.status !== "failed")
    .reduce((sum, r) => sum + r.amount, 0);

  const remainingAmount = order.amount - totalRefunded;

  if (amount > remainingAmount) {
    throw new Error(
      `Refund amount exceeds remaining refundable amount of ${remainingAmount}`,
    );
  }

  // Create refund
  const refund = await prisma.refund.create({
    data: {
      paymentId,
      amount,
      status: "processed",
    },
  });

  // If fully refunded → update payment status
  if (amount === remainingAmount) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "refunded" },
    });
  }

  return {
    refund_id: refund.id,
    payment_id: paymentId,
    amount: refund.amount,
    status: refund.status,
    remaining_refundable: remainingAmount - amount,
    created_at: refund.createdAt,
  };
}

export async function getRefundById(refundId: string, merchantId: string) {
  const refund = await prisma.refund.findFirst({
    where: {
      id: refundId,
      payment: { merchantId },
    },
    include: { payment: true },
  });

  if (!refund) throw new Error("Refund not found");

  return {
    refund_id: refund.id,
    payment_id: refund.paymentId,
    amount: refund.amount,
    status: refund.status,
    created_at: refund.createdAt,
  };
}

export async function getAllRefunds(merchantId: string) {
  return await prisma.refund.findMany({
    where: {
      payment: { merchantId },
    },
    include: { payment: true },
    orderBy: { createdAt: "desc" },
  });
}
