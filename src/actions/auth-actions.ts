'use server';

import { createAuthSession, destroySession } from '@/lib/auth';
import { hashUserPassword, verifyPassword } from '@/lib/hash';
import { createUser, getUserByEmail } from '@/lib/repositories/user';
import { redirect } from 'next/navigation';

export interface Errors {
  [key: string]: string | undefined;
  message?: string;
  email?: string;
  password?: string;
}

function hasCode(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'string'
  );
}

export async function signUp(prevState: unknown, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  const errors: Errors = {};

  if (!email || !password) {
    errors.message =
      'Please enter all the requested data to sign up your user.';
  }

  if (email && typeof email === 'string' && !email.includes('@')) {
    errors.email = 'Please enter a valid email address.';
  }

  if (password && typeof password === 'string' && password.length < 8) {
    errors.password = 'Please enter a valid password longer than 8 characters.';
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const hashedPassword = hashUserPassword(password);

  try {
    const id = createUser(email, hashedPassword);
    await createAuthSession(id);
    redirect('/training');
  } catch (error) {
    if (hasCode(error) && error.code === 'SQLITE_CONSTRAINT_UNIQUE')
      return {
        errors: {
          email: 'It seems like an account for the chosen email already exists',
        },
      };
    throw error;
  }
}

export async function login(prevState: unknown, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  const existingUser = getUserByEmail(email);

  const errors: Errors = {
    email: 'Could not find user, please check credentials.',
  };

  if (!existingUser) {
    return {
      errors,
    };
  }

  const isValidPassword = verifyPassword(existingUser.password, password);

  if (!isValidPassword) {
    return {
      errors,
    };
  }

  await createAuthSession(existingUser.id);
  redirect('/training');
}

export async function auth(
  mode: string,
  prevState: unknown,
  formData: FormData
) {
  if (mode === 'login') {
    return login(prevState, formData);
  }
  return signUp(prevState, formData);
}

export async function logout() {
  await destroySession();
  redirect('/');
}
