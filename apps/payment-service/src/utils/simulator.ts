// Simulates a real payment processor (like Stripe/Razorpay internally)
// In production this would call a real bank/UPI processor

export function simulatePayment(method: string, amount: number): {
  success: boolean;
  transactionId: string;
  message: string;
} {
  // Simulate 85% success rate (realistic)
  const random = Math.random();
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Simulate failure for very small or test amounts
  if (amount === 1) {
    return { success: false, transactionId, message: 'Insufficient amount' };
  }

  if (random < 0.85) {
    return { success: true, transactionId, message: 'Payment successful' };
  } else if (random < 0.92) {
    return { success: false, transactionId, message: 'Payment declined by bank' };
  } else {
    return { success: false, transactionId, message: 'Payment timeout' };
  }
}