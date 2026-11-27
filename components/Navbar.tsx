"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/meta-pixel";

const NAV_ITEMS = [
  { label: "Beranda", href: "/#home", sectionId: "home" },
  { label: "Properti", href: "/#catalog", sectionId: "catalog" },
  { label: "Info KPR", href: "/kpr", sectionId: null },
  { label: "Tentang Kami", href: "/#about", sectionId: "about" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (pathname !== "/") return;

    const sections = document.querySelectorAll("header[id], section[id]");
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let current = "";
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            current = entry.target.getAttribute("id") || "";
          }
        });
        if (current) {
          setActiveSection(current);
        }
      },
      { rootMargin: "-30% 0px -70% 0px" }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [pathname]);

  const isLinkActive = (href: string, sectionId: string | null) => {
    if (pathname === "/") {
      return sectionId !== null && activeSection === sectionId;
    }
    return sectionId === null && pathname === href;
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="logo-container">
        <Link
          href="/"
          className="nav-logo-link"
          aria-label="Kembali ke halaman utama"
          onClick={closeMenu}
        >
          {!logoError ? (
            <Image
              src="/images/logo/logo-06.png"
              alt="Nusantara Indah Property"
              width={4426}
              height={1327}
              priority
              className="nav-logo"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="fallback-logo">NUSANTARA INDAH</span>
          )}
        </Link>
      </div>

      <button
        type="button"
        className={`hamburger-btn${menuOpen ? " active" : ""}`}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`nav-menu${menuOpen ? " active" : ""}`}>
        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={
                  isLinkActive(item.href, item.sectionId) ? "active-link" : undefined
                }
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/#contact"
              className="nav-cta"
              onClick={() => {
                trackEvent("Contact", {
                  content_name: "Navbar - Hubungi Agen",
                });
                closeMenu();
              }}
            >
              Hubungi Agen
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
