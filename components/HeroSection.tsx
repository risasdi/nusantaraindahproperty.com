"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  const handleSmoothAnchor = (
    e: MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;
    e.preventDefault();
    targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `/#${targetId}`);
  };

  return (
    <header
      id="home"
      className="relative overflow-hidden bg-[#070D0C] text-white pt-28 pb-16 sm:pt-32 sm:pb-24 lg:pt-36 lg:pb-24 scroll-mt-24"
    >
      {/* Subtle Ambient Radial Glows (Emerald Green + Nusantara Gold) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-[18%] h-[520px] w-[520px] rounded-full bg-[#063D36]/45 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-8%] left-[28%] h-[440px] w-[560px] rounded-full bg-[#C8A15A]/22 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[14%] right-[-6%] h-[420px] w-[420px] rounded-full bg-[#063D36]/35 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-7 items-stretch">
          {/* LEFT COLUMN: Editorial Headline, CTAs & Market Impact Glass Card */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-10">
            <div>
              {/* Top Pill Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full bg-white/[0.04] backdrop-blur-md border border-[#C8A15A]/25 px-4 py-1.5 mb-7">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rotate-45 bg-[#C8A15A] shadow-[0_0_10px_rgba(200,161,90,0.8)]"
                />
                <span className="text-xs font-medium tracking-wide text-white/80">
                  Hunian Terkurasi &amp; KPR DP 0% Bandung
                </span>
              </div>

              {/* Bold Modern Sans Headline with Italic Nusantara Gold Keyword */}
              <h1 className="font-sans text-[2.45rem] sm:text-5xl xl:text-[3.75rem] font-bold tracking-[-0.03em] leading-[1.08] text-white">
                Hunian Premium{" "}
                <span className="font-normal italic text-[#C8A15A]">
                  Eksklusif
                </span>{" "}
                Tanpa DP &amp; Legalitas Gratis.
              </h1>

              <p className="mt-6 max-w-xl text-sm sm:text-base font-light leading-relaxed text-white/65">
                Melangkah ke rumah impian hanya dengan booking fee. Nusantara
                Indah Property menanggung penuh Uang Muka (DP 0%), AJB,
                Sertifikat, hingga seluruh biaya perizinan legalitas.
              </p>

              {/* Rounded-Full CTAs with Explicit Smooth Scroll */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <a
                  href="#catalog"
                  onClick={(e) => handleSmoothAnchor(e, "catalog")}
                  className="inline-flex items-center justify-center rounded-full bg-[#C8A15A] hover:bg-[#D9B56F] text-[#070D0C] text-xs sm:text-sm font-semibold tracking-wide px-7 py-3.5 transition-all duration-300 shadow-[0_10px_28px_rgba(200,161,90,0.22)] hover:-translate-y-0.5"
                >
                  Lihat Properti
                </a>
                <a
                  href="#contact"
                  onClick={(e) => handleSmoothAnchor(e, "contact")}
                  className="inline-flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/25 hover:border-[#C8A15A]/60 text-white text-xs sm:text-sm font-medium tracking-wide px-7 py-3.5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  Booking Kunjungan
                </a>
              </div>
            </div>

            {/* Bottom Dark Glass Stats Card (Market Impact) */}
            <div className="pt-2">
              <p className="text-sm font-semibold tracking-wide text-white/90 mb-3.5">
                Kepercayaan &amp; Dampak Kami
              </p>
              <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-[#C8A15A]/20 p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-white/75">
                    Unit Terjual &amp; Akad
                  </span>
                  <div className="flex items-start gap-3.5">
                    <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white shrink-0">
                      100+
                    </span>
                    <p className="text-xs leading-relaxed text-white/55">
                      Hunian legalitas SHM &amp; AJB terverifikasi di lokasi
                      strategis Bandung.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:border-l sm:border-white/10 sm:pl-6">
                  <span className="text-xs font-medium text-white/75">
                    Kepuasan Pembeli
                  </span>
                  <div className="flex items-start gap-3.5">
                    <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#C8A15A] shrink-0">
                      98%
                    </span>
                    <p className="text-xs leading-relaxed text-white/55">
                      Pendampingan KPR DP 0% transparan hingga serah terima
                      kunci.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Stacked Bento Visual Cards */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Bento Card 1: Featured Property Showcase Image */}
            <Link
              href="/cluster-sukamukti-islamic"
              aria-label="Lihat detail Cluster Sukamukti Islamic"
              className="group relative min-h-[250px] sm:min-h-[280px] flex-1 rounded-2xl overflow-hidden border border-[#C8A15A]/25 bg-[#0A1412] block"
            >
              <Image
                src="/images/Cluster-Sukamukti-Islamic-type45/Tampak-Depan-Rumah.png"
                alt="Cluster Sukamukti Islamic - Koleksi Unggulan Nusantara Indah Property"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070D0C]/85 via-[#070D0C]/20 to-transparent" />

              {/* Top-left subtle pill */}
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-[#070D0C]/70 backdrop-blur-md border border-[#C8A15A]/35 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C8A15A]" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E6C98F]">
                  Koleksi Unggulan
                </span>
              </div>

              {/* Floating glass card inside bottom-left */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:min-w-[270px] rounded-xl bg-[#0A1412]/82 backdrop-blur-xl border border-[#C8A15A]/30 px-4 py-3.5 transition-colors duration-300 group-hover:border-[#C8A15A]/65">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white leading-snug">
                      Cluster Sukamukti Islamic
                    </p>
                    <p className="text-xs text-[#C8A15A] font-medium mt-0.5">
                      Mulai Rp 400 Juta &bull; Tipe 36 &amp; 45
                    </p>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-[#C8A15A] text-[#070D0C] flex items-center justify-center shrink-0 text-sm font-bold transition-transform duration-300 group-hover:translate-x-0.5">
                    &rarr;
                  </span>
                </div>
              </div>
            </Link>

            {/* Bento Card 2: KPR DP 0% Dark Glass Preview */}
            <div className="relative rounded-2xl bg-gradient-to-br from-[#063D36]/35 via-[#0A1412]/90 to-[#070D0C] backdrop-blur-xl border border-[#C8A15A]/22 p-6 overflow-hidden flex flex-col justify-between gap-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 -right-12 h-44 w-44 rounded-full bg-[#C8A15A]/20 blur-[60px]"
              />

              <div className="relative z-10">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C8A15A]">
                  Simulasi KPR Instan
                </span>
                <h2 className="mt-1.5 font-sans text-lg sm:text-xl font-bold text-white leading-snug">
                  Dukungan KPR DP 0% Lebih Mudah
                </h2>
                <p className="mt-1.5 text-xs sm:text-[13px] text-white/60 leading-relaxed">
                  Hitung estimasi cicilan bulanan dengan bunga promo bank
                  rekanan resmi kami.
                </p>
              </div>

              {/* Sleek dark mini preview bar */}
              <div className="relative z-10 rounded-xl bg-[#070D0C]/75 border border-white/10 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-white/60">Program Promo</span>
                  <span className="font-semibold text-[#C8A15A]">
                    All-In DP 0% &bull; Bebas Biaya
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["BSI", "BCA", "Mandiri", "BTN"].map((bank) => (
                    <span
                      key={bank}
                      className="rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/80"
                    >
                      {bank}
                    </span>
                  ))}
                </div>
                <Link
                  href="/kpr"
                  className="mt-1 inline-flex items-center justify-between rounded-full bg-white/[0.06] hover:bg-[#C8A15A] border border-[#C8A15A]/35 px-4 py-2 text-xs font-semibold text-white hover:text-[#070D0C] transition-all duration-300"
                >
                  <span>Buka Kalkulator KPR</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
