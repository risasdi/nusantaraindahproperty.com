import { redirect } from "next/navigation";
import AdminLeadsDashboard, {
  type DbLead,
} from "@/components/admin/AdminLeadsDashboard";
import { getCurrentAdminProfile } from "@/lib/admin-auth";
import { getRolePermissions } from "@/lib/rbac";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const profile = await getCurrentAdminProfile();

  if (!profile) {
    redirect("/admin/login");
  }

  if (profile.is_active === false) {
    redirect("/admin/login?error=inactive");
  }

  const permissions = getRolePermissions(profile.role);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  let leads = (data as DbLead[] | null) ?? [];

  // For sales role, additionally scope to own leads if an ownership column exists
  // (works alongside Supabase RLS policies without failing if column is absent).
  if (permissions.ownLeadsOnly && leads.length > 0) {
    const hasOwnerColumn = leads.some(
      (row) =>
        "assigned_to" in row || "sales_id" in row || "user_id" in row
    );
    if (hasOwnerColumn) {
      leads = leads.filter(
        (row) =>
          row.assigned_to === profile.id ||
          row.sales_id === profile.id ||
          row.user_id === profile.id
      );
    }
  }

  return (
    <AdminLeadsDashboard
      initialLeads={leads}
      initialError={error?.message ?? null}
    />
  );
}
