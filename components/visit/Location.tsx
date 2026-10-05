import type { Locale } from '@/config/locales';
import { regionName, telHref } from '@/lib/format';
import type { Restaurant } from '@/types/restaurant';
import { ButtonA } from '@/components/ui/Button';

/**
 * Address and contact block. Deliberately no embedded map iframe (heavy, and
 * it sets third-party cookies) — a directions link opens the visitor's own
 * maps app instead.
 */
export function Location({
  restaurant: r,
  locale,
  labels,
  headingLevel = 3,
}: {
  restaurant: Restaurant;
  locale: Locale;
  labels: { address: string; contact: string; directions: string };
  headingLevel?: 2 | 3;
}) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  const directions = r.geo
    ? `https://www.google.com/maps/dir/?api=1&destination=${r.geo.lat},${r.geo.lng}`
    : r.mapsUrl;

  return (
    <div className="grid gap-10 sm:grid-cols-2">
      <div>
        <H className="label text-muted">{labels.address}</H>
        <address className="mt-4 not-italic text-lede">
          {r.address.street}
          <br />
          {r.address.postalCode} {r.address.city}
          <br />
          {regionName(r.address.countryCode, locale)}
        </address>
        {directions ? (
          <ButtonA href={directions} target="_blank" rel="noopener noreferrer" variant="text" arrow className="mt-4">
            {labels.directions}
          </ButtonA>
        ) : null}
      </div>
      <div>
        <H className="label text-muted">{labels.contact}</H>
        <p className="mt-4 space-y-1 text-lede">
          <a href={telHref(r.phone)} className="link-static block w-fit">
            {r.phone}
          </a>
          <a href={`mailto:${r.email}`} className="link-static block w-fit break-all">
            {r.email}
          </a>
        </p>
      </div>
    </div>
  );
}
