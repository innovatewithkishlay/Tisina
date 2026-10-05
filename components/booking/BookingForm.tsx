'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/config/locales';
import { submitBooking } from '@/lib/booking/actions';
import { OCCASIONS, SEATINGS } from '@/lib/booking/constants';
import type { BookingState } from '@/lib/booking/schema';
import { formatDate, formatTime } from '@/lib/format';
import { addDays, bookingSlots, scheduleFor, zonedNow } from '@/lib/hours';
import type { BookingSettings, Hours } from '@/types/restaurant';
import { Field, Honeypot, Select, Spinner, inputClass } from '@/components/ui/Field';
import { Arrow } from '@/components/ui/Button';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';

interface BookingFormProps {
  hours: Hours;
  booking: BookingSettings;
  timeZone: string;
  restaurantName: string;
  phone: string;
  phoneHref: string;
  /** "YYYY-MM-DD" today in the restaurant timezone, as rendered on the server. */
  today: string;
}

const STRIP_DAYS = 21;

export function BookingForm({ hours, booking, timeZone, restaurantName, phone, phoneHref, today: serverToday }: BookingFormProps) {
  const t = useTranslations('Booking');
  const tHours = useTranslations('Hours');
  const locale = useLocale() as Locale;
  const [state, action, pending] = useActionState<BookingState, FormData>(submitBooking, { status: 'idle' });

  const [today, setToday] = useState(serverToday);
  const [date, setDate] = useState(state.values?.date ?? '');
  const [time, setTime] = useState(state.values?.time ?? '');
  const [guests, setGuests] = useState(state.values?.guests ?? '2');
  const [now, setNow] = useState<Date | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  // Client clock (restaurant timezone) — refines "today" and lead-time filtering after hydration.
  useEffect(() => {
    const tick = () => {
      setNow(new Date());
      setToday(zonedNow(timeZone).date);
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  // After a failed submit, restore the controlled fields from the server's echo.
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state.values?.date) setDate(state.values.date);
    if (state.values?.time) setTime(state.values.time);
    if (state.values?.guests) setGuests(state.values.guests);
  }

  useEffect(() => {
    if (state.status === 'error') summaryRef.current?.focus();
    if (state.status === 'success') successRef.current?.focus();
  }, [state]);

  const days = useMemo(
    () =>
      Array.from({ length: STRIP_DAYS }, (_, i) => {
        const d = addDays(today, i);
        return { date: d, closed: scheduleFor(hours, d).closed };
      }),
    [today, hours],
  );

  const slotGroups = useMemo(
    () => (date && now ? bookingSlots(hours, booking, date, timeZone, now) : []),
    [date, now, hours, booking, timeZone],
  );

  // A time chosen for another date is not carried over.
  const selectedTime = slotGroups.some((g) => g.times.includes(time)) ? time : '';

  const err = (field: keyof NonNullable<BookingState['fieldErrors']>) => {
    const code = state.fieldErrors?.[field];
    if (!code) return undefined;
    return t(`errors.${code}` as 'errors.generic', { max: booking.maxParty, days: booking.windowDays, phone });
  };

  if (state.status === 'success' && state.result) {
    const r = state.result;
    return (
      <div role="status">
        <TicketStub
          title={t('stubTitle')}
          date={formatDate(r.date, locale, { weekday: 'long', day: 'numeric', month: 'long' })}
          time={formatTime(r.time, locale)}
          guests={r.guests}
          labels={{ date: t('date'), time: t('time'), guests: t('guests') }}
          reference={`${t('successReference')} · ${r.reference}`}
          stamp={t('stubStamp')}
        />
        <h2 ref={successRef} tabIndex={-1} className="font-display text-h2 mt-14 max-w-[16ch] outline-none">
          {t('successTitle')}
        </h2>
        <p className="mt-8 max-w-[48ch] text-lede text-fg-2">
          {t('successBody', {
            guests: t('guestsCount', { count: r.guests }),
            date: formatDate(r.date, locale),
            time: formatTime(r.time, locale),
          })}
        </p>
        <p className="mt-6 max-w-[48ch] text-muted">{t('successNote')}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="label link-draw mt-10 inline-flex min-h-11 items-center"
        >
          {t('successAgain')}
        </button>
      </div>
    );
  }

  const v = state.values ?? {};
  const hasErrors = state.status === 'error';

  return (
    <form action={action} noValidate className="relative" aria-describedby={hasErrors ? 'booking-summary' : undefined}>
      <input type="hidden" name="locale" value={locale} />
      <Honeypot />

      <TicketStub
        title={t('stubTitle')}
        date={date ? formatDate(date, locale, { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
        time={selectedTime ? formatTime(selectedTime, locale) : ''}
        guests={Number(guests)}
        labels={{ date: t('date'), time: t('time'), guests: t('guests') }}
        className="mb-14"
      />

      {hasErrors ? (
        <div
          id="booking-summary"
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-10 rounded-2xl border border-error/40 bg-error/5 px-5 py-4 text-error outline-none"
        >
          {state.formError
            ? t(`errors.${state.formError}` as 'errors.generic', { max: booking.maxParty, days: booking.windowDays, phone })
            : t('errors.summary')}
        </div>
      ) : null}

      {/* ——— When ——— */}
      <fieldset className="min-w-0">
        <legend className="flex w-full items-baseline gap-4">
          <span className="font-display text-h3 italic">{t('stepWhen')}</span>
        </legend>

        <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_auto]">
          <Field id="booking-date" label={t('date')} error={err('date')}>
            {(a11y) => (
              <input
                {...a11y}
                type="date"
                name="date"
                required
                min={today}
                max={addDays(today, booking.windowDays)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            )}
          </Field>
          <Field id="booking-guests" label={t('guests')} error={err('guests')} className="sm:w-48">
            {(a11y) => (
              <Select {...a11y} name="guests" value={guests} onChange={(e) => setGuests(e.target.value)} required>
                {Array.from({ length: booking.maxParty - booking.minParty + 1 }, (_, i) => booking.minParty + i).map((n) => (
                  <option key={n} value={n}>
                    {t('guestsCount', { count: n })}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        {/* Quick date strip — the next three weeks */}
        <div className="-mx-[var(--gutter)] mt-6 sm:mx-0" role="group" aria-label={t('date')}>
          <ul className="no-scrollbar flex gap-2 overflow-x-auto px-[var(--gutter)] pb-2 sm:px-0">
            {days.map((d) => {
              const selected = d.date === date;
              return (
                <li key={d.date} className="shrink-0">
                  <button
                    type="button"
                    disabled={d.closed}
                    aria-pressed={selected}
                    onClick={() => setDate(d.date)}
                    className={cn(
                      'flex w-16 flex-col items-center gap-1 rounded-2xl border py-3 transition-[color,background-color,border-color,transform] duration-[var(--dur-1)] active:scale-95',
                      selected ? 'border-fg bg-fg text-bg' : 'border-line hover:border-fg',
                      d.closed && 'cursor-not-allowed border-dashed opacity-45 hover:border-line',
                    )}
                  >
                    <span className="label text-[0.625rem]">{formatDate(d.date, locale, { weekday: 'short' })}</span>
                    <span className="font-display text-[1.625rem] leading-none">{formatDate(d.date, locale, { day: 'numeric' })}</span>
                    <span className="text-[0.6875rem] text-current opacity-70">{formatDate(d.date, locale, { month: 'short' })}</span>
                    {d.closed ? <span className="sr-only">{t('closedDay')}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-8">
          <p id="booking-time-label" className="label text-muted">
            {t('time')}
          </p>
          {!date ? (
            <p className="mt-4 text-muted">{t('selectDateFirst')}</p>
          ) : slotGroups.length === 0 ? (
            <p className="mt-4 text-muted">{now ? t('noTimes') : '…'}</p>
          ) : (
            <div role="radiogroup" aria-labelledby="booking-time-label" aria-describedby={err('time') ? 'booking-time-error' : undefined} className="mt-4 space-y-5">
              {slotGroups.map((group) => (
                <div key={group.service} className="flex flex-wrap items-center gap-2">
                  <span className="label w-full text-[0.6875rem] text-muted sm:w-24">{tHours(`services.${group.service}`)}</span>
                  {group.times.map((slot) => (
                    <label key={slot} className="relative">
                      <input
                        type="radio"
                        name="time"
                        value={slot}
                        checked={selectedTime === slot}
                        onChange={() => setTime(slot)}
                        className="peer sr-only"
                      />
                      <span className="inline-flex min-h-11 min-w-[4.75rem] cursor-pointer items-center justify-center rounded-[var(--radius-pill)] border border-line px-4 tabular-nums transition-colors duration-[var(--dur-1)] hover:border-fg peer-checked:border-fg peer-checked:bg-fg peer-checked:text-bg peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)]">
                        {formatTime(slot, locale)}
                      </span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}
          {err('time') ? (
            <p id="booking-time-error" className="mt-3 text-small text-error">
              — {err('time')}
            </p>
          ) : null}
        </div>
      </fieldset>

      {/* ——— Who ——— */}
      <fieldset className="mt-16 min-w-0">
        <legend className="flex w-full items-baseline gap-4">
          <span className="font-display text-h3 italic">{t('stepWho')}</span>
        </legend>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <Field id="booking-name" label={t('name')} error={err('name')} className="sm:col-span-2">
            {(a11y) => <input {...a11y} name="name" autoComplete="name" required defaultValue={v.name} className={inputClass} />}
          </Field>
          <Field id="booking-email" label={t('email')} error={err('email')}>
            {(a11y) => (
              <input {...a11y} name="email" type="email" inputMode="email" autoComplete="email" required defaultValue={v.email} className={inputClass} />
            )}
          </Field>
          <Field id="booking-phone" label={t('phone')} hint={t('phoneHint')} error={err('phone')}>
            {(a11y) => (
              <input {...a11y} name="phone" type="tel" inputMode="tel" autoComplete="tel" required defaultValue={v.phone} className={inputClass} />
            )}
          </Field>
          <Field id="booking-occasion" label={t('occasion')} optionalLabel={t('optional')}>
            {(a11y) => (
              <Select {...a11y} name="occasion" defaultValue={v.occasion ?? ''}>
                <option value="">{t('occasionNone')}</option>
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {t(`occasions.${o}`)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field id="booking-seating" label={t('seating')} optionalLabel={t('optional')}>
            {(a11y) => (
              <Select {...a11y} name="seating" defaultValue={v.seating ?? 'no_preference'}>
                {SEATINGS.map((s) => (
                  <option key={s} value={s}>
                    {t(`seatings.${s}`)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field id="booking-message" label={t('message')} hint={t('messageHint')} optionalLabel={t('optional')} error={err('message')} className="sm:col-span-2">
            {(a11y) => <textarea {...a11y} name="message" rows={3} maxLength={1000} defaultValue={v.message} className={cn(inputClass, 'resize-y')} />}
          </Field>
        </div>

        <div className="mt-10">
          <label className="flex cursor-pointer items-start gap-4 text-small text-fg-2">
            <input
              type="checkbox"
              name="consent"
              required
              aria-invalid={err('consent') ? true : undefined}
              aria-describedby={err('consent') ? 'booking-consent-error' : undefined}
              className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--brand-ink)]"
            />
            <span>
              {t.rich('consent', {
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
            <p id="booking-consent-error" className="mt-2 text-small text-error">
              — {err('consent')}
            </p>
          ) : null}
        </div>
      </fieldset>

      <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
        <button
          type="submit"
          disabled={pending}
          className="btn-fill group label inline-flex min-h-14 items-center gap-4 rounded-[var(--radius-pill)] bg-fg px-9 text-bg disabled:opacity-70"
        >
          {pending ? <Spinner /> : null}
          {pending ? t('submitting') : t('submit')}
          {!pending ? <Arrow /> : null}
        </button>
        <p className="text-small text-muted">
          {t('sideCall')}{' '}
          <a href={phoneHref} className="link-static text-fg">
            {phone}
          </a>
        </p>
      </div>
      <p className="sr-only" aria-live="polite">
        {pending ? t('submitting') : ''}
      </p>
    </form>
  );
}

/**
 * The reservation as a ticket: fills in live while the guest chooses, and gets
 * its reference and a stamp once the request is sent.
 */
function TicketStub({
  title,
  date,
  time,
  guests,
  labels,
  reference,
  stamp,
  className,
}: {
  title: string;
  date: string;
  time: string;
  guests: number;
  labels: { date: string; time: string; guests: string };
  reference?: string;
  stamp?: string;
  className?: string;
}) {
  return (
    <div className={cn('stub shadow-[0_30px_60px_-30px_rgb(15_13_11/0.45)]', className)} aria-hidden={reference ? undefined : true}>
      <div className="stub-perf" />
      <div className="grid grid-cols-[72%_28%]">
        <div className="min-w-0 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <Logo className="w-24 text-bone" />
            <span className="label text-[0.6875rem] text-bone/60">{reference ?? title}</span>
          </div>
          <p className="label mt-8 text-[0.6875rem] text-bone/60">{labels.date}</p>
          <p className="font-display mt-1 min-h-[1.15em] text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.1] first-letter:uppercase">
            {date || <span className="text-bone/55">— — —</span>}
          </p>
          <p className="label mt-5 text-[0.6875rem] text-bone/60">{labels.time}</p>
          <p className="font-display mt-1 min-h-[1.15em] text-[clamp(1.5rem,2.6vw,2.25rem)] tabular-nums leading-[1.1]">
            {time || <span className="text-bone/55">— : —</span>}
          </p>
        </div>
        <div className="relative flex flex-col items-center justify-center p-4 text-center">
          <span key={guests} className="font-display rise text-[clamp(3.5rem,7vw,5.5rem)] italic leading-none">
            {guests}
          </span>
          <span className="label mt-2 text-[0.6875rem] text-bone/60">{labels.guests}</span>
          {stamp ? <span className="stamp label absolute bottom-5 text-[0.625rem] text-[var(--brand-ember-light)]">{stamp}</span> : null}
        </div>
      </div>
    </div>
  );
}
