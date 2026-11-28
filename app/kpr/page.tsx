import type { Metadata } from "next";
import FadeUp from "@/components/FadeUp";
import KprCalculator from "@/components/KprCalculator";
import { getSiteSettings } from "@/lib/site-settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Panduan & Simulasi KPR | Nusantara Indah Property",
  description:
    "Kalkulator KPR dan informasi suku bunga bank - Nusantara Indah Property",
};

const PARTNER_BANKS = [
  { name: "Bank Syariah Indonesia (BSI)", tag: "Syariah" },
  { name: "Bank Central Asia (BCA)", tag: "Konvensional" },
  { name: "Bank Mandiri", tag: "BUMN" },
  { name: "Bank Tabungan Negara (BTN)", tag: "Spesialis KPR" },
] as const;

export default async function KprPage() {
  const settings = await getSiteSettings();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070D0C] text-white">
      {/* Ambient Emerald + Nusantara Gold Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-[15%] h-[420px] w-[520px] rounded-full bg-[#063D36]/50 blur-[135px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[35%] right-[-8%] h-[420px] w-[500px] rounded-full bg-[#C8A15A]/22 blur-[140px]"
      />

      <main className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 pt-10 sm:pt-14 pb-20 sm:pb-24">
        {/* Dark Luxury Editorial Header */}
        <header className="max-w-2xl mb-10 sm:mb-12">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C8A15A] mb-2.5">
            Panduan Pembiayaan
          </span>
          <FadeUp as="div">
            <h1 className="font-sans text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight text-white leading-tight">
              Panduan KPR &amp;{" "}
              <span className="font-normal italic text-[#C8A15A]">Simulasi</span>
            </h1>
          </FadeUp>
          <p className="mt-3 text-sm sm:text-base font-light text-white/60 leading-relaxed">
            Hitung estimasi cicilan rumah impian Anda dengan program KPR DP 0%
            dan pelajari perbedaan skema suku bunga dari bank rekanan kami.
          </p>
        </header>

        {/* 2-Column Bento Glass Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Info & Partner Banks Bento Card */}
          <section className="lg:col-span-5 rounded-2xl bg-[#0B1513]/88 backdrop-blur-xl border border-[#C8A15A]/20 p-5 sm:p-7 space-y-6 shadow-[0_22px_55px_rgba(0,0,0,0.4)]">
            <div className="pb-4 border-b border-white/10">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C8A15A]">
                Edukasi Singkat
              </span>
              <h2 className="mt-1 font-sans text-xl sm:text-2xl font-bold text-white">
                Informasi KPR
              </h2>
            </div>

            <div className="space-y-3.5">
              <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A15A]">
                Bunga Flat vs Floating
              </h3>

              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                <p className="text-sm font-semibold text-white mb-1">
                  Bunga Flat / Fix (Tetap)
                </p>
                <p className="text-xs sm:text-[13px] font-light text-white/65 leading-relaxed">
                  Suku bunga tidak berubah selama masa promo atau tenor yang
                  disepakati. Cicilan Anda tetap sama setiap bulan sehingga
                  memberikan kepastian finansial.
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                <p className="text-sm font-semibold text-white mb-1">
                  Bunga Floating (Mengambang)
                </p>
                <p className="text-xs sm:text-[13px] font-light text-white/65 leading-relaxed">
                  Suku bunga mengikuti suku bunga acuan Bank Indonesia (BI Rate).
                  Nominal cicilan dapat naik atau turun bergantung pada kondisi
                  pasar.
                </p>
              </div>
            </div>

            <div className="pt-2 space-y-3.5">
              <div>
                <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A15A]">
                  Daftar Bank Rekanan
                </h3>
                <p className="mt-1.5 text-xs sm:text-[13px] font-light text-white/60 leading-relaxed">
                  Kami bekerja sama dengan bank terpercaya untuk memudahkan
                  pengajuan KPR Anda hingga akad:
                </p>
              </div>

              {/* 1 column on narrow 360px phones, 2 columns from sm: up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PARTNER_BANKS.map((bank) => (
                  <div
                    key={bank.name}
                    className="rounded-xl bg-white/[0.04] border border-[#C8A15A]/25 px-4 py-3.5 flex flex-col justify-between gap-1"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C8A15A]">
                      {bank.tag}
                    </span>
                    <span className="text-xs sm:text-[13px] font-semibold text-white leading-snug">
                      {bank.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right: KPR Calculator Card */}
          <div className="lg:col-span-7">
            <KprCalculator defaultInterestRate={settings.kpr_interest_rate} />
          </div>
        </div>
      </main>
    </div>
  );
}
