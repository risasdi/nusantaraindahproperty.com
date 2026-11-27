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
  "Bank Syariah Indonesia (BSI)",
  "Bank Central Asia (BCA)",
  "Bank Mandiri",
  "Bank Tabungan Negara (BTN)",
] as const;

export default async function KprPage() {
  const settings = await getSiteSettings();

  return (
    <div className="kpr-page">
      <header className="kpr-header">
        <FadeUp as="div">
          <h1>Panduan KPR &amp; Simulasi</h1>
        </FadeUp>
        <p>
          Hitung estimasi cicilan rumah impian Anda dan pelajari informasi dasar
          mengenai KPR dari berbagai bank.
        </p>
      </header>

      <main className="kpr-container">
        <section className="kpr-card">
          <h2>Informasi KPR</h2>

          <div className="info-section">
            <h3>Bunga Flat vs Floating</h3>
            <p>
              <strong>Bunga Flat (Tetap):</strong> Suku bunga tidak akan berubah
              selama masa promo atau tenor yang disepakati. Cicilan Anda akan
              tetap sama setiap bulannya, memberikan kepastian finansial.
            </p>
            <p>
              <strong>Bunga Floating (Mengambang):</strong> Suku bunga akan
              mengikuti suku bunga acuan Bank Indonesia (BI Rate). Cicilan Anda
              bisa naik atau turun bergantung pada kondisi ekonomi.
            </p>
          </div>

          <div className="info-section">
            <h3>Daftar Bank Rekanan</h3>
            <p>
              Kami bekerja sama dengan berbagai bank terpercaya untuk memberikan
              kemudahan proses KPR Anda:
            </p>
            <div className="bank-grid">
              {PARTNER_BANKS.map((bank) => (
                <div key={bank} className="bank-item">
                  {bank}
                </div>
              ))}
            </div>
          </div>
        </section>

        <KprCalculator defaultInterestRate={settings.kpr_interest_rate} />
      </main>
    </div>
  );
}
