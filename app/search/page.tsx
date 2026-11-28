import type { Metadata } from "next";
import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import PropertySearchBar from "@/components/PropertySearchBar";
import { MAX_SEARCH_PRICE } from "@/data/properties";
import { formatRupiah } from "@/lib/format";
import { getPropertyTypeOptions, searchProperties } from "@/lib/properties";

export const metadata: Metadata = {
  title: "Hasil Pencarian | Nusantara Indah Property",
  description: "Hasil pencarian properti Nusantara Indah Property.",
};

interface SearchPageProps {
  searchParams: Promise<{
    location?: string | string[];
    propertyType?: string | string[];
    maxPrice?: string | string[];
  }>;
}

function getSingleParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const locationQuery = getSingleParam(params.location).trim();
  const propertyType = getSingleParam(params.propertyType) || "Semua Properti";
  const maxPriceRaw = getSingleParam(params.maxPrice);
  const parsedMaxPrice = maxPriceRaw ? Number(maxPriceRaw) : NaN;
  const maxPrice = Number.isFinite(parsedMaxPrice)
    ? parsedMaxPrice
    : MAX_SEARCH_PRICE;

  const [filteredProperties, typeOptions] = await Promise.all([
    searchProperties({
      location: locationQuery,
      propertyType,
      maxPrice,
    }),
    getPropertyTypeOptions(),
  ]);

  const hasActiveFilters =
    Boolean(locationQuery) ||
    propertyType !== "Semua Properti" ||
    maxPrice < MAX_SEARCH_PRICE;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070D0C] text-white">
      {/* Ambient Emerald + Gold Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 h-[380px] w-[min(92vw,920px)] rounded-full bg-gradient-to-r from-[#063D36]/55 via-[#C8A15A]/24 to-[#063D36]/55 blur-[130px]"
      />

      <main className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 pt-8 sm:pt-12 pb-20 sm:pb-24">
        {/* Clean non-overlapping header + summary (safe at <= 620px mobile) */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C8A15A] mb-2">
              Hasil Pencarian
            </span>
            <h1 className="font-sans text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Eksplorasi{" "}
              <span className="font-normal italic text-[#C8A15A]">
                Portofolio
              </span>
            </h1>
          </div>

          <p
            className="text-xs sm:text-sm text-white/60 font-medium"
            id="results-summary"
          >
            {filteredProperties.length} properti ditemukan sesuai pilihan Anda.
          </p>
        </header>

        {/* Dark Pill Search Bar — zero negative margin so it never overlaps results-summary on mobile */}
        <div className="mb-6 sm:mb-8">
          <PropertySearchBar
            key={`${locationQuery}|${propertyType}|${maxPrice}`}
            initialLocation={locationQuery}
            initialPropertyType={propertyType}
            initialMaxPrice={maxPrice}
            typeOptions={typeOptions}
          />
        </div>

        {/* Active Filter Pills + Reset */}
        {hasActiveFilters && (
          <div className="mb-8 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-white/45 mr-1">Filter aktif:</span>
            {locationQuery && (
              <span className="rounded-full bg-white/[0.06] border border-[#C8A15A]/25 px-3 py-1 text-white/85">
                Lokasi: {locationQuery}
              </span>
            )}
            {propertyType !== "Semua Properti" && (
              <span className="rounded-full bg-white/[0.06] border border-[#C8A15A]/25 px-3 py-1 text-white/85">
                Tipe: {propertyType}
              </span>
            )}
            {maxPrice < MAX_SEARCH_PRICE && (
              <span className="rounded-full bg-white/[0.06] border border-[#C8A15A]/25 px-3 py-1 text-white/85">
                Maks: {formatRupiah(maxPrice)}
              </span>
            )}
            <Link
              href="/search"
              className="ml-1 text-[#C8A15A] hover:text-[#D9B56F] font-semibold underline underline-offset-4"
            >
              Reset Filter
            </Link>
          </div>
        )}

        {/* 3-Column Dark Glass Property Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          id="results-grid"
        >
          {filteredProperties.length === 0 ? (
            <div className="col-span-full rounded-2xl bg-[#0B1513]/85 backdrop-blur-xl border border-[#C8A15A]/20 py-14 px-6 text-center space-y-4">
              <p className="text-white/70 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                Belum ada properti yang sesuai dengan lokasi, tipe, dan batas
                harga tersebut. Silakan ubah pilihan pencarian Anda.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center justify-center rounded-full bg-[#C8A15A] hover:bg-[#D9B56F] text-[#070D0C] text-xs font-bold px-6 py-2.5 transition"
              >
                Tampilkan Semua Properti
              </Link>
            </div>
          ) : (
            filteredProperties.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                delay={Number((index * 0.08).toFixed(2))}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
