import Image from 'next/image';
import { Reveal, Words } from '@/components/ui/Reveal';
import { cn } from '@/lib/utils';

export interface RegionStory {
  key: string;
  region: string;
  dish: string;
  body: string;
  alt: string;
  image: { src: string };
}

/**
 * Image-led storytelling on a dark ground: one chapter per region, alternating
 * sides, images drifting slightly against the scroll.
 */
export function Regions({ label, items }: { label: string; items: RegionStory[] }) {
  return (
    <section className="night section relative overflow-hidden" aria-labelledby="regions-label">
      <div className="wrap">
        <Reveal>
          <h2 id="regions-label" className="label label-rule text-muted">
            {label}
          </h2>
        </Reveal>

        <div className="mt-16 space-y-[clamp(6rem,14vw,12rem)] md:mt-24">
          {items.map((item, i) => {
            const flip = i % 2 === 1;
            return (
              <article key={item.key} className="grid items-center gap-10 md:grid-cols-12 md:gap-8">
                <Reveal
                  kind="mask"
                  className={cn(
                    'parallax-img relative overflow-hidden',
                    flip
                      ? 'aspect-[4/5] md:order-2 md:col-span-5 md:col-start-8'
                      : 'aspect-[4/5] md:col-span-6 lg:col-span-5 lg:col-start-2',
                    i === 2 && 'md:aspect-[5/4] md:col-span-7 lg:col-span-7 lg:col-start-1',
                  )}
                >
                  <Image
                    src={item.image.src}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="object-cover"
                  />
                </Reveal>

                <div
                  className={cn(
                    'md:col-span-5',
                    flip ? 'md:order-1 md:col-start-2' : 'md:col-start-8',
                    i === 2 && 'md:col-span-4 md:col-start-9',
                  )}
                >
                  <Reveal>
                    <p className="label flex items-center gap-4 text-muted">
                      <span className="tabular-nums">
                        {String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                      </span>
                      <span aria-hidden="true" className="h-px w-8 bg-current opacity-50" />
                      <span>{item.dish}</span>
                    </p>
                  </Reveal>
                  <Words as="h3" text={item.region} className="font-display text-display mt-6 italic" />
                  <Reveal delay={150}>
                    <p className="mt-8 max-w-[38ch] text-lede text-fg-2">{item.body}</p>
                  </Reveal>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
