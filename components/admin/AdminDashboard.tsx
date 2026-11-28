"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatRupiah, formatThousands } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { DbProperty } from "@/lib/properties";
import { useAdminActions } from "./AdminShell";
import {
  BuildingIcon,
  CheckCircleIcon,
  CloseIcon,
  EditIcon,
  EyeIcon,
  MapPinIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  TagIcon,
  TrashIcon,
} from "./AdminIcons";

const LEGACY_SLUGS = new Set([
  "cluster-sukamukti-islamic-tipe-36",
  "cluster-sukamukti-islamic-tipe-45",
  "villa-resik",
  "taman-katapang-indah",
]);

function getPublicHref(slug: string): string {
  return LEGACY_SLUGS.has(slug) ? `/${slug}` : `/properti/${slug}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function extractArea(location: string): string {
  const firstSegment = location.split(",")[0]?.trim() ?? "";
  return firstSegment;
}

function formatBillionsValue(amount: number): string {
  const val = (amount / 1_000_000_000).toFixed(
    amount % 1_000_000_000 === 0 ? 0 : 1
  );
  return val.replace(".", ",");
}

function formatCompactPrice(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${formatBillionsValue(amount)} M`;
  }
  if (amount >= 1_000_000) {
    const val = Math.round(amount / 1_000_000);
    return `Rp ${val} Jt`;
  }
  return formatRupiah(amount);
}

function formatCompactPriceRange(minPrice: number, maxPrice: number): string {
  if (minPrice === maxPrice) {
    return formatCompactPrice(minPrice);
  }
  if (
    minPrice >= 1_000_000 &&
    minPrice < 1_000_000_000 &&
    maxPrice >= 1_000_000 &&
    maxPrice < 1_000_000_000
  ) {
    return `Rp ${Math.round(minPrice / 1_000_000)}–${Math.round(maxPrice / 1_000_000)} Jt`;
  }
  if (minPrice >= 1_000_000_000 && maxPrice >= 1_000_000_000) {
    return `Rp ${formatBillionsValue(minPrice)}–${formatBillionsValue(maxPrice)} M`;
  }
  if (minPrice >= 1_000_000 && maxPrice >= 1_000_000_000) {
    return `Rp ${Math.round(minPrice / 1_000_000)} Jt–${formatBillionsValue(maxPrice)} M`;
  }
  return `${formatCompactPrice(minPrice)} – ${formatCompactPrice(maxPrice)}`;
}

interface PropertyFormState {
  title: string;
  slug: string;
  location: string;
  price: string;
  type: string;
  status: string;
  bedrooms: string;
  bathrooms: string;
  land_area: string;
  building_area: string;
  description: string;
  featuresText: string;
  images: string[];
  is_featured: boolean;
}

const EMPTY_FORM: PropertyFormState = {
  title: "",
  slug: "",
  location: "",
  price: "",
  type: "Rumah",
  status: "DIJUAL",
  bedrooms: "2",
  bathrooms: "1",
  land_area: "60",
  building_area: "36",
  description: "",
  featuresText: "",
  images: [],
  is_featured: false,
};

function propertyToForm(property: DbProperty): PropertyFormState {
  return {
    title: property.title,
    slug: property.slug,
    location: property.location,
    price: formatThousands(Number(property.price) || 0),
    type: property.type ?? "Rumah",
    status: property.status ?? "DIJUAL",
    bedrooms: String(property.bedrooms ?? 2),
    bathrooms: String(property.bathrooms ?? 1),
    land_area: String(property.land_area ?? 60),
    building_area: String(property.building_area ?? 36),
    description: property.description ?? "",
    featuresText: (property.features ?? []).join("\n"),
    images: property.images ?? [],
    is_featured: Boolean(property.is_featured),
  };
}

type StatusFilter = "all" | "available" | "sold" | "featured";

interface AdminDashboardProps {
  initialProperties: DbProperty[];
  initialError: string | null;
  showKpiCards?: boolean;
  autoOpenCreate?: boolean;
}

const INPUT_CLASS =
  "w-full h-11 px-3.5 rounded-xl border border-white/15 bg-[#070D0C] text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#C8A15A] focus:ring-2 focus:ring-[#C8A15A]/20 transition";

const TEXTAREA_CLASS =
  "w-full p-3.5 rounded-xl border border-white/15 bg-[#070D0C] text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#C8A15A] focus:ring-2 focus:ring-[#C8A15A]/20 transition";

export default function AdminDashboard({
  initialProperties,
  initialError,
  showKpiCards = true,
  autoOpenCreate = false,
}: AdminDashboardProps) {
  const router = useRouter();
  const { permissions, registerCreateHandler } = useAdminActions();
  const canManageProperties = permissions.canManageProperties;

  const [properties, setProperties] = useState<DbProperty[]>(initialProperties);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(
    null
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(
    initialError
      ? {
          type: "error",
          message: `Gagal memuat data dari Supabase: ${initialError}. Pastikan script supabase/seed.sql (GRANT & RLS policy) sudah dijalankan.`,
        }
      : null
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(
    autoOpenCreate && canManageProperties
  );
  const [editingProperty, setEditingProperty] = useState<DbProperty | null>(
    null
  );
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState<PropertyFormState>(EMPTY_FORM);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<DbProperty | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreateModal = useCallback(() => {
    if (!canManageProperties) return;
    setEditingProperty(null);
    setSlugTouched(false);
    setForm(EMPTY_FORM);
    setManualImageUrl("");
    setFormError(null);
    setIsModalOpen(true);
  }, [canManageProperties]);

  const closeModal = useCallback(() => {
    if (saving || uploadingImages) return;
    setIsModalOpen(false);
    setEditingProperty(null);
    setFormError(null);
  }, [saving, uploadingImages]);

  useEffect(() => {
    if (!canManageProperties) {
      registerCreateHandler(null);
      return;
    }
    registerCreateHandler(openCreateModal);
    return () => registerCreateHandler(null);
  }, [canManageProperties, registerCreateHandler, openCreateModal]);

  // Lock body scroll & close modals via Escape key
  useEffect(() => {
    if (!isModalOpen && !deleteTarget) return;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (deleteTarget && !deleting) {
        setDeleteTarget(null);
      } else if (isModalOpen && !saving && !uploadingImages) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, deleteTarget, deleting, saving, uploadingImages, closeModal]);

  const reloadProperties = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setFeedback({ type: "error", message: error.message });
      return;
    }

    setProperties((data as DbProperty[] | null) ?? []);
    router.refresh();
  };

  const openEditModal = (property: DbProperty) => {
    if (!canManageProperties) return;
    setEditingProperty(property);
    setSlugTouched(true);
    setForm(propertyToForm(property));
    setManualImageUrl("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: !editingProperty && !slugTouched ? slugify(value) : prev.slug,
    }));
  };

  const handlePriceChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "");
    setForm((prev) => ({
      ...prev,
      price: digits ? formatThousands(digits) : "",
    }));
  };

  const handleToggleFeatured = async (property: DbProperty) => {
    if (!canManageProperties) return;
    setTogglingFeaturedId(property.id);
    const nextValue = !property.is_featured;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("properties")
        .update({ is_featured: nextValue })
        .eq("id", property.id);

      if (error) throw error;

      setProperties((prev) =>
        prev.map((item) =>
          item.id === property.id ? { ...item, is_featured: nextValue } : item
        )
      );
      router.refresh();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Gagal mengubah status unggulan.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setFormError(null);

    try {
      const supabase = createClient();
      const uploadedUrls: string[] = [];
      const baseSlug = slugify(form.slug || form.title || "property");

      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const safeName = file.name
          .replace(/\.[^.]+$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9-_]/g, "-")
          .slice(0, 40);
        const filePath = `${baseSlug}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}-${safeName}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Upload "${file.name}" gagal: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("property-images")
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));
      }
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Gagal mengunggah gambar ke bucket property-images."
      );
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleAddManualImage = () => {
    const trimmed = manualImageUrl.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, trimmed],
    }));
    setManualImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setForm((prev) => {
      const next = [...prev.images];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      return { ...prev, images: next };
    });
  };

  const handleSaveProperty = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canManageProperties) return;
    setFormError(null);

    const cleanSlug = slugify(form.slug);
    const numericPrice = Number(form.price.replace(/[^0-9]/g, ""));

    if (!form.title.trim() || !cleanSlug || !form.location.trim()) {
      setFormError("Judul, slug, dan lokasi wajib diisi.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setFormError("Harga properti harus berupa angka lebih dari 0.");
      return;
    }

    const features = form.featuresText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      slug: cleanSlug,
      title: form.title.trim(),
      location: form.location.trim(),
      price: numericPrice,
      type: form.type.trim() || "Rumah",
      status: form.status.trim() || "DIJUAL",
      bedrooms: Math.max(0, parseInt(form.bedrooms, 10) || 0),
      bathrooms: Math.max(0, parseInt(form.bathrooms, 10) || 0),
      land_area: Math.max(0, parseInt(form.land_area, 10) || 0),
      building_area: Math.max(0, parseInt(form.building_area, 10) || 0),
      description: form.description.trim() || null,
      features,
      images: form.images,
      is_featured: form.is_featured,
    };

    setSaving(true);

    try {
      const supabase = createClient();

      if (editingProperty) {
        const { error } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", editingProperty.id);

        if (error) throw error;

        setFeedback({
          type: "success",
          message: `Properti "${payload.title}" berhasil diperbarui.`,
        });
      } else {
        const { error } = await supabase.from("properties").insert(payload);

        if (error) throw error;

        setFeedback({
          type: "success",
          message: `Properti "${payload.title}" berhasil ditambahkan.`,
        });
      }

      setIsModalOpen(false);
      setEditingProperty(null);
      await reloadProperties();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Gagal menyimpan data properti.";
      setFormError(
        msg.includes("duplicate key") || msg.includes("23505")
          ? `Slug "${cleanSlug}" sudah dipakai properti lain. Gunakan slug yang unik.`
          : msg
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !canManageProperties) return;
    setDeleting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) throw error;

      setFeedback({
        type: "success",
        message: `Properti "${deleteTarget.title}" berhasil dihapus.`,
      });
      setDeleteTarget(null);
      await reloadProperties();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Gagal menghapus properti.";
      setFeedback({ type: "error", message: msg });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // KPI calculations
  const totalCount = properties.length;
  const soldCount = properties.filter(
    (p) => (p.status ?? "").toLowerCase() === "terjual"
  ).length;
  const availableCount = totalCount - soldCount;
  const featuredCount = properties.filter((p) => p.is_featured).length;

  const prices = properties
    .map((p) => Number(p.price))
    .filter((price) => Number.isFinite(price) && price > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const priceRangeDisplay =
    prices.length === 0
      ? "Rp 0"
      : formatCompactPriceRange(minPrice, maxPrice);

  // Dynamic area options (text before the first comma in location)
  const areaOptions = Array.from(
    new Set(
      properties
        .map((p) => extractArea(p.location))
        .filter((area) => area.length > 0)
    )
  ).sort((a, b) => a.localeCompare(b, "id"));

  // Table filtering
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProperties = properties.filter((p) => {
    const isSold = (p.status ?? "").toLowerCase() === "terjual";
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && !isSold) ||
      (statusFilter === "sold" && isSold) ||
      (statusFilter === "featured" && Boolean(p.is_featured));

    const propertyArea = extractArea(p.location).toLowerCase();
    const matchesArea =
      areaFilter === "all" || propertyArea === areaFilter.toLowerCase();

    const matchesSearch =
      !normalizedQuery ||
      p.title.toLowerCase().includes(normalizedQuery) ||
      p.location.toLowerCase().includes(normalizedQuery) ||
      p.slug.toLowerCase().includes(normalizedQuery) ||
      (p.type ?? "").toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesArea && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
      {feedback && (
        <div
          role="status"
          className={`rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 border text-sm font-medium ${
            feedback.type === "success"
              ? "bg-emerald-500/15 border-emerald-400/35 text-emerald-100"
              : "bg-rose-500/15 border-rose-400/35 text-rose-100"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold opacity-80 hover:opacity-100 cursor-pointer shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Row 1: 4 Dark Glass Bento KPI Stat Cards */}
      {showKpiCards && (
        <section
          aria-label="Ringkasan statistik properti"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
        >
          {/* KPI 1: Total Properti */}
          <div className="bg-[#0B1513] rounded-2xl p-5 border border-[#C8A15A]/18 hover:border-[#C8A15A]/38 transition">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
                  Total Properti
                </p>
                <p className="text-3xl font-sans font-bold text-white mt-2">
                  {totalCount}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/12 text-[#C8A15A] flex items-center justify-center shrink-0">
                <BuildingIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-white/50 mt-3 pt-3 border-t border-white/10">
              Total listing aktif di database Supabase
            </p>
          </div>

          {/* KPI 2: Tersedia / Dijual */}
          <div className="bg-[#0B1513] rounded-2xl p-5 border border-[#C8A15A]/18 hover:border-[#C8A15A]/38 transition">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
                  Tersedia / Dijual
                </p>
                <p className="text-3xl font-sans font-bold text-emerald-400 mt-2">
                  {availableCount}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCircleIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-white/50 mt-3 pt-3 border-t border-white/10">
              {soldCount} unit berstatus terjual
            </p>
          </div>

          {/* KPI 3: Properti Unggulan */}
          <div className="bg-[#0B1513] rounded-2xl p-5 border border-[#C8A15A]/18 hover:border-[#C8A15A]/38 transition">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
                  Properti Unggulan
                </p>
                <p className="text-3xl font-sans font-bold text-[#C8A15A] mt-2">
                  {featuredCount}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#C8A15A]/15 border border-[#C8A15A]/30 text-[#C8A15A] flex items-center justify-center shrink-0">
                <StarIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-white/50 mt-3 pt-3 border-t border-white/10">
              Ditampilkan pada katalog unggulan Homepage
            </p>
          </div>

          {/* KPI 4: Rentang Harga */}
          <div className="bg-[#0B1513] rounded-2xl p-5 border border-[#C8A15A]/18 hover:border-[#C8A15A]/38 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
                  Rentang Harga
                </p>
                <p className="text-xl xl:text-[1.2rem] 2xl:text-2xl font-sans font-bold text-white mt-2 tabular-nums leading-snug">
                  {priceRangeDisplay}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/12 text-[#C8A15A] flex items-center justify-center shrink-0">
                <TagIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-white/50 mt-3 pt-3 border-t border-white/10 tabular-nums leading-relaxed">
              {prices.length > 0
                ? `${formatRupiah(minPrice)} – ${formatRupiah(maxPrice)}`
                : "Belum ada data harga"}
            </p>
          </div>
        </section>
      )}

      {/* Row 2: Clean Dark Properties Table Card */}
      <section className="bg-[#0B1513] rounded-2xl border border-white/10 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-white/10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-sans text-lg font-bold text-white">
                  Daftar Properti
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C8A15A]/15 text-[#E6C98F] border border-[#C8A15A]/30">
                  {filteredProperties.length} unit
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Kelola listing properti, status penjualan, dan foto katalog.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <SearchIcon className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                placeholder="Cari judul, lokasi, atau tipe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-white/15 bg-[#070D0C] text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#C8A15A] focus:ring-2 focus:ring-[#C8A15A]/20 transition"
              />
            </div>

            {/* Status Filter */}
            <select
              aria-label="Filter status properti"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="h-10 px-3.5 rounded-xl border border-white/15 bg-[#070D0C] text-sm font-medium text-white focus:outline-none focus:border-[#C8A15A] focus:ring-2 focus:ring-[#C8A15A]/20 transition cursor-pointer"
            >
              <option value="all" className="bg-[#0A1412] text-white">
                Semua Status ({totalCount})
              </option>
              <option value="available" className="bg-[#0A1412] text-white">
                Dijual / Tersedia ({availableCount})
              </option>
              <option value="sold" className="bg-[#0A1412] text-white">
                Terjual ({soldCount})
              </option>
              <option value="featured" className="bg-[#0A1412] text-white">
                Unggulan ({featuredCount})
              </option>
            </select>

            {/* Area Filter */}
            <select
              aria-label="Filter area properti"
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="h-10 px-3.5 rounded-xl border border-white/15 bg-[#070D0C] text-sm font-medium text-white focus:outline-none focus:border-[#C8A15A] focus:ring-2 focus:ring-[#C8A15A]/20 transition cursor-pointer"
            >
              <option value="all" className="bg-[#0A1412] text-white">
                Semua Area
              </option>
              {areaOptions.map((area) => (
                <option
                  key={area}
                  value={area}
                  className="bg-[#0A1412] text-white"
                >
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F1D1A] border-b border-white/10 text-white/55 text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-5 font-semibold">Properti</th>
                <th className="py-3.5 px-4 font-semibold">Harga &amp; Spek</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Unggulan</th>
                <th className="py-3.5 px-5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8 text-sm">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-16 px-6 text-center text-white/55"
                  >
                    <p className="font-semibold text-white/85">
                      {properties.length === 0
                        ? "Belum ada data properti di Supabase"
                        : "Tidak ada properti yang cocok dengan filter"}
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      {properties.length === 0
                        ? "Tambahkan properti pertama Anda atau jalankan supabase/seed.sql di SQL Editor."
                        : "Coba ubah kata kunci pencarian atau reset filter status."}
                    </p>
                    {properties.length === 0 && canManageProperties && (
                      <button
                        type="button"
                        onClick={openCreateModal}
                        className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#C8A15A] text-[#070D0C] text-xs font-bold hover:bg-[#D9B56F] transition cursor-pointer"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Tambah Properti Baru
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProperties.map((property) => {
                  const thumb = property.images?.[0];
                  const isSold =
                    (property.status ?? "").toLowerCase() === "terjual";
                  const isToggling = togglingFeaturedId === property.id;

                  return (
                    <tr
                      key={property.id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Thumbnail + Title + Location */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5 min-w-[260px]">
                          <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-[#070D0C] shrink-0 border border-white/12">
                            {thumb ? (
                              <Image
                                src={thumb}
                                alt={property.title}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-white/35 font-semibold">
                                No Img
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate max-w-[260px]">
                              {property.title}
                            </p>
                            <p className="text-xs text-white/60 flex items-center gap-1 mt-0.5 truncate max-w-[260px]">
                              <MapPinIcon className="w-3.5 h-3.5 text-[#C8A15A] shrink-0" />
                              <span className="truncate">
                                {property.location}
                              </span>
                            </p>
                            <span className="inline-block mt-1 text-[11px] font-medium text-white/40">
                              {property.type || "Rumah"} &bull; /{property.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Price & Specs */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-sans font-bold text-[#E6C98F]">
                          {formatRupiah(Number(property.price) || 0)}
                        </p>
                        <p className="text-xs text-white/55 mt-0.5">
                          {property.bedrooms ?? 0} KT &bull;{" "}
                          {property.bathrooms ?? 0} KM &bull; LB{" "}
                          {property.building_area ?? 0}m² / LT{" "}
                          {property.land_area ?? 0}m²
                        </p>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isSold
                              ? "bg-rose-500/15 text-rose-200 ring-1 ring-inset ring-rose-400/35"
                              : "bg-emerald-500/15 text-emerald-200 ring-1 ring-inset ring-emerald-400/35"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSold ? "bg-rose-400" : "bg-emerald-400"
                            }`}
                          />
                          {property.status || "Tersedia"}
                        </span>
                      </td>

                      {/* Featured Toggle / Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {canManageProperties ? (
                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleToggleFeatured(property)}
                            title={
                              property.is_featured
                                ? "Hapus dari Properti Unggulan"
                                : "Jadikan Properti Unggulan"
                            }
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${
                              property.is_featured
                                ? "bg-[#C8A15A]/18 text-[#E6C98F] ring-1 ring-inset ring-[#C8A15A]/45 hover:bg-[#C8A15A]/28"
                                : "bg-white/[0.06] text-white/55 ring-1 ring-inset ring-white/10 hover:bg-white/[0.12] hover:text-white/80"
                            }`}
                          >
                            <StarIcon
                              className="w-3.5 h-3.5"
                              fill={
                                property.is_featured ? "currentColor" : "none"
                              }
                            />
                            <span>
                              {property.is_featured ? "Unggulan" : "Standar"}
                            </span>
                          </button>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              property.is_featured
                                ? "bg-[#C8A15A]/18 text-[#E6C98F] ring-1 ring-inset ring-[#C8A15A]/45"
                                : "bg-white/[0.06] text-white/55 ring-1 ring-inset ring-white/10"
                            }`}
                          >
                            <StarIcon
                              className="w-3.5 h-3.5"
                              fill={
                                property.is_featured ? "currentColor" : "none"
                              }
                            />
                            <span>
                              {property.is_featured ? "Unggulan" : "Standar"}
                            </span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={getPublicHref(property.slug)}
                            target="_blank"
                            title="Lihat halaman publik"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/[0.04] text-xs font-semibold text-white/80 hover:border-[#C8A15A]/50 hover:text-[#C8A15A] transition"
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                            <span>Lihat</span>
                          </Link>
                          {canManageProperties && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditModal(property)}
                                title="Edit properti"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#C8A15A]/15 border border-[#C8A15A]/30 text-[#E6C98F] text-xs font-semibold hover:bg-[#C8A15A]/25 transition cursor-pointer"
                              >
                                <EditIcon className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(property)}
                                title="Hapus properti"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/15 border border-rose-400/25 text-rose-200 text-xs font-semibold hover:bg-rose-500/25 transition cursor-pointer"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add / Edit Property Modal (Escape + backdrop click to close) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={
            editingProperty ? "Edit Properti" : "Tambah Properti Baru"
          }
          onClick={closeModal}
        >
          <div className="flex min-h-full items-start sm:items-center justify-center px-4 py-8 sm:py-12">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0B1513] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#C8A15A]/25 overflow-hidden flex flex-col max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-6rem)]"
            >
              {/* Sticky Modal Header */}
              <div className="bg-[#0F1D1A] border-b border-white/10 text-white px-6 py-4 flex items-center justify-between gap-4 shrink-0">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C8A15A]">
                    {editingProperty ? "Perbarui Data" : "Listing Baru"}
                  </p>
                  <h2 className="font-sans text-lg sm:text-xl font-bold mt-0.5 truncate text-white">
                    {editingProperty
                      ? `Edit: ${editingProperty.title}`
                      : "Tambah Properti Baru"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-[#C8A15A] border border-white/15 text-white hover:text-[#070D0C] flex items-center justify-center shrink-0 transition cursor-pointer"
                  aria-label="Tutup modal"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form
                id="property-crud-form"
                onSubmit={handleSaveProperty}
                className="p-6 flex-1 min-h-0 overflow-y-auto space-y-5"
              >
                {formError && (
                  <div className="rounded-xl bg-rose-500/15 border border-rose-400/35 px-4 py-3 text-sm text-rose-100">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                      Judul Properti *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Cluster Harmoni Tipe 45"
                      value={form.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                      Slug URL *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="cluster-harmoni-tipe-45"
                      value={form.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setForm((prev) => ({ ...prev, slug: e.target.value }));
                      }}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                      Lokasi *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Katapang, Bandung, Jawa Barat"
                      value={form.location}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                      Harga (Rp) *
                    </label>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      placeholder="500.000.000"
                      value={form.price}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                      Tipe / Nama Proyek
                    </label>
                    <input
                      type="text"
                      placeholder="Rumah / Cluster Sukamukti Islamic / Villa Resik"
                      value={form.type}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, type: e.target.value }))
                      }
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, status: e.target.value }))
                      }
                      className={INPUT_CLASS}
                    >
                      <option value="DIJUAL" className="bg-[#0A1412] text-white">
                        DIJUAL
                      </option>
                      <option
                        value="Tersedia"
                        className="bg-[#0A1412] text-white"
                      >
                        Tersedia
                      </option>
                      <option
                        value="TERJUAL"
                        className="bg-[#0A1412] text-white"
                      >
                        TERJUAL
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                      Kamar Tidur
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.bedrooms}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          bedrooms: e.target.value,
                        }))
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                      Kamar Mandi
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.bathrooms}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          bathrooms: e.target.value,
                        }))
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                      Luas Tanah (m²)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.land_area}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          land_area: e.target.value,
                        }))
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                      Luas Bangunan (m²)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.building_area}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          building_area: e.target.value,
                        }))
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div>
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          is_featured: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-[#C8A15A] rounded"
                    />
                    <span className="text-sm font-medium text-white/85">
                      Tampilkan sebagai Properti Unggulan di Homepage
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                    Deskripsi Properti
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tulis deskripsi keunggulan hunian..."
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className={TEXTAREA_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/65 mb-1.5">
                    Spesifikasi Bangunan (1 poin per baris)
                  </label>
                  <textarea
                    rows={4}
                    placeholder={
                      "Pondasi Batu Belah\nDinding Bata Merah\nRangka Atap Baja Ringan\nListrik 1300 Watt"
                    }
                    value={form.featuresText}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        featuresText: e.target.value,
                      }))
                    }
                    className={TEXTAREA_CLASS}
                  />
                </div>

                {/* Image Upload Section */}
                <div className="rounded-2xl border border-[#C8A15A]/22 bg-[#070D0C] p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#C8A15A]">
                        Galeri Foto (Bucket: property-images)
                      </label>
                      <p className="text-xs text-white/50 mt-0.5">
                        Foto pertama otomatis menjadi gambar sampul (thumbnail).
                      </p>
                    </div>
                    <label className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#C8A15A] hover:bg-[#D9B56F] text-[#070D0C] text-xs font-bold transition cursor-pointer shrink-0">
                      {uploadingImages ? "Mengunggah..." : "+ Upload Gambar"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploadingImages}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Manual URL input */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Atau tempel URL / path gambar (/images/... atau https://...)"
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                      className="flex-1 h-10 px-3.5 rounded-xl border border-white/15 bg-[#0B1513] text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-[#C8A15A]"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualImage}
                      className="px-4 h-10 rounded-xl border border-white/15 bg-white/[0.06] text-xs font-semibold text-white/85 hover:border-[#C8A15A]/50 hover:text-[#C8A15A] transition cursor-pointer shrink-0"
                    >
                      Tambah URL
                    </button>
                  </div>

                  {form.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {form.images.map((url, idx) => (
                        <div
                          key={`${url}-${idx}`}
                          className="relative group rounded-xl overflow-hidden bg-[#0B1513] border border-white/15 aspect-[4/3]"
                        >
                          <Image
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            fill
                            sizes="160px"
                            className="object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#C8A15A] text-[#070D0C] text-[10px] font-bold">
                              Sampul
                            </span>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1.5 flex items-center justify-between gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                            {idx > 0 ? (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="text-[10px] font-bold text-[#C8A15A] hover:underline cursor-pointer"
                              >
                                Jadikan Sampul
                              </button>
                            ) : (
                              <span className="text-[10px] text-white/75">
                                Utama
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="text-[10px] font-bold text-rose-300 hover:text-rose-200 cursor-pointer"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>

              {/* Sticky Modal Footer */}
              <div className="px-6 py-4 bg-[#0F1D1A] border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving || uploadingImages}
                  className="px-5 py-2.5 rounded-full border border-white/15 bg-white/[0.04] text-sm font-semibold text-white/80 hover:bg-white/[0.1] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="property-crud-form"
                  disabled={saving || uploadingImages}
                  className="px-6 py-2.5 rounded-full bg-[#C8A15A] hover:bg-[#D9B56F] text-[#070D0C] text-sm font-bold disabled:opacity-60 transition shadow-[0_8px_22px_rgba(200,161,90,0.25)] cursor-pointer"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingProperty
                      ? "Simpan Perubahan"
                      : "Simpan Properti"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Escape + backdrop click to close) */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi hapus properti"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div className="flex min-h-full items-center justify-center px-4 py-8">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0B1513] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[#C8A15A]/25"
            >
              <h3 className="font-sans text-lg font-bold text-white">
                Hapus Properti?
              </h3>
              <p className="text-sm text-white/65 mt-2 leading-relaxed">
                Anda yakin ingin menghapus{" "}
                <strong className="text-white">{deleteTarget.title}</strong>?
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-full border border-white/15 bg-white/[0.04] text-sm font-semibold text-white/80 hover:bg-white/[0.1] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-5 py-2 rounded-full bg-rose-600 text-white text-sm font-bold hover:bg-rose-500 disabled:opacity-60 cursor-pointer"
                >
                  {deleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
