import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { DecisionForm } from '@/components/admin/DecisionForm';
import { requireAdmin } from '@/lib/supabase/auth';
import { getRestaurant } from '@/lib/data/restaurant';
import { routing } from '@/i18n/routing';
import { addDays, zonedNow } from '@/lib/hours';
import { formatDate } from '@/lib/format';
import { signOut, setMessageStatus } from './actions';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Reservations' };

const BOOKING_VIEWS = {
  pending: 'Pending',
  upcoming: 'Upcoming',
  past: 'Past',
  all: 'All',
} as const;
type View = keyof typeof BOOKING_VIEWS | 'messages';

interface Booking {
  id: string;
  reference: string;
  status: string;
  name: string;
  email: string;
  phone: string;
  party_size: number;
  booking_date: string;
  booking_time: string;
  occasion: string | null;
  seating: string;
  message: string | null;
  locale: string;
  admin_note: string | null;
  guest_notified: string | null;
  created_at: string;
}

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  locale: string;
  status: string;
  created_at: string;
}

const STATUS_TONE: Record<string, string> = {
  pending: 'bg-[var(--brand-ember-light)] text-night',
  confirmed: 'bg-[#9bb592] text-night',
  declined: 'bg-white/10 text-fg-2',
  cancelled: 'bg-white/10 text-muted line-through',
  new: 'bg-[var(--brand-ember-light)] text-night',
  answered: 'bg-[#9bb592] text-night',
  archived: 'bg-white/10 text-muted',
};

const label = (s: string) => s.replace(/_/g, ' ');

export default async function AdminPage({ searchParams }: PageProps<'/admin'>) {
  const { client, user } = await requireAdmin();
  const sp = await searchParams;
  const view: View = sp.view === 'messages' || (typeof sp.view === 'string' && sp.view in BOOKING_VIEWS) ? (sp.view as View) : 'pending';

  const restaurant = await getRestaurant(routing.defaultLocale);
  const today = zonedNow(restaurant.timezone).date;
  const nowIso = new Date().toISOString();
  const cols = 'id, reference, status, name, email, phone, party_size, booking_date, booking_time, occasion, seating, message, locale, admin_note, guest_notified, created_at';

  const [pendingCount, todayRows, weekCount, newMessages] = await Promise.all([
    client.from('booking_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending').gte('starts_at', nowIso),
    client.from('booking_requests').select('party_size').eq('status', 'confirmed').eq('booking_date', today),
    client.from('booking_requests').select('id', { count: 'exact', head: true }).eq('status', 'confirmed').gte('booking_date', today).lte('booking_date', addDays(today, 6)),
    client.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ]);

  let bookings: Booking[] = [];
  let messages: Message[] = [];
  if (view === 'messages') {
    const { data } = await client.from('contact_messages').select('*').neq('status', 'archived').order('created_at', { ascending: false }).limit(200);
    messages = (data ?? []) as Message[];
  } else {
    let q = client.from('booking_requests').select(cols);
    if (view === 'pending') q = q.eq('status', 'pending').gte('starts_at', nowIso).order('starts_at');
    if (view === 'upcoming') q = q.gte('starts_at', nowIso).in('status', ['pending', 'confirmed']).order('starts_at');
    if (view === 'past') q = q.lt('starts_at', nowIso).order('starts_at', { ascending: false });
    if (view === 'all') q = q.order('created_at', { ascending: false });
    const { data } = await q.limit(200);
    bookings = (data ?? []) as Booking[];
  }

  const byDate = new Map<string, Booking[]>();
  for (const b of bookings) byDate.set(b.booking_date, [...(byDate.get(b.booking_date) ?? []), b]);

  const stats = [
    { label: 'Awaiting a decision', value: pendingCount.count ?? 0, href: '/admin?view=pending' },
    { label: 'Covers tonight', value: (todayRows.data ?? []).reduce((n, r) => n + r.party_size, 0), href: '/admin?view=upcoming' },
    { label: 'Confirmed, next 7 days', value: weekCount.count ?? 0, href: '/admin?view=upcoming' },
    { label: 'New messages', value: newMessages.count ?? 0, href: '/admin?view=messages' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <header className="flex items-center justify-between gap-6 border-b border-line py-6">
        <div className="flex items-center gap-4">
          <Logo className="w-28 text-bone" />
          <span className="label hidden text-muted sm:inline">Admin</span>
        </div>
        <div className="flex items-center gap-5 text-small text-muted">
          <span className="hidden md:inline">{user.email}</span>
          <a href={`/${routing.defaultLocale}`} className="link-static">View site</a>
          <form action={signOut}>
            <button className="label min-h-10 rounded-full border border-line px-4 text-[0.6875rem] text-fg hover:border-fg">Sign out</button>
          </form>
        </div>
      </header>

      <section aria-label="Overview" className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-3xl border border-line bg-white/[0.02] p-5 transition-colors hover:border-fg/40">
            <p className="font-display text-[3rem] leading-none tabular-nums">{s.value}</p>
            <p className="label mt-3 text-[0.6875rem] text-muted">{s.label}</p>
          </Link>
        ))}
      </section>

      <nav aria-label="Views" className="no-scrollbar mt-10 flex gap-1 overflow-x-auto">
        {([...Object.keys(BOOKING_VIEWS), 'messages'] as View[]).map((v) => (
          <Link
            key={v}
            href={`/admin?view=${v}`}
            aria-current={view === v ? 'page' : undefined}
            className={cn('label min-h-10 shrink-0 content-center rounded-full px-4 text-[0.6875rem]', view === v ? 'bg-bone text-night' : 'text-muted hover:text-fg')}
          >
            {v === 'messages' ? 'Messages' : BOOKING_VIEWS[v]}
          </Link>
        ))}
      </nav>

      {view !== 'messages' ? (
        bookings.length === 0 ? (
          <p className="mt-16 text-lede text-muted">Nothing here right now.</p>
        ) : (
          [...byDate.entries()].map(([date, list]) => (
            <section key={date} className="mt-12" aria-label={date}>
              <h2 className="font-display text-h3 italic first-letter:uppercase">
                {date === today ? 'Today' : formatDate(date, 'en', { weekday: 'long', day: 'numeric', month: 'long' })}
                <span className="label ml-4 align-middle text-[0.6875rem] not-italic text-muted">
                  {list.reduce((n, b) => n + b.party_size, 0)} covers · {list.length} {list.length === 1 ? 'request' : 'requests'}
                </span>
              </h2>
              <ul className="mt-5 grid gap-4 lg:grid-cols-2">
                {list.map((b) => (
                  <li key={b.id} className="rounded-3xl border border-line bg-white/[0.02] p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-[2.25rem] leading-none tabular-nums">{b.booking_time.slice(0, 5)}</p>
                        <p className="mt-2 text-lede">
                          {b.name} <span className="text-muted">· {b.party_size} {b.party_size === 1 ? 'guest' : 'guests'}</span>
                        </p>
                      </div>
                      <span className={cn('label shrink-0 rounded-full px-3 py-1.5 text-[0.625rem]', STATUS_TONE[b.status])}>{b.status}</span>
                    </div>
                    <dl className="mt-5 grid grid-cols-[7rem_1fr] gap-x-4 gap-y-1.5 text-small">
                      <dt className="text-muted">Phone</dt>
                      <dd><a className="link-static" href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a></dd>
                      <dt className="text-muted">Email</dt>
                      <dd className="min-w-0 truncate"><a className="link-static" href={`mailto:${b.email}?subject=${encodeURIComponent(`${restaurant.name} — ${b.reference}`)}`}>{b.email}</a></dd>
                      {b.occasion ? (<><dt className="text-muted">Occasion</dt><dd className="capitalize">{label(b.occasion)}</dd></>) : null}
                      {b.seating !== 'no_preference' ? (<><dt className="text-muted">Seating</dt><dd className="capitalize">{label(b.seating)}</dd></>) : null}
                      <dt className="text-muted">Reference</dt>
                      <dd className="tabular-nums">{b.reference} · {b.locale.toUpperCase()}</dd>
                      {b.guest_notified ? (<><dt className="text-muted">Guest email</dt><dd>{b.guest_notified}</dd></>) : null}
                    </dl>
                    {b.message ? <p className="mt-4 rounded-2xl bg-white/[0.04] px-4 py-3 text-small text-fg-2">“{b.message}”</p> : null}
                    <DecisionForm id={b.id} status={b.status} note={b.admin_note} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )
      ) : messages.length === 0 ? (
        <p className="mt-16 text-lede text-muted">No open messages.</p>
      ) : (
        <ul className="mt-10 grid gap-4">
          {messages.map((m) => (
            <li key={m.id} className="rounded-3xl border border-line bg-white/[0.02] p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-lede">
                  {m.name} <span className="label ml-2 text-[0.6875rem] text-muted">{label(m.subject)}</span>
                </p>
                <span className={cn('label rounded-full px-3 py-1.5 text-[0.625rem]', STATUS_TONE[m.status])}>{m.status}</span>
              </div>
              <p className="mt-1 text-small text-muted">
                {new Date(m.created_at).toLocaleString('en-GB', { timeZone: restaurant.timezone, dateStyle: 'medium', timeStyle: 'short' })} · {m.locale.toUpperCase()}
              </p>
              <p className="mt-4 whitespace-pre-line text-fg-2">{m.message}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-5">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${restaurant.name}`)}`} className="label min-h-10 content-center rounded-full bg-bone px-5 text-[0.6875rem] text-night">
                  Reply by email
                </a>
                {m.phone ? <a href={`tel:${m.phone.replace(/[^\d+]/g, '')}`} className="label min-h-10 content-center rounded-full border border-line px-5 text-[0.6875rem]">{m.phone}</a> : null}
                {(['answered', 'archived'] as const).filter((s) => s !== m.status).map((s) => (
                  <form key={s} action={setMessageStatus}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="status" value={s} />
                    <button className="label min-h-10 rounded-full px-4 text-[0.6875rem] text-muted hover:text-fg">Mark {s}</button>
                  </form>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
