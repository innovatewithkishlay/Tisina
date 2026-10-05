'use client';

import { useActionState } from 'react';
import { decideBooking, type DecisionState } from '@/app/admin/actions';
import { cn } from '@/lib/utils';

const ACTIONS: Record<string, { value: string; label: string; tone: string }[]> = {
  pending: [
    { value: 'confirmed', label: 'Confirm', tone: 'bg-bone text-night' },
    { value: 'declined', label: 'Decline', tone: 'border border-line text-fg' },
  ],
  confirmed: [
    { value: 'cancelled', label: 'Cancel booking', tone: 'border border-line text-fg' },
    { value: 'pending', label: 'Back to pending', tone: 'text-muted' },
  ],
  declined: [
    { value: 'confirmed', label: 'Confirm instead', tone: 'border border-line text-fg' },
    { value: 'pending', label: 'Back to pending', tone: 'text-muted' },
  ],
  cancelled: [{ value: 'pending', label: 'Reopen', tone: 'text-muted' }],
};

const EMAIL_NOTE = { sent: 'Guest emailed.', failed: 'Saved, but the email to the guest failed — check SMTP settings.', skipped: 'Saved. SMTP is not configured, so no email was sent.' };

export function DecisionForm({ id, status, note }: { id: string; status: string; note?: string | null }) {
  const [state, action, pending] = useActionState<DecisionState, FormData>(decideBooking, {});
  return (
    <form action={action} className="mt-5 border-t border-line pt-5">
      <input type="hidden" name="id" value={id} />
      <label className="block">
        <span className="label text-[0.6875rem] text-muted">Note to the guest (optional, included in the email)</span>
        <textarea
          name="note"
          rows={2}
          maxLength={1000}
          defaultValue={note ?? ''}
          className="mt-2 block w-full resize-y rounded-xl border border-line bg-white/[0.03] px-3 py-2 text-small text-fg outline-none focus:border-accent"
        />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(ACTIONS[status] ?? []).map((a) => (
          <button
            key={a.value}
            type="submit"
            name="decision"
            value={a.value}
            disabled={pending}
            className={cn('label min-h-10 rounded-full px-5 text-[0.6875rem] transition-opacity hover:opacity-85 disabled:opacity-50', a.tone)}
          >
            {a.label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-small text-muted">
          <input type="checkbox" name="notify" defaultChecked className="size-4 accent-[var(--brand-ember-light)]" />
          Email the guest
        </label>
      </div>
      <p className="mt-3 min-h-5 text-small text-muted" aria-live="polite">
        {pending ? 'Saving…' : state.error ? <span className="text-error">{state.error}</span> : state.ok ? (state.emailed ? EMAIL_NOTE[state.emailed] : 'Saved.') : ''}
      </p>
    </form>
  );
}
