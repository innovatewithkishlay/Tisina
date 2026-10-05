'use client';

import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { Logo, Hacek } from '@/components/brand/Logo';
import { Img } from '@/components/ui/Img';
import { useLenis } from '@/components/motion/SmoothScroll';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  address: string;
  phone: string;
  phoneHref: string;
  email: string;
  instagram?: string;
  status?: ReactNode;
  /** Preview photo per nav entry, shown beside the links in the overlay. */
  previews: Record<string, string>;
}

const ITEMS = [{ key: 'home', href: '/' } as const, ...siteConfig.nav];

/**
 * The header is a thin, fixed strip that never changes size or hides, so it
 * cannot jitter while scrolling. `mix-blend-mode: difference` keeps it legible
 * over video, photography, paper and night sections alike. Navigation lives
 * in a full-screen overlay on every screen size.
 */
export function Navbar({ address, phone, phoneHref, email, instagram, status, previews }: NavbarProps) {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string>(ITEMS[0].key);
  const [heroMarkVisible, setHeroMarkVisible] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on navigation (adjusting state during render; no effect needed).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // On the homepage the big hero wordmark is the logo; the small one appears once it scrolls away.
  useEffect(() => {
    const mark = document.getElementById('hero-mark');
    if (!mark) {
      const id = requestAnimationFrame(() => setHeroMarkVisible(false));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(([e]) => setHeroMarkVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(mark);
    return () => io.disconnect();
  }, [pathname]);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = 'hidden';
    const panel = panelRef.current;
    const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    const first = window.setTimeout(() => focusables()[0]?.focus(), 350);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const els = [toggleRef.current!, ...focusables()];
        const a = els[0];
        const z = els[els.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(first);
      lenis?.start();
      document.documentElement.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close, lenis]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));
  const showLogo = open || !heroMarkVisible;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[70] text-white mix-blend-difference">
        <div className="wrap grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center">
          <button
            ref={toggleRef}
            type="button"
            className="group pointer-events-auto -ml-2 inline-flex min-h-11 items-center gap-3 justify-self-start px-2"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" className="relative block h-2.5 w-7">
              <span
                className={cn(
                  'absolute left-0 top-0 h-px w-7 bg-current transition-transform duration-[var(--dur-2)] ease-[var(--ease-out)]',
                  open ? 'translate-y-[5px] rotate-[24deg]' : 'group-hover:translate-x-1',
                )}
              />
              <span
                className={cn(
                  'absolute bottom-0 left-0 h-px bg-current transition-[transform,width] duration-[var(--dur-2)] ease-[var(--ease-out)]',
                  open ? 'w-7 -translate-y-[4px] -rotate-[24deg]' : 'w-4 group-hover:w-7',
                )}
              />
            </span>
            <span className="label hidden sm:inline">{open ? t('closeMenu') : t('openMenu')}</span>
            <span className="sr-only sm:hidden">{open ? t('closeMenu') : t('openMenu')}</span>
          </button>

          <Link
            href="/"
            aria-label={siteConfig.brandName}
            className={cn(
              'pointer-events-auto block transition-[opacity,transform] duration-[var(--dur-3)] ease-[var(--ease-out)]',
              showLogo ? 'opacity-100' : 'pointer-events-none -translate-y-3 opacity-0',
            )}
            tabIndex={showLogo ? undefined : -1}
          >
            <Logo className="w-[6.25rem] [--hacek:currentColor] sm:w-[7.25rem]" />
          </Link>

          <div className="flex items-center gap-1 justify-self-end">
            <Suspense fallback={null}>
              <LanguageSwitcher className="pointer-events-auto hidden md:block" />
            </Suspense>
            <Link
              href="/book"
              className="label pointer-events-auto ml-2 inline-flex min-h-10 items-center rounded-[var(--radius-pill)] border border-current px-4 transition-colors duration-[var(--dur-2)] hover:bg-white hover:text-black sm:px-5"
            >
              {t('book')}
            </Link>
          </div>
        </div>
      </header>

      {/* Full-screen menu */}
      <div
        id="site-menu"
        ref={panelRef}
        data-open={open}
        inert={!open}
        aria-hidden={!open}
        className="night fixed inset-0 z-[65] flex flex-col overflow-y-auto [clip-path:inset(0_0_100%_0)] transition-[clip-path] duration-[900ms] ease-[var(--ease-in-out)] data-[open=true]:[clip-path:inset(0_0_0_0)]"
        data-lenis-prevent
      >
        <div className="wrap grid flex-1 items-center gap-10 pb-8 pt-[calc(var(--header-h)+2rem)] lg:grid-cols-12">
          <nav aria-label={t('primary')} className="lg:col-span-7">
            <ul>
              {ITEMS.map((item, i) => (
                <li key={item.href} className="overflow-hidden">
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    onPointerEnter={() => setHover(item.key)}
                    onFocus={() => setHover(item.key)}
                    className={cn(
                      'group flex items-baseline gap-5 py-1 transition-[transform,opacity] duration-[900ms] ease-[var(--ease-out)]',
                      open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
                    )}
                    style={{ transitionDelay: open ? `${180 + i * 70}ms` : '0ms' }}
                  >
                    <span className="index w-10 shrink-0 text-[1.05rem] text-muted">({String(i + 1).padStart(2, '0')})</span>
                    <span className="font-display text-[clamp(3rem,9.5vw,7.25rem)] leading-[0.98] tracking-[-0.02em] transition-[color,font-style] duration-[var(--dur-2)] group-hover:italic group-hover:text-accent group-aria-[current=page]:italic">
                      {t(item.key)}
                    </span>
                    <Hacek className="h-[0.9rem] text-accent opacity-0 transition-opacity group-hover:opacity-100 group-aria-[current=page]:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div
            className={cn(
              'relative hidden aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] transition-[opacity,transform] duration-[1100ms] ease-[var(--ease-out)] lg:col-span-4 lg:col-start-9 lg:block',
              open ? 'scale-100 opacity-100 delay-300' : 'scale-95 opacity-0',
            )}
            aria-hidden="true"
          >
            {ITEMS.map((item) => (
              <Img
                key={item.key}
                src={previews[item.key]}
                alt=""
                fill
                sizes="30vw"
                className={cn(
                  'object-cover transition-[opacity,transform] duration-[900ms] ease-[var(--ease-out)]',
                  hover === item.key ? 'scale-100 opacity-100' : 'scale-110 opacity-0',
                )}
              />
            ))}
          </div>
        </div>

        <div
          className={cn(
            'wrap grid gap-6 border-t hairline py-6 text-small text-muted transition-opacity duration-700 sm:grid-cols-2 lg:grid-cols-4',
            open ? 'opacity-100 delay-500' : 'opacity-0',
          )}
        >
          <Suspense fallback={null}>
            <LanguageSwitcher onNavigate={() => setOpen(false)} className="-ml-2" />
          </Suspense>
          <div>{status}</div>
          <p>
            {address}
            <br />
            <a href={phoneHref} className="link-static">
              {phone}
            </a>
          </p>
          <p className="lg:text-right">
            <a href={`mailto:${email}`} className="link-static break-all">
              {email}
            </a>
            {instagram ? (
              <>
                <br />
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="link-static">
                  Instagram
                </a>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </>
  );
}
