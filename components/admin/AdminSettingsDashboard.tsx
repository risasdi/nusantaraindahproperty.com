"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ADMIN_ROLES,
  getRoleBadgeMeta,
  normalizeAdminRole,
  type AdminRole,
} from "@/lib/rbac";
import { createClient } from "@/lib/supabase/client";
import {
  CloseIcon,
  EditIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "./AdminIcons";

export interface TeamMemberRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at?: string;
}

export interface SiteSettingsData {
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

interface AdminSettingsDashboardProps {
  currentUserId: string;
  initialUsers: TeamMemberRow[];
  initialUsersError: string | null;
  initialSettings: SiteSettingsData;
  initialSettingsError: string | null;
}

type SettingsTab = "team" | "website";

interface CreateFormState {
  full_name: string;
  email: string;
  password: string;
  role: AdminRole;
}

interface EditFormState {
  id: string;
  full_name: string;
  email: string;
  password: string;
  role: AdminRole;
  is_active: boolean;
}

const EMPTY_CREATE_FORM: CreateFormState = {
  full_name: "",
  email: "",
  password: "",
  role: "sales",
};

const INPUT_CLASS =
  "w-full h-11 px-3.5 rounded-xl border border-white/15 bg-[#070D0C] text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#C8A15A] focus:ring-2 focus:ring-[#C8A15A]/20 transition";

const TEXTAREA_CLASS =
  "w-full p-3.5 rounded-xl border border-white/15 bg-[#070D0C] text-sm text-white placeholder:text-white/35 leading-relaxed focus:outline-none focus:border-[#C8A15A] focus:ring-2 focus:ring-[#C8A15A]/20 transition resize-y";

export default function AdminSettingsDashboard({
  currentUserId,
  initialUsers,
  initialUsersError,
  initialSettings,
  initialSettingsError,
}: AdminSettingsDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("team");

  // --- Team Management State ---
  const [users, setUsers] = useState<TeamMemberRow[]>(initialUsers);
  const [userSearch, setUserSearch] = useState("");
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [teamFeedback, setTeamFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(
    initialUsersError
      ? {
          type: "error",
          message: `Gagal memuat daftar user: ${initialUsersError}`,
        }
      : null
  );

  // Add Member Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateFormState>(EMPTY_CREATE_FORM);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit / Reset Password Modal
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // --- Website Settings State ---
  const [siteForm, setSiteForm] = useState({
    company_name: initialSettings.company_name,
    whatsapp_number: initialSettings.whatsapp_number,
    office_address: initialSettings.office_address,
    operating_hours: initialSettings.operating_hours,
    kpr_interest_rate: String(initialSettings.kpr_interest_rate),
    instagram_url: initialSettings.instagram_url,
    tiktok_url: initialSettings.tiktok_url,
    facebook_url: initialSettings.facebook_url,
    ai_knowledge: initialSettings.ai_knowledge ?? "",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(
    initialSettingsError
      ? {
          type: "error",
          message: `Catatan pengaturan website: ${initialSettingsError}`,
        }
      : null
  );

  // Lock body scroll & close modals via Escape key
  useEffect(() => {
    if (!isAddModalOpen && !editForm) return;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isAddModalOpen && !creatingUser) {
        setIsAddModalOpen(false);
      } else if (editForm && !updatingUser) {
        setEditForm(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAddModalOpen, editForm, creatingUser, updatingUser]);

  const openAddModal = () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (member: TeamMemberRow) => {
    setEditForm({
      id: member.id,
      full_name: member.full_name ?? "",
      email: member.email,
      password: "",
      role: normalizeAdminRole(member.role),
      is_active: member.is_active,
    });
    setEditError(null);
  };

  const handleCreateMember = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateError(null);
    setCreatingUser(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const json = (await res.json()) as {
        user?: TeamMemberRow;
        error?: string;
      };

      if (!res.ok || !json.user) {
        setCreateError(json.error ?? "Gagal menambahkan anggota tim.");
        return;
      }

      setUsers((prev) => [...prev, json.user!]);
      setIsAddModalOpen(false);
      setTeamFeedback({
        type: "success",
        message: `Akun "${json.user.full_name || json.user.email}" berhasil dibuat.`,
      });
      router.refresh();
    } catch {
      setCreateError("Terjadi kesalahan jaringan saat membuat akun.");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleQuickUpdate = async (
    member: TeamMemberRow,
    patch: { role?: AdminRole; is_active?: boolean }
  ) => {
    setBusyUserId(member.id);
    setTeamFeedback(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, ...patch }),
      });

      const json = (await res.json()) as {
        user?: TeamMemberRow;
        error?: string;
      };

      if (!res.ok || !json.user) {
        setTeamFeedback({
          type: "error",
          message: json.error ?? "Gagal memperbarui data user.",
        });
        return;
      }

      setUsers((prev) =>
        prev.map((item) => (item.id === member.id ? json.user! : item))
      );
      setTeamFeedback({
        type: "success",
        message: `Data "${json.user.full_name || json.user.email}" berhasil diperbarui.`,
      });
      router.refresh();
    } catch {
      setTeamFeedback({
        type: "error",
        message: "Terjadi kesalahan jaringan saat memperbarui user.",
      });
    } finally {
      setBusyUserId(null);
    }
  };

  const handleSaveEditModal = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editForm) return;
    setEditError(null);
    setUpdatingUser(true);

    const isSelf = editForm.id === currentUserId;

    try {
      const payload: Record<string, unknown> = {
        id: editForm.id,
        full_name: editForm.full_name.trim(),
        email: editForm.email.trim().toLowerCase(),
      };

      if (!isSelf) {
        payload.role = editForm.role;
        payload.is_active = editForm.is_active;
      }

      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as {
        user?: TeamMemberRow;
        error?: string;
      };

      if (!res.ok || !json.user) {
        setEditError(json.error ?? "Gagal menyimpan perubahan user.");
        return;
      }

      setUsers((prev) =>
        prev.map((item) => (item.id === editForm.id ? json.user! : item))
      );
      setEditForm(null);
      setTeamFeedback({
        type: "success",
        message: editForm.password.trim()
          ? `Profil & password "${json.user.full_name || json.user.email}" berhasil diperbarui.`
          : `Profil "${json.user.full_name || json.user.email}" berhasil diperbarui.`,
      });
      router.refresh();
    } catch {
      setEditError("Terjadi kesalahan jaringan saat memperbarui user.");
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleSaveSiteSettings = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSettingsFeedback(null);

    const parsedRate = parseFloat(siteForm.kpr_interest_rate);
    if (Number.isNaN(parsedRate) || parsedRate < 0) {
      setSettingsFeedback({
        type: "error",
        message: "Suku bunga KPR default harus berupa angka valid (misal: 5.5).",
      });
      return;
    }

    const cleanedWhatsapp = siteForm.whatsapp_number.replace(/[^0-9]/g, "");
    if (cleanedWhatsapp.length < 9) {
      setSettingsFeedback({
        type: "error",
        message:
          "Nomor WhatsApp marketing harus menggunakan format angka valid (misal: 6285121186505).",
      });
      return;
    }

    setSavingSettings(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("site_settings").upsert(
        {
          id: 1,
          company_name: siteForm.company_name.trim(),
          whatsapp_number: cleanedWhatsapp,
          office_address: siteForm.office_address.trim(),
          operating_hours: siteForm.operating_hours.trim(),
          kpr_interest_rate: parsedRate,
          instagram_url: siteForm.instagram_url.trim(),
          tiktok_url: siteForm.tiktok_url.trim(),
          facebook_url: siteForm.facebook_url.trim(),
          ai_knowledge: siteForm.ai_knowledge.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (error) {
        throw error;
      }

      setSiteForm((prev) => ({ ...prev, whatsapp_number: cleanedWhatsapp }));
      setSettingsFeedback({
        type: "success",
        message: "Pengaturan website berhasil disimpan ke Supabase.",
      });
      router.refresh();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Gagal menyimpan pengaturan website.";
      setSettingsFeedback({ type: "error", message: msg });
    } finally {
      setSavingSettings(false);
    }
  };

  const normalizedSearch = userSearch.trim().toLowerCase();
  const filteredUsers = users.filter(
    (u) =>
      !normalizedSearch ||
      (u.full_name ?? "").toLowerCase().includes(normalizedSearch) ||
      u.email.toLowerCase().includes(normalizedSearch) ||
      u.role.toLowerCase().includes(normalizedSearch)
  );

  return (
    <div className="space-y-6">
      {/* Dark Pill Tab Navigation */}
      <div className="bg-[#0B1513] rounded-full border border-white/12 p-1.5 inline-flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("team")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeTab === "team"
              ? "bg-[#C8A15A] text-[#070D0C]"
              : "text-white/70 hover:text-white hover:bg-white/[0.06]"
          }`}
        >
          <UsersIcon
            className={`w-4 h-4 ${
              activeTab === "team" ? "text-[#070D0C]" : "text-[#C8A15A]"
            }`}
          />
          <span>Manajemen Tim &amp; User</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === "team"
                ? "bg-[#070D0C]/15 text-[#070D0C]"
                : "bg-white/10 text-white/75"
            }`}
          >
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("website")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeTab === "website"
              ? "bg-[#C8A15A] text-[#070D0C]"
              : "text-white/70 hover:text-white hover:bg-white/[0.06]"
          }`}
        >
          <SettingsIcon
            className={`w-4 h-4 ${
              activeTab === "website" ? "text-[#070D0C]" : "text-[#C8A15A]"
            }`}
          />
          <span>Pengaturan Website</span>
        </button>
      </div>

      {/* TAB 1: MANAJEMEN TIM & USER */}
      {activeTab === "team" && (
        <div className="space-y-4">
          {teamFeedback && (
            <div
              role="status"
              className={`rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 border text-sm font-medium ${
                teamFeedback.type === "success"
                  ? "bg-emerald-500/15 border-emerald-400/35 text-emerald-100"
                  : "bg-rose-500/15 border-rose-400/35 text-rose-100"
              }`}
            >
              <span>{teamFeedback.message}</span>
              <button
                type="button"
                onClick={() => setTeamFeedback(null)}
                className="text-xs font-bold opacity-80 hover:opacity-100 cursor-pointer shrink-0"
              >
                Tutup
              </button>
            </div>
          )}

          <section className="bg-[#0B1513] rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="font-sans text-lg font-bold text-white">
                  Daftar Anggota Tim &amp; Akses Role
                </h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Kelola akun admin, sales, marketing, serta status aktif secara
                  langsung.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <SearchIcon className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    placeholder="Cari nama, email, atau role..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-white/15 bg-[#070D0C] text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#C8A15A] focus:ring-2 focus:ring-[#C8A15A]/20 transition"
                  />
                </div>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full bg-[#C8A15A] hover:bg-[#D9B56F] text-[#070D0C] text-xs sm:text-sm font-bold transition cursor-pointer shrink-0"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Tambah Anggota Tim</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0F1D1A] border-b border-white/10 text-white/55 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-5 font-semibold">Nama &amp; Email</th>
                    <th className="py-3.5 px-4 font-semibold">Role Akses</th>
                    <th className="py-3.5 px-4 font-semibold">Status Akun</th>
                    <th className="py-3.5 px-5 font-semibold text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8 text-sm">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-14 px-6 text-center text-white/55"
                      >
                        Tidak ada anggota tim yang cocok dengan pencarian Anda.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((member) => {
                      const isSelf = member.id === currentUserId;
                      const isBusy = busyUserId === member.id;
                      const normalizedRole = normalizeAdminRole(member.role);
                      const roleMeta = getRoleBadgeMeta(normalizedRole);
                      const displayName =
                        member.full_name?.trim() ||
                        member.email.split("@")[0] ||
                        "User";

                      return (
                        <tr
                          key={member.id}
                          className="hover:bg-white/[0.03] transition-colors"
                        >
                          {/* Nama & Email */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3 min-w-[220px]">
                              <span className="w-9 h-9 rounded-full bg-[#C8A15A]/18 border border-[#C8A15A]/40 text-[#E6C98F] text-xs font-bold flex items-center justify-center shrink-0">
                                {displayName.charAt(0).toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-white truncate">
                                    {displayName}
                                  </p>
                                  {isSelf && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C8A15A]/20 text-[#E6C98F] border border-[#C8A15A]/35">
                                      Anda
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-white/55 truncate">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Quick Role Dropdown */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {isSelf ? (
                              <span
                                title="Role akun Anda sendiri terkunci agar tidak kehilangan akses Super Admin"
                                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${roleMeta.badgeClass}`}
                              >
                                {roleMeta.label}
                              </span>
                            ) : (
                              <select
                                aria-label={`Ubah role ${displayName}`}
                                value={normalizedRole}
                                disabled={isBusy}
                                onChange={(e) =>
                                  handleQuickUpdate(member, {
                                    role: e.target.value as AdminRole,
                                  })
                                }
                                className="h-9 px-3 rounded-lg border border-white/15 bg-[#070D0C] text-xs font-semibold text-white focus:outline-none focus:border-[#C8A15A] cursor-pointer disabled:opacity-50"
                              >
                                {ADMIN_ROLES.map((roleOption) => (
                                  <option
                                    key={roleOption}
                                    value={roleOption}
                                    className="bg-[#0A1412] text-white"
                                  >
                                    {getRoleBadgeMeta(roleOption).label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>

                          {/* Active / Inactive Toggle */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <button
                              type="button"
                              disabled={isSelf || isBusy}
                              onClick={() =>
                                handleQuickUpdate(member, {
                                  is_active: !member.is_active,
                                })
                              }
                              title={
                                isSelf
                                  ? "Akun Super Admin yang sedang login tidak dapat dinonaktifkan"
                                  : member.is_active
                                    ? "Klik untuk menonaktifkan akun"
                                    : "Klik untuk mengaktifkan kembali akun"
                              }
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                                isSelf
                                  ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-inset ring-emerald-400/35 opacity-75 cursor-not-allowed"
                                  : member.is_active
                                    ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-inset ring-emerald-400/35 hover:bg-emerald-500/25 cursor-pointer"
                                    : "bg-rose-500/15 text-rose-200 ring-1 ring-inset ring-rose-400/35 hover:bg-rose-500/25 cursor-pointer"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  member.is_active
                                    ? "bg-emerald-400"
                                    : "bg-rose-400"
                                }`}
                              />
                              <span>
                                {member.is_active ? "Aktif" : "Nonaktif"}
                              </span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={() => openEditModal(member)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C8A15A]/15 border border-[#C8A15A]/30 text-[#E6C98F] text-xs font-semibold hover:bg-[#C8A15A]/25 transition cursor-pointer"
                            >
                              <EditIcon className="w-3.5 h-3.5" />
                              <span>Edit / Reset Password</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: PENGATURAN WEBSITE */}
      {activeTab === "website" && (
        <div className="space-y-4 w-full">
          {settingsFeedback && (
            <div
              role="status"
              className={`rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 border text-sm font-medium ${
                settingsFeedback.type === "success"
                  ? "bg-emerald-500/15 border-emerald-400/35 text-emerald-100"
                  : "bg-rose-500/15 border-rose-400/35 text-rose-100"
              }`}
            >
              <span>{settingsFeedback.message}</span>
              <button
                type="button"
                onClick={() => setSettingsFeedback(null)}
                className="text-xs font-bold opacity-80 hover:opacity-100 cursor-pointer shrink-0"
              >
                Tutup
              </button>
            </div>
          )}

          <section className="bg-[#0B1513] rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="font-sans text-lg font-bold text-white">
                Informasi &amp; Pengaturan Website
              </h2>
            </div>

            <form
              onSubmit={handleSaveSiteSettings}
              className="p-6 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="setting-company-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5"
                  >
                    Nama Perusahaan *
                  </label>
                  <input
                    id="setting-company-name"
                    type="text"
                    required
                    value={siteForm.company_name}
                    onChange={(e) =>
                      setSiteForm((prev) => ({
                        ...prev,
                        company_name: e.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label
                    htmlFor="setting-whatsapp"
                    className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5"
                  >
                    Nomor WhatsApp Marketing (628...) *
                  </label>
                  <input
                    id="setting-whatsapp"
                    type="tel"
                    required
                    placeholder="6285121186505"
                    value={siteForm.whatsapp_number}
                    onChange={(e) =>
                      setSiteForm((prev) => ({
                        ...prev,
                        whatsapp_number: e.target.value,
                      }))
                    }
                    className={`${INPUT_CLASS} font-mono`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="setting-office-address"
                  className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5"
                >
                  Alamat Kantor
                </label>
                <textarea
                  id="setting-office-address"
                  rows={2}
                  value={siteForm.office_address}
                  onChange={(e) =>
                    setSiteForm((prev) => ({
                      ...prev,
                      office_address: e.target.value,
                    }))
                  }
                  className={TEXTAREA_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="setting-operating-hours"
                    className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5"
                  >
                    Jam Operasional
                  </label>
                  <input
                    id="setting-operating-hours"
                    type="text"
                    placeholder="Senin - Minggu, 08.00 - 17.00 WIB"
                    value={siteForm.operating_hours}
                    onChange={(e) =>
                      setSiteForm((prev) => ({
                        ...prev,
                        operating_hours: e.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label
                    htmlFor="setting-kpr-rate"
                    className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5"
                  >
                    Suku Bunga KPR Default (%)
                  </label>
                  <input
                    id="setting-kpr-rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="30"
                    required
                    value={siteForm.kpr_interest_rate}
                    onChange={(e) =>
                      setSiteForm((prev) => ({
                        ...prev,
                        kpr_interest_rate: e.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label
                    htmlFor="setting-instagram"
                    className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5"
                  >
                    Link Instagram
                  </label>
                  <input
                    id="setting-instagram"
                    type="url"
                    placeholder="https://www.instagram.com/..."
                    value={siteForm.instagram_url}
                    onChange={(e) =>
                      setSiteForm((prev) => ({
                        ...prev,
                        instagram_url: e.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label
                    htmlFor="setting-tiktok"
                    className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5"
                  >
                    Link TikTok
                  </label>
                  <input
                    id="setting-tiktok"
                    type="url"
                    placeholder="https://www.tiktok.com/@..."
                    value={siteForm.tiktok_url}
                    onChange={(e) =>
                      setSiteForm((prev) => ({
                        ...prev,
                        tiktok_url: e.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label
                    htmlFor="setting-facebook"
                    className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5"
                  >
                    Link Facebook
                  </label>
                  <input
                    id="setting-facebook"
                    type="url"
                    placeholder="https://www.facebook.com/..."
                    value={siteForm.facebook_url}
                    onChange={(e) =>
                      setSiteForm((prev) => ({
                        ...prev,
                        facebook_url: e.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <label
                    htmlFor="setting-ai-knowledge"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#C8A15A]"
                  >
                    KNOWLEDGE BASE &amp; INFO PROMO AI
                  </label>
                  <span className="text-[11px] text-white/45">
                    {siteForm.ai_knowledge.length} / 2.000 karakter dibaca AI
                  </span>
                </div>
                <p className="text-xs text-white/55 mb-2.5">
                  Isi info promo, syarat KPR, bank rekanan, booking fee, atau
                  FAQ. Perubahan di sini langsung dibaca oleh AI Chatbot secara
                  real-time.
                </p>
                <textarea
                  id="setting-ai-knowledge"
                  rows={7}
                  placeholder="Contoh:&#10;- Promo bulan ini: KPR DP 0%, All-in Booking Fee Rp 2 juta, bebas biaya BPHTB & AJB.&#10;- Bank rekanan: BSI, BCA, Mandiri, BTN.&#10;- Syarat KPR: KTP, KK, slip gaji 3 bulan terakhir / rekening koran usaha."
                  value={siteForm.ai_knowledge}
                  onChange={(e) =>
                    setSiteForm((prev) => ({
                      ...prev,
                      ai_knowledge: e.target.value,
                    }))
                  }
                  className={TEXTAREA_CLASS}
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-7 py-2.5 rounded-full bg-[#C8A15A] hover:bg-[#D9B56F] text-[#070D0C] text-sm font-bold shadow-[0_8px_24px_rgba(200,161,90,0.25)] transition disabled:opacity-60 cursor-pointer"
                >
                  {savingSettings ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* MODAL: TAMBAH ANGGOTA TIM (Escape + backdrop click to close) */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Tambah Anggota Tim"
          onClick={() => !creatingUser && setIsAddModalOpen(false)}
        >
          <div className="flex min-h-full items-start sm:items-center justify-center px-4 py-8 sm:py-12">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0B1513] w-full max-w-lg rounded-2xl shadow-2xl border border-[#C8A15A]/25 overflow-hidden flex flex-col max-h-[calc(100vh-4rem)]"
            >
              <div className="bg-[#0F1D1A] border-b border-white/10 text-white px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C8A15A]">
                    Manajemen Tim
                  </p>
                  <h3 className="font-sans text-lg font-bold mt-0.5 text-white">
                    Tambah Anggota Tim Baru
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => !creatingUser && setIsAddModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-[#C8A15A] border border-white/15 text-white hover:text-[#070D0C] flex items-center justify-center transition cursor-pointer"
                  aria-label="Tutup modal"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <form
                id="create-team-member-form"
                onSubmit={handleCreateMember}
                className="p-6 flex-1 min-h-0 overflow-y-auto space-y-4"
              >
                {createError && (
                  <div className="rounded-xl bg-rose-500/15 border border-rose-400/35 px-4 py-3 text-sm text-rose-100">
                    {createError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Andi Pratama"
                    value={createForm.full_name}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        full_name: e.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="andi@nusantaraindahproperty.com"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                    Password * (min. 6 karakter)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                    Role Akses *
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        role: e.target.value as AdminRole,
                      }))
                    }
                    className={INPUT_CLASS}
                  >
                    {ADMIN_ROLES.map((roleOption) => (
                      <option
                        key={roleOption}
                        value={roleOption}
                        className="bg-[#0A1412] text-white"
                      >
                        {getRoleBadgeMeta(roleOption).label}
                      </option>
                    ))}
                  </select>
                </div>
              </form>

              <div className="px-6 py-4 bg-[#0F1D1A] border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  disabled={creatingUser}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2 rounded-full border border-white/15 bg-white/[0.04] text-sm font-semibold text-white/80 hover:bg-white/[0.1] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="create-team-member-form"
                  disabled={creatingUser}
                  className="px-6 py-2 rounded-full bg-[#C8A15A] hover:bg-[#D9B56F] text-[#070D0C] text-sm font-bold disabled:opacity-60 cursor-pointer"
                >
                  {creatingUser ? "Membuat..." : "Buat Akun"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / RESET PASSWORD (Escape + backdrop click to close) */}
      {editForm && (
        <div
          className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Edit Anggota Tim"
          onClick={() => !updatingUser && setEditForm(null)}
        >
          <div className="flex min-h-full items-start sm:items-center justify-center px-4 py-8 sm:py-12">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0B1513] w-full max-w-lg rounded-2xl shadow-2xl border border-[#C8A15A]/25 overflow-hidden flex flex-col max-h-[calc(100vh-4rem)]"
            >
              <div className="bg-[#0F1D1A] border-b border-white/10 text-white px-6 py-4 flex items-center justify-between shrink-0">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C8A15A]">
                    Edit &amp; Reset Password
                  </p>
                  <h3 className="font-sans text-lg font-bold mt-0.5 truncate text-white">
                    {editForm.full_name || editForm.email}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => !updatingUser && setEditForm(null)}
                  className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-[#C8A15A] border border-white/15 text-white hover:text-[#070D0C] flex items-center justify-center transition cursor-pointer shrink-0"
                  aria-label="Tutup modal"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <form
                id="edit-team-member-form"
                onSubmit={handleSaveEditModal}
                className="p-6 flex-1 min-h-0 overflow-y-auto space-y-4"
              >
                {editError && (
                  <div className="rounded-xl bg-rose-500/15 border border-rose-400/35 px-4 py-3 text-sm text-rose-100">
                    {editError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.full_name}
                    onChange={(e) =>
                      setEditForm((prev) =>
                        prev ? { ...prev, full_name: e.target.value } : null
                      )
                    }
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((prev) =>
                        prev ? { ...prev, email: e.target.value } : null
                      )
                    }
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                    Role Akses
                  </label>
                  <select
                    value={editForm.role}
                    disabled={editForm.id === currentUserId}
                    onChange={(e) =>
                      setEditForm((prev) =>
                        prev
                          ? { ...prev, role: e.target.value as AdminRole }
                          : null
                      )
                    }
                    className={`${INPUT_CLASS} disabled:opacity-50`}
                  >
                    {ADMIN_ROLES.map((roleOption) => (
                      <option
                        key={roleOption}
                        value={roleOption}
                        className="bg-[#0A1412] text-white"
                      >
                        {getRoleBadgeMeta(roleOption).label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                    Password Baru{" "}
                    <span className="text-white/40 font-normal normal-case tracking-normal">
                      (opsional — kosongkan jika tidak diubah)
                    </span>
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    value={editForm.password}
                    onChange={(e) =>
                      setEditForm((prev) =>
                        prev ? { ...prev, password: e.target.value } : null
                      )
                    }
                    className={INPUT_CLASS}
                  />
                </div>

                {editForm.id !== currentUserId && (
                  <label className="inline-flex items-center gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={editForm.is_active}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev
                            ? { ...prev, is_active: e.target.checked }
                            : null
                        )
                      }
                      className="w-4 h-4 accent-[#C8A15A] rounded"
                    />
                    <span className="text-sm font-medium text-white/85">
                      Akun Aktif (bisa login ke dashboard)
                    </span>
                  </label>
                )}
              </form>

              <div className="px-6 py-4 bg-[#0F1D1A] border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  disabled={updatingUser}
                  onClick={() => setEditForm(null)}
                  className="px-5 py-2 rounded-full border border-white/15 bg-white/[0.04] text-sm font-semibold text-white/80 hover:bg-white/[0.1] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="edit-team-member-form"
                  disabled={updatingUser}
                  className="px-6 py-2 rounded-full bg-[#C8A15A] hover:bg-[#D9B56F] text-[#070D0C] text-sm font-bold disabled:opacity-60 cursor-pointer"
                >
                  {updatingUser ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
