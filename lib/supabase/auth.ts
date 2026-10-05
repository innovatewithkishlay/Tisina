import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Cookie-based Supabase client for the admin panel. It acts as the signed-in
 * staff member, so every query is limited by Row Level Security (see
 * supabase/migrations/*_admin.sql). Only the publishable key is used here.
 */
export async function getAuthClient(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: the proxy refreshes the session instead.
        }
      },
    },
  });
}

export interface AdminSession {
  client: SupabaseClient;
  user: User;
}

/** The signed-in admin, or a redirect to the login page. */
export async function requireAdmin(): Promise<AdminSession> {
  const client = await getAuthClient();
  if (!client) redirect('/admin/login?e=config');
  const { data } = await client.auth.getUser();
  if (!data.user) redirect('/admin/login');
  const { data: isAdmin } = await client.rpc('is_admin');
  if (!isAdmin) redirect('/admin/login?e=forbidden');
  return { client, user: data.user };
}
