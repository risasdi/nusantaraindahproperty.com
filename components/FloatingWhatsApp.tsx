"use client";

import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/meta-pixel";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Beranda",
  "/kpr": "Info KPR",
  "/search": "Hasil Pencarian",
  "/cluster-sukamukti-islamic": "Cluster Sukamukti Islamic",
  "/cluster-sukamukti-islamic-tipe-36": "Cluster Sukamukti Islamic - Tipe 36",
  "/cluster-sukamukti-islamic-tipe-45": "Cluster Sukamukti Islamic - Tipe 45",
  "/villa-resik": "Villa Resik",
  "/taman-katapang-indah": "Taman Indah Katapang",
};

export default function FloatingWhatsApp() {
  const pathname = usePathname();

  const handleClick = () => {
    const knownLabel = ROUTE_LABELS[pathname];
    const headingText =
      typeof document !== "undefined"
        ? document.querySelector("h1")?.textContent?.trim()
        : undefined;
    const contextName =
      knownLabel ||
      (pathname.startsWith("/properti/") && headingText
        ? headingText
        : pathname);

    trackEvent("Contact", {
      content_name: `Chat WA - ${contextName}`,
      content_category: "WhatsApp",
    });
  };

  return (
    <a
      href="https://wa.me/6285121186505"
      target="_blank"
      rel="noreferrer"
      className="floating-wa"
      aria-label="Chat WhatsApp"
      onClick={handleClick}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.5 4.1 1.5 5.9L0 24l6.3-1.6a11.9 11.9 0 0 0 5.7 1.4h.1c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4zM12.1 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7.9 1-3.6-.2-.4a9.8 9.8 0 1 1 8.3 4.7zm5.4-7.3c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2c-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.8-2.1-.2-.3 0-.5.2-.7l.5-.6c.2-.2.2-.4.3-.6 0-.2 0-.4-.1-.6-.1-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6 0 1.5 1.1 3 1.2 3.2.2.2 2.2 3.4 5.4 4.8.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.7-.1 1.8-.7 2-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.4z" />
      </svg>
    </a>
  );
}
