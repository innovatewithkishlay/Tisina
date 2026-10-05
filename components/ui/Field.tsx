import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Form primitives: underline inputs on the page background, labels above,
 * hints and errors wired up with aria-describedby.
 */

export const inputClass =
  'peer block w-full min-h-12 appearance-none rounded-none border-0 border-b border-line bg-transparent px-0 py-3 text-[1.0625rem] text-fg placeholder:text-muted/70 transition-colors duration-[var(--dur-1)] hover:border-fg/50 focus:border-fg focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-error';

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optionalLabel?: string;
  children: (a11y: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => ReactNode;
  className?: string;
}

export function Field({ id, label, hint, error, optionalLabel, children, className }: FieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('group', className)}>
      <label htmlFor={id} className="label flex items-baseline justify-between gap-4 text-muted group-focus-within:text-fg">
        <span>{label}</span>
        {optionalLabel ? <span className="normal-case tracking-normal">{optionalLabel}</span> : null}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-2 text-small text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-2 text-small text-error">
          <span aria-hidden="true">—</span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select {...props} className={cn(inputClass, 'cursor-pointer pr-8', className)}>
        {children}
      </select>
      <svg aria-hidden="true" viewBox="0 0 12 8" className="pointer-events-none absolute right-1 top-1/2 h-2 w-3 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M1 1l5 5 5-5" />
      </svg>
    </div>
  );
}

export function Spinner() {
  return (
    <span aria-hidden="true" className="inline-block size-4 animate-spin rounded-full border border-current border-r-transparent motion-reduce:animate-none" />
  );
}

/** Off-screen field bots fill in and humans never see. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
