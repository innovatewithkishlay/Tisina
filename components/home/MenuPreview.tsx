import { Reveal, Words } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { MenuPreviewList, type PreviewDish } from './MenuPreviewList';

/** Editorial menu teaser: a few dishes as typographic rows, photos follow the cursor. */
export function MenuPreview({
  label,
  title,
  body,
  cta,
  dishes,
}: {
  label: string;
  title: string;
  body: string;
  cta: string;
  dishes: PreviewDish[];
}) {
  return (
    <section className="section" aria-labelledby="menu-preview-title">
      <div className="wrap grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <p className="label label-rule text-muted">{label}</p>
            </Reveal>
            <Words as="h2" id="menu-preview-title" text={title} className="font-display text-h2 mt-6 block" />
            <Reveal delay={120}>
              <p className="mt-6 max-w-[34ch] text-fg-2">{body}</p>
              <ButtonLink href="/menu" variant="outline" arrow className="mt-8">
                {cta}
              </ButtonLink>
            </Reveal>
          </div>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <MenuPreviewList dishes={dishes} />
        </div>
      </div>
    </section>
  );
}
