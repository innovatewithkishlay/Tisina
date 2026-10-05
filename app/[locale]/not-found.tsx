import { getTranslations } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';

export default async function NotFound() {
  const t = await getTranslations('NotFound');
  return (
    <section className="wrap relative flex min-h-svh flex-col items-center justify-center overflow-hidden pb-[var(--section)] pt-[var(--header-h)] text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-night/5 pointer-events-none" />
      
      <div className="relative z-10 flex max-w-4xl flex-col items-center">
        <Reveal delay={100}>
          <p className="font-sans text-[0.85rem] font-bold uppercase tracking-[0.4em] text-accent">
            Error 404
          </p>
        </Reveal>
        
        <Reveal delay={200}>
          <h1 className="mt-8 font-display text-[4rem] leading-[0.9] tracking-tight sm:text-[6rem] md:text-[9rem]">
            {t('title')}
          </h1>
        </Reveal>
        
        <Reveal delay={300}>
          <p className="mt-10 max-w-[40ch] font-serif text-[1.25rem] italic leading-relaxed text-muted md:text-[1.5rem]">
            {t('body')}
          </p>
        </Reveal>
        
        <Reveal delay={400} className="mt-16">
          <ButtonLink 
            href="/" 
            variant="solid" 
            arrow 
            className="min-h-16 rounded-[2rem] bg-night px-10 text-[0.85rem] tracking-[0.2em] text-bone transition-all duration-500 hover:scale-[1.02] hover:bg-accent hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
          >
            {t('cta')}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
