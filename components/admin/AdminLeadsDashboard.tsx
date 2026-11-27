"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTimeWIB } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { useAdminActions } from "./AdminShell";
import {
  AwardIcon,
  CalendarIcon,
  SearchIcon,
  SparklesIcon,
  TrashIcon,
  UsersIcon,
  WhatsAppIcon,
} from "./AdminIcons";

export const LEAD_STATUSES = [
  "Baru",
  "Dihubungi",
  "Survei",
  "Closing",
  "Batal",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface DbLead {
  id: string;
  name: string;
  whatsapp: string;
  property_id: string | null;
  property_title: string | null;
  message: string | null;
  source: string | null;
  status: string;
  created_at: string;
  assigned_to?: string | null;
  sales_id?: string | null;
  user_id?: string | null;
}

function getStatusSelectClasses(status: string): string {
  switch (status) {
    case "Baru":
      return "bg-sky-50 text-sky-800 border-sky-200 focus:border-sky-400";
    case "Dihubungi":
      return "bg-amber-50 text-amber-800 border-amber-200 focus:border-amber-400";
    case "Survei":
      return "bg-indigo-50 text-indigo-800 border-indigo-200 focus:border-indigo-400";
    case "Closing":
      return "bg-emerald-50 text-emerald-800 border-emerald-200 focus:border-emerald-400";
    case "Batal":
      return "bg-rose-50 text-rose-800 border-rose-200 focus:border-rose-400";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function buildWhatsAppUrl(lead: DbLead): string {
  let digits = lead.whatsapp.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) {
    digits = `62${digits.slice(1)}`;
  } else if (digits.startsWith("8")) {
    digits = `62${digits}`;
  }

  const greeting = lead.property_title
    ? `Halo Bapak/Ibu ${lead.name}, terima kasih telah menghubungi Nusantara Indah Property terkait ${lead.property_title}. Apakah ada informasi lebih lanjut atau jadwal survei lokasi yang bisa kami bantu?`
    : `Halo Bapak/Ibu ${lead.name}, terima kasih telah menghubungi Nusantara Indah Property. Apakah ada informasi properti atau jadwal survei yang bisa kami bantu?`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(greeting)}`;
}

interface AdminLeadsDashboardProps {
  initialLeads: DbLead[];
  initialError: string | null;
}

export default function AdminLeadsDashboard({
  initialLeads,
  initialError,
}: AdminLeadsDashboardProps) {
  const router = useRouter();
  const { permissions } = useAdminActions();
  const { canUpdateLeads, canDeleteLeads } = permissions;

  const [leads, setLeads] = useState<DbLead[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DbLead | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(
    initialError
      ? {
          type: "error",
          message: `Gagal memuat data leads dari Supabase: ${initialError}`,
        }
      : null
  );

  useEffect(() => {
    if (!deleteTarget) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [deleteTarget]);

  const handleStatusChange = async (lead: DbLead, nextStatus: string) => {
    if (!canUpdateLeads) return;
    const prevStatus = lead.status;
    setUpdatingStatusId(lead.id);
    setLeads((prev) =>
      prev.map((item) =>
        item.id === lead.id ? { ...item, status: nextStatus } : item
      )
    );

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("leads")
        .update({ status: nextStatus })
        .eq("id", lead.id);

      if (error) throw error;

      setFeedback({
        type: "success",
        message: `Status lead "${lead.name}" diperbarui menjadi ${nextStatus}.`,
      });
      router.refresh();
    } catch (err) {
      // Revert optimistic update on failure
      setLeads((prev) =>
        prev.map((item) =>
          item.id === lead.id ? { ...item, status: prevStatus } : item
        )
      );
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Gagal memperbarui status lead.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !canDeleteLeads) return;
    setDeleting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) throw error;

      setLeads((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setFeedback({
        type: "success",
        message: `Lead "${deleteTarget.name}" berhasil dihapus.`,
      });
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Gagal menghapus data lead.";
      setFeedback({ type: "error", message: msg });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // KPI metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "Baru").length;
  const surveyLeads = leads.filter((l) => l.status === "Survei").length;
  const closingLeads = leads.filter((l) => l.status === "Closing").length;

  // Filtering
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredLeads = leads.filter((lead) => {
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    const matchesSearch =
      !normalizedQuery ||
      lead.name.toLowerCase().includes(normalizedQuery) ||
      lead.whatsapp.toLowerCase().includes(normalizedQuery) ||
      (lead.property_title ?? "").toLowerCase().includes(normalizedQuery) ||
      (lead.message ?? "").toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          role="status"
          className={`rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 border text-sm font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Row 1: 4 KPI Stat Cards */}
      <section
        aria-label="Ringkasan statistik leads"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
      >
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Leads
              </p>
              <p className="text-3xl font-serif font-bold text-[#063D36] mt-2">
                {totalLeads}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#063D36]/10 text-[#063D36] flex items-center justify-center shrink-0">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
            Seluruh calon buyer yang masuk dari website
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Leads Baru
              </p>
              <p className="text-3xl font-serif font-bold text-sky-700 mt-2">
                {newLeads}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
              <SparklesIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
            Menunggu respon pertama tim marketing
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Jadwal Survei
              </p>
              <p className="text-3xl font-serif font-bold text-indigo-700 mt-2">
                {surveyLeads}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
            Calon pembeli dalam tahap survei lokasi
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Closing
              </p>
              <p className="text-3xl font-serif font-bold text-emerald-700 mt-2">
                {closingLeads}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <AwardIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
            Transaksi berhasil ditutup
          </p>
        </div>
      </section>

      {/* Row 2: Leads CRM Table */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-serif font-bold text-[#063D36]">
                Daftar Leads &amp; Pesan Masuk
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                {filteredLeads.length} lead
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau minat calon buyer, perbarui status follow-up, dan hubungi
              langsung via WhatsApp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                placeholder="Cari nama, WA, atau properti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#C8A15A] focus:ring-4 focus:ring-[#C8A15A]/15 transition"
              />
            </div>

            {/* Status Filter */}
            <select
              aria-label="Filter status leads"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-[#C8A15A] focus:ring-4 focus:ring-[#C8A15A]/15 transition"
            >
              <option value="all">Semua Status ({totalLeads})</option>
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status} ({leads.filter((l) => l.status === status).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-5 font-semibold">Tanggal</th>
                <th className="py-3.5 px-4 font-semibold">Nama &amp; No. WA</th>
                <th className="py-3.5 px-4 font-semibold">Minat Properti</th>
                <th className="py-3.5 px-4 font-semibold">Pesan</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 px-6 text-center text-slate-500"
                  >
                    <p className="font-medium text-slate-700">
                      {leads.length === 0
                        ? "Belum ada leads yang masuk"
                        : "Tidak ada leads yang cocok dengan filter"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {leads.length === 0
                        ? "Leads baru dari formulir Homepage dan halaman Detail Properti akan otomatis muncul di sini."
                        : "Coba ubah kata kunci pencarian atau filter status."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isUpdating = updatingStatusId === lead.id;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/70 transition-colors align-top"
                    >
                      {/* Tanggal & Source */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <p className="text-xs font-semibold text-slate-700">
                          {formatDateTimeWIB(lead.created_at)}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-500">
                          {lead.source || "Website"}
                        </span>
                      </td>

                      {/* Nama & No. WA */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-900">
                          {lead.name}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {lead.whatsapp}
                        </p>
                      </td>

                      {/* Minat Properti */}
                      <td className="py-4 px-4">
                        <p className="font-medium text-[#063D36] min-w-[160px] max-w-[220px]">
                          {lead.property_title || "General Inquiry"}
                        </p>
                      </td>

                      {/* Pesan */}
                      <td className="py-4 px-4">
                        <p className="text-xs text-slate-600 leading-relaxed min-w-[200px] max-w-[300px] whitespace-pre-line">
                          {lead.message?.trim() || (
                            <span className="text-slate-400 italic">
                              Tidak ada pesan tambahan
                            </span>
                          )}
                        </p>
                      </td>

                      {/* Inline Status Select (editable) or Static Badge (read-only) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {canUpdateLeads ? (
                          <select
                            aria-label={`Ubah status ${lead.name}`}
                            value={lead.status}
                            disabled={isUpdating}
                            onChange={(e) =>
                              handleStatusChange(lead, e.target.value)
                            }
                            className={`h-9 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer disabled:opacity-60 focus:outline-none ${getStatusSelectClasses(
                              lead.status
                            )}`}
                          >
                            {LEAD_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-semibold ${getStatusSelectClasses(
                              lead.status
                            )}`}
                          >
                            {lead.status}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={buildWhatsAppUrl(lead)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] !text-white text-xs font-semibold transition shadow-xs"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5 text-white shrink-0" />
                            <span className="text-white">Chat WA</span>
                          </a>
                          {canDeleteLeads && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(lead)}
                              title="Hapus lead"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition cursor-pointer"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-900/65 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi hapus lead"
        >
          <div className="flex min-h-full items-center justify-center px-4 py-8">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200">
              <h3 className="text-lg font-serif font-bold text-[#063D36]">
                Hapus Data Lead?
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Anda yakin ingin menghapus data lead atas nama{" "}
                <strong className="text-slate-900">{deleteTarget.name}</strong>?
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60 cursor-pointer"
                >
                  {deleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
