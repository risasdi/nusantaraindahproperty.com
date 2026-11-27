"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MAX_SEARCH_PRICE, PROPERTY_TYPE_OPTIONS } from "@/data/properties";
import { formatRupiah } from "@/lib/format";

const MIN_PRICE = 0;
const STEP_PRICE = 50_000_000;

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

  const plusSuffix = maxPrice >= MAX_SEARCH_PRICE ? "+" : "";

  return (
    <div className="search-container" style={containerStyle}>
      <form
        className="search-box"
        action="/search"
        method="get"
        aria-label="Form pencarian properti"
        onSubmit={handleSubmit}
      >
        <div className="search-item">
          <label htmlFor="location">Lokasi</label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Masukkan lokasi"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="search-item">
          <label htmlFor="propertyType">Tipe Properti</label>
          <select
            id="propertyType"
            name="propertyType"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          >
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="search-item price-slider-container">
          <div className="price-header">
            <label htmlFor="priceRange">Rentang Harga</label>
            <span id="price-output">
              {`${formatRupiah(MIN_PRICE)} - ${formatRupiah(maxPrice)}${plusSuffix}`}
            </span>
          </div>
          <input
            type="range"
            id="priceRange"
            name="maxPrice"
            min={MIN_PRICE}
            max={MAX_SEARCH_PRICE}
            step={STEP_PRICE}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="slider"
          />
        </div>

        <button type="submit" className="btn-search">
          Cari Properti
        </button>
      </form>
    </div>
  );
}
