import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/** Redirects `/` and un-prefixed paths to the visitor's best-matching locale. */
export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals, metadata files and static assets.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
