const buckets = new Map<string, { count: number; resetAt: number }>();

export function check(key: string, max: number, windowMs: number): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: max - 1, resetAt };
  }
  b.count += 1;
  if (b.count > max) return { ok: false, remaining: 0, resetAt: b.resetAt };
  return { ok: true, remaining: max - b.count, resetAt: b.resetAt };
}

export function _resetForTest() { buckets.clear(); }
