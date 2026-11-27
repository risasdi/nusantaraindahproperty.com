import FadeUp from "./FadeUp";

export default function ContactSection() {
  return (
    <section id="contact" className="contact-section">
      <FadeUp as="h2">Siap menemukan rumah impian Anda?</FadeUp>
      <p>
        Hubungi tim marketing kami untuk konsultasi gratis dan temukan properti
        yang tepat untuk langkah berikutnya.
      </p>
      <div className="contact-buttons">
        <a href="mailto:nusantaraindahproperty@gmail.com" className="btn-email">
          Kirim Email
        </a>
      </div>
    </section>
  );
}
