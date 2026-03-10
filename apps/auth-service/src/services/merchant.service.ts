import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateApiKey, generateApiSecret } from '../utils/apiKey';

const prisma = new PrismaClient();

export async function registerMerchant(name: string, email: string, password: string) {
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required');
  }

  const existing = await prisma.merchant.findUnique({ where: { email } });
  if (existing) throw new Error('Email already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  const apiKey = generateApiKey();
  const apiSecret = generateApiSecret();

  const merchant = await prisma.merchant.create({
    data: { name, email, passwordHash, apiKey, apiSecret }
  });

  return { merchant_id: merchant.id };
}

export async function loginMerchant(emailOrKey: string, passwordOrSecret: string) {
  if (!emailOrKey || !passwordOrSecret) {
    throw new Error('Credentials are required');
  }

  let merchant;

  // SDK login — api_key + api_secret
  if (emailOrKey.startsWith('payflow_ak_')) {
    merchant = await prisma.merchant.findUnique({
      where: { apiKey: emailOrKey }
    });
    if (!merchant) throw new Error('Invalid API key');
    if (merchant.apiSecret !== passwordOrSecret) throw new Error('Invalid API secret');

  } else {
    // Dashboard login — email + password
    merchant = await prisma.merchant.findUnique({
      where: { email: emailOrKey }
    });
    if (!merchant) throw new Error('Merchant not found');
    const valid = await bcrypt.compare(passwordOrSecret, merchant.passwordHash);
    if (!valid) throw new Error('Invalid password');
  }

  return merchant;
}

export async function regenerateApiKeys(merchantId: string) {
  if (!merchantId) throw new Error('Merchant ID required');

  const apiKey = generateApiKey();
  const apiSecret = generateApiSecret();

  const merchant = await prisma.merchant.update({
    where: { id: merchantId },
    data: { apiKey, apiSecret }
  });

  return {
    api_key: merchant.apiKey,
    api_secret: merchant.apiSecret
  };
}
