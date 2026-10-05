import 'server-only';
import { headers } from 'next/headers';

/**
 * Best-effort, in-memory throttle per client IP. It only protects a single
 * server instance — the database functions enforce the real per-email limits.
 */
const hits = new Map<string, number[]>();

export async function throttle(key: string, limit = 5, windowMs = 10 * 60_000): Promise<boolean> {
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? 'local').split(',')[0].trim();
  const id = `${key}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(id) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(id, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length <= limit;
}
