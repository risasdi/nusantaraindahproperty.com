import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getCurrentAdminProfile } from "@/lib/admin-auth";
import type { DbProperty } from "@/lib/properties";
import { getRolePermissions } from "@/lib/rbac";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface AdminPropertiesPageProps {
  searchParams: Promise<{ new?: string | string[] }>;
}

export default async function AdminPropertiesPage({
  searchParams,
}: AdminPropertiesPageProps) {
  const profile = await getCurrentAdminProfile();

  if (!profile) {
    redirect("/admin/login");
  }

  if (profile.is_active === false) {
    redirect("/admin/login?error=inactive");
  }

  const permissions = getRolePermissions(profile.role);
  const params = await searchParams;
  const openNew =
    params.new === "1" ||
    (Array.isArray(params.new) && params.new[0] === "1");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminDashboard
      initialProperties={(data as DbProperty[] | null) ?? []}
      initialError={error?.message ?? null}
      showKpiCards={false}
      autoOpenCreate={openNew && permissions.canManageProperties}
    />
  );
}
