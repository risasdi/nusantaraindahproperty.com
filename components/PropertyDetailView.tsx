import Link from "next/link";
import FadeUp from "./FadeUp";
import LeadForm from "./LeadForm";
import PropertyGallery from "./PropertyGallery";
import PropertyViewTracker from "./PropertyViewTracker";
import TrackedContactLink from "./TrackedContactLink";
import type { PropertyItem } from "@/data/properties";
import {
  buildMarketingWhatsAppUrl,
  getSiteSettings,
} from "@/lib/site-settings";

interface PropertyDetailViewProps {
  property: PropertyItem;
}

export default async function PropertyDetailView({
  property,
}: PropertyDetailViewProps) {
  const settings = await getSiteSettings();
  const waHref = buildMarketingWhatsAppUrl(
    settings.whatsapp_number,
    `Halo ${settings.company_name}, saya tertarik dengan properti ${property.name} (${property.location}). Mohon info lengkap & jadwal survei.`
  );

  return (
    <div className="detail-page">
      <PropertyViewTracker
        title={property.name}
        price={property.price}
        slug={property.slug}
      />
      <main className="detail-main">
        <Link className="detail-back-top" href={property.backHref}>
          &#8592; {property.backLabel}
        </Link>

        <FadeUp className="detail-grid">
          <PropertyGallery
            images={property.gallery}
            ariaLabel={property.galleryAriaLabel}
          />

          <section className="detail-copy">
            <span className="detail-label">{property.detailLabel}</span>
            <h1>{property.detailTitle}</h1>
            <p className="detail-location">
              📍{" "}
              <a href={property.mapsUrl} target="_blank" rel="noreferrer">
                {property.location}
              </a>
            </p>
            <p className="detail-description">{property.description}</p>
            <div className="price-container" style={{ margin: "28px 0" }}>
              <span className="price-label">Mulai dari</span>
              <span className="price-value" style={{ fontSize: "1.8rem" }}>
                {property.priceLabel}
              </span>
            </div>
            <div className="detail-specs">
              {property.specs.map((spec) => (
                <div key={spec} className="detail-spec">
                  {spec}
                </div>
              ))}
            </div>
            <div className="detail-actions">
              <TrackedContactLink
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="btn-wa"
                contentName={`Detail Properti - ${property.name}`}
                contentCategory="WhatsApp"
                propertyTitle={property.name}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.5 4.1 1.5 5.9L0 24l6.3-1.6a11.9 11.9 0 0 0 5.7 1.4h.1c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4zM12.1 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7.9 1-3.6-.2-.4a9.8 9.8 0 1 1 8.3 4.7zm5.4-7.3c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2c-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.8-2.1-.2-.3 0-.5.2-.7l.5-.6c.2-.2.2-.4.3-.6 0-.2 0-.4-.1-.6-.1-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6 0 1.5 1.1 3 1.2 3.2.2.2 2.2 3.4 5.4 4.8.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.7-.1 1.8-.7 2-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.4z" />
                </svg>
                <span>Hubungi Agen via WhatsApp</span>
              </TrackedContactLink>
            </div>
          </section>
        </FadeUp>

        <FadeUp className="detail-info-section">
          <div className="detail-content-grid">
            <div className="detail-box">
              <h3>Deskripsi Properti</h3>
              <p>{property.description}</p>
              {property.accessibility && (
                <p>
                  <strong>Aksesibilitas:</strong>
                  <br />
                  {property.accessibility}
                </p>
              )}
              <p>
                <strong>Penawaran Eksklusif:</strong>
                <br />
                {property.exclusiveOffer}
              </p>
            </div>

            <div className="detail-box">
              <h3>Spesifikasi Bangunan</h3>
              <ul>
                {property.buildingSpecs.map((spec) => (
                  <li key={spec}>{spec}</li>
                ))}
              </ul>
            </div>
          </div>
        </FadeUp>

        <FadeUp className="mt-12">
          <LeadForm
            propertyId={property.id}
            propertyTitle={property.name}
            source="Detail Properti"
          />
        </FadeUp>
      </main>
    </div>
  );
}
