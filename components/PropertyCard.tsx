"use client";

import { useEffect, useRef, useState } from "react";
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

function cleanSpecLabel(raw: string): string {
  return raw.replace(/^[^\p{L}\p{N}]+/u, "").trim() || raw;
}

export default function PropertyCard({ property, delay }: PropertyCardProps) {
  const cardRef = useRef<HTMLElement>(null);
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
      { root: null, rootMargin: "0px", threshold: 0.12 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const isSold = property.badgeVariant === "rent";

  return (
    <article
      ref={cardRef}
      style={delay !== undefined ? { transitionDelay: `${delay}s` } : undefined}
      className={`group fade-up${isVisible ? " is-visible" : ""} relative flex flex-col rounded-2xl overflow-hidden bg-[#0B1412]/88 backdrop-blur-xl border border-[#C8A15A]/20 hover:border-[#C8A15A]/55 transition-all duration-500 shadow-[0_18px_45px_rgba(0,0,0,0.45)] hover:-translate-y-1`}
    >
      {/* Top Sharp Photo */}
      <Link
        href={property.href}
        aria-label={`Lihat detail ${property.title}`}
        className="relative aspect-[16/11] w-full overflow-hidden bg-[#0A1412] block"
      >
        <Image
          src={property.image}
          alt={property.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1412]/70 via-transparent to-[#070D0C]/20" />

        {/* Small Pill Status Badge */}
        <span
          className={`absolute top-3.5 left-3.5 z-10 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
            isSold
              ? "bg-[#070D0C]/80 text-white/80 border border-white/20 backdrop-blur-md"
              : "bg-[#C8A15A] text-[#070D0C] shadow-[0_4px_14px_rgba(200,161,90,0.35)]"
          }`}
        >
          {property.badgeText}
        </span>
      </Link>

      {/* Dark Glass Content Area */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 bg-gradient-to-b from-[#0D1916]/60 to-[#070D0C]/95">
        <div>
          {/* Bold White Price */}
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {property.priceLabel}
          </p>

          {/* Title & Location Row */}
          <div className="mt-1.5 flex items-start justify-between gap-3">
            <h4 className="font-sans text-sm sm:text-[15px] font-semibold text-white/95 leading-snug">
              {property.title}
            </h4>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/55 shrink-0 pt-0.5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-3.5 h-3.5 text-[#C8A15A] shrink-0"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="max-w-[130px] truncate">{property.location}</span>
            </span>
          </div>

          {/* Specs Row with Gold Icons */}
          <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center gap-x-4 gap-y-2">
            {property.facilities.slice(0, 3).map((item, idx) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 text-xs text-white/70"
              >
                {idx === 0 && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="w-3.5 h-3.5 text-[#C8A15A] shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M3 7v11m18-4v4M3 14h18v-3a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v3" />
                    <circle cx="6.5" cy="10" r="1.5" />
                  </svg>
                )}
                {idx === 1 && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="w-3.5 h-3.5 text-[#C8A15A] shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3z" />
                    <path d="M6 12V6a2 2 0 0 1 2-2h1" />
                  </svg>
                )}
                {idx === 2 && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="w-3.5 h-3.5 text-[#C8A15A] shrink-0"
                    aria-hidden="true"
                  >
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <path d="M9 4v16M4 9h16" />
                  </svg>
                )}
                <span>{cleanSpecLabel(item)}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Full-Width Rounded-Full Outline Button */}
        <Link
          href={property.href}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-white/25 hover:border-[#C8A15A] bg-white/[0.03] hover:bg-[#C8A15A] text-white hover:text-[#070D0C] text-xs font-semibold tracking-wide py-2.5 px-5 transition-all duration-300"
        >
          Lihat Detail
        </Link>
      </div>
    </article>
  );
}
