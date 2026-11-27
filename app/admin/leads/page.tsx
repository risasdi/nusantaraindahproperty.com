import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquareIcon } from "@/components/admin/AdminIcons";
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 sm:p-12 text-center max-w-2xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-[#063D36]/10 text-[#063D36] flex items-center justify-center mx-auto">
        <MessageSquareIcon className="w-7 h-7" />
      </div>
      <span className="inline-block mt-5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C8A15A]/15 text-[#9A722B]">
        Segera Hadir
      </span>
      <h2 className="text-2xl font-serif font-bold text-[#063D36] mt-3">
        Leads &amp; Pesan CRM
      </h2>
      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
        Modul ini sedang dipersiapkan untuk mencatat prospek calon pembeli,
        riwayat booking kunjungan, serta pesan masuk dari formulir website dan
        WhatsApp secara terpusat.
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
