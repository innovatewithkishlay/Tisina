import { Locale } from './locales';

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tripadvisor?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  street: string;
  city: string;
  country: string;
  postalCode: string;
  coordinates?: Coordinates;
  googleMapsUrl?: string;
}

export interface RestaurantConfig {
  id: string; // The slug or identifier for this restaurant
  name: string;
  tagline: Record<Locale, string>;
  description: Record<Locale, string>;
  
  address: Address;
  contact: {
    phone: string;
    email: string;
    website: string;
  };

  social: SocialLinks;
  
  settings: {
    currency: string;
    timezone: string;
    defaultLocale: Locale;
    supportedLocales: Locale[];
    bookingEnabled: boolean;
  };
  
  seo: {
    title: Record<Locale, string>;
    description: Record<Locale, string>;
  };
}

export const restaurantConfig: RestaurantConfig = {
  id: 'maison-example',
  name: 'Maison Example',
  tagline: {
    en: 'Modern European Dining',
    hr: 'Moderno Europsko Iskustvo',
    hu: 'Modern Európai Étterem',
    de: 'Moderne Europäische Küche'
  },
  description: {
    en: 'Experience the finest ingredients from the Adriatic coast prepared with modern techniques in the heart of Zagreb.',
    hr: 'Doživite najbolje sastojke s jadranske obale pripremljene modernim tehnikama u srcu Zagreba.',
    hu: 'Tapasztalja meg az Adriai-part legfinomabb alapanyagait modern technikákkal elkészítve Zágráb szívében.',
    de: 'Erleben Sie die feinsten Zutaten von der Adriaküste, zubereitet mit modernen Techniken im Herzen von Zagreb.'
  },
  
  address: {
    street: 'Trg bana Josipa Jelačića 1',
    city: 'Zagreb',
    country: 'Croatia',
    postalCode: '10000',
    googleMapsUrl: 'https://maps.google.com/?q=Zagreb',
  },
  
  contact: {
    phone: '+385 1 234 5678',
    email: 'info@maisonexample.com',
    website: 'https://maisonexample.com',
  },
  
  social: {
    instagram: 'https://instagram.com/maisonexample',
  },
  
  settings: {
    currency: 'EUR',
    timezone: 'Europe/Zagreb',
    defaultLocale: 'en',
    supportedLocales: ['en', 'hr'], // Defaulting to en and hr for the starter MVP
    bookingEnabled: true,
  },

  seo: {
    title: {
      en: 'Maison Example | Fine Dining in Zagreb',
      hr: 'Maison Example | Fine Dining u Zagrebu',
      hu: 'Maison Example | Fine Dining Zágrábban',
      de: 'Maison Example | Fine Dining in Zagreb'
    },
    description: {
      en: 'Modern European dining in the heart of Zagreb.',
      hr: 'Moderno europsko blagovanje u srcu Zagreba.',
      hu: 'Modern európai étkezés Zágráb szívében.',
      de: 'Moderne europäische Küche im Herzen von Zagreb.'
    }
  }
};
