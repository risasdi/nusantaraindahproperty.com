"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/meta-pixel";

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

  const defaultHeading = propertyTitle
    ? `Tertarik dengan ${propertyTitle}?`
    : "Konsultasi & Jadwal Survei Gratis";
  const defaultSubheading = propertyTitle
    ? "Tinggalkan kontak Anda untuk mendapatkan brosur lengkap, simulasi KPR DP 0%, atau menjadwalkan survei lokasi bersama agen kami."
    : "Isi formulir singkat di bawah ini, tim marketing kami akan segera menghubungi Anda melalui WhatsApp.";

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

      const { error } = await supabase.from("leads").insert({
        name: trimmedName,
        whatsapp: trimmedWa,
        property_id: validPropertyUuid,
        property_title: propertyTitle ?? null,
        message: message.trim() || null,
        source,
        status: "Baru",
      });

      if (error) {
        throw error;
      }

      trackEvent("Lead", {
        content_name: propertyTitle || "General Inquiry",
      });

      setName("");
      setWhatsapp("");
      setMessage("");
      setSuccessMessage(
        "Terima kasih! Data Anda telah kami terima. Tim marketing Nusantara Indah Property akan segera menghubungi Anda melalui WhatsApp."
      );
    } catch {
      setErrorMessage(
        "Maaf, permintaan Anda belum dapat dikirim saat ini. Silakan coba lagi atau hubungi kami langsung melalui tombol WhatsApp."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[22px] border border-[#063d36]/12 shadow-[0_16px_36px_rgba(6,61,54,0.08)] overflow-hidden text-left">
      <div className="bg-[#063d36] px-6 sm:px-8 py-6 text-white">
        <span className="inline-block text-[11px] font-bold uppercase tracking-[0.22em] text-[#c8a15a] mb-2">
          Booking &amp; Konsultasi
        </span>
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-snug">
          {heading || defaultHeading}
        </h3>
        <p className="text-sm text-white/80 mt-2 leading-relaxed">
          {subheading || defaultSubheading}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
        {successMessage && (
          <div
            role="status"
            className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3.5 text-sm text-emerald-900 font-medium leading-relaxed"
          >
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3.5 text-sm text-red-700 font-medium"
          >
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={`lead-name-${source}`}
              className="block text-xs font-bold uppercase tracking-[0.1em] text-[#063d36] mb-2"
            >
              Nama Lengkap <span className="text-[#c8a15a]">*</span>
            </label>
            <input
              id={`lead-name-${source}`}
              type="text"
              required
              autoComplete="name"
              placeholder="Contoh: Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-[#063d36]/20 bg-white text-[#063d36] text-sm placeholder:text-[#063d36]/40 focus:outline-none focus:border-[#c8a15a] focus:ring-4 focus:ring-[#c8a15a]/15 transition"
            />
          </div>

          <div>
            <label
              htmlFor={`lead-whatsapp-${source}`}
              className="block text-xs font-bold uppercase tracking-[0.1em] text-[#063d36] mb-2"
            >
              Nomor WhatsApp <span className="text-[#c8a15a]">*</span>
            </label>
            <input
              id={`lead-whatsapp-${source}`}
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              placeholder="Contoh: 081234567890"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-[#063d36]/20 bg-white text-[#063d36] text-sm placeholder:text-[#063d36]/40 focus:outline-none focus:border-[#c8a15a] focus:ring-4 focus:ring-[#c8a15a]/15 transition"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor={`lead-message-${source}`}
            className="block text-xs font-bold uppercase tracking-[0.1em] text-[#063d36] mb-2"
          >
            Pesan / Rencana Jadwal Survei{" "}
            <span className="text-[#063d36]/45 font-normal normal-case tracking-normal">
              (opsional)
            </span>
          </label>
          <textarea
            id={`lead-message-${source}`}
            rows={3}
            placeholder="Contoh: Saya ingin survei lokasi hari Sabtu pukul 10.00 WIB dan minta info cicilan KPR DP 0%."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-[#063d36]/20 bg-white text-[#063d36] text-sm placeholder:text-[#063d36]/40 focus:outline-none focus:border-[#c8a15a] focus:ring-4 focus:ring-[#c8a15a]/15 transition resize-y"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <p className="text-xs text-[#063d36]/60">
            Data Anda terjaga kerahasiaannya dan hanya digunakan untuk layanan
            konsultasi properti.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="shrink-0 inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#c8a15a] text-[#063d36] font-bold text-sm hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-[0_12px_24px_rgba(200,161,90,0.3)] cursor-pointer"
          >
            {submitting ? "Mengirim..." : "Kirim Permintaan"}
          </button>
        </div>
      </form>
    </div>
  );
}
