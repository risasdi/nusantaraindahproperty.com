import { redirect } from "next/navigation";
import Link from "next/link";
import { SettingsIcon } from "@/components/admin/AdminIcons";
import { getCurrentAdminProfile } from "@/lib/admin-auth";
import { getRolePermissions } from "@/lib/rbac";

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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 sm:p-12 text-center max-w-2xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-[#063D36]/10 text-[#063D36] flex items-center justify-center mx-auto">
        <SettingsIcon className="w-7 h-7" />
      </div>
      <span className="inline-block mt-5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C8A15A]/15 text-[#9A722B]">
        Segera Hadir
      </span>
      <h2 className="text-2xl font-serif font-bold text-[#063D36] mt-3">
        Pengaturan Website &amp; Akun
      </h2>
      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
        Halaman pengaturan profil perusahaan, nomor WhatsApp marketing, info
        suku bunga KPR, dan manajemen pengguna admin akan segera tersedia di
        sini.
      </p>
      <div className="mt-6">
        <Link
          href="/admin"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#063D36] text-white text-sm font-semibold hover:bg-[#052e29] transition"
        >
          Kembali ke Overview
        </Link>
      </div>
    </div>
  );
}
