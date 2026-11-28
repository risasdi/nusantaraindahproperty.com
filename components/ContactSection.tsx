import FadeUp from "./FadeUp";
import LeadForm from "./LeadForm";
import TrackedContactLink from "./TrackedContactLink";
import {
  buildMarketingWhatsAppUrl,
  DEFAULT_SITE_SETTINGS,
  normalizeWhatsappNumber,
  type SiteSettings,
} from "@/lib/site-settings";

interface ContactSectionProps {
  settings?: SiteSettings;
}

function formatReadablePhone(raw: string): string {
  const digits = normalizeWhatsappNumber(raw);
  if (digits.startsWith("62") && digits.length >= 11) {
    const rest = digits.slice(2);
    return `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`;
  }
  return `+${digits}`;
}

export default function ContactSection({
  settings = DEFAULT_SITE_SETTINGS,
}: ContactSectionProps) {
  const formattedPhone = formatReadablePhone(settings.whatsapp_number);
  const waHref = buildMarketingWhatsAppUrl(
    settings.whatsapp_number,
    `Halo ${settings.company_name}, saya ingin konsultasi properti & jadwal survei.`
  );
  const telHref = `tel:+${normalizeWhatsappNumber(settings.whatsapp_number)}`;

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#070D0C] py-20 sm:py-28 scroll-mt-24"
    >
      {/* Centered Ambient Emerald + Gold Glow behind the 2-column seam */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[56%] left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[min(90vw,780px)] rounded-full bg-gradient-to-r from-[#063D36]/55 via-[#C8A15A]/34 to-[#063D36]/55 blur-[130px]"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl mb-10 sm:mb-12 text-left">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C8A15A] mb-2.5">
            Hubungi Kami
          </span>
          <FadeUp
            as="h2"
            className="font-sans text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight text-white leading-tight"
          >
            Mulai Langkah{" "}
            <span className="font-normal italic text-[#C8A15A]">
              Hunian Anda
            </span>
          </FadeUp>
          <p className="mt-3 text-sm sm:text-base font-light text-white/60 leading-relaxed">
            Baik sedang mencari rumah pertama, simulasi KPR DP 0%, atau jadwal
            survei lokasi — tim konsultan {settings.company_name} siap memandu
            setiap keputusan Anda.
          </p>
        </div>

        {/* 2-Column Split: Left Dark Glass Form, Right Stacked Contact Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7">
            <LeadForm source="Homepage" />
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            {/* Card 1: Alamat Kantor */}
            <div className="rounded-2xl bg-[#0B1513]/88 backdrop-blur-xl border border-[#C8A15A]/20 hover:border-[#C8A15A]/45 p-5 flex items-center gap-4 transition-colors duration-300">
              <div className="w-11 h-11 rounded-xl bg-[#C8A15A]/15 border border-[#C8A15A]/35 text-[#C8A15A] flex items-center justify-center shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C8A15A]">
                  Kunjungi Kantor
                </p>
                <p className="mt-1 text-sm font-semibold text-white leading-snug">
                  {settings.office_address}
                </p>
                <p className="mt-0.5 text-xs text-white/50">
                  {settings.operating_hours}
                </p>
              </div>
            </div>

            {/* Card 2: Telepon */}
            <a
              href={telHref}
              className="rounded-2xl bg-[#0B1513]/88 backdrop-blur-xl border border-[#C8A15A]/20 hover:border-[#C8A15A]/50 p-5 flex items-center gap-4 transition-colors duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#C8A15A]/15 border border-[#C8A15A]/35 text-[#C8A15A] flex items-center justify-center shrink-0 group-hover:bg-[#C8A15A] group-hover:text-[#070D0C] transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C8A15A]">
                  Telepon Kami
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formattedPhone}
                </p>
                <p className="mt-0.5 text-xs text-white/50">
                  Layanan konsultasi langsung dengan agen
                </p>
              </div>
            </a>

            {/* Card 3: Email */}
            <a
              href="mailto:nusantaraindahproperty@gmail.com"
              className="rounded-2xl bg-[#0B1513]/88 backdrop-blur-xl border border-[#C8A15A]/20 hover:border-[#C8A15A]/50 p-5 flex items-center gap-4 transition-colors duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#C8A15A]/15 border border-[#C8A15A]/35 text-[#C8A15A] flex items-center justify-center shrink-0 group-hover:bg-[#C8A15A] group-hover:text-[#070D0C] transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C8A15A]">
                  Email Kami
                </p>
                <p className="mt-1 text-sm font-semibold text-white truncate">
                  nusantaraindahproperty@gmail.com
                </p>
                <p className="mt-0.5 text-xs text-white/50">
                  Respon cepat di jam operasional
                </p>
              </div>
            </a>

            {/* Card 4: WhatsApp */}
            <TrackedContactLink
              href={waHref}
              target="_blank"
              rel="noreferrer"
              contentName="Contact Section - WhatsApp Card"
              contentCategory="WhatsApp"
              propertyTitle="Contact Section - WhatsApp"
              className="rounded-2xl bg-[#0B1513]/88 backdrop-blur-xl border border-[#C8A15A]/25 hover:border-[#C8A15A]/65 p-5 flex items-center gap-4 transition-colors duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#C8A15A]/15 border border-[#C8A15A]/35 text-[#C8A15A] flex items-center justify-center shrink-0 group-hover:bg-[#C8A15A] group-hover:text-[#070D0C] transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C8A15A]">
                  WhatsApp Marketing
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formattedPhone}
                </p>
                <p className="mt-0.5 text-xs text-white/50">
                  Balasan cepat 7 hari seminggu
                </p>
              </div>
              <span
                aria-hidden="true"
                className="text-[#C8A15A] text-sm transition-transform duration-300 group-hover:translate-x-1"
              >
                &rarr;
              </span>
            </TrackedContactLink>
          </div>
        </div>
      </div>
    </section>
  );
}
