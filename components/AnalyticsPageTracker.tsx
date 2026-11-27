"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export default function AnalyticsPageTracker() {
  const pathname = usePathname();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
      lastTrackedPathRef.current = null;
      return;
    }

    if (lastTrackedPathRef.current === pathname) return;
    lastTrackedPathRef.current = pathname;

    trackEvent({
      event_name: "PageView",
      page_path: pathname,
    });
  }, [pathname]);

  return null;
}
