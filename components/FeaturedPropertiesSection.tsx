import FadeUp from "./FadeUp";
import PropertyCard, { type PropertySummary } from "./PropertyCard";
import PropertySearchBar from "./PropertySearchBar";
import { FEATURED_PROPERTIES, PROPERTY_TYPE_OPTIONS } from "@/data/properties";

interface FeaturedPropertiesSectionProps {
  properties?: PropertySummary[];
  typeOptions?: readonly string[];
}

export default function FeaturedPropertiesSection({
  properties = FEATURED_PROPERTIES,
  typeOptions = PROPERTY_TYPE_OPTIONS,
}: FeaturedPropertiesSectionProps) {
  return (
    <section
      id="catalog"
      className="relative overflow-hidden bg-[#070D0C] py-20 sm:py-24 scroll-mt-24"
    >
      {/* Subtle Horizontal Section Divider */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C8A15A]/25 to-transparent"
      />

      {/* Ambient Emerald + Gold Glow behind the Portfolio Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[min(92vw,960px)] rounded-full bg-gradient-to-r from-[#063D36]/55 via-[#C8A15A]/26 to-[#063D36]/55 blur-[130px]"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8">
        {/* Portfolio Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C8A15A] mb-2">
              Koleksi Unggulan
            </span>
            <FadeUp
              as="h2"
              className="font-sans text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-white leading-tight"
            >
              Eksplorasi{" "}
              <span className="font-normal italic text-[#C8A15A]">
                Portofolio
              </span>
            </FadeUp>
          </div>

          <p className="text-xs sm:text-sm text-white/55 font-medium">
            {properties.length} properti pilihan tersedia
          </p>
        </div>

        {/* Dark Pill Search Bar */}
        <div className="mb-10">
          <PropertySearchBar typeOptions={typeOptions} />
        </div>

        {/* 3-Column Dark Glass Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              delay={Number(((index + 1) * 0.08).toFixed(2))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
