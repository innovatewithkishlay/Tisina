'use client';

import { useRef } from 'react';
import { Img } from '@/components/ui/Img';
import { Kicker } from '@/components/ui/Kicker';
import { gsap, reducedMotion, useGSAP } from '@/components/motion/gsap';

/**
 * A large statement that "reads itself": words darken from stone to ink as it
 * scrolls through, and small photographs open inside the sentence itself.
 * Markup: `[[key]]` inserts the image `images[key]`, `*word*` sets italic.
 */
type Token = { kind: 'img'; key: string } | { kind: 'word'; w: string; em: boolean };

export function Manifesto({ label, text, images }: { label: string; text: string; images: Record<string, string> }) {
  const root = useRef<HTMLElement>(null);
  const plain = text.replace(/\[\[\w+\]\]\s?/g, '').replace(/\*/g, '');
  const tokens = text.split(/(\[\[\w+\]\])/).flatMap((part): Token[] => {
    const img = part.match(/^\[\[(\w+)\]\]$/);
    if (img) return [{ kind: 'img', key: img[1] }];
    return part
      .split(/(\*[^*]+\*)/)
      .flatMap((seg): Token[] =>
        seg.startsWith('*')
          ? seg.slice(1, -1).split(/\s+/).map((w) => ({ kind: 'word' as const, w, em: true }))
          : seg.split(/\s+/).filter(Boolean).map((w) => ({ kind: 'word' as const, w, em: false })),
      );
  });

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.fromTo(
        '[data-mw]',
        { color: 'var(--muted)' },
        {
          color: 'var(--fg)',
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: { trigger: '[data-mtext]', start: 'top 78%', end: 'bottom 45%', scrub: true },
        },
      );
      gsap.fromTo(
        '[data-mimg]',
        { scale: 0, rotate: -8 },
        {
          scale: 1,
          rotate: 0,
          ease: 'back.out(1.6)',
          stagger: 0.25,
          scrollTrigger: { trigger: '[data-mtext]', start: 'top 75%', end: 'center 50%', scrub: 0.6 },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="paper section">
      <div className="wrap">
        <Kicker>{label}</Kicker>
        <p data-mtext className="font-display text-statement mt-10 max-w-[22ch] sm:max-w-none lg:w-[88%]">
          <span className="sr-only">{plain}</span>
          <span aria-hidden="true">
            {tokens.map((t, i) =>
              t.kind === 'img' ? (
                images[t.key] ? (
                  <span
                    key={i}
                    data-mimg
                    className="relative mx-[0.12em] inline-block h-[0.82em] w-[1.75em] translate-y-[0.08em] overflow-hidden rounded-full align-baseline"
                  >
                    <Img src={images[t.key]} alt="" fill sizes="160px" className="object-cover" />
                  </span>
                ) : null
              ) : (
                <span key={i}>
                  <span data-mw={t.em ? undefined : true} className={t.em ? 'italic text-accent' : undefined}>
                    {t.w}
                  </span>{' '}
                </span>
              ),
            )}
          </span>
        </p>
      </div>
    </section>
  );
}
