const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

interface AttemptEntry {
  count: number;
  resetAt: number;
}

const attempts = new Map<string, AttemptEntry>();

export function checkLoginRateLimit(key: string): {
  allowed: boolean;
  retryAfterMs?: number;
} {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  return { allowed: true };
}

export function recordFailedLoginAttempt(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  entry.count += 1;
}

export function clearLoginRateLimit(key: string) {
  attempts.delete(key);
}
