import { createClient } from "@/lib/supabase/client";

export type AnalyticsEventName =
  | "PageView"
  | "ViewContent"
  | "Contact"
  | "Lead"
  | (string & {});

export interface TrackAnalyticsInput {
  event_name: AnalyticsEventName;
  page_path?: string;
  property_title?: string | null;
}

const UTM_STORAGE_KEY = "nip_utm_params";

interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

function isExcludedPath(path: string): boolean {
  return path.startsWith("/admin") || path.startsWith("/login");
}

function readUtmParams(): UtmParams {
  if (typeof window === "undefined") {
    return { utm_source: null, utm_medium: null, utm_campaign: null };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const urlSource = searchParams.get("utm_source")?.trim() || null;
  const urlMedium = searchParams.get("utm_medium")?.trim() || null;
  const urlCampaign = searchParams.get("utm_campaign")?.trim() || null;

  if (urlSource || urlMedium || urlCampaign) {
    const fresh: UtmParams = {
      utm_source: urlSource,
      utm_medium: urlMedium,
      utm_campaign: urlCampaign,
    };
    try {
      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // Ignore storage access errors in private browsing modes
    }
    return fresh;
  }

  try {
    const cached = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as Partial<UtmParams>;
      return {
        utm_source: parsed.utm_source ?? null,
        utm_medium: parsed.utm_medium ?? null,
        utm_campaign: parsed.utm_campaign ?? null,
      };
    }
  } catch {
    // Ignore storage/parse errors
  }

  return { utm_source: null, utm_medium: null, utm_campaign: null };
}

export function trackEvent({
  event_name,
  page_path,
  property_title,
}: TrackAnalyticsInput): void {
  if (typeof window === "undefined") return;

  const resolvedPath = page_path ?? window.location.pathname;
  if (!resolvedPath || isExcludedPath(resolvedPath)) return;

  const { utm_source, utm_medium, utm_campaign } = readUtmParams();

  // Fire-and-forget non-blocking insert (no .select() so anon INSERT-only RLS succeeds)
  void (async () => {
    try {
      const supabase = createClient();
      await supabase.from("analytics_events").insert([
        {
          event_name,
          page_path: resolvedPath,
          property_title: property_title?.trim() || null,
          utm_source,
          utm_medium,
          utm_campaign,
        },
      ]);
    } catch {
      // Never block or surface analytics errors to end users
    }
  })();
}
