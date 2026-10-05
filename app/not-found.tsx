import Link from 'next/link';
import { siteConfig } from '@/config/site';
import './globals.css';

/** Fallback for paths outside any locale (the proxy normally prevents these). */
export default function RootNotFound() {
  return (
    <html lang={siteConfig.defaultLocale}>
      <body>
        <main className="wrap relative flex min-h-svh flex-col items-center justify-center overflow-hidden text-center bg-paper text-fg">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-night/5 pointer-events-none" />
          
          <div className="relative z-10 flex max-w-4xl flex-col items-center opacity-0 animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-forwards">
            <p className="font-sans text-[0.85rem] font-bold uppercase tracking-[0.4em] text-accent">
              Error 404
            </p>
            
            <h1 className="mt-8 font-display text-[4rem] leading-[0.9] tracking-tight sm:text-[6rem] md:text-[9rem]">
              Not Found
            </h1>
            
            <p className="mt-10 max-w-[40ch] font-serif text-[1.25rem] italic leading-relaxed text-muted md:text-[1.5rem]">
              The page you are looking for does not exist or has been moved.
            </p>
            
            <Link 
              href={`/${siteConfig.defaultLocale}`} 
              className="group relative inline-flex min-h-16 items-center justify-center gap-3 mt-16 rounded-[2rem] bg-night px-10 font-sans text-[0.85rem] font-medium uppercase tracking-[0.2em] text-bone transition-all duration-500 hover:scale-[1.02] hover:bg-accent hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            >
              <span>Return Home</span>
              <svg aria-hidden="true" viewBox="0 0 24 12" className="h-3 w-6 transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M0 6h22M17 1l5 5-5 5" />
              </svg>
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
