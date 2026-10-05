'use client';

import { useRef } from 'react';
import { Link } from '@/i18n/routing';
import { Kicker } from '@/components/ui/Kicker';
import { Magnetic } from '@/components/motion/Magnetic';
import { gsap, reducedMotion, useGSAP } from '@/components/motion/gsap';

/**
 * A glance at the menu without repeating it: the course names drift across
 * the screen in two rows, in opposite directions, tied to the scroll. Each
 * name jumps to that course on the menu page.
 */
export function MenuGlance({
  label,
  title,
  cta,
  courses,
}: {
  label: string;
  title: string;
  cta: string;
  courses: { slug: string; name: string }[];
}) {
  const root = useRef<HTMLElement>(null);
  const half = Math.ceil(courses.length / 2);
  const rows = [courses.slice(0, half), courses.slice(half)];

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const st = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.4 };
      gsap.fromTo('[data-glance-row="0"]', { xPercent: 0 }, { xPercent: -28, ease: 'none', scrollTrigger: st });
      gsap.fromTo('[data-glance-row="1"]', { xPercent: -28 }, { xPercent: 0, ease: 'none', scrollTrigger: st });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="paper section overflow-hidden" aria-labelledby="glance-title">
      <div className="wrap flex flex-wrap items-end justify-between gap-6">
        <div>
          <Kicker>{label}</Kicker>
          <h2 id="glance-title" className="font-display mt-6 max-w-[16ch] text-h2">
            {title}
          </h2>
        </div>
      </div>

      <nav aria-label={label} className="mt-16 space-y-2">
        {rows.map((row, r) => (
          <ul key={r} data-glance-row={r} className="flex w-max items-center gap-[0.35em] whitespace-nowrap pl-[var(--gutter)] font-display text-[clamp(3.25rem,10vw,10rem)] leading-[1.02] tracking-[-0.03em]">
            {[...row, ...row].map((c, i) => (
              <li key={`${c.slug}-${i}`} className="flex items-center gap-[0.35em]" aria-hidden={i >= row.length ? true : undefined}>
                <Link
                  href={{ pathname: '/menu', hash: `c-${c.slug}` }}
                  tabIndex={i >= row.length ? -1 : undefined}
                  className="outline-text transition-[color,-webkit-text-stroke-color] duration-500 [-webkit-text-stroke-color:color-mix(in_srgb,var(--fg)_62%,transparent)] [-webkit-text-stroke-width:1.2px] hover:text-fg hover:italic"
                >
                  {c.name}
                </Link>
                <span className="text-[0.35em] text-accent" aria-hidden="true">ˇ</span>
              </li>
            ))}
          </ul>
        ))}
      </nav>

      <div className="wrap mt-16">
        <Magnetic>
        <Link
          href="/menu"
          className="btn-fill label inline-flex min-h-14 items-center gap-4 rounded-[var(--radius-pill)] bg-fg px-8 text-bg [--btn-fill:var(--accent)]"
        >
          {cta} <span aria-hidden="true">→</span>
        </Link>
        </Magnetic>
      </div>
    </section>
  );
}
