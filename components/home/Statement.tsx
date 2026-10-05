import { Reveal, Words } from '@/components/ui/Reveal';

/** A large editorial sentence that brightens word by word as it scrolls past. */
export function Statement({ label, text }: { label: string; text: string }) {
  return (
    <section className="section">
      <div className="wrap grid gap-8 md:grid-cols-12">
        <Reveal className="md:col-span-3">
          <p className="label label-rule text-muted md:sticky md:top-32">{label}</p>
        </Reveal>
        <Words
          as="p"
          mode="read"
          text={text}
          className="font-display text-statement md:col-span-9 lg:col-span-8 lg:indent-[12%]"
        />
      </div>
    </section>
  );
}
