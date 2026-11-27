"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";

export interface PropertySummary {
  id: string;
  title: string;
  badgeText: string;
  badgeVariant: "sale" | "rent";
  image: string;
  imageAlt: string;
  location: string;
  priceLabel: string;
  facilities: string[];
  backDescription: string;
  href: string;
}

interface PropertyCardProps {
  property: PropertySummary;
  delay?: number;
}

export default function PropertyCard({ property, delay }: PropertyCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.15 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleCardClick = (e: MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("a")) return;
    setIsFlipped((prev) => !prev);
  };

  return (
    <article
      ref={cardRef}
      className={`property-card flip-card fade-up${isVisible ? " is-visible" : ""}`}
      style={delay !== undefined ? { transitionDelay: `${delay}s` } : undefined}
      onClick={handleCardClick}
    >
      <div className={`flip-card-inner${isFlipped ? " is-flipped" : ""}`}>
        <div className="flip-card-front">
          <div className="card-img-wrapper">
            <span className={`badge ${property.badgeVariant}`}>
              {property.badgeText}
            </span>
            <Image
              src={property.image}
              alt={property.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
          <div className="card-body">
            <h4>{property.title}</h4>
            <p className="front-location">📍 {property.location}</p>
            <div className="price-container">
              <span className="price-label">Mulai dari</span>
              <span className="price-value">{property.priceLabel}</span>
            </div>
            <div className="facilities">
              {property.facilities.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flip-card-back">
          <p className="back-desc">{property.backDescription}</p>
          <Link
            href={property.href}
            className="btn-primary"
            style={{
              marginTop: "20px",
              display: "inline-block",
              textDecoration: "none",
            }}
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </article>
  );
}
