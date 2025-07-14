'use client';
import { auth } from '@/actions/auth-actions';
import Link from 'next/link';

import type { Errors } from '../../actions/auth-actions';
import { useActionState } from 'react';

interface AuthFormInterface {
  mode: string;
}

const initialState: { errors: Errors } = {
  errors: {},
};

import logo from '@/assets/login.svg';
import Image from 'next/image';

export default function AuthForm({ mode }: AuthFormInterface) {
  const [formState, action] = useActionState(
    auth.bind(null, mode),
    initialState
  );

  return (
    <form id="auth-form" action={action}>
      <div>
        <Image src={logo} alt="A lock icon" />
      </div>
      <p>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
      </p>
      <p>
        <button type="submit">
          {mode === 'login' ? 'Login' : 'Create Account'}
        </button>
      </p>
      {formState.errors && (
        <ul id="form-errors">
          {Object.keys(formState.errors).map((error: string) => (
            <li key={error}>{formState.errors[error]}</li>
          ))}
        </ul>
      )}
      <p>
        {mode === 'login' && (
          <Link href="/?mode=signup">Create an account</Link>
        )}
        {mode === 'signup' && (
          <Link href="/?mode=login">Login with existing account.</Link>
        )}
      </p>
    </form>
  );
}
