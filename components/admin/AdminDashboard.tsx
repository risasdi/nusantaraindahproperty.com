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

function formatCompactPrice(amount: number): string {
  if (amount >= 1_000_000_000) {
    const val = (amount / 1_000_000_000).toFixed(amount % 1_000_000_000 === 0 ? 0 : 1);
    return `Rp ${val.replace(".", ",")} M`;
  }
  if (amount >= 1_000_000) {
    const val = Math.round(amount / 1_000_000);
    return `Rp ${val} Jt`;
  }
  return formatRupiah(amount);
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

export default function AdminDashboard({
  initialProperties,
  initialError,
  showKpiCards = true,
  autoOpenCreate = false,
}: AdminDashboardProps) {
  const router = useRouter();
  const { registerCreateHandler } = useAdminActions();

  const [properties, setProperties] = useState<DbProperty[]>(initialProperties);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
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
  const [isModalOpen, setIsModalOpen] = useState(autoOpenCreate);
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
    setEditingProperty(null);
    setSlugTouched(false);
    setForm(EMPTY_FORM);
    setManualImageUrl("");
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    registerCreateHandler(openCreateModal);
    return () => registerCreateHandler(null);
  }, [registerCreateHandler, openCreateModal]);

  useEffect(() => {
    if (!isModalOpen && !deleteTarget) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen, deleteTarget]);

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
    setEditingProperty(property);
    setSlugTouched(true);
    setForm(propertyToForm(property));
    setManualImageUrl("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving || uploadingImages) return;
    setIsModalOpen(false);
    setEditingProperty(null);
    setFormError(null);
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
    if (!deleteTarget) return;
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
      : minPrice === maxPrice
        ? formatCompactPrice(minPrice)
        : `${formatCompactPrice(minPrice)} – ${formatCompactPrice(maxPrice)}`;

  // Table filtering
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProperties = properties.filter((p) => {
    const isSold = (p.status ?? "").toLowerCase() === "terjual";
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && !isSold) ||
      (statusFilter === "sold" && isSold) ||
      (statusFilter === "featured" && Boolean(p.is_featured));

    const matchesSearch =
      !normalizedQuery ||
      p.title.toLowerCase().includes(normalizedQuery) ||
      p.location.toLowerCase().includes(normalizedQuery) ||
      p.slug.toLowerCase().includes(normalizedQuery) ||
      (p.type ?? "").toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
      {feedback && (
        <div
          role="status"
          className={`rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 border text-sm font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Row 1: 4 KPI Stat Cards */}
      {showKpiCards && (
        <section
          aria-label="Ringkasan statistik properti"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
        >
          {/* KPI 1: Total Properti */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Properti
                </p>
                <p className="text-3xl font-serif font-bold text-[#063D36] mt-2">
                  {totalCount}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#063D36]/10 text-[#063D36] flex items-center justify-center shrink-0">
                <BuildingIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
              Total listing aktif di database Supabase
            </p>
          </div>

          {/* KPI 2: Tersedia / Dijual */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tersedia / Dijual
                </p>
                <p className="text-3xl font-serif font-bold text-emerald-700 mt-2">
                  {availableCount}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircleIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
              {soldCount} unit berstatus terjual
            </p>
          </div>

          {/* KPI 3: Properti Unggulan */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Properti Unggulan
                </p>
                <p className="text-3xl font-serif font-bold text-[#B5893C] mt-2">
                  {featuredCount}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#C8A15A]/15 text-[#B5893C] flex items-center justify-center shrink-0">
                <StarIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
              Ditampilkan pada katalog unggulan Homepage
            </p>
          </div>

          {/* KPI 4: Rentang Harga */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Rentang Harga
                </p>
                <p className="text-2xl font-serif font-bold text-[#063D36] mt-2 truncate">
                  {priceRangeDisplay}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-[#063D36] flex items-center justify-center shrink-0">
                <TagIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 truncate">
              {prices.length > 0
                ? `${formatRupiah(minPrice)} – ${formatRupiah(maxPrice)}`
                : "Belum ada data harga"}
            </p>
          </div>
        </section>
      )}

      {/* Row 2: Modern Properties Table Card */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-serif font-bold text-[#063D36]">
                  Daftar Properti
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  {filteredProperties.length} unit
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola listing properti, status penjualan, dan foto katalog.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                placeholder="Cari judul, lokasi, atau tipe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#C8A15A] focus:ring-4 focus:ring-[#C8A15A]/15 transition"
              />
            </div>

            {/* Status Filter */}
            <select
              aria-label="Filter status properti"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-[#C8A15A] focus:ring-4 focus:ring-[#C8A15A]/15 transition"
            >
              <option value="all">Semua Status ({totalCount})</option>
              <option value="available">
                Dijual / Tersedia ({availableCount})
              </option>
              <option value="sold">Terjual ({soldCount})</option>
              <option value="featured">Unggulan ({featuredCount})</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-5 font-semibold">Properti</th>
                <th className="py-3.5 px-4 font-semibold">Harga &amp; Spek</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Unggulan</th>
                <th className="py-3.5 px-5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-16 px-6 text-center text-slate-500"
                  >
                    <p className="font-medium text-slate-700">
                      {properties.length === 0
                        ? "Belum ada data properti di Supabase"
                        : "Tidak ada properti yang cocok dengan filter"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {properties.length === 0
                        ? "Tambahkan properti pertama Anda atau jalankan supabase/seed.sql di SQL Editor."
                        : "Coba ubah kata kunci pencarian atau reset filter status."}
                    </p>
                    {properties.length === 0 && (
                      <button
                        type="button"
                        onClick={openCreateModal}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#063D36] text-white text-xs font-semibold hover:bg-[#052e29] transition cursor-pointer"
                      >
                        <PlusIcon className="w-4 h-4 text-[#C8A15A]" />
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
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Thumbnail + Title + Location */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5 min-w-[260px]">
                          <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                            {thumb ? (
                              <Image
                                src={thumb}
                                alt={property.title}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                                No Img
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-[260px]">
                              {property.title}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate max-w-[260px]">
                              <MapPinIcon className="w-3.5 h-3.5 text-[#C8A15A] shrink-0" />
                              <span className="truncate">
                                {property.location}
                              </span>
                            </p>
                            <span className="inline-block mt-1 text-[11px] font-medium text-slate-400">
                              {property.type || "Rumah"} &bull; /{property.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Price & Specs */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-serif font-bold text-[#063D36]">
                          {formatRupiah(Number(property.price) || 0)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
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
                              ? "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20"
                              : "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSold ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                          />
                          {property.status || "Tersedia"}
                        </span>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-4 px-4 whitespace-nowrap">
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
                              ? "bg-[#C8A15A]/15 text-[#9A722B] ring-1 ring-inset ring-[#C8A15A]/40 hover:bg-[#C8A15A]/25"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200/70"
                          }`}
                        >
                          <StarIcon
                            className="w-3.5 h-3.5"
                            fill={property.is_featured ? "currentColor" : "none"}
                          />
                          <span>
                            {property.is_featured ? "Unggulan" : "Standar"}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={getPublicHref(property.slug)}
                            target="_blank"
                            title="Lihat halaman publik"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
                          >
                            <EyeIcon className="w-3.5 h-3.5 text-slate-500" />
                            <span>Lihat</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditModal(property)}
                            title="Edit properti"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#063D36]/10 text-[#063D36] text-xs font-semibold hover:bg-[#063D36]/15 transition cursor-pointer"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(property)}
                            title="Hapus properti"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition cursor-pointer"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
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

      {/* Add / Edit Property Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-900/65 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={
            editingProperty ? "Edit Properti" : "Tambah Properti Baru"
          }
        >
          <div className="flex min-h-full items-start sm:items-center justify-center px-4 py-8 sm:py-12">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-6rem)]">
              {/* Sticky Modal Header */}
              <div className="bg-[#063D36] text-white px-6 py-4 flex items-center justify-between gap-4 shrink-0">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C8A15A]">
                    {editingProperty ? "Perbarui Data" : "Listing Baru"}
                  </p>
                  <h2 className="text-lg sm:text-xl font-serif font-bold mt-0.5 truncate">
                    {editingProperty
                      ? `Edit: ${editingProperty.title}`
                      : "Tambah Properti Baru"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 transition cursor-pointer"
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
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Judul Properti *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Cluster Harmoni Tipe 45"
                      value={form.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#C8A15A] focus:ring-4 focus:ring-[#C8A15A]/15"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
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
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#C8A15A] focus:ring-4 focus:ring-[#C8A15A]/15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
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
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#C8A15A] focus:ring-4 focus:ring-[#C8A15A]/15"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Harga (Rp) *
                    </label>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      placeholder="500.000.000"
                      value={form.price}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#C8A15A] focus:ring-4 focus:ring-[#C8A15A]/15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Tipe / Nama Proyek
                    </label>
                    <input
                      type="text"
                      placeholder="Rumah / Cluster Sukamukti Islamic / Villa Resik"
                      value={form.type}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, type: e.target.value }))
                      }
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#C8A15A] focus:ring-4 focus:ring-[#C8A15A]/15"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, status: e.target.value }))
                      }
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#C8A15A] focus:ring-4 focus:ring-[#C8A15A]/15"
                    >
                      <option value="DIJUAL">DIJUAL</option>
                      <option value="Tersedia">Tersedia</option>
                      <option value="TERJUAL">TERJUAL</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
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
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
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
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
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
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
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
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-900"
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
                      className="w-4 h-4 accent-[#063D36] rounded"
                    />
                    <span className="text-sm font-semibold text-slate-800">
                      Tampilkan sebagai Properti Unggulan di Homepage
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
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
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#C8A15A] focus:ring-4 focus:ring-[#C8A15A]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
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
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#C8A15A] focus:ring-4 focus:ring-[#C8A15A]/15"
                  />
                </div>

                {/* Image Upload Section */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#063D36]">
                        Galeri Foto (Bucket: property-images)
                      </label>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Foto pertama otomatis menjadi gambar sampul (thumbnail).
                      </p>
                    </div>
                    <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#063D36] text-white text-xs font-bold hover:bg-[#052e29] transition cursor-pointer">
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
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Atau tempel URL / path gambar (/images/... atau https://...)"
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualImage}
                      className="px-3.5 h-10 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Tambah URL
                    </button>
                  </div>

                  {form.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {form.images.map((url, idx) => (
                        <div
                          key={`${url}-${idx}`}
                          className="relative group rounded-xl overflow-hidden bg-white border border-slate-200 aspect-[4/3]"
                        >
                          <Image
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            fill
                            sizes="160px"
                            className="object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#063D36] text-[#C8A15A] text-[10px] font-bold">
                              Sampul
                            </span>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-black/65 p-1.5 flex items-center justify-between gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
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
                              className="text-[10px] font-bold text-red-300 hover:text-red-200 cursor-pointer"
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
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving || uploadingImages}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="property-crud-form"
                  disabled={saving || uploadingImages}
                  className="px-5 py-2.5 rounded-xl bg-[#063D36] text-white text-sm font-bold hover:bg-[#052e29] disabled:opacity-60 transition shadow-xs cursor-pointer"
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-900/65 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi hapus properti"
        >
          <div className="flex min-h-full items-center justify-center px-4 py-8">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200">
              <h3 className="text-lg font-serif font-bold text-[#063D36]">
                Hapus Properti?
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Anda yakin ingin menghapus{" "}
                <strong className="text-slate-900">{deleteTarget.title}</strong>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60 cursor-pointer"
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
