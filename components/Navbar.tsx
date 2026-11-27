"use client";

import { useEffect, useState, type MouseEvent } from "react";
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

    if (pathname !== "/" || !targetId) {
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

  return (
    <nav className="navbar z-[999] pointer-events-auto">
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
                  isLinkActive(item.href, item.sectionId)
                    ? "active-link"
                    : undefined
                }
                onClick={(e) => handleSectionNavigation(e, item.sectionId)}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/#contact"
              className="nav-cta"
              onClick={(e) => {
                trackMetaEvent("Contact", {
                  content_name: "Navbar - Hubungi Agen",
                });
                trackAnalyticsEvent({
                  event_name: "Contact",
                  page_path: pathname,
                  property_title: "Navbar - Hubungi Agen",
                });
                handleSectionNavigation(e, "contact");
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
