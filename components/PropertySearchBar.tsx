"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MAX_SEARCH_PRICE, PROPERTY_TYPE_OPTIONS } from "@/data/properties";
import { formatRupiah } from "@/lib/format";

const PRICE_OPTIONS = [
  { label: "Semua Harga", value: MAX_SEARCH_PRICE },
  { label: "Maks. Rp 400 Jt", value: 400_000_000 },
  { label: "Maks. Rp 500 Jt", value: 500_000_000 },
  { label: "Maks. Rp 600 Jt", value: 600_000_000 },
  { label: "Maks. Rp 700 Jt", value: 700_000_000 },
  { label: "Maks. Rp 850 Jt", value: 850_000_000 },
] as const;

interface PropertySearchBarProps {
  initialLocation?: string;
  initialPropertyType?: string;
  initialMaxPrice?: number;
  typeOptions?: readonly string[];
  containerStyle?: CSSProperties;
}

export default function PropertySearchBar({
  initialLocation = "",
  initialPropertyType = "Semua Properti",
  initialMaxPrice = MAX_SEARCH_PRICE,
  typeOptions = PROPERTY_TYPE_OPTIONS,
  containerStyle,
}: PropertySearchBarProps) {
  const router = useRouter();
  const [location, setLocation] = useState(initialLocation);
  const [propertyType, setPropertyType] = useState<string>(initialPropertyType);
  const [maxPrice, setMaxPrice] = useState<number>(initialMaxPrice);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams({
      location: location.trim(),
      propertyType,
      maxPrice: String(maxPrice),
    });
    router.push(`/search?${params.toString()}`);
  };

  // Preserve custom maxPrice URL param if user navigated with a custom value
  const hasMatchingOption = PRICE_OPTIONS.some((opt) => opt.value === maxPrice);

  return (
    <div className="w-full" style={containerStyle}>
      <form
        action="/search"
        method="get"
        aria-label="Form pencarian properti"
        onSubmit={handleSubmit}
        className="w-full rounded-2xl lg:rounded-full bg-[#0D1614]/85 backdrop-blur-xl border border-[#C8A15A]/22 p-2.5 lg:p-2 shadow-[0_18px_48px_rgba(0,0,0,0.45)] flex flex-col lg:flex-row lg:items-center gap-2.5 lg:gap-0"
      >
        {/* Location Input */}
        <div className="flex-1 flex items-center gap-3 px-4 py-2 lg:py-1.5 min-w-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-[#C8A15A] shrink-0"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <label htmlFor="location" className="sr-only">
            Lokasi
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Cari lokasi, cluster, atau nama properti..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>

        <span
          aria-hidden="true"
          className="hidden lg:block w-px h-7 bg-white/12 shrink-0"
        />

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-2 px-1.5 lg:px-3">
          {/* Property Type Select */}
          <div className="relative">
            <label htmlFor="propertyType" className="sr-only">
              Tipe Properti
            </label>
            <select
              id="propertyType"
              name="propertyType"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full lg:w-auto appearance-none rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/12 focus:border-[#C8A15A]/60 text-xs sm:text-[13px] font-medium text-white/90 pl-4 pr-9 py-2.5 focus:outline-none transition cursor-pointer"
            >
              {typeOptions.map((option) => (
                <option
                  key={option}
                  value={option}
                  className="bg-[#0A1412] text-white"
                >
                  {option}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="pointer-events-none w-3.5 h-3.5 text-[#C8A15A] absolute right-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Max Price Select */}
          <div className="relative">
            <label htmlFor="priceRange" className="sr-only">
              Rentang Harga
            </label>
            <select
              id="priceRange"
              name="maxPrice"
              value={String(maxPrice)}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full lg:w-auto appearance-none rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/12 focus:border-[#C8A15A]/60 text-xs sm:text-[13px] font-medium text-white/90 pl-4 pr-9 py-2.5 focus:outline-none transition cursor-pointer"
            >
              {!hasMatchingOption && (
                <option
                  value={String(maxPrice)}
                  className="bg-[#0A1412] text-white"
                >
                  Maks. {formatRupiah(maxPrice)}
                </option>
              )}
              {PRICE_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={String(opt.value)}
                  className="bg-[#0A1412] text-white"
                >
                  {opt.label}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="pointer-events-none w-3.5 h-3.5 text-[#C8A15A] absolute right-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Gold Pill Submit Button */}
        <button
          type="submit"
          className="shrink-0 inline-flex items-center justify-center rounded-full bg-[#C8A15A] hover:bg-[#D9B56F] text-[#070D0C] text-xs sm:text-[13px] font-bold tracking-wide px-6 py-3 lg:py-2.5 transition-all duration-300 shadow-[0_6px_20px_rgba(200,161,90,0.28)] cursor-pointer"
        >
          Cari Properti
        </button>
      </form>
    </div>
  );
}
