'use client';

import { useRef } from 'react';
import { useMotionValueEvent, useScroll } from 'motion/react';
import { Img } from '@/components/ui/Img';
import { Kicker } from '@/components/ui/Kicker';
import { useCalm, useDesktop } from '@/lib/motion';

/**
 * A statement that reads itself. As it scrolls through, each word lights from
 * 15% to full ink — scrubbed, so it dims again on the way back — and the
 * small photographs open inside the sentence at the exact moment the word
 * before them lights, turning upright as they widen. Phones use a shorter
 * window so the sentence completes within about a screen and a bit.
 *
 * Markup: `[[key]]` inserts the image `images[key]`, `*word*` sets italic.
 */
type Token = { kind: 'img'; key: string; i: number } | { kind: 'word'; w: string; em: boolean; i: number };

export function Manifesto({ label, text, images }: { label: string; text: string; images: Record<string, string> }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const calm = useCalm();
  const desktop = useDesktop();
  const plain = text.replace(/\[\[\w+\]\]\s?/g, '').replace(/\*/g, '');

  let n = 0;
  const tokens = text.split(/(\[\[\w+\]\])/).flatMap((part): Token[] => {
    const img = part.match(/^\[\[(\w+)\]\]$/);
    // A picture opens with the word just before it.
    if (img) return [{ kind: 'img', key: img[1], i: Math.max(n - 1, 0) }];
    return part
      .split(/(\*[^*]+\*)/)
      .flatMap((seg): Token[] => {
        const em = seg.startsWith('*');
        return (em ? seg.slice(1, -1) : seg)
          .split(/\s+/)
          .filter(Boolean)
          .map((w) => ({ kind: 'word', w, em, i: n++ }));
      });
  });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: desktop ? ['start 80%', 'end 45%'] : ['start 88%', 'end 62%'],
  });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!calm) ref.current?.style.setProperty('--p', v.toFixed(4));
  });

  return (
    <section className="paper section">
      <div className="wrap">
        <Kicker>{label}</Kicker>
        <p
          ref={ref}
          className="manifesto font-display text-statement mt-10 max-w-[22ch] sm:max-w-none lg:w-[88%]"
          style={{ ['--n' as string]: n }}
        >
          <span className="sr-only">{plain}</span>
          <span aria-hidden="true">
            {tokens.map((t, k) =>
              t.kind === 'img' ? (
                images[t.key] ? (
                  <span
                    key={k}
                    className="mf-pill relative mx-[0.12em] inline-block h-[0.82em] w-[1.75em] overflow-hidden rounded-full align-baseline"
                    style={{ ['--i' as string]: t.i }}
                  >
                    <span className="mf-pill-img absolute inset-0">
                      <Img src={images[t.key]} alt="" fill sizes="160px" className="object-cover" />
                    </span>
                  </span>
                ) : null
              ) : (
                <span key={k}>
                  <span className={t.em ? 'mf-word italic text-accent' : 'mf-word'} style={{ ['--i' as string]: t.i }}>
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
