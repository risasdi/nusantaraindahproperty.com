"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { trackEvent as trackAnalyticsEvent } from "@/lib/analytics";
import { trackEvent as trackMetaEvent } from "@/lib/meta-pixel";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface LeadFormProps {
  propertyId?: string;
  propertyTitle?: string;
  source: string;
  heading?: string;
  subheading?: string;
}

export default function LeadForm({
  propertyId,
  propertyTitle,
  source,
  heading,
  subheading,
}: LeadFormProps) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const safeIdSuffix = source.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const defaultHeading = propertyTitle
    ? `Tertarik dengan ${propertyTitle}?`
    : "Kirim Pesan Konsultasi";
  const defaultSubheading = propertyTitle
    ? "Tinggalkan kontak Anda untuk brosur lengkap, simulasi KPR DP 0%, atau jadwal survei lokasi bersama agen kami."
    : "Isi formulir singkat di bawah ini, tim marketing kami akan segera menghubungi Anda via WhatsApp.";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    const trimmedWa = whatsapp.trim();
    const digitsOnly = trimmedWa.replace(/[^0-9]/g, "");

    if (!trimmedName) {
      setErrorMessage("Mohon masukkan nama lengkap Anda.");
      return;
    }

    if (digitsOnly.length < 9) {
      setErrorMessage("Mohon masukkan nomor WhatsApp yang valid.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const validPropertyUuid =
        propertyId && UUID_REGEX.test(propertyId) ? propertyId : null;

      const { error } = await supabase.from("leads").insert([
        {
          name: trimmedName,
          whatsapp: trimmedWa,
          property_id: validPropertyUuid,
          property_title: propertyTitle?.trim() || null,
          message: message.trim() || null,
          source,
          status: "Baru",
        },
      ]);

      if (error) {
        console.error("Lead submit error:", error);
        setErrorMessage(
          `Gagal mengirim permintaan: ${error.message || "Terjadi kesalahan pada server."}`
        );
        return;
      }

      trackMetaEvent("Lead", {
        content_name: propertyTitle || "General Inquiry",
      });

      trackAnalyticsEvent({
        event_name: "Lead",
        property_title: propertyTitle || "General Inquiry",
      });

      setName("");
      setWhatsapp("");
      setMessage("");
      setSuccessMessage(
        "Terima kasih! Data Anda telah kami terima. Tim marketing Nusantara Indah Property akan segera menghubungi Anda melalui WhatsApp."
      );
    } catch (error) {
      console.error("Lead submit error:", error);
      const detail =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : "Terjadi kesalahan jaringan. Silakan coba lagi.";
      setErrorMessage(`Gagal mengirim permintaan: ${detail}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[#0B1513]/92 backdrop-blur-xl border border-[#C8A15A]/22 shadow-[0_24px_60px_rgba(0,0,0,0.45)] p-6 sm:p-8 text-left">
      <div className="mb-6">
        <h3 className="font-sans text-xl sm:text-2xl font-bold text-white leading-snug">
          {heading || defaultHeading}
        </h3>
        <p className="text-xs sm:text-sm text-white/60 mt-1.5 leading-relaxed">
          {subheading || defaultSubheading}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {successMessage && (
          <div
            role="status"
            className="rounded-xl bg-emerald-500/15 border border-emerald-400/35 px-4 py-3.5 text-sm text-emerald-100 font-medium leading-relaxed"
          >
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl bg-rose-500/15 border border-rose-400/35 px-4 py-3.5 text-sm text-rose-100 font-medium"
          >
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={`lead-name-${safeIdSuffix}`}
              className="block text-xs font-medium text-white/75 mb-2"
            >
              Nama Lengkap <span className="text-[#C8A15A]">*</span>
            </label>
            <input
              id={`lead-name-${safeIdSuffix}`}
              type="text"
              required
              autoComplete="name"
              placeholder="Contoh: Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-white/14 bg-white/[0.05] text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-[#C8A15A] focus:bg-white/[0.08] focus:ring-2 focus:ring-[#C8A15A]/20 transition"
            />
          </div>

          <div>
            <label
              htmlFor={`lead-whatsapp-${safeIdSuffix}`}
              className="block text-xs font-medium text-white/75 mb-2"
            >
              Nomor WhatsApp <span className="text-[#C8A15A]">*</span>
            </label>
            <input
              id={`lead-whatsapp-${safeIdSuffix}`}
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              placeholder="Contoh: 081234567890"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-white/14 bg-white/[0.05] text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-[#C8A15A] focus:bg-white/[0.08] focus:ring-2 focus:ring-[#C8A15A]/20 transition"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor={`lead-message-${safeIdSuffix}`}
            className="block text-xs font-medium text-white/75 mb-2"
          >
            Pesan / Rencana Jadwal Survei{" "}
            <span className="text-white/40 font-normal">(opsional)</span>
          </label>
          <textarea
            id={`lead-message-${safeIdSuffix}`}
            rows={4}
            placeholder="Ceritakan tipe rumah yang dicari atau rencana jadwal survei Anda..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-white/14 bg-white/[0.05] text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-[#C8A15A] focus:bg-white/[0.08] focus:ring-2 focus:ring-[#C8A15A]/20 transition resize-y"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
          <p className="text-xs text-white/45 leading-relaxed">
            Data Anda dijaga kerahasiaannya dan hanya digunakan untuk layanan
            konsultasi properti.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="shrink-0 inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#C8A15A] hover:bg-[#D9B56F] text-[#070D0C] font-bold text-xs sm:text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_10px_28px_rgba(200,161,90,0.28)] cursor-pointer"
          >
            {submitting ? "Mengirim..." : "Kirim Permintaan"}
          </button>
        </div>
      </form>
    </div>
  );
}
