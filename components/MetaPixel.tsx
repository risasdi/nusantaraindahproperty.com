"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import {
  META_PIXEL_ID,
  flushPendingMetaPixelEvents,
  pageview,
} from "@/lib/meta-pixel";

export default function MetaPixel() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const hasInitializedRef = useRef(false);
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!META_PIXEL_ID || isAdminRoute) return;

    // Flush any early events (e.g. ViewContent) once fbq is attached
    const flushTimer = window.setInterval(() => {
      if (typeof window.fbq === "function") {
        flushPendingMetaPixelEvents();
        window.clearInterval(flushTimer);
      }
    }, 150);

    const stopFlushTimer = window.setTimeout(() => {
      window.clearInterval(flushTimer);
    }, 5000);

    if (!hasInitializedRef.current) {
      // Initial PageView is sent by the base snippet on first non-admin load
      hasInitializedRef.current = true;
      lastTrackedPathRef.current = pathname;
    } else if (lastTrackedPathRef.current !== pathname) {
      lastTrackedPathRef.current = pathname;
      pageview();
    }

    return () => {
      window.clearInterval(flushTimer);
      window.clearTimeout(stopFlushTimer);
    };
  }, [pathname, isAdminRoute]);

  if (!META_PIXEL_ID || isAdminRoute) {
    return null;
  }

  // Only allow numeric/alphanumeric safe Pixel ID characters inside inline script
  const safePixelId = META_PIXEL_ID.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safePixelId) {
    return null;
  }

  return (
    <Script
      id="meta-pixel-base"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          if (!window.__metaPixelInitialized) {
            window.__metaPixelInitialized = true;
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${safePixelId}');
            fbq('track', 'PageView');
          }
        `,
      }}
    />
  );
}
