'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { m } from 'motion/react';
import { Logo } from '@/components/brand/Logo';
import { ease } from '@/lib/motion';

declare global {
  interface Window {
    __tisinaNavigated?: boolean;
  }
}

/**
 * Page transition: on every in-site navigation a bottle-green curtain covers
 * the new page and wipes upward (quart-in-out, 0.8 s); the page's headline
 * then rises line by line — `--enter` on <html> delays every reveal that
 * starts during the wipe. The first load never waits behind a curtain.
 */
export default function Template({ children }: { children: ReactNode }) {
  const [play] = useState(() => typeof window !== 'undefined' && window.__tisinaNavigated === true);
  useEffect(() => {
    window.__tisinaNavigated = true;
    if (!play) return;
    const root = document.documentElement;
    root.style.setProperty('--enter', '0.55s');
    const id = window.setTimeout(() => root.style.removeProperty('--enter'), 1600);
    return () => window.clearTimeout(id);
  }, [play]);

  if (!play) return <>{children}</>;

  return (
    <>
      <m.div
        aria-hidden="true"
        className="night pointer-events-none fixed inset-0 z-[85] flex items-center justify-center"
        initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        animate={{ clipPath: 'inset(0% 0% 100% 0%)' }}
        transition={{ duration: 0.8, ease: ease.inOut, delay: 0.1 }}
      >
        <m.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -24 }} transition={{ duration: 0.4, ease: ease.inOut }}>
          <Logo className="w-[min(40vw,14rem)] text-bone [--hacek:var(--brand-ember-light)]" />
        </m.div>
      </m.div>
      {children}
    </>
  );
}
