'use client';

import { useEffect } from 'react';
import { LogoLetters } from '@/components/brand/Logo';

const KEY = 'tisina-intro';

/**
 * First-visit overture (once per session): the wordmark rises letter by
 * letter, the háček drops onto the Š last, then the curtain lifts off the
 * page — 1.8 s in all. It is pure CSS, keyed off a class that an inline
 * script sets before first paint, so it runs even while the page hydrates;
 * without JS, on repeat visits and with reduced motion it never appears.
 */
export function Intro({ name }: { name: string }) {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('intro')) return;
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {}
    const id = window.setTimeout(() => root.classList.add('intro-done'), 4000);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="intro-veil" aria-hidden="true">
      <div className="intro-curtain grid place-items-center text-bone">
        <LogoLetters title={name} className="intro-mark w-[min(72vw,36rem)] text-bone [--hacek:var(--brand-ember-light)]" />
      </div>
    </div>
  );
}

/** Runs in <head> before paint: decides whether the overture plays. */
export const introScript = `try{if(!sessionStorage.getItem('${KEY}')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('intro')}catch(e){}`;
