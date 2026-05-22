import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type AdminProfile = {
  id: string;
  email: string;
  role: string;
};

function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Supabase public env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return { url, anon };
}

export async function getAuthenticatedAdmin() {
  const { url, anon } = getSupabasePublicEnv();
  const cookieStore = await cookies();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: Array<{ name: string; value: string; options?: Parameters<(typeof cookieStore)["set"]>[2] }>
      ) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      }
    }
  });

  const { data: userResult, error: userError } = await supabase.auth.getUser();
  if (userError || !userResult.user) {
    return null;
  }

  const { data: admin, error: adminError } = await supabase.from("admins").select("id, email, role").eq("id", userResult.user.id).single();
  if (adminError || !admin) {
    return null;
  }

  return {
    user: userResult.user,
    admin: admin as AdminProfile
  };
}
