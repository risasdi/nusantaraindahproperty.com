import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import type { DbProperty } from "@/lib/properties";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

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
