'use server';

import { createAuthSession, destroySession } from '@/lib/auth/auth';
import {
  checkLoginRateLimit,
  clearLoginRateLimit,
  recordFailedLoginAttempt,
} from '@/lib/auth/rate-limit';
import { verifyPassword } from '@/lib/utils/hash';
import { getUserByEmail } from '@/lib/repositories/user';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export interface Errors {
  [key: string]: string | undefined;
  message?: string;
  email?: string;
  password?: string;
}

async function getClientKey() {
  const headerStore = await headers();
  const forwarded = headerStore.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || headerStore.get('x-real-ip') || 'unknown';
  return ip;
}

export async function login(prevState: unknown, formData: FormData) {
  const clientKey = await getClientKey();
  const rateLimit = checkLoginRateLimit(clientKey);

  if (!rateLimit.allowed) {
    const minutes = Math.ceil((rateLimit.retryAfterMs ?? 0) / 60000);
    return {
      errors: {
        message: `Demasiados intentos. Probá de nuevo en ${minutes} minuto(s).`,
      },
    };
  }

  const email = formData.get('email');
  const password = formData.get('password');

  if (process.env.NODE_ENV !== 'production' && process.env.AUTH_DEBUG === '1') {
    console.log('[AUTH_DEBUG] intento de login', { email });
  }

  const errors: Errors = {
    email: 'Could not find user, please check credentials.',
  };

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    recordFailedLoginAttempt(clientKey);
    return { errors };
  }

  const existingUser = getUserByEmail(email);

  if (!existingUser) {
    recordFailedLoginAttempt(clientKey);
    return { errors };
  }

  const isValidPassword = verifyPassword(existingUser.password, password);

  if (!isValidPassword) {
    recordFailedLoginAttempt(clientKey);
    return { errors };
  }

  clearLoginRateLimit(clientKey);
  await createAuthSession(existingUser.id);
  redirect('/training');
}

export async function logout() {
  await destroySession();
  redirect('/');
}
