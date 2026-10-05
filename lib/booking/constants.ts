/** Option lists shared by the forms (client) and validation (server). Kept free of zod so it stays out of the browser bundle. */
export const OCCASIONS = ['birthday', 'anniversary', 'business', 'celebration', 'other'] as const;
export const SEATINGS = ['no_preference', 'dining_room', 'chefs_counter', 'terrace'] as const;
export const CONTACT_SUBJECTS = ['general', 'private_dining', 'events', 'press', 'other'] as const;
