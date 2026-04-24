import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "./constants";

export const createClient = () => {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
};

export const supabaseAdmin = createClient();

export default supabaseAdmin;
