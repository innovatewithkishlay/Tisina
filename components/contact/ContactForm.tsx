'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { submitContact } from '@/lib/booking/actions';
import { CONTACT_SUBJECTS } from '@/lib/booking/constants';
import type { ContactState } from '@/lib/booking/schema';
import { Field, Honeypot, Select, Spinner, inputClass } from '@/components/ui/Field';
import { Arrow } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function ContactForm({ restaurantName, restaurantEmail }: { restaurantName: string; restaurantEmail: string }) {
  const t = useTranslations('Contact');
  const tBooking = useTranslations('Booking');
  const locale = useLocale();
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, { status: 'idle' });
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.status === 'error') summaryRef.current?.focus();
    if (state.status === 'success') successRef.current?.focus();
  }, [state]);

  const err = (field: keyof NonNullable<ContactState['fieldErrors']>) => {
    const code = state.fieldErrors?.[field];
    return code ? t(`errors.${code}` as 'errors.generic', { email: restaurantEmail }) : undefined;
  };

  if (state.status === 'success') {
    return (
      <div className="border-t hairline pt-10" role="status">
        <h2 ref={successRef} tabIndex={-1} className="font-display text-h2 max-w-[16ch] outline-none">
          {t('successTitle')}
        </h2>
        <p className="mt-8 max-w-[44ch] text-lede text-fg-2">{t('successBody', { email: state.email ?? '' })}</p>
        <button type="button" onClick={() => window.location.reload()} className="label link-draw mt-10 inline-flex min-h-11 items-center">
          {t('successAgain')}
        </button>
      </div>
    );
  }

  const v = state.values ?? {};

  return (
    <form action={action} noValidate className="relative">
      <input type="hidden" name="locale" value={locale} />
      <Honeypot />

      {state.status === 'error' ? (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="mb-10 border-l-2 border-error bg-error/5 px-5 py-4 text-error outline-none">
          {state.formError ? t(`errors.${state.formError}` as 'errors.generic', { email: restaurantEmail }) : t('errors.summary')}
        </div>
      ) : null}

      <div className="grid gap-8 sm:grid-cols-2">
        <Field id="contact-subject" label={t('subject')} className="sm:col-span-2">
          {(a11y) => (
            <Select {...a11y} name="subject" defaultValue={v.subject ?? 'general'}>
              {CONTACT_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {t(`subjects.${s}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="contact-name" label={t('name')} error={err('name')} className="sm:col-span-2">
          {(a11y) => <input {...a11y} name="name" autoComplete="name" required defaultValue={v.name} className={inputClass} />}
        </Field>
        <Field id="contact-email" label={t('email')} error={err('email')}>
          {(a11y) => <input {...a11y} name="email" type="email" inputMode="email" autoComplete="email" required defaultValue={v.email} className={inputClass} />}
        </Field>
        <Field id="contact-phone" label={t('phone')} optionalLabel={tBooking('optional')} error={err('phone')}>
          {(a11y) => <input {...a11y} name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={v.phone} className={inputClass} />}
        </Field>
        <Field id="contact-message" label={t('message')} error={err('message')} className="sm:col-span-2">
          {(a11y) => (
            <textarea {...a11y} name="message" rows={6} required minLength={10} maxLength={4000} defaultValue={v.message} className={cn(inputClass, 'resize-y')} />
          )}
        </Field>
      </div>

      <label className="mt-10 flex cursor-pointer items-start gap-4 text-small text-fg-2">
        <input
          type="checkbox"
          name="consent"
          required
          aria-invalid={err('consent') ? true : undefined}
          aria-describedby={err('consent') ? 'contact-consent-error' : undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--brand-ink)]"
        />
        <span>
          {tBooking.rich('consent', {
            name: restaurantName,
            link: (chunks) => (
              <Link href="/privacy" className="link-static" target="_blank">
                {chunks}
              </Link>
            ),
          })}
        </span>
      </label>
      {err('consent') ? (
        <p id="contact-consent-error" className="mt-2 text-small text-error">
          — {err('consent')}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="group label mt-12 inline-flex min-h-14 items-center gap-4 rounded-[var(--radius-pill)] bg-fg px-9 text-bg transition-colors duration-[var(--dur-2)] hover:bg-accent hover:text-on-accent disabled:opacity-70"
      >
        {pending ? <Spinner /> : null}
        {pending ? t('submitting') : t('submit')}
        {!pending ? <Arrow /> : null}
      </button>
      <p className="sr-only" aria-live="polite">
        {pending ? t('submitting') : ''}
      </p>
    </form>
  );
}
