import { redirect } from "next/navigation";
import AdminLeadsDashboard, {
  type DbLead,
} from "@/components/admin/AdminLeadsDashboard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminLeadsDashboard
      initialLeads={(data as DbLead[] | null) ?? []}
      initialError={error?.message ?? null}
    />
  );
}
