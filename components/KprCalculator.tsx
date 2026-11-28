"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { formatRupiah, formatThousands } from "@/lib/format";

interface CalculationResult {
  pokokKredit: number;
  cicilanBulanan: number;
  tenorTahun: number;
  bungaTahunan: number;
}

interface KprCalculatorProps {
  defaultInterestRate?: number;
}

export default function KprCalculator({
  defaultInterestRate = 5.5,
}: KprCalculatorProps) {
  const [hargaInput, setHargaInput] = useState("");
  const [bungaInput, setBungaInput] = useState(String(defaultInterestRate));
  const [tenorInput, setTenorInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleHargaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, "");
    if (errorMessage) setErrorMessage(null);
    if (!digits) {
      setHargaInput("");
      return;
    }
    setHargaInput(formatThousands(digits));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const harga = parseFloat(hargaInput.replace(/\./g, ""));
    const bungaTahunan = parseFloat(bungaInput);
    const tenorTahun = parseInt(tenorInput, 10);

    if (Number.isNaN(harga) || harga <= 0) {
      setResult(null);
      setErrorMessage("Mohon masukkan harga properti lebih dari Rp 0.");
      return;
    }

    if (Number.isNaN(bungaTahunan) || bungaTahunan < 0) {
      setResult(null);
      setErrorMessage(
        "Suku bunga per tahun harus berupa angka valid (minimal 0%)."
      );
      return;
    }

    if (Number.isNaN(tenorTahun) || tenorTahun <= 0 || tenorTahun > 30) {
      setResult(null);
      setErrorMessage("Tenor cicilan harus diisi antara 1 hingga 30 tahun.");
      return;
    }

    // Promo DP 0% (formula kept identical)
    const pokokKredit = harga;
    const r = bungaTahunan / 100 / 12;
    const n = tenorTahun * 12;

    const cicilanBulanan =
      r > 0
        ? (pokokKredit * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1)
        : pokokKredit / n;

    setResult({ pokokKredit, cicilanBulanan, tenorTahun, bungaTahunan });
  };

  return (
    <section className="rounded-2xl bg-[#0B1513]/90 backdrop-blur-xl border border-[#C8A15A]/22 p-5 sm:p-8 shadow-[0_22px_55px_rgba(0,0,0,0.45)]">
      <div className="mb-6 pb-4 border-b border-white/10">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C8A15A]">
          Simulasi DP 0%
        </span>
        <h2 className="mt-1 font-sans text-xl sm:text-2xl font-bold text-white">
          Kalkulator Simulasi{" "}
          <span className="font-normal italic text-[#C8A15A]">KPR</span>
        </h2>
      </div>

      <form id="kpr-form" noValidate onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl bg-rose-500/15 border border-rose-400/35 px-4 py-3 text-xs sm:text-sm text-rose-100 font-medium leading-relaxed"
          >
            {errorMessage}
          </div>
        )}

        <div>
          <label
            htmlFor="harga"
            className="block text-xs font-medium text-white/75 mb-2"
          >
            Harga Properti <span className="text-[#C8A15A]">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#C8A15A]">
              Rp
            </span>
            <input
              type="text"
              id="harga"
              placeholder="Misal: 500.000.000"
              required
              autoComplete="off"
              inputMode="numeric"
              value={hargaInput}
              onChange={handleHargaChange}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-white/15 bg-white/[0.05] text-white text-sm sm:text-base font-medium placeholder:text-white/35 focus:outline-none focus:border-[#C8A15A] focus:bg-white/[0.08] focus:ring-2 focus:ring-[#C8A15A]/20 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="bunga"
              className="block text-xs font-medium text-white/75 mb-2"
            >
              Suku Bunga per Tahun <span className="text-[#C8A15A]">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="bunga"
                placeholder="Misal: 5.5"
                step="0.01"
                min="0"
                required
                autoComplete="off"
                value={bungaInput}
                onChange={(e) => {
                  if (errorMessage) setErrorMessage(null);
                  setBungaInput(e.target.value);
                }}
                className="w-full h-12 pl-4 pr-12 rounded-xl border border-white/15 bg-white/[0.05] text-white text-sm sm:text-base font-medium placeholder:text-white/35 focus:outline-none focus:border-[#C8A15A] focus:bg-white/[0.08] focus:ring-2 focus:ring-[#C8A15A]/20 transition"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#C8A15A]">
                %
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="tenor"
              className="block text-xs font-medium text-white/75 mb-2"
            >
              Tenor (Jangka Waktu) <span className="text-[#C8A15A]">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="tenor"
                placeholder="Misal: 15"
                required
                min={1}
                max={30}
                autoComplete="off"
                value={tenorInput}
                onChange={(e) => {
                  if (errorMessage) setErrorMessage(null);
                  setTenorInput(e.target.value);
                }}
                className="w-full h-12 pl-4 pr-20 rounded-xl border border-white/15 bg-white/[0.05] text-white text-sm sm:text-base font-medium placeholder:text-white/35 focus:outline-none focus:border-[#C8A15A] focus:bg-white/[0.08] focus:ring-2 focus:ring-[#C8A15A]/20 transition"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/60">
                Tahun
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-12 rounded-full bg-[#C8A15A] hover:bg-[#D9B56F] text-[#070D0C] text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 shadow-[0_10px_28px_rgba(200,161,90,0.28)] hover:-translate-y-0.5 cursor-pointer"
        >
          Hitung Cicilan
        </button>
      </form>

      {/* Result Box with subtle Emerald + Gold Ambient Glow */}
      {result && (
        <div
          id="result-box"
          className="relative mt-7 overflow-hidden rounded-2xl border border-[#C8A15A]/35 bg-gradient-to-br from-[#063D36]/40 via-[#0A1412]/95 to-[#070D0C] p-5 sm:p-6 text-center"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-32 w-60 rounded-full bg-[#C8A15A]/22 blur-[55px]"
          />

          <div className="relative z-10">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
              Estimasi Cicilan per Bulan
            </div>

            <div
              id="cicilan-bulanan"
              className="mt-2 font-sans text-[1.65rem] sm:text-4xl font-bold tracking-tight text-[#C8A15A] break-words leading-tight"
            >
              {formatRupiah(result.cicilanBulanan)}
            </div>

            <div className="mt-5 pt-4 border-t border-white/12 space-y-2 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 text-white/70">
                <span>Pokok Pinjaman (DP 0%):</span>
                <strong
                  id="pokok-kredit"
                  className="font-semibold text-white break-words"
                >
                  {formatRupiah(result.pokokKredit)}
                </strong>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 text-white/70">
                <span>Skema Simulasi:</span>
                <strong className="font-semibold text-white">
                  {result.bungaTahunan}% / thn &bull; {result.tenorTahun} Tahun
                </strong>
              </div>
            </div>

            <p className="mt-4 text-xs text-white/50 italic leading-relaxed">
              *Angka di atas adalah estimasi cicilan tetap selama masa Promo
              (Fix). Untuk perhitungan skema Bunga Floating dan detail Sisa
              Pokok Hutang, silakan konsultasi gratis bersama agen kami.
            </p>

            <Link
              href="/#contact"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-[#C8A15A]/45 bg-white/[0.04] hover:bg-[#C8A15A] text-white hover:text-[#070D0C] text-xs font-semibold px-5 py-2 transition"
            >
              <span>Konsultasi KPR Gratis</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
