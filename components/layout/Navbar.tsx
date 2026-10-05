'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { Wordmark } from '@/components/ui/Wordmark';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  address: string;
  phone: string;
  phoneHref: string;
  status?: React.ReactNode;
}

export function Navbar({ address, phone, phoneHref, status }: NavbarProps) {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Solid background after leaving the top; hide while scrolling down, show on the way up.
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        setHidden(y > 320 && y > last + 4);
        if (y < last - 4) setHidden(false);
        last = y;
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Close the mobile menu on navigation (state adjusted during render, no effect needed).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Mobile menu: lock scroll, trap focus, close on Escape.
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const els = [toggleRef.current!, ...focusables()];
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color,color] duration-[var(--dur-2)] ease-[var(--ease-out)]',
        open ? 'night border-b border-transparent' : scrolled ? 'border-b hairline bg-bg/85 backdrop-blur-md' : 'border-b border-transparent',
        hidden && !open && '-translate-y-full',
      )}
    >
      <div className="wrap flex h-[var(--header-h)] items-center gap-6">
        <Link href="/" className="relative z-10 -ml-1 flex min-h-11 items-center px-1" aria-label={siteConfig.brandName}>
          <Wordmark />
        </Link>

        <nav aria-label={t('primary')} className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-9">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className="label link-draw inline-flex min-h-11 items-center"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:gap-4">
          <Suspense fallback={null}>
            <LanguageSwitcher className="hidden md:block" />
          </Suspense>
          <Link
            href="/book"
            className={cn(
              'label hidden min-h-10 items-center rounded-[var(--radius-pill)] border border-current px-5 transition-colors duration-[var(--dur-2)] hover:bg-fg hover:text-bg sm:inline-flex',
              open && 'sm:hidden',
            )}
          >
            {t('book')}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="relative z-10 -mr-2 inline-flex min-h-11 min-w-11 items-center justify-center gap-3 px-2 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t('closeMenu') : t('openMenu')}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" className="relative block h-3 w-7">
              <span
                className={cn(
                  'absolute left-0 top-0 h-px w-7 bg-current transition-transform duration-[var(--dur-2)] ease-[var(--ease-out)]',
                  open && 'translate-y-1.5 rotate-[20deg]',
                )}
              />
              <span
                className={cn(
                  'absolute bottom-0 left-0 h-px w-7 bg-current transition-transform duration-[var(--dur-2)] ease-[var(--ease-out)]',
                  open ? '-translate-y-1.5 -rotate-[20deg]' : 'w-5',
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="night fixed inset-0 top-[var(--header-h)] flex h-[calc(100dvh-var(--header-h))] flex-col overflow-y-auto lg:hidden"
      >
        <nav aria-label={t('primary')} className="wrap flex flex-1 flex-col justify-center py-10">
          <ul className="space-y-1">
            {[{ key: 'home', href: '/' } as const, ...siteConfig.nav].map((item, i) => (
              <li key={item.href} className="rise" style={{ ['--delay' as string]: 60 + i * 60 }}>
                <Link
                  href={item.href}
                  aria-current={(item.href === '/' ? pathname === '/' : isActive(item.href)) ? 'page' : undefined}
                  className="font-display flex min-h-14 items-baseline gap-4 text-[clamp(2.75rem,12vw,4.5rem)] leading-[1.05] aria-[current=page]:italic"
                >
                  <span className="label w-6 text-muted">{String(i + 1).padStart(2, '0')}</span>
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/book"
            className="rise label mt-10 inline-flex min-h-13 items-center justify-center rounded-[var(--radius-pill)] bg-fg px-8 text-bg"
            style={{ ['--delay' as string]: 420 }}
          >
            {t('bookLong')}
          </Link>
        </nav>
        <div className="wrap rise border-t hairline py-6 text-small text-muted" style={{ ['--delay' as string]: 480 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Suspense fallback={null}>
              <LanguageSwitcher onNavigate={() => setOpen(false)} />
            </Suspense>
            {status}
          </div>
          <p className="mt-4">{address}</p>
          <a href={phoneHref} className="link-static mt-1 inline-block">
            {phone}
          </a>
        </div>
      </div>
    </header>
  );
}
