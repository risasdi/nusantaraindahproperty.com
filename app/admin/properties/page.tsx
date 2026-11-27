import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import type { DbProperty } from "@/lib/properties";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface AdminPropertiesPageProps {
  searchParams: Promise<{ new?: string | string[] }>;
}

export default async function AdminPropertiesPage({
  searchParams,
}: AdminPropertiesPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const openNew =
    params.new === "1" ||
    (Array.isArray(params.new) && params.new[0] === "1");

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminDashboard
      initialProperties={(data as DbProperty[] | null) ?? []}
      initialError={error?.message ?? null}
      showKpiCards={false}
      autoOpenCreate={openNew}
    />
  );
}
