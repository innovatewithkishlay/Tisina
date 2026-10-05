import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

/**
 * Brand mark. Uses the official logo when `siteConfig.logo` is set, otherwise
 * a typographic wordmark in the display face.
 */
export function Wordmark({ className }: { className?: string }) {
  if (siteConfig.logo) {
    return (
      <Image
        src={siteConfig.logo.src}
        width={siteConfig.logo.width}
        height={siteConfig.logo.height}
        alt={siteConfig.brandName}
        className={cn('h-7 w-auto', className)}
        priority
      />
    );
  }
  return (
    <span className={cn('font-display text-[1.75rem] leading-none tracking-[-0.01em]', className)}>
      {siteConfig.brandName}
    </span>
  );
}
