import Link from "next/link";
import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
} from "@/lib/site-settings";

interface FooterProps {
  settings?: SiteSettings;
}

export default function Footer({
  settings = DEFAULT_SITE_SETTINGS,
}: FooterProps) {
  return (
    <footer className="relative bg-[#050A09] border-t border-[#C8A15A]/18 py-10 px-5 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C8A15A]/35 to-transparent"
      />
      <div className="mx-auto max-w-[1280px] flex flex-col items-center gap-4 text-center">
        <p className="font-serif text-sm sm:text-base font-medium tracking-[0.16em] text-[#C8A15A] uppercase">
          {settings.company_name}
        </p>

        <nav
          aria-label="Navigasi footer"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/55"
        >
          <Link href="/" className="hover:text-[#C8A15A] transition">
            Beranda
          </Link>
          <Link href="/#catalog" className="hover:text-[#C8A15A] transition">
            Portofolio
          </Link>
          <Link href="/kpr" className="hover:text-[#C8A15A] transition">
            Simulasi KPR
          </Link>
          <Link href="/#about" className="hover:text-[#C8A15A] transition">
            Tentang Kami
          </Link>
          <Link href="/#contact" className="hover:text-[#C8A15A] transition">
            Kontak
          </Link>
        </nav>

        <p className="text-[11px] text-white/40 pt-2">
          &copy; 2026 {settings.company_name}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
