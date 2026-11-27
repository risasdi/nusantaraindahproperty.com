import FadeUp from "./FadeUp";
import LeadForm from "./LeadForm";
import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
} from "@/lib/site-settings";

interface ContactSectionProps {
  settings?: SiteSettings;
}

export default function ContactSection({
  settings = DEFAULT_SITE_SETTINGS,
}: ContactSectionProps) {
  return (
    <section id="contact" className="contact-section">
      <FadeUp as="h2">Siap menemukan rumah impian Anda?</FadeUp>
      <p>
        Hubungi tim marketing {settings.company_name} untuk konsultasi gratis
        dan temukan properti yang tepat untuk langkah berikutnya.
      </p>

      {(settings.office_address || settings.operating_hours) && (
        <div className="max-w-3xl mx-auto mb-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-[#063d36]">
          {settings.office_address && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#e4e7e5]/70 border border-[#063d36]/10 font-medium">
              <span>📍</span>
              <span>{settings.office_address}</span>
            </span>
          )}
          {settings.operating_hours && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#e4e7e5]/70 border border-[#063d36]/10 font-medium">
              <span>🕒</span>
              <span>{settings.operating_hours}</span>
            </span>
          )}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <LeadForm source="Homepage" />
      </div>
    </section>
  );
}
