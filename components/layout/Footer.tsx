import { useTranslations } from 'next-intl';
import { restaurantConfig } from '@/config/restaurant';

export function Footer() {
  const t = useTranslations('Navigation');
  const year = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border bg-muted/40 text-muted-foreground">
      <div className="container max-w-screen-2xl px-4 md:px-8 mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-foreground mb-4">{restaurantConfig.name}</h3>
            <p className="text-sm max-w-xs">
              {restaurantConfig.address.street}<br/>
              {restaurantConfig.address.postalCode} {restaurantConfig.address.city}<br/>
              {restaurantConfig.address.country}
            </p>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-4">Contact</h3>
            <p className="text-sm">
              <a href={`tel:${restaurantConfig.contact.phone}`} className="hover:text-foreground transition-colors">{restaurantConfig.contact.phone}</a><br/>
              <a href={`mailto:${restaurantConfig.contact.email}`} className="hover:text-foreground transition-colors">{restaurantConfig.contact.email}</a>
            </p>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-4">Links</h3>
            <ul className="text-sm space-y-2">
              {Object.entries(restaurantConfig.social).map(([network, url]) => (
                <li key={network}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors capitalize">
                    {network}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-sm">
          <p>© {year} {restaurantConfig.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
