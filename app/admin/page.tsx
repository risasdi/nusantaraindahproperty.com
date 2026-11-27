import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getCurrentAdminProfile } from "@/lib/admin-auth";
import type { DbProperty } from "@/lib/properties";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const profile = await getCurrentAdminProfile();

  if (!profile) {
    redirect("/admin/login");
  }

  if (profile.is_active === false) {
    redirect("/admin/login?error=inactive");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminDashboard
      initialProperties={(data as DbProperty[] | null) ?? []}
      initialError={error?.message ?? null}
      showKpiCards
    />
  );
}
