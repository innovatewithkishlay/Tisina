'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { m } from 'motion/react';
import { Logo } from '@/components/brand/Logo';

declare global {
  interface Window {
    __tisinaNavigated?: boolean;
  }
}

/**
 * Page transition: on every in-site navigation a bottle-green curtain with
 * the wordmark lifts off the new page, which rises gently into place.
 */
export default function Template({ children }: { children: ReactNode }) {
  // Only after the first page has mounted do later mounts play the curtain —
  // the first load must never wait behind it (and server HTML stays curtain-free).
  const [play] = useState(() => typeof window !== 'undefined' && window.__tisinaNavigated === true);
  useEffect(() => {
    window.__tisinaNavigated = true;
  }, []);

  if (!play) return <>{children}</>;

  return (
    <>
      <m.div
        aria-hidden="true"
        className="night pointer-events-none fixed inset-0 z-[85] flex items-center justify-center"
        initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        animate={{ clipPath: 'inset(0% 0% 100% 0%)' }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
      >
        <m.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -30 }} transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}>
          <Logo className="w-[min(40vw,14rem)] text-bone [--hacek:var(--brand-ember-light)]" />
        </m.div>
      </m.div>
      <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}>
        {children}
      </m.div>
    </>
  );
}
