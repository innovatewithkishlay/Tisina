/**
 * Every photograph the website uses, by role. Swap files here when forking —
 * components reference roles, never file paths. Alt texts live in
 * messages/<locale>.json so they are translated.
 *
 * Dish photos used by the menu live on the menu items themselves
 * (menu_items.image in Supabase / content/restaurant.ts).
 */
export const images = {
  /** Stills from the kitchen film (public/media), black and white. */
  kitchen: {
    poster: { src: '/images/kitchen/poster.jpg', width: 1920, height: 1080 },
    chefs: { src: '/images/kitchen/chefs.jpg', width: 1920, height: 1080 },
    dough: { src: '/images/kitchen/dough.jpg', width: 1920, height: 1080 },
    fire: { src: '/images/kitchen/fire.jpg', width: 1920, height: 1080 },
    hands: { src: '/images/kitchen/hands.jpg', width: 1920, height: 1080 },
  },
  hero: { src: '/images/dishes/fuzi-truffle.jpg', width: 1024, height: 1024 },
  signature: { src: '/images/dishes/pasticada.jpg', width: 1024, height: 1024 },
  regions: {
    istra: { src: '/images/dishes/fuzi-truffle.jpg', width: 1024, height: 1024 },
    dalmacija: { src: '/images/dishes/pasticada.jpg', width: 1024, height: 1024 },
    jadran: { src: '/images/dishes/tuna-tartare.jpg', width: 1024, height: 1024 },
  },
  room: { src: '/images/atmosphere/candles.jpg', width: 1024, height: 360 },
  gallery: {
    candles: { src: '/images/atmosphere/candles.jpg', width: 1024, height: 360 },
    window: { src: '/images/atmosphere/window.jpg', width: 1024, height: 392 },
    wine: { src: '/images/atmosphere/wine.jpg', width: 728, height: 840 },
    linen: { src: '/images/atmosphere/linen.jpg', width: 800, height: 928 },
    dessert: { src: '/images/dishes/panna-cotta.jpg', width: 1024, height: 1024 },
    garden: { src: '/images/dishes/burrata.jpg', width: 1024, height: 1024 },
  },
  story: {
    one: { src: '/images/dishes/burrata.jpg', width: 1024, height: 1024 },
    two: { src: '/images/dishes/panna-cotta.jpg', width: 1024, height: 1024 },
    band: { src: '/images/atmosphere/window.jpg', width: 1024, height: 392 },
  },
  visit: { src: '/images/atmosphere/stone-window.jpg', width: 900, height: 530 },
  booking: { src: '/images/atmosphere/white-wine.jpg', width: 768, height: 800 },
} as const;

/** Video. Re-encode with ffmpeg when replacing (see README → Media). */
export const videos = {
  hero: {
    poster: '/images/kitchen/poster.jpg',
    sources: [
      { src: '/media/hero-540.mp4', media: '(max-width: 768px)' },
      { src: '/media/hero-1080.mp4' },
    ],
  },
  fire: { poster: '/images/kitchen/fire.jpg', src: '/media/fire-loop.mp4' },
} as const;
