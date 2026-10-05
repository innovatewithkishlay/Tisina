'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

const LenisContext = createContext<Lenis | null>(null);

/** The smooth-scroll instance — null on touch devices, with reduced motion, or before mount. */
export function useLenis() {
  return useContext(LenisContext);
}

/**
 * Heavy, inertial scrolling for mouse and trackpad (Lenis, lerp 0.08). Touch
 * screens keep their native scrolling — nothing is ever scroll-jacked on a
 * phone — and so does anyone who prefers reduced motion. Motion's useScroll
 * reads the same native scroll position, so every scroll-linked effect stays
 * in step with the smoothing.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || calm) return;

    const instance = new Lenis({ lerp: 0.08, wheelMultiplier: 0.85, syncTouch: false, autoRaf: true, anchors: true });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- exposing an external instance
    setLenis(instance);
    return () => {
      instance.destroy();
      setLenis(null);
    };
  }, []);

  // A new page starts at the top, without gliding there.
  useEffect(() => {
    if (!window.location.hash) lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
