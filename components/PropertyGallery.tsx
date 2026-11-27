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
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + images.length) % images.length
    );
  }, [images.length]);

  const showNextLightbox = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % images.length
    );
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrevLightbox();
      if (e.key === "ArrowRight") showNextLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, closeLightbox, showPrevLightbox, showNextLightbox]);

  const handleGalleryKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") showSlide(currentSlide - 1);
    if (e.key === "ArrowRight") showSlide(currentSlide + 1);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const touchEndX = e.changedTouches[0].screenX;
    const threshold = 50;
    if (touchEndX < touchStartX.current - threshold) {
      showNextLightbox();
    } else if (touchEndX > touchStartX.current + threshold) {
      showPrevLightbox();
    }
  };

  return (
    <>
      <div
        className="property-gallery"
        tabIndex={0}
        aria-label={ariaLabel}
        onKeyDown={handleGalleryKeyDown}
      >
        <div
          className="gallery-track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={image.src} className="gallery-slide-wrapper">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 760px) 100vw, 55vw"
                className="gallery-slide lightbox-trigger"
                onClick={() => setLightboxIndex(index)}
              />
            </div>
          ))}
        </div>

        <button
          className="gallery-button previous"
          type="button"
          aria-label="Foto sebelumnya"
          onClick={() => showSlide(currentSlide - 1)}
        >
          &#8249;
        </button>
        <button
          className="gallery-button next"
          type="button"
          aria-label="Foto berikutnya"
          onClick={() => showSlide(currentSlide + 1)}
        >
          &#8250;
        </button>

        <div className="gallery-dots" aria-label="Pilih foto">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              className={`gallery-dot${index === currentSlide ? " active" : ""}`}
              aria-label={`Tampilkan foto ${index + 1}`}
              aria-current={index === currentSlide ? "true" : "false"}
              onClick={() => showSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <div
        className={`lightbox-overlay${lightboxIndex !== null ? " active" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Tampilan foto diperbesar"
        onClick={closeLightbox}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          className="lightbox-prev"
          aria-label="Previous image"
          onClick={(e) => {
            e.stopPropagation();
            showPrevLightbox();
          }}
        >
          &#10094;
        </button>

        <div className="lightbox-content">
          {lightboxIndex !== null && images[lightboxIndex] && (
            <Image
              src={images[lightboxIndex].src}
              alt={images[lightboxIndex].alt}
              width={1600}
              height={1200}
              className="lightbox-img"
              style={{ width: "auto", height: "auto" }}
            />
          )}
        </div>

        <button
          type="button"
          className="lightbox-next"
          aria-label="Next image"
          onClick={(e) => {
            e.stopPropagation();
            showNextLightbox();
          }}
        >
          &#10095;
        </button>
      </div>
    </>
  );
}
