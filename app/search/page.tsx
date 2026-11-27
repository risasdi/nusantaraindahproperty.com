import type { Metadata } from "next";
import PropertyCard from "@/components/PropertyCard";
import PropertySearchBar from "@/components/PropertySearchBar";
import { MAX_SEARCH_PRICE } from "@/data/properties";
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

  return (
    <div className="results-page">
      <header className="results-header">
        <div className="results-heading">
          <span>HASIL PENCARIAN</span>
          <h1>Temukan properti yang sesuai.</h1>
          <p className="results-summary" id="results-summary">
            {filteredProperties.length} properti ditemukan sesuai pilihan Anda.
          </p>
        </div>
      </header>

      <main className="results-main">
        <PropertySearchBar
          key={`${locationQuery}|${propertyType}|${maxPrice}`}
          initialLocation={locationQuery}
          initialPropertyType={propertyType}
          initialMaxPrice={maxPrice}
          typeOptions={typeOptions}
          containerStyle={{
            marginTop: "-85px",
            marginBottom: "40px",
            padding: 0,
          }}
        />

        <div className="results-grid" id="results-grid">
          {filteredProperties.length === 0 ? (
            <div className="empty-result">
              Belum ada properti yang sesuai dengan lokasi, tipe, dan batas
              harga tersebut. Silakan ubah pilihan pencarian Anda.
            </div>
          ) : (
            filteredProperties.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                delay={Number((index * 0.1).toFixed(1))}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
