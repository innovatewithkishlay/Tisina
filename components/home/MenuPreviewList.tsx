'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export interface PreviewDish {
  slug: string;
  name: string;
  category: string;
  description?: string;
  price: string;
  image?: string;
}

/**
 * Rows of dishes. On devices with a fine pointer, hovering a row shows its
 * photograph floating beside the cursor (eased with rAF, transform-only).
 * Touch devices get an inline thumbnail instead.
 */
export function MenuPreviewList({ dishes }: { dishes: PreviewDish[] }) {
  const [active, setActive] = useState<number | null>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);

  const hovering = active !== null;

  // The easing loop only runs while a row is hovered.
  useEffect(() => {
    if (!hovering) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = () => {
      const k = reduce ? 1 : 0.14;
      pos.current.x += (target.current.x - pos.current.x) * k;
      pos.current.y += (target.current.y - pos.current.y) * k;
      if (floatRef.current) {
        floatRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [hovering]);

  const onMove = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    target.current = { x: e.clientX - rect.left + 28, y: e.clientY - rect.top - 120 };
    if (!hovering) pos.current = { ...target.current };
  };

  return (
    <div className="relative">
      <ul className="border-t hairline" onPointerMove={onMove} onPointerLeave={() => setActive(null)}>
        {dishes.map((dish, i) => (
          <li key={dish.slug} className="border-b hairline">
            <Link
              href={{ pathname: '/menu', hash: dish.slug }}
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-1 py-6 md:py-8"
              onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
              onFocus={() => setActive(null)}
            >
              {dish.image ? (
                <span className="relative block size-16 overflow-hidden bg-bg-2 [@media(pointer:fine)]:hidden">
                  <Image src={dish.image} alt="" fill sizes="64px" className="object-cover" />
                </span>
              ) : (
                <span className="[@media(pointer:fine)]:hidden" />
              )}
              <span className="col-start-2 [@media(pointer:fine)]:col-start-1 [@media(pointer:fine)]:col-end-3">
                <span className="label block text-muted">{dish.category}</span>
                <span className="font-display text-h3 mt-2 block transition-[transform,color] duration-[var(--dur-2)] ease-[var(--ease-out)] group-hover:translate-x-3 group-hover:italic">
                  {dish.name}
                </span>
              </span>
              <span className="font-display text-[1.375rem] tabular-nums text-fg-2">{dish.price}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Floating preview (decorative; images also appear on the menu page) */}
      <div
        ref={floatRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-10 hidden w-[17rem] [@media(pointer:fine)]:block"
      >
        {dishes.map((dish, i) =>
          dish.image ? (
            <div
              key={dish.slug}
              className={cn(
                'absolute inset-x-0 top-0 aspect-[4/5] overflow-hidden shadow-[var(--shadow-float)] transition-[opacity,clip-path,transform] duration-[var(--dur-2)] ease-[var(--ease-out)]',
                active === i ? 'opacity-100 [clip-path:inset(0)]' : 'opacity-0 [clip-path:inset(12%_12%_12%_12%)]',
              )}
            >
              <Image src={dish.image} alt="" fill sizes="272px" className="object-cover" />
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
