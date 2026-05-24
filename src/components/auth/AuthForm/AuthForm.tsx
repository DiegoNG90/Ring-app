'use client';

import { login } from '@/actions/auth-actions';
import type { Errors } from '@/actions/auth-actions';
import logo from '@/assets/login.svg';
import Image from 'next/image';
import { useActionState } from 'react';

const initialState: { errors: Errors } = {
  errors: {},
};

export default function AuthForm() {
  const [formState, action] = useActionState(login, initialState);

  return (
    <form id="auth-form" action={action}>
      <div>
        <Image src={logo} alt="A lock icon" />
      </div>
      <p>
        <label htmlFor="email">Usuario</label>
        <input type="text" name="email" id="email" autoComplete="username" />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          autoComplete="current-password"
        />
      </p>
      <p>
        <button type="submit">Login</button>
      </p>
      {formState.errors && (
        <ul id="form-errors">
          {Object.keys(formState.errors).map((error: string) => (
            <li key={error}>{formState.errors[error]}</li>
          ))}
        </ul>
      )}
    </form>
  );
}
