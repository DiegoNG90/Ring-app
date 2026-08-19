const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

interface AttemptEntry {
  count: number;
  resetAt: number;
}

const attemptsByBucket = new Map<string, Map<string, AttemptEntry>>();

function getBucketMap(bucket: string): Map<string, AttemptEntry> {
  let bucketMap = attemptsByBucket.get(bucket);
  if (!bucketMap) {
    bucketMap = new Map();
    attemptsByBucket.set(bucket, bucketMap);
  }
  return bucketMap;
}

export function checkRateLimit(
  bucket: string,
  key: string,
  maxAttempts = MAX_ATTEMPTS,
): {
  allowed: boolean;
  retryAfterMs?: number;
} {
  const now = Date.now();
  const bucketMap = getBucketMap(bucket);
  const entry = bucketMap.get(key);

  if (!entry || now > entry.resetAt) {
    return { allowed: true };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  return { allowed: true };
}

export function recordRateLimitAttempt(
  bucket: string,
  key: string,
  windowMs = WINDOW_MS,
) {
  const now = Date.now();
  const bucketMap = getBucketMap(bucket);
  const entry = bucketMap.get(key);

  if (!entry || now > entry.resetAt) {
    bucketMap.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  entry.count += 1;
}

export function clearRateLimit(bucket: string, key: string) {
  getBucketMap(bucket).delete(key);
}

export function checkLoginRateLimit(key: string): {
  allowed: boolean;
  retryAfterMs?: number;
} {
  return checkRateLimit('login', key);
}

export function recordFailedLoginAttempt(key: string) {
  recordRateLimitAttempt('login', key);
}

export function clearLoginRateLimit(key: string) {
  clearRateLimit('login', key);
}

export const ROUTINE_CREATE_RATE_LIMIT = {
  bucket: 'routine:create',
  maxAttempts: 10,
  windowMs: WINDOW_MS,
} as const;

export function checkRoutineCreateRateLimit(userId: string | number) {
  return checkRateLimit(
    ROUTINE_CREATE_RATE_LIMIT.bucket,
    String(userId),
    ROUTINE_CREATE_RATE_LIMIT.maxAttempts,
  );
}

export function recordRoutineCreateAttempt(userId: string | number) {
  recordRateLimitAttempt(
    ROUTINE_CREATE_RATE_LIMIT.bucket,
    String(userId),
    ROUTINE_CREATE_RATE_LIMIT.windowMs,
  );
}
