import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** The browser client. Uses the publishable key; row level security decides access. */
export function supabase(): SupabaseClient {
  client ??= createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
  );
  return client;
}
