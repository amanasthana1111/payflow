import Redis from "ioredis";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL || "redis://localhost:6379";
    redis = new Redis(url, {
      tls: url.startsWith("rediss://") ? {} : undefined,
    });
  }
  return redis;
}

// Store idempotency key with result for 24 hours
export async function setIdempotencyKey(
  key: string,
  result: any,
): Promise<void> {
  try {
    const client = getRedis();
    await client.set(`idempotency:${key}`, JSON.stringify(result), "EX", 86400);
  } catch (err) {
    // Redis unavailable - skip idempotency
  }
}

// Check if request was already processed
export async function getIdempotencyKey(key: string): Promise<any | null> {
  try {
    const client = getRedis();
    const val = await client.get(`idempotency:${key}`);
    return val ? JSON.parse(val) : null;
  } catch (err) {
    return null;
  }
}
