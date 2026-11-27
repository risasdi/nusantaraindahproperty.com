import type { PropertySummary } from "@/components/PropertyCard";

export interface PropertyImage {
  src: string;
  alt: string;
}

export type PropertyProjectName =
  | "Cluster Sukamukti Islamic"
  | "Villa Resik"
  | "Taman Indah Katapang";

export interface PropertyItem {
  id: string;
  slug: string;
  href: string;
  name: string;
  detailTitle: string;
  detailLabel: string;
  project: PropertyProjectName;
  status: "DIJUAL" | "TERJUAL";
  badgeVariant: "sale" | "rent";
  location: string;
  mapsUrl: string;
  price: number;
  priceLabel: string;
  specs: string[];
  shortDesc: string;
  description: string;
  accessibility?: string;
  exclusiveOffer: string;
  buildingSpecs: string[];
  thumbnail: PropertyImage;
  gallery: PropertyImage[];
  galleryAriaLabel: string;
  backHref: string;
  backLabel: string;
  seoTitle: string;
  seoDescription: string;
}

export interface ClusterTypeChoice {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  specs: string[];
  ctaLabel: string;
  href: string;
  image: PropertyImage;
}

export const PROPERTY_TYPE_OPTIONS = [
  "Semua Properti",
  "Cluster Sukamukti Islamic",
  "Villa Resik",
  "Taman Indah Katapang",
] as const;

export const MAX_SEARCH_PRICE = 1_000_000_000;

export const PROPERTIES: PropertyItem[] = [
  {
    id: "cluster-sukamukti-islamic-tipe-36",
    slug: "cluster-sukamukti-islamic-tipe-36",
    href: "/cluster-sukamukti-islamic-tipe-36",
    name: "Cluster Sukamukti Islamic - Tipe 36",
    detailTitle: "Rumah Tipe 36",
    detailLabel: "CLUSTER SUKAMUKTI ISLAMIC",
    project: "Cluster Sukamukti Islamic",
    status: "DIJUAL",
    badgeVariant: "sale",
    location: "Katapang, Bandung, Jawa Barat",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Cluster+Sukamukti+Islamic+Katapang+Bandung+Jawa+Barat",
    price: 400_000_000,
    priceLabel: "Rp 400 Juta-an",
    specs: ["🛏️ 2 Kamar", "🛁 1 Kamar Mandi", "📐 Tipe 36"],
    shortDesc:
      "Pilihan cerdas bagi keluarga modern dengan tata ruang efisien, fungsional, dan mudah dirawat.",
    description:
      "Pilihan cerdas bagi keluarga modern. Menghadirkan tata ruang yang efisien, fungsional, dan mudah dirawat di tengah lingkungan tenang.",
    exclusiveOffer:
      "ALL IN – DP 0%, Booking Fee Rp1.000.000, Gratis Biaya Legalitas (AJB, Sertifikat), Langsung serah terima kunci.",
    buildingSpecs: [
      "Lantai Keramik berkualitas",
      "Kusen Kayu Manglid",
      "Dinding Bata Merah",
      "Pondasi Batu Belah",
      "Besi Struktur 10 SNI",
      "Rangka Atap Baja Ringan",
      "Listrik 1300 Watt",
      "Mesin Air Submersible + Toren Air 300L",
    ],
    thumbnail: {
      src: "/images/Cluster-Sukamukti-Islamic-type36/Area-luar-depan-rumah.jpeg",
      alt: "Tampak depan Cluster Sukamukti Islamic Tipe 36",
    },
    gallery: [
      {
        src: "/images/Cluster-Sukamukti-Islamic-type36/Area-luar-depan-rumah.jpeg",
        alt: "Tampak depan Cluster Sukamukti Islamic Tipe 36",
      },
      {
        src: "/images/Cluster-Sukamukti-Islamic-type36/Area-tengah.jpeg",
        alt: "Ruang tengah Cluster Sukamukti Islamic Tipe 36",
      },
      {
        src: "/images/Cluster-Sukamukti-Islamic-type36/Area-tengah-view-1.jpeg",
        alt: "Ruang tengah view 1 Cluster Sukamukti Islamic Tipe 36",
      },
      {
        src: "/images/Cluster-Sukamukti-Islamic-type36/Area-tengah-view-2.jpeg",
        alt: "Ruang tengah view 2 Cluster Sukamukti Islamic Tipe 36",
      },
      {
        src: "/images/Cluster-Sukamukti-Islamic-type36/Area-toilet.jpeg",
        alt: "Toilet Cluster Sukamukti Islamic Tipe 36",
      },
      {
        src: "/images/Cluster-Sukamukti-Islamic-type36/Kamar-1.jpeg",
        alt: "Kamar 1 Cluster Sukamukti Islamic Tipe 36",
      },
      {
        src: "/images/Cluster-Sukamukti-Islamic-type36/Kamar-2-view.jpeg",
        alt: "Kamar 2 Cluster Sukamukti Islamic Tipe 36",
      },
      {
        src: "/images/Cluster-Sukamukti-Islamic-type36/Loundry-Area.jpeg",
        alt: "Area laundry Cluster Sukamukti Islamic Tipe 36",
      },
      {
        src: "/images/Cluster-Sukamukti-Islamic-type36/Loundry-area-view-2.jpeg",
        alt: "Area laundry view 2 Cluster Sukamukti Islamic Tipe 36",
      },
    ],
    galleryAriaLabel: "Galeri foto Cluster Sukamukti Islamic Tipe 36",
    backHref: "/cluster-sukamukti-islamic",
    backLabel: "Kembali memilih tipe rumah",
    seoTitle: "Cluster Sukamukti Islamic Tipe 36 | Nusantara Indah Property",
    seoDescription: "Detail rumah Tipe 36 Cluster Sukamukti Islamic.",
  },
  {
    id: "cluster-sukamukti-islamic-tipe-45",
    slug: "cluster-sukamukti-islamic-tipe-45",
    href: "/cluster-sukamukti-islamic-tipe-45",
    name: "Cluster Sukamukti Islamic - Tipe 45",
    detailTitle: "Rumah Tipe 45",
    detailLabel: "CLUSTER SUKAMUKTI ISLAMIC",
    project: "Cluster Sukamukti Islamic",
    status: "DIJUAL",
    badgeVariant: "sale",
    location: "Katapang, Bandung, Jawa Barat",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Cluster+Sukamukti+Islamic+Katapang+Bandung+Jawa+Barat",
    price: 500_000_000,
    priceLabel: "Rp 500 Juta-an",
    specs: ["🛏️ 2 Kamar", "🛁 1 Kamar Mandi", "📐 Tipe 45"],
    shortDesc:
      "Simbol kemapanan dengan suasana lingkungan Islami yang menenangkan dan ruang keluarga lebih luas.",
    description:
      "Simbol kemapanan dengan suasana lingkungan Islami yang menenangkan. Tipe 45 menawarkan ruang fungsional yang lebih luas, dirancang khusus untuk kenyamanan keluarga dan nilai investasi yang terus bertumbuh.",
    exclusiveOffer:
      "ALL IN – DP 0%, Booking Fee Rp1.000.000, Gratis Biaya Legalitas (AJB, Sertifikat), Langsung serah terima kunci.",
    buildingSpecs: [
      "Lantai Granit elegan",
      "Kusen Kayu Manglid",
      "Dinding Bata Merah",
      "Pondasi Batu Belah",
      "Besi Struktur 10 SNI",
      "Rangka Atap Baja Ringan",
      "Listrik 1300 Watt",
      "Mesin Air Submersible + Toren Air 300L",
    ],
    thumbnail: {
      src: "/images/Cluster-Sukamukti-Islamic-type45/Tampak-Depan-Rumah.png",
      alt: "Tampak depan Cluster Sukamukti Islamic Tipe 45",
    },
    gallery: [
      {
        src: "/images/Cluster-Sukamukti-Islamic-type45/Tampak-Depan-Rumah.png",
        alt: "Tampak depan Cluster Sukamukti Islamic Tipe 45",
      },
      {
        src: "/images/Cluster-Sukamukti-Islamic-type45/Tampak-Ruang-Tengah-(1).png",
        alt: "Ruang tengah view 1 Cluster Sukamukti Islamic Tipe 45",
      },
      {
        src: "/images/Cluster-Sukamukti-Islamic-type45/Tampak-Ruang-Tengah.png",
        alt: "Ruang tengah Cluster Sukamukti Islamic Tipe 45",
      },
      {
        src: "/images/Cluster-Sukamukti-Islamic-type45/Tampak-Kamar.png",
        alt: "Kamar Cluster Sukamukti Islamic Tipe 45",
      },
      {
        src: "/images/Cluster-Sukamukti-Islamic-type45/Ruang-Dapur.png",
        alt: "Ruang dapur Cluster Sukamukti Islamic Tipe 45",
      },
      {
        src: "/images/Cluster-Sukamukti-Islamic-type45/Tampak-Dapur.png",
        alt: "Tampak dapur Cluster Sukamukti Islamic Tipe 45",
      },
    ],
    galleryAriaLabel: "Galeri foto Cluster Sukamukti Islamic Tipe 45",
    backHref: "/cluster-sukamukti-islamic",
    backLabel: "Kembali memilih tipe rumah",
    seoTitle: "Cluster Sukamukti Islamic Tipe 45 | Nusantara Indah Property",
    seoDescription: "Detail rumah Tipe 45 Cluster Sukamukti Islamic.",
  },
  {
    id: "villa-resik",
    slug: "villa-resik",
    href: "/villa-resik",
    name: "Villa Resik",
    detailTitle: "Villa Resik",
    detailLabel: "PROPERTI UNGGULAN",
    project: "Villa Resik",
    status: "TERJUAL",
    badgeVariant: "rent",
    location: "Buahbatu, Bandung, Jawa Barat",
    mapsUrl: "https://maps.app.goo.gl/bKyEtuNitXt4SqNP6",
    price: 600_000_000,
    priceLabel: "Rp 600 Juta-an",
    specs: ["🛏️ 2 Kamar", "🛁 2 Kamar Mandi", "📐 Tipe 60"],
    shortDesc:
      "Mahakarya arsitektur modern yang memadukan efisiensi tata ruang dengan teknologi pintar (smart home).",
    description:
      "Mahakarya arsitektur modern yang memadukan efisiensi tata ruang dengan teknologi pintar (smart home).",
    accessibility:
      "10 Menit ke Masjid Raya Al-Jabbar, 10 Menit Stasiun Whoosh Tegalluar, 10 Menit Summarecon Mall Bandung, 20 Menit Telkom University.",
    exclusiveOffer:
      "ALL IN – DP 0%, Booking Fee Rp1.000.000, Bebas Biaya (BPHTB, AJB, Balik Nama, Notaris), SHM diurus tuntas.",
    buildingSpecs: [
      "Smart Door Lock System",
      "Pondasi Batu Belah",
      "Besi Struktur 10 SNI",
      "Dinding Bata Merah",
      "Rangka Atap Baja Ringan",
      "Listrik 1300 Watt",
      "Mesin Air Submersible",
    ],
    thumbnail: {
      src: "/images/villa-resik/tampak-depan-rumah.png",
      alt: "Tampak depan Villa Resik",
    },
    gallery: [
      {
        src: "/images/villa-resik/tampak-depan-rumah.png",
        alt: "Tampak depan Villa Resik",
      },
      {
        src: "/images/villa-resik/ruang-tamu-modern-minimalist-bawah-tangga.png",
        alt: "Ruang keluarga Villa Resik",
      },
      {
        src: "/images/villa-resik/ruang-keluarga-atas-modern-minimalist.png",
        alt: "Ruang keluarga Villa Resik",
      },
      {
        src: "/images/villa-resik/kamar-tidur.png",
        alt: "Kamar Villa Resik",
      },
      {
        src: "/images/villa-resik/dapur-modern-minimalist.png",
        alt: "Dapur Villa Resik",
      },
      {
        src: "/images/villa-resik/toilet.png",
        alt: "Tampak toilet Villa Resik",
      },
    ],
    galleryAriaLabel: "Galeri foto Villa Resik",
    backHref: "/#catalog",
    backLabel: "Kembali ke Properti",
    seoTitle: "Villa Resik | Nusantara Indah Property",
    seoDescription: "Detail Villa Resik dari Nusantara Indah Property.",
  },
  {
    id: "taman-katapang-indah",
    slug: "taman-katapang-indah",
    href: "/taman-katapang-indah",
    name: "Taman Indah Katapang",
    detailTitle: "Taman Indah Katapang",
    detailLabel: "PROPERTI UNGGULAN",
    project: "Taman Indah Katapang",
    status: "DIJUAL",
    badgeVariant: "sale",
    location: "Katapang, Bandung, Jawa Barat",
    mapsUrl: "https://maps.app.goo.gl/HPZQEPiCbdbkP3Pk7",
    price: 700_000_000,
    priceLabel: "Rp 700 Juta-an",
    specs: ["🛏️ 2 Kamar", "🛁 2 Kamar Mandi", "📐 Tipe 70"],
    shortDesc:
      "Rumah ideal berkonsep asri di lingkungan yang aman dan 100% bebas banjir.",
    description:
      "Rumah ideal berkonsep asri di lingkungan yang aman dan 100% bebas banjir. Dirancang dengan ruang yang lapang, aksesibilitas strategis.",
    accessibility:
      "15-20 Menit ke RSUD Otista, 20 Menit Akses Tol Soroja, 20 Menit Pusat Kota Soreang.",
    exclusiveOffer:
      "ALL IN – DP 0%, Booking Fee Rp5.000.000, Bebas Biaya (BPHTB, AJB, Balik Nama, Notaris), SHM diurus tuntas.",
    buildingSpecs: [
      "2 Kamar Tidur",
      "1 Kamar Mandi",
      "Pondasi Batu Belah",
      "Besi Struktur 10 SNI",
      "Dinding Bata Merah",
      "Rangka Atap Baja Ringan",
      "Listrik 1300 Watt",
      "Mesin Air Submersible",
    ],
    thumbnail: {
      src: "/images/taman-katapang-indah/rumah-tampak-depan.png",
      alt: "Rumah tampak depan Taman Indah Katapang",
    },
    gallery: [
      {
        src: "/images/taman-katapang-indah/rumah-tampak-depan.png",
        alt: "Rumah tampak depan Taman Indah Katapang",
      },
      {
        src: "/images/taman-katapang-indah/ruang-tamu.jpg",
        alt: "Ruang tamu Taman Indah Katapang",
      },
      {
        src: "/images/taman-katapang-indah/kamar-tidur.jpg",
        alt: "Kamar tidur Taman Indah Katapang",
      },
      {
        src: "/images/taman-katapang-indah/dapur-estetik.jpg",
        alt: "Dapur estetik Taman Indah Katapang",
      },
      {
        src: "/images/taman-katapang-indah/ruang-kerja.jpg",
        alt: "Ruang kerja Taman Indah Katapang",
      },
      {
        src: "/images/taman-katapang-indah/balkon-lantai-2.jpg",
        alt: "Balkon lantai 2 Taman Indah Katapang",
      },
      {
        src: "/images/taman-katapang-indah/kamar-open-view.jpg",
        alt: "Kamar open view Taman Indah Katapang",
      },
    ],
    galleryAriaLabel: "Galeri foto Taman Indah Katapang",
    backHref: "/#catalog",
    backLabel: "Kembali ke Properti",
    seoTitle: "Taman Indah Katapang | Nusantara Indah Property",
    seoDescription: "Detail Taman Indah Katapang dari Nusantara Indah Property.",
  },
];

export const FEATURED_PROPERTIES: PropertySummary[] = [
  {
    id: "cluster-sukamukti-islamic",
    title: "Cluster Sukamukti Islamic",
    badgeText: "DIJUAL",
    badgeVariant: "sale",
    image:
      "/images/Cluster-Sukamukti-Islamic-type36/Area-luar-depan-rumah.jpeg",
    imageAlt: "Tampak depan Cluster Sukamukti Islamic",
    location: "Katapang, Bandung, Jawa Barat",
    priceLabel: "Rp 400 Juta-an",
    facilities: ["🛏️ 2 Kamar", "🛁 1 Kamar Mandi", "📐 Tipe 36 & 45"],
    backDescription: "Pilihan cerdas bagi keluarga modern.",
    href: "/cluster-sukamukti-islamic",
  },
  {
    id: "villa-resik",
    title: "Villa Resik",
    badgeText: "TERJUAL",
    badgeVariant: "rent",
    image: "/images/villa-resik/tampak-depan-rumah.png",
    imageAlt: "Tampak Depan Villa Resik",
    location: "Buahbatu, Bandung, Jawa Barat",
    priceLabel: "Rp 600 Juta-an",
    facilities: ["🛏️ 2 Kamar", "🛁 2 Kamar Mandi", "📐 Tipe 60"],
    backDescription:
      "Mahakarya arsitektur modern yang memadukan efisiensi tata ruang dengan teknologi pintar (smart home).",
    href: "/villa-resik",
  },
  {
    id: "taman-indah-katapang",
    title: "Taman Indah Katapang",
    badgeText: "DIJUAL",
    badgeVariant: "sale",
    image: "/images/taman-katapang-indah/rumah-tampak-depan.png",
    imageAlt: "Rumah tampak depan Taman Indah Katapang",
    location: "Katapang, Bandung, Jawa Barat",
    priceLabel: "Rp 700 Juta-an",
    facilities: ["🛏️ 2 Kamar", "🛁 2 Kamar Mandi", "📐 Tipe 70"],
    backDescription:
      "Rumah ideal berkonsep asri di lingkungan yang aman dan 100% bebas banjir.",
    href: "/taman-katapang-indah",
  },
];

export const CLUSTER_SUKAMUKTI_CHOICES: ClusterTypeChoice[] = [
  {
    id: "tipe-36",
    title: "Tipe 36",
    description:
      "Hunian ringkas dan nyaman untuk keluarga yang mengutamakan efisiensi ruang.",
    priceLabel: "Rp 400 Juta-an",
    specs: ["2 Kamar", "1 Kamar Mandi", "Luas Tipe 36"],
    ctaLabel: "Lihat Detail Tipe 36",
    href: "/cluster-sukamukti-islamic-tipe-36",
    image: {
      src: "/images/Cluster-Sukamukti-Islamic-type36/Area-luar-depan-rumah.jpeg",
      alt: "Tampak depan Cluster Sukamukti Islamic Tipe 36",
    },
  },
  {
    id: "tipe-45",
    title: "Tipe 45",
    description:
      "Hunian nyaman dengan ruang keluarga yang lebih lapang untuk aktivitas harian.",
    priceLabel: "Rp 500 Juta-an",
    specs: ["2 Kamar", "1 Kamar Mandi", "Luas Tipe 45"],
    ctaLabel: "Lihat Detail Tipe 45",
    href: "/cluster-sukamukti-islamic-tipe-45",
    image: {
      src: "/images/Cluster-Sukamukti-Islamic-type45/Tampak-Depan-Rumah.png",
      alt: "Tampak depan Cluster Sukamukti Islamic Tipe 45",
    },
  },
];

export function getPropertyBySlug(slug: string): PropertyItem | undefined {
  return PROPERTIES.find((property) => property.slug === slug);
}

export function toPropertySummary(property: PropertyItem): PropertySummary {
  return {
    id: property.id,
    title: property.name,
    badgeText: property.status,
    badgeVariant: property.badgeVariant,
    image: property.thumbnail.src,
    imageAlt: property.thumbnail.alt,
    location: property.location,
    priceLabel: property.priceLabel,
    facilities: property.specs,
    backDescription: property.shortDesc,
    href: property.href,
  };
}

export interface PropertySearchFilter {
  location?: string;
  propertyType?: string;
  maxPrice?: number;
}

export function filterProperties({
  location = "",
  propertyType = "Semua Properti",
  maxPrice = MAX_SEARCH_PRICE,
}: PropertySearchFilter): PropertyItem[] {
  const normalizedLocation = location.trim().toLowerCase();

  return PROPERTIES.filter((property) => {
    const matchesLocation =
      !normalizedLocation ||
      property.location.toLowerCase().includes(normalizedLocation) ||
      property.name.toLowerCase().includes(normalizedLocation);
    const matchesType =
      !propertyType ||
      propertyType === "Semua Properti" ||
      property.project === propertyType;
    const matchesPrice = property.price <= maxPrice;

    return matchesLocation && matchesType && matchesPrice;
  });
}
