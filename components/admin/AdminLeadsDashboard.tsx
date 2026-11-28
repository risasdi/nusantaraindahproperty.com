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
      return "bg-sky-500/15 text-sky-200 border-sky-400/35 focus:border-sky-300";
    case "Dihubungi":
      return "bg-amber-500/15 text-amber-200 border-amber-400/35 focus:border-amber-300";
    case "Survei":
      return "bg-indigo-500/15 text-indigo-200 border-indigo-400/35 focus:border-indigo-300";
    case "Closing":
      return "bg-emerald-500/15 text-emerald-200 border-emerald-400/35 focus:border-emerald-300";
    case "Batal":
      return "bg-rose-500/15 text-rose-200 border-rose-400/35 focus:border-rose-300";
    default:
      return "bg-white/[0.06] text-white/80 border-white/15";
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

  // Lock body scroll & close modal on Escape key
  useEffect(() => {
    if (!deleteTarget) return;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) {
        setDeleteTarget(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteTarget, deleting]);

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
              ? "bg-emerald-500/15 border-emerald-400/35 text-emerald-100"
              : "bg-rose-500/15 border-rose-400/35 text-rose-100"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold opacity-80 hover:opacity-100 cursor-pointer shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Row 1: 4 Dark Glass KPI Stat Cards */}
      <section
        aria-label="Ringkasan statistik leads"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
      >
        <div className="bg-[#0B1513] rounded-2xl p-5 border border-[#C8A15A]/18 hover:border-[#C8A15A]/38 transition">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
                Total Leads
              </p>
              <p className="text-3xl font-sans font-bold text-white mt-2">
                {totalLeads}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#C8A15A]/15 border border-[#C8A15A]/30 text-[#C8A15A] flex items-center justify-center shrink-0">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-white/50 mt-3 pt-3 border-t border-white/10">
            Seluruh calon buyer yang masuk dari website
          </p>
        </div>

        <div className="bg-[#0B1513] rounded-2xl p-5 border border-[#C8A15A]/18 hover:border-[#C8A15A]/38 transition">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
                Leads Baru
              </p>
              <p className="text-3xl font-sans font-bold text-sky-400 mt-2">
                {newLeads}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-400/25 text-sky-300 flex items-center justify-center shrink-0">
              <SparklesIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-white/50 mt-3 pt-3 border-t border-white/10">
            Menunggu respon pertama tim marketing
          </p>
        </div>

        <div className="bg-[#0B1513] rounded-2xl p-5 border border-[#C8A15A]/18 hover:border-[#C8A15A]/38 transition">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
                Jadwal Survei
              </p>
              <p className="text-3xl font-sans font-bold text-indigo-300 mt-2">
                {surveyLeads}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-white/50 mt-3 pt-3 border-t border-white/10">
            Calon pembeli dalam tahap survei lokasi
          </p>
        </div>

        <div className="bg-[#0B1513] rounded-2xl p-5 border border-[#C8A15A]/18 hover:border-[#C8A15A]/38 transition">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
                Closing
              </p>
              <p className="text-3xl font-sans font-bold text-emerald-400 mt-2">
                {closingLeads}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 flex items-center justify-center shrink-0">
              <AwardIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-white/50 mt-3 pt-3 border-t border-white/10">
            Transaksi berhasil ditutup
          </p>
        </div>
      </section>

      {/* Row 2: Dark Leads CRM Table */}
      <section className="bg-[#0B1513] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-sans text-lg font-bold text-white">
                Daftar Leads &amp; Pesan Masuk
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C8A15A]/15 text-[#E6C98F] border border-[#C8A15A]/30">
                {filteredLeads.length} lead
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Pantau minat calon buyer, perbarui status follow-up, dan hubungi
              langsung via WhatsApp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <SearchIcon className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                placeholder="Cari nama, WA, atau properti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-white/15 bg-[#070D0C] text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#C8A15A] focus:ring-2 focus:ring-[#C8A15A]/20 transition"
              />
            </div>

            {/* Status Filter */}
            <select
              aria-label="Filter status leads"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3.5 rounded-xl border border-white/15 bg-[#070D0C] text-sm font-medium text-white focus:outline-none focus:border-[#C8A15A] focus:ring-2 focus:ring-[#C8A15A]/20 transition cursor-pointer"
            >
              <option value="all" className="bg-[#0A1412] text-white">
                Semua Status ({totalLeads})
              </option>
              {LEAD_STATUSES.map((status) => (
                <option
                  key={status}
                  value={status}
                  className="bg-[#0A1412] text-white"
                >
                  {status} ({leads.filter((l) => l.status === status).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F1D1A] border-b border-white/10 text-white/55 text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-5 font-semibold">Tanggal</th>
                <th className="py-3.5 px-4 font-semibold">Nama &amp; No. WA</th>
                <th className="py-3.5 px-4 font-semibold">Minat Properti</th>
                <th className="py-3.5 px-4 font-semibold">Pesan</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8 text-sm">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 px-6 text-center text-white/55"
                  >
                    <p className="font-semibold text-white/85">
                      {leads.length === 0
                        ? "Belum ada leads yang masuk"
                        : "Tidak ada leads yang cocok dengan filter"}
                    </p>
                    <p className="text-xs text-white/50 mt-1">
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
                      className="hover:bg-white/[0.03] transition-colors align-top"
                    >
                      {/* Tanggal & Source */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <p className="text-xs font-semibold text-white/85">
                          {formatDateTimeWIB(lead.created_at)}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-semibold text-white/60">
                          {lead.source || "Website"}
                        </span>
                      </td>

                      {/* Nama & No. WA */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-semibold text-white">{lead.name}</p>
                        <p className="text-xs text-[#C8A15A] font-mono mt-0.5">
                          {lead.whatsapp}
                        </p>
                      </td>

                      {/* Minat Properti */}
                      <td className="py-4 px-4">
                        <p className="font-medium text-white/90 min-w-[160px] max-w-[220px]">
                          {lead.property_title || "General Inquiry"}
                        </p>
                      </td>

                      {/* Pesan */}
                      <td className="py-4 px-4">
                        <p className="text-xs text-white/70 leading-relaxed min-w-[200px] max-w-[300px] whitespace-pre-line">
                          {lead.message?.trim() || (
                            <span className="text-white/35 italic">
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
                              <option
                                key={status}
                                value={status}
                                className="bg-[#0A1412] text-white"
                              >
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] !text-white text-xs font-semibold transition"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5 text-white shrink-0" />
                            <span className="text-white">Chat WA</span>
                          </a>
                          {canDeleteLeads && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(lead)}
                              title="Hapus lead"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/15 border border-rose-400/25 text-rose-200 text-xs font-semibold hover:bg-rose-500/25 transition cursor-pointer"
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

      {/* Delete Confirmation Modal (Escape + backdrop click to close) */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi hapus lead"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div className="flex min-h-full items-center justify-center px-4 py-8">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0B1513] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[#C8A15A]/25"
            >
              <h3 className="font-sans text-lg font-bold text-white">
                Hapus Data Lead?
              </h3>
              <p className="text-sm text-white/65 mt-2 leading-relaxed">
                Anda yakin ingin menghapus data lead atas nama{" "}
                <strong className="text-white">{deleteTarget.name}</strong>?
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-full border border-white/15 bg-white/[0.04] text-sm font-semibold text-white/80 hover:bg-white/[0.1] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-5 py-2 rounded-full bg-rose-600 text-white text-sm font-bold hover:bg-rose-500 disabled:opacity-60 cursor-pointer"
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
