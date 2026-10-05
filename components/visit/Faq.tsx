/**
 * FAQ built on native <details>: keyboard and screen-reader friendly with no
 * JavaScript. Content doubles as FAQPage structured data on the Visit page.
 */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="border-t hairline">
      {items.map((item) => (
        <details key={item.q} className="group border-b hairline">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lede [&::-webkit-details-marker]:hidden">
            <span className="font-display text-[1.5rem] leading-snug">{item.q}</span>
            <span
              aria-hidden="true"
              className="relative size-4 shrink-0 before:absolute before:left-0 before:top-1/2 before:h-px before:w-4 before:bg-current after:absolute after:left-1/2 after:top-0 after:h-4 after:w-px after:bg-current after:transition-transform after:duration-[var(--dur-2)] group-open:after:scale-y-0"
            />
          </summary>
          <p className="max-w-[60ch] pb-7 text-fg-2">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
