import type {
  BookingSettings,
  Hours,
  IsoWeekday,
  ServicePeriod,
  SpecialHours,
} from '@/types/restaurant';

/**
 * Opening-hours logic, always evaluated in the RESTAURANT's timezone, never
 * the visitor's. Pure functions — safe in server and client components.
 */

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const fromMinutes = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

/** ISO weekday for a "YYYY-MM-DD" calendar date. */
export function isoWeekday(date: string): IsoWeekday {
  const [y, m, d] = date.split('-').map(Number);
  const js = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return (js === 0 ? 7 : js) as IsoWeekday;
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Wall-clock date and time right now in `timeZone`. */
export function zonedNow(timeZone: string, now: Date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  return { date, minutes: Number(parts.hour) * 60 + Number(parts.minute), weekday: isoWeekday(date) };
}

export interface DaySchedule {
  date: string;
  closed: boolean;
  periods: ServicePeriod[];
  special?: SpecialHours;
}

/** Effective services for a date: special hours override the weekly schedule. */
export function scheduleFor(hours: Hours, date: string): DaySchedule {
  const specials = hours.special.filter((s) => s.date === date);
  if (specials.length > 0) {
    const closed = specials.some((s) => s.closed);
    return {
      date,
      closed,
      special: specials[0],
      periods: closed
        ? []
        : specials
            .filter((s) => s.opens && s.closes)
            .map((s) => ({ service: s.service ?? 'dinner', opens: s.opens!, closes: s.closes! })),
    };
  }
  const day = isoWeekday(date);
  const periods = hours.weekly
    .filter((h) => h.day === day)
    .map(({ service, opens, closes }) => ({ service, opens, closes }))
    .sort((a, b) => toMinutes(a.opens) - toMinutes(b.opens));
  return { date, closed: periods.length === 0, periods };
}

/** Weekly schedule grouped by ISO weekday (1–7), including closed days. */
export function weeklyTable(hours: Hours) {
  return ([1, 2, 3, 4, 5, 6, 7] as IsoWeekday[]).map((day) => ({
    day,
    periods: hours.weekly
      .filter((h) => h.day === day)
      .sort((a, b) => toMinutes(a.opens) - toMinutes(b.opens)),
  }));
}

export type OpenStatus =
  | { state: 'open'; closes: string }
  | { state: 'later_today'; opens: string }
  | { state: 'closed'; next?: { date: string; opens: string } };

export function openStatus(hours: Hours, timeZone: string, now: Date = new Date()): OpenStatus {
  const { date, minutes } = zonedNow(timeZone, now);
  const today = scheduleFor(hours, date);
  for (const p of today.periods) {
    if (minutes >= toMinutes(p.opens) && minutes < toMinutes(p.closes)) return { state: 'open', closes: p.closes };
  }
  const later = today.periods.find((p) => toMinutes(p.opens) > minutes);
  if (later) return { state: 'later_today', opens: later.opens };
  for (let i = 1; i <= 14; i++) {
    const d = addDays(date, i);
    const s = scheduleFor(hours, d);
    if (s.periods.length) return { state: 'closed', next: { date: d, opens: s.periods[0].opens } };
  }
  return { state: 'closed' };
}

/**
 * Bookable start times for a date, in restaurant-local "HH:MM".
 * Mirrors the validation inside the `create_booking_request` database
 * function, which remains the source of truth.
 */
export function bookingSlots(
  hours: Hours,
  booking: BookingSettings,
  date: string,
  timeZone: string,
  now: Date = new Date(),
): { service: ServicePeriod['service']; times: string[] }[] {
  const local = zonedNow(timeZone, now);
  const schedule = scheduleFor(hours, date);
  if (schedule.closed || date < local.date || date > addDays(local.date, booking.windowDays)) return [];

  const dayOffset = Math.round(
    (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${local.date}T00:00:00Z`)) / 86_400_000,
  );
  const earliest = local.minutes + booking.leadMinutes - dayOffset * 1440;

  return schedule.periods
    .map((p) => {
      const times: string[] = [];
      const last = toMinutes(p.closes) - booking.lastSeatingMinutes;
      for (let t = toMinutes(p.opens); t <= last; t += booking.slotMinutes) {
        if (t >= earliest) times.push(fromMinutes(t));
      }
      return { service: p.service, times };
    })
    .filter((g) => g.times.length > 0);
}
