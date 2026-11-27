import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { normalizeAdminRole, type UserProfile } from "@/lib/rbac";

interface RawProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  is_active: boolean | null;
}

export async function getCurrentAdminProfile(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    const row = data as RawProfileRow | null;

    return {
      id: user.id,
      email: row?.email ?? user.email ?? "",
      full_name: row?.full_name ?? null,
      role: normalizeAdminRole(row?.role),
      is_active: row?.is_active ?? true,
    };
  } catch {
    return null;
  }
}
