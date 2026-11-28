"use client";

import { Fragment, useEffect, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackEvent as trackAnalyticsEvent } from "@/lib/analytics";
import { trackEvent as trackMetaEvent } from "@/lib/meta-pixel";

const NAV_ITEMS = [
  { label: "Beranda", href: "/#home", sectionId: "home" },
  { label: "Properti", href: "/#catalog", sectionId: "catalog" },
  { label: "Info KPR", href: "/kpr", sectionId: null },
  { label: "Tentang Kami", href: "/#about", sectionId: "about" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const [scrolled, setScrolled] = useState(false);

  // Subtle dark glass intensification on scroll
  useEffect(() => {
    const updateScroll = () => {
      setScrolled(window.scrollY > 28);
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, [pathname]);

  // Lock body scroll and listen for Escape key when mobile overlay is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  // Scroll-spy for homepage sections
  useEffect(() => {
    if (!isHome) return;

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
      { rootMargin: "-20% 0px -55% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isHome]);

  const isLinkActive = (href: string, sectionId: string | null) => {
    if (isHome) {
      return sectionId !== null && activeSection === sectionId;
    }
    return sectionId === null && pathname === href;
  };

  const closeMenu = () => {
    setMenuOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  };

  const handleSectionNavigation = (
    e: MouseEvent<HTMLAnchorElement>,
    targetId: string | null
  ) => {
    closeMenu();

    if (!isHome || !targetId) {
      return;
    }

    e.preventDefault();

    if (targetId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.replaceState(null, "", "/");
      setActiveSection("home");
      return;
    }

    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `/#${targetId}`);
      if (targetId !== "contact") {
        setActiveSection(targetId);
      }
    }
  };

  const handleContactClick = (e: MouseEvent<HTMLAnchorElement>) => {
    trackMetaEvent("Contact", {
      content_name: "Navbar - Hubungi Agen",
    });
    trackAnalyticsEvent({
      event_name: "Contact",
      page_path: pathname,
      property_title: "Navbar - Hubungi Agen",
    });
    handleSectionNavigation(e, "contact");
  };

  const navClassName = [
    "navbar",
    isHome ? "navbar--hero" : "navbar--inner",
    scrolled ? "navbar--scrolled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <nav className={navClassName} aria-label="Navigasi utama">
        <div className="navbar-inner">
          {/* Left: Brand Logo */}
          <div className="logo-container">
            <Link
              href="/"
              className="nav-logo-link"
              aria-label="Kembali ke halaman utama"
              onClick={(e) => handleSectionNavigation(e, "home")}
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

          {/* Center: Floating Dark Glass Pill Navigation */}
          <div className="nav-desktop">
            <ul className="nav-pill-container">
              {NAV_ITEMS.map((item, idx) => (
                <Fragment key={item.href}>
                  <li>
                    <Link
                      href={item.href}
                      className={
                        isLinkActive(item.href, item.sectionId)
                          ? "nav-pill-link active-link"
                          : "nav-pill-link"
                      }
                      onClick={(e) => handleSectionNavigation(e, item.sectionId)}
                    >
                      {item.label}
                    </Link>
                  </li>
                  {idx < NAV_ITEMS.length - 1 && (
                    <li aria-hidden="true" className="nav-pill-dot">
                      &bull;
                    </li>
                  )}
                </Fragment>
              ))}
            </ul>
          </div>

          {/* Right: Solid Gold Pill CTA + Mobile Hamburger */}
          <div className="nav-right">
            <Link
              href="/#contact"
              className="nav-cta-pill"
              onClick={handleContactClick}
            >
              Hubungi Agen
            </Link>

            <button
              type="button"
              className={`hamburger-btn${menuOpen ? " active" : ""}`}
              aria-label={
                menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
              }
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation-overlay"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Sibling full-screen mobile overlay outside <nav> so backdrop-filter
          never clips fixed 100dvh, and z-index (9995) sits strictly above
          PropertyChatBot (z-[9990]) */}
      <div
        id="mobile-navigation-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi mobile"
        aria-hidden={!menuOpen}
        className={`nav-mobile-overlay${menuOpen ? " active" : ""}`}
      >
        <div className="nav-mobile-header">
          <span className="nav-mobile-brand">Nusantara Indah</span>
          <button
            type="button"
            className="nav-mobile-close"
            aria-label="Tutup menu navigasi"
            onClick={closeMenu}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="nav-mobile-body">
          <ul className="nav-mobile-links">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  tabIndex={menuOpen ? 0 : -1}
                  className={
                    isLinkActive(item.href, item.sectionId)
                      ? "active-link"
                      : undefined
                  }
                  onClick={(e) => handleSectionNavigation(e, item.sectionId)}
                >
                  <span>{item.label}</span>
                  <span className="nav-mobile-arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-mobile-footer">
            <Link
              href="/#contact"
              tabIndex={menuOpen ? 0 : -1}
              className="nav-mobile-cta"
              onClick={handleContactClick}
            >
              Hubungi Agen
            </Link>
            <p className="nav-mobile-note">
              Dark Luxury Living &bull; Bandung
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
