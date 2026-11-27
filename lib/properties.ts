import type { PropertySummary } from "@/components/PropertyCard";
import {
  CLUSTER_SUKAMUKTI_CHOICES,
  FEATURED_PROPERTIES,
  MAX_SEARCH_PRICE,
  PROPERTIES,
  PROPERTY_TYPE_OPTIONS,
  filterProperties as filterFallbackProperties,
  getPropertyBySlug as getFallbackPropertyBySlug,
  toPropertySummary,
  type ClusterTypeChoice,
  type PropertyItem,
  type PropertySearchFilter,
} from "@/data/properties";
import { formatRupiah } from "@/lib/format";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface DbProperty {
  id: string;
  slug: string;
  title: string;
  location: string;
  price: number;
  type: string | null;
  status: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  land_area: number | null;
  building_area: number | null;
  description: string | null;
  features: string[] | null;
  images: string[] | null;
  is_featured: boolean | null;
  created_at: string;
}

const LEGACY_STATIC_SLUGS = new Set([
  "cluster-sukamukti-islamic-tipe-36",
  "cluster-sukamukti-islamic-tipe-45",
  "villa-resik",
  "taman-katapang-indah",
]);

const DEFAULT_FALLBACK_IMAGE =
  "/images/Cluster-Sukamukti-Islamic-type36/Area-luar-depan-rumah.jpeg";

export function getPropertyHref(slug: string): string {
  if (LEGACY_STATIC_SLUGS.has(slug)) {
    return `/${slug}`;
  }
  return `/properti/${slug}`;
}

function isSoldStatus(status: string | null | undefined): boolean {
  const normalized = (status ?? "").trim().toLowerCase();
  return normalized === "terjual" || normalized === "sold";
}

function getBadgeText(status: string | null | undefined): string {
  const trimmed = (status ?? "").trim();
  if (!trimmed) return "DIJUAL";
  return trimmed.toUpperCase();
}

function formatPriceDisplay(price: number, fallbackLabel?: string): string {
  if (
    fallbackLabel &&
    price > 0 &&
    ((fallbackLabel === "Rp 400 Juta-an" && price === 400_000_000) ||
      (fallbackLabel === "Rp 500 Juta-an" && price === 500_000_000) ||
      (fallbackLabel === "Rp 600 Juta-an" && price === 600_000_000) ||
      (fallbackLabel === "Rp 700 Juta-an" && price === 700_000_000))
  ) {
    return fallbackLabel;
  }
  return formatRupiah(price);
}

function buildMapsUrl(title: string, location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${title} ${location}`
  )}`;
}

export function mapDbPropertyToItem(row: DbProperty): PropertyItem {
  const legacy = getFallbackPropertyBySlug(row.slug);
  const bedrooms = row.bedrooms ?? 2;
  const bathrooms = row.bathrooms ?? 1;
  const buildingArea = row.building_area ?? 36;
  const landArea = row.land_area ?? 60;
  const validImages = (row.images ?? []).filter(Boolean);
  const gallery =
    validImages.length > 0
      ? validImages.map((src, idx) => ({
          src,
          alt: `${row.title} - Foto ${idx + 1}`,
        }))
      : legacy?.gallery ?? [{ src: DEFAULT_FALLBACK_IMAGE, alt: row.title }];

  const sold = isSoldStatus(row.status);
  const description =
    row.description?.trim() ||
    legacy?.description ||
    "Hunian modern dengan legalitas lengkap dan promo DP 0% dari Nusantara Indah Property.";
  const buildingSpecs =
    row.features && row.features.length > 0
      ? row.features
      : legacy?.buildingSpecs ?? [
          `${bedrooms} Kamar Tidur`,
          `${bathrooms} Kamar Mandi`,
          `Luas Bangunan ${buildingArea} m²`,
          `Luas Tanah ${landArea} m²`,
        ];

  const typeLabel =
    buildingArea > 0 ? `📐 Tipe ${buildingArea}` : `📐 LT ${landArea} m²`;

  return {
    id: row.id,
    slug: row.slug,
    href: getPropertyHref(row.slug),
    name: row.title,
    detailTitle: legacy ? legacy.detailTitle : row.title,
    detailLabel: legacy
      ? legacy.detailLabel
      : (row.type || "PROPERTI UNGGULAN").toUpperCase(),
    project: (row.type as PropertyItem["project"]) || "Cluster Sukamukti Islamic",
    status: sold ? "TERJUAL" : "DIJUAL",
    badgeVariant: sold ? "rent" : "sale",
    location: row.location,
    mapsUrl: legacy?.mapsUrl ?? buildMapsUrl(row.title, row.location),
    price: Number(row.price) || 0,
    priceLabel: formatPriceDisplay(Number(row.price) || 0, legacy?.priceLabel),
    specs: [
      `🛏️ ${bedrooms} Kamar`,
      `🛁 ${bathrooms} Kamar Mandi`,
      typeLabel,
    ],
    shortDesc:
      description.length > 140
        ? `${description.slice(0, 137).trimEnd()}...`
        : description,
    description,
    accessibility: legacy?.accessibility,
    exclusiveOffer:
      legacy?.exclusiveOffer ??
      "ALL IN – DP 0%, Bebas Biaya Legalitas (AJB, Sertifikat, Notaris), proses KPR dibantu hingga akad.",
    buildingSpecs,
    thumbnail: gallery[0],
    gallery,
    galleryAriaLabel: `Galeri foto ${row.title}`,
    backHref: legacy?.backHref ?? "/#catalog",
    backLabel: legacy?.backLabel ?? "Kembali ke Properti",
    seoTitle: `${row.title} | Nusantara Indah Property`,
    seoDescription: description,
  };
}

export function mapDbPropertyToSummary(
  row: DbProperty,
  override?: Partial<PropertySummary>
): PropertySummary {
  const item = mapDbPropertyToItem(row);
  return {
    id: row.id,
    title: row.title,
    badgeText: getBadgeText(row.status),
    badgeVariant: isSoldStatus(row.status) ? "rent" : "sale",
    image: item.thumbnail.src,
    imageAlt: item.thumbnail.alt,
    location: row.location,
    priceLabel: item.priceLabel,
    facilities: item.specs,
    backDescription: item.shortDesc,
    href: item.href,
    ...override,
  };
}

async function fetchDbProperties(): Promise<DbProperty[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return null;
    }

    return data as DbProperty[];
  } catch {
    return null;
  }
}

export async function getFeaturedProperties(): Promise<PropertySummary[]> {
  const rows = await fetchDbProperties();
  if (!rows) {
    return FEATURED_PROPERTIES;
  }

  const featuredRows = rows.filter((row) => row.is_featured);
  const source = featuredRows.length > 0 ? featuredRows : rows.slice(0, 3);

  return source.map((row) => {
    // Keep Cluster Sukamukti Islamic featured card routing to the type-choice hub
    // when it is the legacy Tipe 36 seeded entry.
    if (row.slug === "cluster-sukamukti-islamic-tipe-36") {
      return mapDbPropertyToSummary(row, {
        title: "Cluster Sukamukti Islamic",
        facilities: ["🛏️ 2 Kamar", "🛁 1 Kamar Mandi", "📐 Tipe 36 & 45"],
        backDescription: "Pilihan cerdas bagi keluarga modern.",
        href: "/cluster-sukamukti-islamic",
      });
    }
    return mapDbPropertyToSummary(row);
  });
}

export async function getPropertyTypeOptions(): Promise<string[]> {
  const rows = await fetchDbProperties();
  if (!rows) {
    return [...PROPERTY_TYPE_OPTIONS];
  }

  const types = new Set<string>(["Semua Properti"]);
  for (const row of rows) {
    const typeName = row.type?.trim();
    if (typeName) {
      types.add(typeName);
    }
  }
  return Array.from(types);
}

export async function searchProperties({
  location = "",
  propertyType = "Semua Properti",
  maxPrice = MAX_SEARCH_PRICE,
}: PropertySearchFilter): Promise<PropertySummary[]> {
  const rows = await fetchDbProperties();
  if (!rows) {
    return filterFallbackProperties({ location, propertyType, maxPrice }).map(
      toPropertySummary
    );
  }

  const normalizedLocation = location.trim().toLowerCase();

  return rows
    .filter((row) => {
      const matchesLocation =
        !normalizedLocation ||
        row.location.toLowerCase().includes(normalizedLocation) ||
        row.title.toLowerCase().includes(normalizedLocation);
      const matchesType =
        !propertyType ||
        propertyType === "Semua Properti" ||
        (row.type ?? "").toLowerCase() === propertyType.toLowerCase();
      const matchesPrice =
        maxPrice >= MAX_SEARCH_PRICE || Number(row.price) <= maxPrice;

      return matchesLocation && matchesType && matchesPrice;
    })
    .map((row) => mapDbPropertyToSummary(row));
}

export async function getPropertyDetailBySlug(
  slug: string
): Promise<PropertyItem | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        return mapDbPropertyToItem(data as DbProperty);
      }
    } catch {
      // Fall back to static data below
    }
  }

  return getFallbackPropertyBySlug(slug) ?? null;
}

export async function getClusterSukamuktiChoices(): Promise<
  ClusterTypeChoice[]
> {
  const rows = await fetchDbProperties();
  if (!rows) {
    return CLUSTER_SUKAMUKTI_CHOICES;
  }

  const bySlug = new Map(rows.map((row) => [row.slug, row]));

  return CLUSTER_SUKAMUKTI_CHOICES.map((fallbackChoice) => {
    const slug = fallbackChoice.href.replace(/^\//, "");
    const row = bySlug.get(slug);
    if (!row) return fallbackChoice;

    const item = mapDbPropertyToItem(row);
    return {
      ...fallbackChoice,
      priceLabel: item.priceLabel,
      image: item.thumbnail,
      specs: [
        `${row.bedrooms ?? 2} Kamar`,
        `${row.bathrooms ?? 1} Kamar Mandi`,
        `Luas Tipe ${row.building_area ?? 36}`,
      ],
    };
  });
}

export function getStaticPropertyCount(): number {
  return PROPERTIES.length;
}
