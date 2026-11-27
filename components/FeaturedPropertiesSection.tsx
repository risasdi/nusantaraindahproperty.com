import FadeUp from "./FadeUp";
import PropertyCard from "./PropertyCard";
import { FEATURED_PROPERTIES } from "@/data/properties";

export default function FeaturedPropertiesSection() {
  return (
    <section id="catalog" className="listings-section">
      <div className="section-header">
        <h3>TEMUKAN PILIHAN KAMI</h3>
        <FadeUp as="h2">Properti Unggulan</FadeUp>
      </div>

      <div className="property-grid">
        {FEATURED_PROPERTIES.map((property, index) => (
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
