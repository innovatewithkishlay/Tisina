import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase clients.
 *
 * The website has no user accounts, so there is no cookie/session handling:
 * the public client uses the publishable (anon) key and can only do what RLS
 * allows — read public content and call the booking/contact RPCs.
 *
 * Nothing in this file is imported by client components.
 */

let publicClient: SupabaseClient | null | undefined;

export function getPublicClient(): SupabaseClient | null {
  if (publicClient !== undefined) return publicClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  publicClient = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return publicClient;
}

let adminClient: SupabaseClient | null | undefined;

/**
 * Service-role client, only available when SUPABASE_SERVICE_ROLE_KEY is set.
 * Used for bookkeeping the public role is not allowed to do (recording whether
 * the notification email was delivered). Never expose this key to the browser.
 */
export function getAdminClient(): SupabaseClient | null {
  if (adminClient !== undefined) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  adminClient = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return adminClient;
}
