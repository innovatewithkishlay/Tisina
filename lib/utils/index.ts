import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge the custom type scale (app/globals.css @theme), otherwise
// `text-h1` and `text-fg` look like two colours and one is silently dropped.
const twMerge = extendTailwindMerge({
  extend: {
    theme: { text: ['giant', 'display', 'h1', 'h2', 'h3', 'statement', 'lede', 'body', 'small', 'label'] },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Serialize JSON-LD safely for a <script> tag (prevents `</script>` injection). */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
