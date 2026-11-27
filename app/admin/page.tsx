import { redirect } from "next/navigation";
import AdminAnalyticsOverview from "@/components/admin/AdminAnalyticsOverview";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getCurrentAdminProfile } from "@/lib/admin-auth";
import { getAdminAnalyticsOverviewData } from "@/lib/analytics-server";
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

  const [propertiesRes, analyticsData] = await Promise.all([
    supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false }),
    getAdminAnalyticsOverviewData(),
  ]);

  return (
    <div className="space-y-8">
      <AdminAnalyticsOverview
        initialEvents={analyticsData.events}
        initialError={analyticsData.error}
        referenceTimestamp={analyticsData.referenceTimestamp}
      />

      <AdminDashboard
        initialProperties={(propertiesRes.data as DbProperty[] | null) ?? []}
        initialError={propertiesRes.error?.message ?? null}
        showKpiCards
      />
    </div>
  );
}
