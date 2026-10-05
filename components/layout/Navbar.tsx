'use client';

import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { Logo, Hacek } from '@/components/brand/Logo';
import { useLenis } from '@/components/motion/SmoothScroll';
import { m, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { scrollSpring } from '@/lib/motion';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  address: string;
  phone: string;
  phoneHref: string;
  email: string;
  instagram?: string;
  status?: ReactNode;
}

const ITEMS = [{ key: 'home', href: '/' } as const, ...siteConfig.nav];

/**
 * The header is a fixed bar that never changes size, so it cannot jitter.
 * It slips away while you read down the page and returns as soon as you
 * scroll up; past 80px it becomes a blurred night bar that content slides
 * beneath. A gold hairline along the top shows how far you have read.
 * Navigation lives in a side panel on every screen size.
 */
export function Navbar({ address, phone, phoneHref, email, instagram, status }: NavbarProps) {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [heroMarkVisible, setHeroMarkVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
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

  // Hide while reading down the page, return the moment the visitor scrolls
  // back up. The bar slides as a whole (transform only), so nothing reflows.
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, scrollSpring);
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 80);
    if (y < 160) setHidden(false);
    else if (Math.abs(y - prev) > 4) setHidden(y > prev);
  });

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
  // Transparent only over the home film before scrolling; everywhere else a
  // solid bar, so page content passes underneath instead of through it.
  const solid = open || scrolled || pathname !== '/';

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[70] text-bone transition-[background-color,border-color,backdrop-filter,transform] duration-700 ease-[var(--ease-out)]',
          hidden && !open && '-translate-y-full',
          solid ? 'border-b border-white/[0.07] bg-night/90 backdrop-blur-xl' : 'border-b border-transparent bg-transparent',
        )}
      >
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
            <Logo className="w-[6.25rem] [--hacek:var(--brand-ember-light)] sm:w-[7.25rem]" />
          </Link>

          <div className="flex items-center justify-self-end">
            <Suspense fallback={null}>
              <LanguageSwitcher className="pointer-events-auto hidden md:block" />
            </Suspense>
          </div>
        </div>
      </header>



      {/* Dimmed Backdrop */}
      <div 
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-[64] bg-black/40 backdrop-blur-sm transition-opacity duration-700 pointer-events-none",
          open ? "opacity-100 pointer-events-auto" : "opacity-0"
        )}
        onClick={() => setOpen(false)}
      />
      
      {/* Elegant Right Sidebar Menu */}
      <div
        id="site-menu"
        ref={panelRef}
        data-open={open}
        inert={!open}
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-[65] flex w-full lg:w-[480px] flex-col bg-night/95 backdrop-blur-2xl text-bone",
          "transition-transform duration-[800ms] ease-[var(--ease-out)]",
          open ? "translate-x-0 shadow-[-30px_0_60px_rgba(0,0,0,0.5)]" : "invisible translate-x-full"
        )}
      >
        <div className="flex flex-col flex-1 px-10 pb-12 pt-[calc(var(--header-h)+2rem)]">
          <nav aria-label={t('primary')} className="mt-8">
            <ul className="flex flex-col gap-6">
              {ITEMS.map((item, i) => (
                <li key={item.href} className="overflow-hidden">
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'group flex items-center gap-6 transition-[transform,opacity] duration-[700ms] ease-[var(--ease-out)]',
                      open ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0',
                    )}
                    style={{ transitionDelay: open ? `${200 + i * 50}ms` : '0ms' }}
                  >
                    <span className="font-display text-[3rem] leading-none text-bone transition-colors duration-[var(--dur-3)] group-hover:text-accent group-hover:italic group-aria-[current=page]:italic group-aria-[current=page]:text-accent">
                      {t(item.key)}
                    </span>
                    <Hacek className="h-[1.2rem] text-accent opacity-0 transition-[opacity,transform] duration-[var(--dur-3)] -translate-x-4 group-hover:translate-x-0 group-hover:opacity-100 group-aria-[current=page]:opacity-100 group-aria-[current=page]:translate-x-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto pt-16">
            <div className="mb-8 h-px w-12 bg-white/20" />
            {status ? <div className="mb-5 text-sm text-bone/80">{status}</div> : null}
            <p className="text-sm leading-relaxed text-muted">
              {address}
              <br />
              <a href={phoneHref} className="transition-colors hover:text-white">{phone}</a>
            </p>
            <div className="mt-6 flex gap-6">
              <a href={`mailto:${email}`} className="text-sm text-bone transition-colors hover:text-accent">Email</a>
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-bone transition-colors hover:text-accent">Instagram</a>
              )}
            </div>
            <div className="mt-8 sm:hidden">
              <Suspense fallback={null}>
                <LanguageSwitcher onNavigate={() => setOpen(false)} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
