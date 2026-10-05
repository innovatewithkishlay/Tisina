import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

/**
 * - /admin: refreshes the staff member's Supabase session cookie.
 * - everything else: redirects `/` and un-prefixed paths to the best-matching locale.
 */
export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin' || request.nextUrl.pathname.startsWith('/admin/')) {
    let response = NextResponse.next({ request });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (list) => {
            list.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      });
      await supabase.auth.getUser();
    }
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }
  return intl(request);
}

export const config = {
  // Everything except API routes, Next internals, metadata files and static assets.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
