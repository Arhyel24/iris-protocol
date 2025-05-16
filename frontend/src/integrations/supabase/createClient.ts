import { getTokens } from '@civic/auth-web3/nextjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClientWithJWT = async (): Promise<SupabaseClient> => {
  if (supabaseClient) return supabaseClient;

  const tokens = await getTokens();
  const jwt = tokens?.accessToken;

  supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    }
  );

  return supabaseClient;
};
