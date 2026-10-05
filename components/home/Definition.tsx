import { Reveal } from '@/components/ui/Reveal';

/** A quiet interlude set like a dictionary entry — the brand's name, defined. */
export function Definition({
  word,
  pron,
  kind,
  senses,
}: {
  word: string;
  pron: string;
  kind: string;
  senses: string[];
}) {
  return (
    <section className="section bg-bg-2" lang="hr">
      <div className="wrap grid md:grid-cols-12">
        <Reveal className="md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
          <dl>
            <dt className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <span className="font-display text-h1 italic">{word}</span>
              <span className="text-lede text-muted">{pron}</span>
              <span className="label text-muted">{kind}</span>
            </dt>
            {senses.map((sense, i) => (
              <dd key={i} className="mt-6 flex gap-5 border-t hairline pt-6 text-lede first-of-type:mt-10">
                <span className="font-display text-muted">{i + 1}.</span>
                <span>{sense}</span>
              </dd>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
