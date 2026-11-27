import { redirect } from "next/navigation";
import AdminSettingsDashboard, {
  type SiteSettingsData,
  type TeamMemberRow,
} from "@/components/admin/AdminSettingsDashboard";
import { getCurrentAdminProfile } from "@/lib/admin-auth";
import { getRolePermissions } from "@/lib/rbac";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const profile = await getCurrentAdminProfile();

  if (!profile) {
    redirect("/admin/login");
  }

  if (profile.is_active === false) {
    redirect("/admin/login?error=inactive");
  }

  const permissions = getRolePermissions(profile.role);
  if (!permissions.canAccessSettings) {
    redirect("/admin");
  }

  const supabase = await createClient();

  const [usersRes, settingsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, role, is_active, created_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  const rawSettings = settingsRes.data as Partial<SiteSettingsData> | null;
  const initialSettings: SiteSettingsData = {
    id: 1,
    company_name:
      rawSettings?.company_name ?? DEFAULT_SITE_SETTINGS.company_name,
    whatsapp_number:
      rawSettings?.whatsapp_number ?? DEFAULT_SITE_SETTINGS.whatsapp_number,
    office_address:
      rawSettings?.office_address ?? DEFAULT_SITE_SETTINGS.office_address,
    operating_hours:
      rawSettings?.operating_hours ?? DEFAULT_SITE_SETTINGS.operating_hours,
    kpr_interest_rate:
      rawSettings?.kpr_interest_rate !== undefined &&
      rawSettings?.kpr_interest_rate !== null
        ? Number(rawSettings.kpr_interest_rate)
        : DEFAULT_SITE_SETTINGS.kpr_interest_rate,
    instagram_url:
      rawSettings?.instagram_url ?? DEFAULT_SITE_SETTINGS.instagram_url,
    tiktok_url: rawSettings?.tiktok_url ?? DEFAULT_SITE_SETTINGS.tiktok_url,
  };

  return (
    <AdminSettingsDashboard
      currentUserId={profile.id}
      initialUsers={(usersRes.data as TeamMemberRow[] | null) ?? []}
      initialUsersError={usersRes.error?.message ?? null}
      initialSettings={initialSettings}
      initialSettingsError={settingsRes.error?.message ?? null}
    />
  );
}
