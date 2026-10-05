import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

type Variant = 'solid' | 'outline' | 'text';

const base =
  'group relative inline-flex items-center justify-center gap-3 font-sans text-[0.8125rem] font-medium uppercase tracking-[0.16em] transition-[color,background-color,border-color,transform] duration-[var(--dur-2)] ease-[var(--ease-out)] disabled:pointer-events-none disabled:opacity-60';

const variants: Record<Variant, string> = {
  solid:
    'min-h-12 rounded-[var(--radius-pill)] bg-fg px-7 text-bg hover:bg-accent hover:text-on-accent active:scale-[0.98]',
  outline:
    'min-h-12 rounded-[var(--radius-pill)] border border-current px-7 text-fg hover:bg-fg hover:text-bg active:scale-[0.98]',
  text: 'min-h-11 px-0 text-fg',
};

export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 12"
      className={cn('h-3 w-6 transition-transform duration-[var(--dur-2)] ease-[var(--ease-out)] group-hover:translate-x-1', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M0 6h22M17 1l5 5-5 5" />
    </svg>
  );
}

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, 'className'> {
  variant?: Variant;
  className?: string;
  arrow?: boolean;
  children: ReactNode;
}

/** Internal, locale-aware link styled as a button. */
export function ButtonLink({ variant = 'solid', className, arrow, children, ...props }: ButtonLinkProps) {
  return (
    <Link {...props} className={cn(base, variants[variant], className)}>
      <span className={variant === 'text' ? 'link-draw' : undefined}>{children}</span>
      {arrow ? <Arrow /> : null}
    </Link>
  );
}

/** External link (maps, tel:, mailto:) styled as a button. */
export function ButtonA({
  variant = 'solid',
  className,
  arrow,
  children,
  ...props
}: ComponentProps<'a'> & { variant?: Variant; arrow?: boolean }) {
  return (
    <a {...props} className={cn(base, variants[variant], className)}>
      <span className={variant === 'text' ? 'link-draw' : undefined}>{children}</span>
      {arrow ? <Arrow /> : null}
    </a>
  );
}

export function Button({
  variant = 'solid',
  className,
  children,
  ...props
}: ComponentProps<'button'> & { variant?: Variant }) {
  return (
    <button {...props} className={cn(base, variants[variant], className)}>
      {children}
    </button>
  );
}
