import { config } from "../config/env.js";

const store = new Map(); // key -> { value, expiresAt }

/**
 * Runs `fn` and caches its resolved value under `key` for `ttlMs`.
 * On cache hit, `fn` is never invoked. Failures are not cached.
 */
export async function withCache(key, fn, ttlMs = config.cache.ttlMs) {
  const normalizedKey = key.toLowerCase().trim();
  const cached = store.get(normalizedKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const value = await fn();
  store.set(normalizedKey, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export function clearCache() {
  store.clear();
}
