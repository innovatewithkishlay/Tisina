'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * One IntersectionObserver for the whole page. Server-rendered elements opt in
 * with a `data-reveal` attribute (see components/ui/Reveal.tsx) and get
 * `data-in="true"` the first time they scroll into view. Keeps every reveal a
 * Server Component and ships ~1 KB of JS instead of a motion library.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pending = () => document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-in])');

    if (reduce || !('IntersectionObserver' in window)) {
      pending().forEach((el) => (el.dataset.in = 'true'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.in = 'true';
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );

    const scan = () => pending().forEach((el) => io.observe(el));
    scan();

    // Content streamed in later (Suspense, client navigation) is picked up too.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
