import FadeUp from "./FadeUp";
import LeadForm from "./LeadForm";
import TrackedContactLink from "./TrackedContactLink";
import {
  buildMarketingWhatsAppUrl,
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
} from "@/lib/site-settings";

interface ContactSectionProps {
  settings?: SiteSettings;
}

export default function ContactSection({
  settings = DEFAULT_SITE_SETTINGS,
}: ContactSectionProps) {
  const waHref = buildMarketingWhatsAppUrl(
    settings.whatsapp_number,
    `Halo ${settings.company_name}, saya ingin konsultasi properti dan info KPR DP 0%.`
  );

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

      <div className="max-w-3xl mx-auto mb-8">
        <LeadForm source="Homepage" />
      </div>

      <div className="contact-buttons">
        <TrackedContactLink
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="btn-wa"
          contentName="Contact Section - Chat WhatsApp"
          contentCategory="WhatsApp"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.5 4.1 1.5 5.9L0 24l6.3-1.6a11.9 11.9 0 0 0 5.7 1.4h.1c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4zM12.1 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7.9 1-3.6-.2-.4a9.8 9.8 0 1 1 8.3 4.7zm5.4-7.3c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2c-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.8-2.1-.2-.3 0-.5.2-.7l.5-.6c.2-.2.2-.4.3-.6 0-.2 0-.4-.1-.6-.1-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6 0 1.5 1.1 3 1.2 3.2.2.2 2.2 3.4 5.4 4.8.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.7-.1 1.8-.7 2-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.4z" />
          </svg>
          <span>Chat WhatsApp</span>
        </TrackedContactLink>

        <TrackedContactLink
          href="mailto:nusantaraindahproperty@gmail.com"
          className="btn-email"
          contentName="Contact Section - Kirim Email"
          contentCategory="Email"
        >
          Kirim Email
        </TrackedContactLink>
      </div>
    </section>
  );
}
