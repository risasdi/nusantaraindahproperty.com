"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { formatRupiah, formatThousands } from "@/lib/format";

interface CalculationResult {
  pokokKredit: number;
  cicilanBulanan: number;
}

export default function KprCalculator() {
  const [hargaInput, setHargaInput] = useState("");
  const [bungaInput, setBungaInput] = useState("");
  const [tenorInput, setTenorInput] = useState("");
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleHargaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, "");
    if (!digits) {
      setHargaInput("");
      return;
    }
    setHargaInput(formatThousands(digits));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const harga = parseFloat(hargaInput.replace(/\./g, ""));
    const bungaTahunan = parseFloat(bungaInput);
    const tenorTahun = parseInt(tenorInput, 10);

    if (
      Number.isNaN(harga) ||
      harga <= 0 ||
      Number.isNaN(bungaTahunan) ||
      Number.isNaN(tenorTahun) ||
      tenorTahun <= 0
    ) {
      return;
    }

    // Promo DP 0%
    const pokokKredit = harga;
    const r = bungaTahunan / 100 / 12;
    const n = tenorTahun * 12;

    const cicilanBulanan =
      r > 0
        ? (pokokKredit * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1)
        : pokokKredit / n;

    setResult({ pokokKredit, cicilanBulanan });
  };

  return (
    <section className="kpr-card">
      <h2>Kalkulator Simulasi KPR</h2>
      <form id="kpr-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="harga">Harga Properti</label>
          <div className="input-wrapper">
            <span className="input-prefix">Rp</span>
            <input
              type="text"
              id="harga"
              className="with-prefix"
              placeholder="Misal: 500.000.000"
              required
              autoComplete="off"
              inputMode="numeric"
              value={hargaInput}
              onChange={handleHargaChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="bunga">Suku Bunga per Tahun</label>
          <div className="input-wrapper">
            <input
              type="number"
              id="bunga"
              className="with-suffix"
              placeholder="Misal: 5.5"
              step="0.01"
              min="0"
              required
              autoComplete="off"
              value={bungaInput}
              onChange={(e) => setBungaInput(e.target.value)}
            />
            <span className="input-suffix">%</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tenor">Tenor (Jangka Waktu)</label>
          <div className="input-wrapper">
            <input
              type="number"
              id="tenor"
              className="with-suffix"
              placeholder="Misal: 15"
              required
              min={1}
              max={30}
              autoComplete="off"
              value={tenorInput}
              onChange={(e) => setTenorInput(e.target.value)}
            />
            <span className="input-suffix">Tahun</span>
          </div>
        </div>

        <button type="submit" className="btn-calc">
          Hitung Cicilan
        </button>
      </form>

      <div id="result-box" className={`result-box${result ? " active" : ""}`}>
        <div className="result-title">Estimasi Cicilan per Bulan</div>
        <div id="cicilan-bulanan" className="result-amount">
          {result ? formatRupiah(result.cicilanBulanan) : "Rp 0"}
        </div>

        <div className="result-detail">
          <span>Pokok Pinjaman:</span>
          <strong id="pokok-kredit">
            {result ? formatRupiah(result.pokokKredit) : "Rp 0"}
          </strong>
        </div>

        <p className="result-note">
          *Angka di atas adalah estimasi cicilan tetap selama masa Promo (Fix).
          Untuk perhitungan skema Bunga Floating dan detail Sisa Pokok Hutang,
          silakan klik menu Hubungi Agen untuk konsultasi gratis.
        </p>
      </div>
    </section>
  );
}
