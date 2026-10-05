'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Sticky category index for the menu. Highlights the section in view and keeps
 * the active chip scrolled into view on small screens.
 */
export function MenuNav({ label, categories }: { label: string; categories: { slug: string; name: string }[] }) {
  const [active, setActive] = useState(categories[0]?.slug);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(`c-${c.slug}`))
      .filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id.slice(2));
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [categories]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-slug="${active}"]`);
    const list = listRef.current;
    if (el && list) list.scrollTo({ left: el.offsetLeft - 24, behavior: 'smooth' });
  }, [active]);

  return (
    <nav aria-label={label} className="sticky top-0 z-30 border-y hairline bg-bg/90 backdrop-blur-md">
      <ul ref={listRef} className="wrap no-scrollbar flex gap-1 overflow-x-auto py-2">
        {categories.map((c) => (
          <li key={c.slug} data-slug={c.slug} className="shrink-0">
            <a
              href={`#c-${c.slug}`}
              aria-current={active === c.slug ? 'location' : undefined}
              className={cn(
                'label inline-flex min-h-11 items-center rounded-[var(--radius-pill)] px-4 transition-colors duration-[var(--dur-1)]',
                active === c.slug ? 'bg-fg text-bg' : 'text-muted hover:text-fg',
              )}
            >
              {c.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
