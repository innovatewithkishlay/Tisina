import { useTranslations } from 'next-intl';

export default function BookPage() {
  const t = useTranslations('Navigation');
  
  return (
    <main className="container max-w-screen-md mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">{t('book')}</h1>
      <p className="text-muted-foreground mb-8">
        Booking request form will be placed here.
      </p>
    </main>
  );
}
