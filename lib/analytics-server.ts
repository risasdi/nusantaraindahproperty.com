import { createClient } from "@/lib/supabase/server";
import type { AnalyticsEventRow } from "@/components/admin/AdminAnalyticsOverview";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function getAdminAnalyticsOverviewData(): Promise<{
  events: AnalyticsEventRow[];
  error: string | null;
  referenceTimestamp: number;
}> {
  const referenceTimestamp = Date.now();
  const thirtyDaysAgoIso = new Date(
    referenceTimestamp - THIRTY_DAYS_MS
  ).toISOString();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("analytics_events")
    .select(
      "id, event_name, page_path, property_title, utm_source, created_at"
    )
    .gte("created_at", thirtyDaysAgoIso)
    .order("created_at", { ascending: true });

  return {
    events: (data as AnalyticsEventRow[] | null) ?? [],
    error: error?.message ?? null,
    referenceTimestamp,
  };
}
