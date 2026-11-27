import FadeUp from "./FadeUp";
import TrackedContactLink from "./TrackedContactLink";

export default function ContactSection() {
  return (
    <section id="contact" className="contact-section">
      <FadeUp as="h2">Siap menemukan rumah impian Anda?</FadeUp>
      <p>
        Hubungi tim marketing kami untuk konsultasi gratis dan temukan properti
        yang tepat untuk langkah berikutnya.
      </p>
      <div className="contact-buttons">
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
