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
  /** Licensed photography (see README → Photography credits). */
  hero: { src: '/images/photo/truffle-pasta.jpg', width: 2000, height: 1121 },
  signature: { src: '/images/photo/octopus.jpg', width: 1333, height: 2000 },
  regions: {
    istra: { src: '/images/photo/truffle-pasta.jpg', width: 2000, height: 1121 },
    dalmacija: { src: '/images/photo/beef-stew.jpg', width: 2000, height: 1333 },
    jadran: { src: '/images/photo/tuna-tartare.jpg', width: 2000, height: 1335 },
  },
  room: { src: '/images/photo/room-candles.jpg', width: 2000, height: 1333 },
  gallery: {
    candles: { src: '/images/photo/room-candles.jpg', width: 2000, height: 1333 },
    window: { src: '/images/photo/room-evening.jpg', width: 1335, height: 2000 },
    wine: { src: '/images/photo/wine-pour.jpg', width: 1333, height: 2000 },
    linen: { src: '/images/photo/private-room.jpg', width: 2000, height: 1500 },
    dessert: { src: '/images/photo/panna-cotta.jpg', width: 2000, height: 1121 },
    garden: { src: '/images/photo/burrata.jpg', width: 1024, height: 683 },
  },
  story: {
    one: { src: '/images/photo/chef-plating.jpg', width: 2000, height: 1335 },
    two: { src: '/images/photo/wine-decanter.jpg', width: 1333, height: 2000 },
    band: { src: '/images/photo/room-candles.jpg', width: 2000, height: 1333 },
  },
  visit: { src: '/images/photo/private-room.jpg', width: 2000, height: 1500 },
  booking: { src: '/images/photo/wine-pour.jpg', width: 1333, height: 2000 },
  /** Opening photograph for each menu course (by category slug). */
  courses: {
    'to-begin': '/images/photo/room-candles.jpg',
    starters: '/images/photo/chef-plating.jpg',
    pasta: '/images/kitchen/dough.jpg',
    'from-the-oven': '/images/kitchen/fire.jpg',
    'from-the-sea': '/images/photo/langoustines.jpg',
    'from-the-land': '/images/photo/beef-medallion.jpg',
    garden: '/images/photo/chef-sauce.jpg',
    desserts: '/images/photo/room-evening.jpg',
    tasting: '/images/photo/private-room.jpg',
    wine: '/images/photo/wine-decanter.jpg',
  } as Record<string, string>,
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
