import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('Navigation');
  
  return (
    <main className="container max-w-screen-xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">{t('about')}</h1>
      <p className="text-muted-foreground">
        About content goes here.
      </p>
    </main>
  );
}
