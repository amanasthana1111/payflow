import { v4 as uuidv4 } from 'uuid';

export function generateApiKey(): string {
  return `payflow_ak_${uuidv4().replace(/-/g, '')}`;
}

export function generateApiSecret(): string {
  return `payflow_sk_${uuidv4().replace(/-/g, '')}`;
}
