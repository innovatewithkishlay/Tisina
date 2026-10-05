import Image from 'next/image';
import { Reveal, Words } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';

interface SignatureDishProps {
  label: string;
  name: string;
  description?: string;
  note: string;
  price?: string;
  image: { src: string; alt: string };
  cta: string;
}

/** One dish, given a whole screen: oversized title, an image that opens up as you scroll. */
export function SignatureDish({ label, name, description, note, price, image, cta }: SignatureDishProps) {
  return (
    <section className="section overflow-hidden" aria-labelledby="signature-title">
      <div className="wrap">
        <div className="flex items-end justify-between gap-6">
          <Reveal>
            <p className="label label-rule text-muted">{label}</p>
          </Reveal>
          {price ? (
            <Reveal>
              <p className="font-display text-h3 tabular-nums">{price}</p>
            </Reveal>
          ) : null}
        </div>
        <Words
          as="h2"
          id="signature-title"
          text={name}
          className="font-display text-display mt-6 block -ml-[0.04em] italic"
        />
      </div>

      <div className="wrap mt-10 md:mt-14">
        <div className="scale-on-scroll parallax-img relative aspect-[4/5] overflow-hidden bg-bg-2 sm:aspect-[16/9]">
          <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1440px) 1360px, 100vw" className="object-cover object-[50%_55%]" />
        </div>
      </div>

      <div className="wrap mt-10 grid gap-8 md:mt-14 md:grid-cols-12">
        <Reveal className="md:col-span-5 md:col-start-2">
          <p className="font-display text-h3 italic">
            “{note}”
          </p>
        </Reveal>
        <Reveal delay={120} className="md:col-span-4 md:col-start-8">
          {description ? <p className="text-fg-2">{description}</p> : null}
          <ButtonLink href="/menu" variant="text" arrow className="mt-6">
            {cta}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
