import Link from "next/link";
import FadeUp from "./FadeUp";
import LeadForm from "./LeadForm";
import PropertyGallery from "./PropertyGallery";
import PropertyViewTracker from "./PropertyViewTracker";
import TrackedContactLink from "./TrackedContactLink";
import type { PropertyItem } from "@/data/properties";
import {
  buildMarketingWhatsAppUrl,
  getSiteSettings,
} from "@/lib/site-settings";

interface PropertyDetailViewProps {
  property: PropertyItem;
}

function cleanSpecLabel(raw: string): string {
  return raw.replace(/^[^\p{L}\p{N}]+/u, "").trim() || raw;
}

export default async function PropertyDetailView({
  property,
}: PropertyDetailViewProps) {
  const settings = await getSiteSettings();
  const isSold =
    property.status === "TERJUAL" || property.badgeVariant === "rent";

  const waMessage = isSold
    ? `Halo ${settings.company_name}, saya melihat properti ${property.name} (${property.location}) sudah berstatus TERJUAL. Apakah ada rekomendasi unit serupa yang masih tersedia?`
    : `Halo ${settings.company_name}, saya tertarik dengan properti ${property.name} (${property.location}). Mohon info lengkap & jadwal survei.`;

  const waHref = buildMarketingWhatsAppUrl(settings.whatsapp_number, waMessage);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070D0C] text-white">
      <PropertyViewTracker
        title={property.name}
        price={property.price}
        slug={property.slug}
      />

      {/* Ambient Emerald + Nusantara Gold Radial Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-[12%] h-[460px] w-[520px] rounded-full bg-[#063D36]/45 blur-[135px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[26%] right-[-6%] h-[400px] w-[480px] rounded-full bg-[#C8A15A]/20 blur-[140px]"
      />

      <main className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 pt-8 sm:pt-12 pb-20 sm:pb-24">
        {/* Back Pill Link */}
        <Link
          href={property.backHref}
          className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/14 hover:border-[#C8A15A]/50 px-4 py-2 text-xs font-medium text-white/80 hover:text-[#C8A15A] transition mb-7"
        >
          <span aria-hidden="true">&larr;</span>
          <span>{property.backLabel}</span>
        </Link>

        {/* Top 2-Column Hero Grid: Gallery + Summary Glass Card */}
        <FadeUp className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-9 items-start">
          <div className="lg:col-span-7">
            <PropertyGallery
              images={property.gallery}
              ariaLabel={property.galleryAriaLabel}
            />
          </div>

          <section className="lg:col-span-5 rounded-2xl bg-[#0B1513]/88 backdrop-blur-xl border border-[#C8A15A]/22 p-6 sm:p-8 shadow-[0_22px_55px_rgba(0,0,0,0.45)] flex flex-col">
            {/* Label + Status Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C8A15A]">
                {property.detailLabel}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                  isSold
                    ? "bg-rose-500/20 border border-rose-400/45 text-rose-200"
                    : "bg-[#C8A15A] text-[#070D0C]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isSold ? "bg-rose-400" : "bg-[#070D0C]"
                  }`}
                />
                <span>{isSold ? "TERJUAL" : "DIJUAL"}</span>
              </span>
            </div>

            <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              {property.detailTitle}
            </h1>

            <p className="mt-3 flex items-center gap-2 text-sm text-white/70">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="w-4 h-4 text-[#C8A15A] shrink-0"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <a
                href={property.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-[#C8A15A]/50 underline-offset-4 hover:text-[#C8A15A] transition"
              >
                {property.location}
              </a>
            </p>

            {/* Sold Notice Banner if TERJUAL */}
            {isSold && (
              <div className="mt-5 rounded-xl bg-rose-500/12 border border-rose-400/30 px-4 py-3 text-xs leading-relaxed text-rose-100">
                Unit ini saat ini berstatus{" "}
                <strong className="font-bold text-white">TERJUAL</strong>. Anda
                tetap dapat menghubungi agen kami untuk rekomendasi unit serupa
                yang masih tersedia.
              </div>
            )}

            {/* Price Block */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                {isSold ? "Harga Referensi" : "Mulai Dari"}
              </span>
              <span
                className={`mt-1 block text-2xl sm:text-3xl font-bold tracking-tight ${
                  isSold ? "text-white/65 line-through" : "text-[#C8A15A]"
                }`}
              >
                {property.priceLabel}
              </span>
            </div>

            {/* Quick Specs Mini Bento Grid */}
            <div className="mt-5 grid grid-cols-3 gap-2.5">
              {property.specs.map((spec, idx) => (
                <div
                  key={`${spec}-${idx}`}
                  className="rounded-xl bg-white/[0.04] border border-white/10 px-2.5 py-3 text-center flex flex-col items-center justify-center gap-1"
                >
                  <span className="text-[11px] sm:text-xs font-semibold text-white/90 leading-snug">
                    {cleanSpecLabel(spec)}
                  </span>
                </div>
              ))}
            </div>

            {/* Primary Gold WhatsApp CTA + Secondary KPR Link */}
            <div className="mt-6 flex flex-col gap-3">
              <TrackedContactLink
                href={waHref}
                target="_blank"
                rel="noreferrer"
                contentName={`Detail Properti - ${property.name}`}
                contentCategory="WhatsApp"
                propertyTitle={property.name}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-full bg-[#C8A15A] hover:bg-[#D9B56F] text-[#070D0C] text-xs sm:text-sm font-bold tracking-wide px-6 py-3.5 transition-all duration-300 shadow-[0_10px_28px_rgba(200,161,90,0.28)] hover:-translate-y-0.5"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.5 4.1 1.5 5.9L0 24l6.3-1.6a11.9 11.9 0 0 0 5.7 1.4h.1c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4zM12.1 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7.9 1-3.6-.2-.4a9.8 9.8 0 1 1 8.3 4.7zm5.4-7.3c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2c-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.8-2.1-.2-.3 0-.5.2-.7l.5-.6c.2-.2.2-.4.3-.6 0-.2 0-.4-.1-.6-.1-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6 0 1.5 1.1 3 1.2 3.2.2.2 2.2 3.4 5.4 4.8.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.7-.1 1.8-.7 2-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.4z" />
                </svg>
                <span>
                  {isSold
                    ? "Tanya Unit Serupa via WhatsApp"
                    : "Hubungi Agen via WhatsApp"}
                </span>
              </TrackedContactLink>

              <Link
                href="/kpr"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/18 hover:border-[#C8A15A]/55 text-white text-xs sm:text-sm font-semibold px-6 py-3 transition"
              >
                <span>Simulasi Cicilan KPR DP 0%</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </section>
        </FadeUp>

        {/* Middle Info Grid: Description + Building Specifications */}
        <FadeUp className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 rounded-2xl bg-[#0B1513]/85 backdrop-blur-xl border border-[#C8A15A]/18 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C8A15A]">
                Ringkasan Hunian
              </span>
              <h2 className="mt-1.5 font-sans text-xl sm:text-2xl font-bold text-white">
                Deskripsi{" "}
                <span className="font-normal italic text-[#C8A15A]">
                  Properti
                </span>
              </h2>
              <p className="mt-4 text-sm sm:text-[15px] font-light leading-relaxed text-white/75">
                {property.description}
              </p>

              {property.accessibility && (
                <div className="mt-6 pt-5 border-t border-white/10">
                  <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A15A] mb-2">
                    Aksesibilitas &amp; Lokasi Strategis
                  </h3>
                  <p className="text-sm font-light leading-relaxed text-white/70">
                    {property.accessibility}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-[#063D36]/30 border border-[#C8A15A]/30 p-4 sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C8A15A] mb-1.5">
                Penawaran Eksklusif
              </p>
              <p className="text-sm text-white/85 leading-relaxed">
                {property.exclusiveOffer}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-[#0B1513]/85 backdrop-blur-xl border border-[#C8A15A]/18 p-6 sm:p-8">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C8A15A]">
              Detail Teknis
            </span>
            <h2 className="mt-1.5 font-sans text-xl sm:text-2xl font-bold text-white mb-5">
              Spesifikasi{" "}
              <span className="font-normal italic text-[#C8A15A]">
                Bangunan
              </span>
            </h2>
            <ul className="divide-y divide-white/10">
              {property.buildingSpecs.map((spec, idx) => (
                <li
                  key={`${spec}-${idx}`}
                  className="py-3 flex items-start gap-3 text-sm text-white/80"
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C8A15A]/15 border border-[#C8A15A]/35 text-[#C8A15A] text-[11px] font-bold">
                    ✓
                  </span>
                  <span className="leading-relaxed">{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeUp>

        {/* Bottom Lead Form */}
        <FadeUp className="mt-10">
          <LeadForm
            propertyId={property.id}
            propertyTitle={property.name}
            source="Detail Properti"
            heading={
              isSold
                ? `Cari Unit Serupa ${property.name}?`
                : `Tertarik dengan ${property.name}?`
            }
            subheading={
              isSold
                ? "Unit ini sudah terjual, namun tim kami siap mengirimkan daftar unit serupa yang masih tersedia beserta promo KPR DP 0%."
                : "Tinggalkan kontak Anda untuk mendapatkan brosur lengkap, simulasi KPR DP 0%, atau menjadwalkan survei lokasi bersama agen kami."
            }
          />
        </FadeUp>
      </main>
    </div>
  );
}
