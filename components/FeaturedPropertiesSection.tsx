import FadeUp from "./FadeUp";
import PropertyCard, { type PropertySummary } from "./PropertyCard";
import { FEATURED_PROPERTIES } from "@/data/properties";

interface FeaturedPropertiesSectionProps {
  properties?: PropertySummary[];
}

export default function FeaturedPropertiesSection({
  properties = FEATURED_PROPERTIES,
}: FeaturedPropertiesSectionProps) {
  return (
    <section id="catalog" className="listings-section">
      <div className="section-header">
        <h3>TEMUKAN PILIHAN KAMI</h3>
        <FadeUp as="h2">Properti Unggulan</FadeUp>
      </div>

      <div className="property-grid">
        {properties.map((property, index) => (
          <PropertyCard
            key={property.id}
            property={property}
            delay={Number(((index + 1) * 0.1).toFixed(1))}
          />
        ))}
      </div>
    </section>
  );
}
