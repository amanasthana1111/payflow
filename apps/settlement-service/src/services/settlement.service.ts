import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Settlement fee: 2% platform fee (like Razorpay charges)
const PLATFORM_FEE_PERCENT = 0.02;

export async function createSettlement(merchantId: string) {
  // Find all captured payments not yet settled
  const unsettledPayments = await prisma.payment.findMany({
    where: {
      merchantId,
      status: 'captured',
      // only payments older than 1 day (T+1 settlement)
      createdAt: {
        lte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    },
    include: { order: true }
  });

  if (unsettledPayments.length === 0) {
    throw new Error('No payments eligible for settlement');
  }

  // Calculate total amount
  const totalAmount = unsettledPayments.reduce(
    (sum, p) => sum + p.order.amount, 0
  );

  // Deduct platform fee
  const platformFee = Math.floor(totalAmount * PLATFORM_FEE_PERCENT);
  const settlementAmount = totalAmount - platformFee;

  // Create settlement record
  const settlement = await prisma.settlement.create({
    data: {
      merchantId,
      amount: settlementAmount,
      status: 'processed',
      processedAt: new Date()
    }
  });

  return {
    settlement_id: settlement.id,
    total_payments: unsettledPayments.length,
    gross_amount: totalAmount,
    platform_fee: platformFee,
    settlement_amount: settlementAmount,
    status: settlement.status,
    processed_at: settlement.processedAt
  };
}

export async function getAllSettlements(merchantId: string) {
  const settlements = await prisma.settlement.findMany({
    where: { merchantId },
    orderBy: { createdAt: 'desc' }
  });

  return settlements;
}

export async function getSettlementById(
  settlementId: string,
  merchantId: string
) {
  const settlement = await prisma.settlement.findFirst({
    where: { id: settlementId, merchantId }
  });

  if (!settlement) throw new Error('Settlement not found');
  return settlement;
}

export async function getSettlementSummary(merchantId: string) {
  // Total captured payments
  const payments = await prisma.payment.findMany({
    where: { merchantId, status: 'captured' },
    include: { order: true }
  });

  const totalCaptured = payments.reduce((sum, p) => sum + p.order.amount, 0);

  // Total settled
  const settlements = await prisma.settlement.findMany({
    where: { merchantId, status: 'processed' }
  });

  const totalSettled = settlements.reduce((sum, s) => sum + s.amount, 0);

  return {
    total_payments: payments.length,
    total_captured_amount: totalCaptured,
    total_settlements: settlements.length,
    total_settled_amount: totalSettled,
    pending_settlement: totalCaptured - totalSettled
  };
}