// lib/supabase/server-client.ts
// Creates a Supabase client scoped to a specific user's JWT.
// RLS policies are enforced — use this for user-facing data reads.
// Use the service-role client (lib/supabase/client.ts) only for admin operations.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Create a Supabase client authenticated as a specific user via their JWT.
 * This enforces RLS — the user can only see their own data.
 */
export function createUserClient(userToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Create an anonymous Supabase client (no user context).
 * Use for public data that doesn't require authentication.
 */
export function createAnonClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
