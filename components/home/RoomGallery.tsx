import Image from 'next/image';
import { Reveal, Words } from '@/components/ui/Reveal';
import { cn } from '@/lib/utils';

export interface GalleryImage {
  key: string;
  src: string;
  width: number;
  height: number;
  caption: string;
}

/**
 * The room, then a horizontal film strip of evenings. On large screens with
 * scroll-timeline support the strip is pinned and moves sideways as you scroll
 * down; everywhere else it is a swipeable, snap-aligned row.
 */
export function RoomGallery({
  label,
  title,
  body,
  galleryLabel,
  items,
}: {
  label: string;
  title: string;
  body: string;
  galleryLabel: string;
  items: GalleryImage[];
}) {
  const heights = ['lg:h-[58vh]', 'lg:h-[42vh]', 'lg:h-[64vh]', 'lg:h-[48vh]', 'lg:h-[56vh]', 'lg:h-[44vh]'];
  const offsets = ['lg:self-start', 'lg:self-end', 'lg:self-center', 'lg:self-start', 'lg:self-end', 'lg:self-center'];

  return (
    <section className="night overflow-clip" aria-labelledby="room-title">
      <div className="wrap section grid gap-10 pb-0 md:grid-cols-12">
        <Reveal className="md:col-span-3">
          <p className="label label-rule text-muted">{label}</p>
        </Reveal>
        <div className="md:col-span-8 md:col-start-5">
          <Words as="h2" id="room-title" text={title} className="font-display text-h1 block" />
          <Reveal delay={150}>
            <p className="mt-8 max-w-[52ch] text-lede text-fg-2">{body}</p>
          </Reveal>
        </div>
      </div>

      <div className="hscroll">
        <div className="hscroll-sticky">
          <figure className="w-full">
            <figcaption className="sr-only">{galleryLabel}</figcaption>
            <ul
              className="hscroll-track no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--gutter)] py-16 md:gap-8 lg:w-max lg:snap-none lg:py-0 lg:pr-[20vw]"
              aria-label={galleryLabel}
            >
              {items.map((item, i) => {
                const ratio = item.width / item.height;
                return (
                  <li
                    key={item.key}
                    className={cn('shrink-0 snap-center', offsets[i % offsets.length], i === 0 && 'lg:ml-[30vw]')}
                  >
                    <div
                      className={cn('relative overflow-hidden bg-bg-2', 'h-[52vh] max-h-[34rem] lg:max-h-none', heights[i % heights.length])}
                      style={{ aspectRatio: ratio > 1.6 ? '16 / 10' : ratio < 0.95 ? '4 / 5' : '1 / 1' }}
                    >
                      <Image
                        src={item.src}
                        alt={item.caption}
                        fill
                        sizes="(min-width: 1024px) 50vw, 85vw"
                        className="object-cover"
                      />
                    </div>
                    <p className="mt-4 flex gap-3 text-small text-muted">
                      <span className="tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                      <span>{item.caption}</span>
                    </p>
                  </li>
                );
              })}
            </ul>
          </figure>
        </div>
      </div>
    </section>
  );
}
