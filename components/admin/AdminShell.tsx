"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BuildingIcon,
  CloseIcon,
  ExternalLinkIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  MessageSquareIcon,
  PlusIcon,
  SettingsIcon,
} from "./AdminIcons";

interface AdminActionContextValue {
  registerCreateHandler: (handler: (() => void) | null) => void;
  openCreateProperty: () => void;
}

const AdminActionContext = createContext<AdminActionContextValue>({
  registerCreateHandler: () => {},
  openCreateProperty: () => {},
});

export function useAdminActions() {
  return useContext(AdminActionContext);
}

const SIDEBAR_ITEMS = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboardIcon,
    badge: null,
  },
  {
    label: "Kelola Properti",
    href: "/admin/properties",
    icon: BuildingIcon,
    badge: null,
  },
  {
    label: "Leads & Pesan",
    href: "/admin/leads",
    icon: MessageSquareIcon,
    badge: "Segera",
  },
  {
    label: "Pengaturan",
    href: "/admin/settings",
    icon: SettingsIcon,
    badge: "Segera",
  },
] as const;

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Overview Dashboard",
    subtitle: "Ringkasan performa & daftar properti PT Nusantara Indah Property",
  },
  "/admin/properties": {
    title: "Kelola Properti",
    subtitle: "Tambah, perbarui, dan atur katalog properti secara terpusat",
  },
  "/admin/leads": {
    title: "Leads & Pesan",
    subtitle: "Manajemen calon pembeli dan pesan masuk CRM",
  },
  "/admin/settings": {
    title: "Pengaturan",
    subtitle: "Konfigurasi akun admin dan preferensi website",
  },
};

interface AdminShellProps {
  userEmail: string | null;
  children: ReactNode;
}

export default function AdminShell({ userEmail, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const createHandlerRef = useRef<(() => void) | null>(null);

  const registerCreateHandler = useCallback((handler: (() => void) | null) => {
    createHandlerRef.current = handler;
  }, []);

  const openCreateProperty = useCallback(() => {
    if (createHandlerRef.current) {
      createHandlerRef.current();
    } else {
      router.push("/admin/properties?new=1");
    }
  }, [router]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // Do not wrap /admin/login with the dashboard sidebar & topbar
  if (pathname === "/admin/login" || !userEmail) {
    return <>{children}</>;
  }

  const pageMeta = PAGE_TITLES[pathname] ?? {
    title: "Admin Dashboard",
    subtitle: "Panel manajemen PT Nusantara Indah Property",
  };

  const userInitial = userEmail.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const renderSidebarNav = () => (
    <div className="flex flex-col h-full bg-[#063D36] text-white select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 shrink-0">
        <Link
          href="/admin"
          className="flex items-center gap-3 min-w-0"
          onClick={() => setSidebarOpen(false)}
        >
          <Image
            src="/images/logo/logo-10.png"
            alt="Nusantara Indah Property"
            width={36}
            height={36}
            className="rounded-lg shrink-0"
            priority
          />
          <div className="min-w-0">
            <span className="block font-serif text-sm font-bold tracking-[0.12em] text-[#C8A15A] leading-tight truncate">
              NUSANTARA
            </span>
            <span className="block text-[10px] font-medium tracking-[0.2em] text-white/65 uppercase truncate">
              Admin Panel
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition cursor-pointer"
          aria-label="Tutup menu sidebar"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto" aria-label="Menu Admin">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
          Menu Utama
        </p>

        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-[#C8A15A]/15 text-[#C8A15A] font-semibold shadow-[inset_3px_0_0_#C8A15A]"
                  : "text-white/80 hover:text-white hover:bg-white/8"
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    isActive
                      ? "text-[#C8A15A]"
                      : "text-white/60 group-hover:text-white"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </span>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white/75 shrink-0">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-white/10 space-y-1.5 shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/8 transition"
        >
          <ExternalLinkIcon className="w-[18px] h-[18px] text-[#C8A15A] shrink-0" />
          <span>Lihat Website</span>
        </a>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-200 hover:text-white hover:bg-red-500/25 disabled:opacity-50 transition cursor-pointer"
        >
          <LogOutIcon className="w-[18px] h-[18px] shrink-0" />
          <span>{loggingOut ? "Keluar..." : "Logout"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <AdminActionContext.Provider
      value={{ registerCreateHandler, openCreateProperty }}
    >
      <div className="min-h-screen bg-slate-50 text-slate-900">
        {/* Desktop Fixed Sidebar */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:w-64 shadow-xl">
          {renderSidebarNav()}
        </aside>

        {/* Mobile Drawer Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-64 max-w-[82vw] shadow-2xl">
              {renderSidebarNav()}
            </aside>
          </div>
        )}

        {/* Main Content Column */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          {/* White Topbar */}
          <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:text-[#063D36] hover:bg-slate-100 transition cursor-pointer"
                aria-label="Buka menu navigasi"
              >
                <MenuIcon className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-serif font-bold text-[#063D36] truncate leading-tight">
                  {pageMeta.title}
                </h1>
                <p className="hidden sm:block text-xs text-slate-500 truncate">
                  {pageMeta.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Admin Email Pill */}
              <div className="hidden md:flex items-center gap-2.5 pl-1.5 pr-3.5 py-1 rounded-full bg-slate-100 border border-slate-200/80">
                <span className="w-7 h-7 rounded-full bg-[#063D36] text-[#C8A15A] text-xs font-bold flex items-center justify-center shrink-0">
                  {userInitial}
                </span>
                <span className="text-xs font-medium text-slate-700 max-w-[180px] truncate">
                  {userEmail}
                </span>
              </div>

              {/* Quick Action Button */}
              <button
                type="button"
                onClick={openCreateProperty}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-[#063D36] hover:bg-[#052e29] text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
              >
                <PlusIcon className="w-4 h-4 text-[#C8A15A]" />
                <span>Tambah Properti</span>
              </button>
            </div>
          </header>

          {/* Page Canvas */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminActionContext.Provider>
  );
}
