import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Module-level singleton — ONE client for the entire browser session.
// Prevents useCallback/useEffect dependency loops caused by a new client
// object reference on every component render.
let _client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (!_client) {
    _client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}
