interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const globalForRateLimit = globalThis as unknown as {
  rateLimitStore?: Map<string, RateLimitBucket>;
};

function getStore(): Map<string, RateLimitBucket> {
  if (!globalForRateLimit.rateLimitStore) {
    globalForRateLimit.rateLimitStore = new Map<string, RateLimitBucket>();
  }
  return globalForRateLimit.rateLimitStore;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

function pruneExpiredEntries(store: Map<string, RateLimitBucket>, now: number) {
  if (store.size < 500) return;
  for (const [k, bucket] of store.entries()) {
    if (now >= bucket.resetAt) {
      store.delete(k);
    }
  }
}

/**
 * Sliding window / fixed-window rate limiter keyed by route + client identifier.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const store = getStore();
  const now = Date.now();
  pruneExpiredEntries(store, now);
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  existing.count += 1;
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((existing.resetAt - now) / 1000)
  );

  if (existing.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - existing.count),
    retryAfterSeconds,
  };
}

