'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * Tišina motion tokens. Everything moves slowly and settles heavily: long
 * expo-out reveals, quart-in-out curtains and a damped spring for anything
 * tied to the scroll. Nothing overshoots.
 */
export const ease = {
  /** Reveals: fast start, long soft landing. */
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** Curtains and wipes. */
  inOut: [0.76, 0, 0.24, 1] as [number, number, number, number],
};

export const dur = { fast: 0.4, base: 0.9, slow: 1.4 } as const;

export const stagger = { tight: 0.06, loose: 0.08 } as const;

/** Smooths scroll-linked values without any bounce. */
export const scrollSpring = { stiffness: 120, damping: 30, mass: 0.4 } as const;

/** CSS equivalents, for transitions driven by data attributes. */
export const cssEase = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.76, 0, 0.24, 1)',
} as const;

/** Tracks a media query on the client; `false` during SSR and the first render. */
export function useMedia(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return match;
}

/** Wide layout: pinned and horizontal choreography only happens here. */
export const useDesktop = () => useMedia('(min-width: 768px)');

/** A mouse or trackpad: cursor, magnetic pull, hover-only effects. */
export const useFinePointer = () => useMedia('(hover: hover) and (pointer: fine)');

/** True when the visitor prefers less motion (falls back to false on the server). */
export const useCalm = () => useReducedMotion() ?? false;

/** Parallax travels about half as far on phones. */
export function useParallaxScale() {
  return useDesktop() ? 1 : 0.5;
}

/** Splits `*emphasis*` markup into plain and emphasised runs. */
export function parseEmphasis(text: string) {
  return text.split(/(\*[^*]+\*)/).filter(Boolean).map((part) =>
    part.startsWith('*') && part.endsWith('*') ? { text: part.slice(1, -1), em: true } : { text: part, em: false },
  );
}

/** Same as parseEmphasis, for `<em>…</em>` markup coming from translations. */
export function parseEm(html: string) {
  return parseEmphasis(html.replace(/<\/?em>/g, '*'));
}

/** Plain text with emphasis markers removed (for screen readers and metadata). */
export const stripEmphasis = (text: string) => text.replace(/\*|<\/?em>/g, '');
