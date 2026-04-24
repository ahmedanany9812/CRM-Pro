import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./constants";

export const createClient = () => {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
};

export const supabase = createClient();
