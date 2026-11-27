import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

export interface SiteSettings {
  id: number;
  company_name: string;
  whatsapp_number: string;
  office_address: string;
  operating_hours: string;
  kpr_interest_rate: number;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
  ai_knowledge?: string | null;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 1,
  company_name: "Nusantara Indah Property",
  whatsapp_number: "6285121186505",
  office_address: "Bandung, Jawa Barat",
  operating_hours: "Senin - Minggu, 08.00 - 17.00 WIB",
  kpr_interest_rate: 5.5,
  instagram_url: "https://www.instagram.com/nusantaraindahproperty",
  tiktok_url: "https://www.tiktok.com/@nusantaraindahproperty",
  facebook_url: "https://www.facebook.com/share/1FEMa37atR/?mibextid=wwXIfr",
  ai_knowledge: "",
};

export function normalizeWhatsappNumber(phone: string | null | undefined): string {
  let digits = (phone ?? "").replace(/[^0-9]/g, "");
  if (!digits) return DEFAULT_SITE_SETTINGS.whatsapp_number;
  if (digits.startsWith("0")) {
    digits = `62${digits.slice(1)}`;
  } else if (digits.startsWith("8")) {
    digits = `62${digits}`;
  }
  return digits;
}

export function buildMarketingWhatsAppUrl(
  whatsappNumber: string | null | undefined,
  message?: string
): string {
  const digits = normalizeWhatsappNumber(whatsappNumber);
  if (!message) {
    return `https://wa.me/${digits}`;
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

interface RawSiteSettingsRow {
  id?: number;
  company_name?: string | null;
  whatsapp_number?: string | null;
  office_address?: string | null;
  operating_hours?: string | null;
  kpr_interest_rate?: number | string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  facebook_url?: string | null;
  ai_knowledge?: string | null;
}

async function querySiteSettings(noStore: boolean): Promise<SiteSettings> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return DEFAULT_SITE_SETTINGS;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        fetch: (input, init) =>
          fetch(
            input,
            noStore
              ? { ...init, cache: "no-store" }
              : { ...init, next: { revalidate: 60 } }
          ),
      },
    });

    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "id, company_name, whatsapp_number, office_address, operating_hours, kpr_interest_rate, instagram_url, tiktok_url, facebook_url, ai_knowledge"
      )
      .eq("id", 1)
      .single();

    if (error || !data) {
      return DEFAULT_SITE_SETTINGS;
    }

    const row = data as RawSiteSettingsRow;
    const parsedRate =
      row.kpr_interest_rate !== undefined && row.kpr_interest_rate !== null
        ? Number(row.kpr_interest_rate)
        : NaN;

    return {
      id: row.id ?? 1,
      company_name:
        row.company_name?.trim() || DEFAULT_SITE_SETTINGS.company_name,
      whatsapp_number: normalizeWhatsappNumber(row.whatsapp_number),
      office_address:
        row.office_address?.trim() || DEFAULT_SITE_SETTINGS.office_address,
      operating_hours:
        row.operating_hours?.trim() || DEFAULT_SITE_SETTINGS.operating_hours,
      kpr_interest_rate: Number.isFinite(parsedRate)
        ? parsedRate
        : DEFAULT_SITE_SETTINGS.kpr_interest_rate,
      // Preserve explicit empty string so clearing a URL hides the social icon
      instagram_url:
        row.instagram_url !== null && row.instagram_url !== undefined
          ? row.instagram_url.trim()
          : DEFAULT_SITE_SETTINGS.instagram_url,
      tiktok_url:
        row.tiktok_url !== null && row.tiktok_url !== undefined
          ? row.tiktok_url.trim()
          : DEFAULT_SITE_SETTINGS.tiktok_url,
      facebook_url:
        row.facebook_url !== null && row.facebook_url !== undefined
          ? row.facebook_url.trim()
          : DEFAULT_SITE_SETTINGS.facebook_url,
      ai_knowledge:
        row.ai_knowledge !== null && row.ai_knowledge !== undefined
          ? row.ai_knowledge.trim()
          : (DEFAULT_SITE_SETTINGS.ai_knowledge ?? ""),
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  return querySiteSettings(false);
});

export async function getFreshSiteSettings(): Promise<SiteSettings> {
  return querySiteSettings(true);
}
