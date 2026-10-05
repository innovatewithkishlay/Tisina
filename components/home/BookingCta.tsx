import { Link } from '@/i18n/routing';
import { Arrow } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';

/** Closing call to action: the whole headline is the link. */
export function BookingCta({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <section className="section bg-bg-2" aria-labelledby="booking-cta-title">
      <div className="wrap">
        <Reveal>
          <p className="label label-rule text-muted">{label}</p>
        </Reveal>
        <Reveal delay={100}>
          <Link href="/book" className="group mt-6 block w-fit">
            <h2 id="booking-cta-title" className="font-display text-display flex flex-wrap items-baseline gap-x-[0.3em]">
              <span className="transition-[font-style] group-hover:italic">{title}</span>
              <Arrow className="h-[0.32em] w-[0.7em] translate-y-[-0.1em] group-hover:translate-x-4" />
            </h2>
          </Link>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-8 max-w-[44ch] text-lede text-fg-2">{body}</p>
        </Reveal>
      </div>
    </section>
  );
}
