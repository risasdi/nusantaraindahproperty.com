import Link from "next/link";
import FadeUp from "./FadeUp";
import LeadForm from "./LeadForm";
import PropertyGallery from "./PropertyGallery";
import PropertyViewTracker from "./PropertyViewTracker";
import type { PropertyItem } from "@/data/properties";

interface PropertyDetailViewProps {
  property: PropertyItem;
}

export default function PropertyDetailView({
  property,
}: PropertyDetailViewProps) {
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
