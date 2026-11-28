"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
} from "react";
import Image from "next/image";
import type { PropertyImage } from "@/data/properties";

interface PropertyGalleryProps {
  images: PropertyImage[];
  ariaLabel: string;
}

export default function PropertyGallery({
  images,
  ariaLabel,
}: PropertyGalleryProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef(0);

  const hasMultiple = images.length > 1;

  const showSlide = useCallback(
    (index: number) => {
      if (images.length === 0) return;
      setCurrentSlide((index + images.length) % images.length);
    },
    [images.length]
  );

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const showPrevLightbox = useCallback(() => {
    if (images.length <= 1) return;
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + images.length) % images.length
    );
  }, [images.length]);

  const showNextLightbox = useCallback(() => {
    if (images.length <= 1) return;
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % images.length
    );
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (hasMultiple && e.key === "ArrowLeft") showPrevLightbox();
      if (hasMultiple && e.key === "ArrowRight") showNextLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    lightboxIndex,
    hasMultiple,
    closeLightbox,
    showPrevLightbox,
    showNextLightbox,
  ]);

  const handleGalleryKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!hasMultiple) return;
    if (e.key === "ArrowLeft") showSlide(currentSlide - 1);
    if (e.key === "ArrowRight") showSlide(currentSlide + 1);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!hasMultiple) return;
    const touchEndX = e.changedTouches[0].screenX;
    const threshold = 50;
    if (touchEndX < touchStartX.current - threshold) {
      showNextLightbox();
    } else if (touchEndX > touchStartX.current + threshold) {
      showPrevLightbox();
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main Dark Luxury Gallery Frame */}
        <div
          tabIndex={0}
          aria-label={ariaLabel}
          onKeyDown={handleGalleryKeyDown}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#C8A15A]/22 bg-[#0B1513] shadow-[0_22px_55px_rgba(0,0,0,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A15A]"
        >
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {images.map((image, index) => (
              <div
                key={`${image.src}-${index}`}
                className="relative min-w-full h-full"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover cursor-zoom-in"
                  onClick={() => setLightboxIndex(index)}
                />
              </div>
            ))}
          </div>

          {/* Subtle top-right photo counter & zoom hint */}
          <button
            type="button"
            onClick={() => setLightboxIndex(currentSlide)}
            aria-label="Perbesar foto"
            className="absolute top-3.5 right-3.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#070D0C]/75 backdrop-blur-md border border-white/15 hover:border-[#C8A15A]/60 px-3 py-1 text-[11px] font-medium text-white/90 transition cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="w-3.5 h-3.5 text-[#C8A15A]"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <span>
              {currentSlide + 1} / {images.length}
            </span>
          </button>

          {/* Carousel Controls — only shown when more than 1 image */}
          {hasMultiple && (
            <>
              <button
                type="button"
                aria-label="Foto sebelumnya"
                onClick={() => showSlide(currentSlide - 1)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#070D0C]/70 hover:bg-[#C8A15A] border border-white/15 hover:border-[#C8A15A] text-white hover:text-[#070D0C] flex items-center justify-center backdrop-blur-md transition cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <button
                type="button"
                aria-label="Foto berikutnya"
                onClick={() => showSlide(currentSlide + 1)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#070D0C]/70 hover:bg-[#C8A15A] border border-white/15 hover:border-[#C8A15A] text-white hover:text-[#070D0C] flex items-center justify-center backdrop-blur-md transition cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <div
                className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full bg-[#070D0C]/65 backdrop-blur-md px-3 py-1.5 border border-white/10"
                aria-label="Pilih foto"
              >
                {images.map((image, index) => (
                  <button
                    key={`${image.src}-dot-${index}`}
                    type="button"
                    aria-label={`Tampilkan foto ${index + 1}`}
                    aria-current={index === currentSlide ? "true" : "false"}
                    onClick={() => showSlide(index)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      index === currentSlide
                        ? "w-6 bg-[#C8A15A]"
                        : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sleek Thumbnail Strip (only when more than 1 image) */}
        {hasMultiple && (
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {images.map((image, index) => {
              const isActive = index === currentSlide;
              return (
                <button
                  key={`${image.src}-thumb-${index}`}
                  type="button"
                  onClick={() => showSlide(index)}
                  aria-label={`Pilih foto ${index + 1}`}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border transition cursor-pointer ${
                    isActive
                      ? "border-[#C8A15A] ring-2 ring-[#C8A15A]/30 opacity-100"
                      : "border-white/12 opacity-60 hover:opacity-95"
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal (z-[9998] above Navbar & ChatBot, explicit Close button, stopPropagation on image) */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tampilan foto diperbesar"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-0 z-[9998] bg-[#040807]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
        >
          {/* Explicit Top-Right Close Button */}
          <button
            type="button"
            aria-label="Tutup tampilan foto"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-[#C8A15A] border border-white/20 hover:border-[#C8A15A] text-white hover:text-[#070D0C] flex items-center justify-center transition cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Prev Button (only when multiple images) */}
          {hasMultiple && (
            <button
              type="button"
              aria-label="Foto sebelumnya"
              onClick={(e) => {
                e.stopPropagation();
                showPrevLightbox();
              }}
              className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-[#C8A15A] border border-white/20 hover:border-[#C8A15A] text-white hover:text-[#070D0C] flex items-center justify-center backdrop-blur-md transition cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-5 h-5"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Enlarged Image Wrapper — stopPropagation prevents closing when clicking the image */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[92vw] max-h-[82vh] flex flex-col items-center justify-center gap-3"
          >
            <Image
              src={images[lightboxIndex].src}
              alt={images[lightboxIndex].alt}
              width={1600}
              height={1200}
              className="max-w-full max-h-[78vh] rounded-xl object-contain border border-[#C8A15A]/25 shadow-[0_24px_70px_rgba(0,0,0,0.75)] select-none"
              style={{ width: "auto", height: "auto" }}
            />
            <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] border border-white/12 px-4 py-1 text-xs text-white/80">
              <span>{images[lightboxIndex].alt}</span>
              {hasMultiple && (
                <span className="text-[#C8A15A] font-semibold">
                  ({lightboxIndex + 1}/{images.length})
                </span>
              )}
            </div>
          </div>

          {/* Next Button (only when multiple images) */}
          {hasMultiple && (
            <button
              type="button"
              aria-label="Foto berikutnya"
              onClick={(e) => {
                e.stopPropagation();
                showNextLightbox();
              }}
              className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-[#C8A15A] border border-white/20 hover:border-[#C8A15A] text-white hover:text-[#070D0C] flex items-center justify-center backdrop-blur-md transition cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-5 h-5"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}
