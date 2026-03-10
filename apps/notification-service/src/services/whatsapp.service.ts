import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendPaymentSuccessWhatsApp(data: {
  payment_id: string;
  order_id: string;
  amount: number;
  currency: string;
  method: string;
  merchant_phone?: string;
}) {
  const amount = (data.amount / 100).toFixed(2);
  const symbol = data.currency === 'INR' ? '₹' : '$';

  const message = `
💰 *Payment Received!*

*Amount:* ${symbol}${amount}
*Order ID:* ${data.order_id}
*Payment ID:* ${data.payment_id}
*Method:* ${data.method.toUpperCase()}
*Status:* Captured ✅

_Powered by Payflow_
  `.trim();

  const to = data.merchant_phone
    ? `whatsapp:${data.merchant_phone}`
    : process.env.MERCHANT_WHATSAPP_TO!;

  const result = await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to,
    body: message
  });

  console.log(`✅ WhatsApp sent! SID: ${result.sid}`);
  return { sid: result.sid, status: result.status };
}

export async function sendPaymentFailedWhatsApp(data: {
  order_id: string;
  amount: number;
  currency: string;
  reason: string;
  merchant_phone?: string;
}) {
  const amount = (data.amount / 100).toFixed(2);
  const symbol = data.currency === 'INR' ? '₹' : '$';

  const message = `
❌ *Payment Failed!*

*Amount:* ${symbol}${amount}
*Order ID:* ${data.order_id}
*Reason:* ${data.reason}

_Please retry the payment._
_Powered by Payflow_
  `.trim();

  const to = data.merchant_phone
    ? `whatsapp:${data.merchant_phone}`
    : process.env.MERCHANT_WHATSAPP_TO!;

  const result = await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to,
    body: message
  });

  console.log(`✅ WhatsApp sent! SID: ${result.sid}`);
  return { sid: result.sid, status: result.status };
}