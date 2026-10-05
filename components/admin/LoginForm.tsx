'use client';

import { useActionState } from 'react';
import { signIn, type LoginState } from '@/app/admin/actions';

const MESSAGES: Record<NonNullable<LoginState['error']>, string> = {
  invalid: 'That email and password do not match an admin account.',
  config: 'Supabase is not configured on this deployment (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY).',
  rate_limited: 'Too many attempts. Please wait a few minutes.',
};

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});
  const error = state.error ? MESSAGES[state.error] : notice;
  return (
    <form action={action} className="mt-10 space-y-6">
      {error ? (
        <p role="alert" className="rounded-2xl border border-error/40 bg-error/10 px-4 py-3 text-small text-error">
          {error}
        </p>
      ) : null}
      <label className="block">
        <span className="label text-muted">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="mt-2 block min-h-12 w-full rounded-xl border border-line bg-white/[0.03] px-4 text-fg outline-none transition-colors focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="label text-muted">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 block min-h-12 w-full rounded-xl border border-line bg-white/[0.03] px-4 text-fg outline-none transition-colors focus:border-accent"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="label inline-flex min-h-12 w-full items-center justify-center rounded-full bg-bone text-night transition-opacity disabled:opacity-60"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
