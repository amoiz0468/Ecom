import { createClient, SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as unknown as {
  supabaseAdminClient?: SupabaseClient;
};

/**
 * Server-only Supabase client using the service-role (secret) key.
 * It bypasses Row Level Security, so it must never be imported into client
 * components and the key must never use a NEXT_PUBLIC_ variable name.
 *
 * There are deliberately NO hard-coded fallbacks: a missing or wrong key must
 * fail loudly instead of silently running with the public key.
 */
export function createAdminClient(): SupabaseClient {
  if (globalForSupabase.supabaseAdminClient) {
    return globalForSupabase.supabaseAdminClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  if (key.startsWith("sb_publishable_") || key.includes("...")) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY must be the secret/service_role key, not the publishable key."
    );
  }

  globalForSupabase.supabaseAdminClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return globalForSupabase.supabaseAdminClient;
}
