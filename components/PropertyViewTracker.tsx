"use client";

import { useEffect, useRef } from "react";
import { trackEvent as trackAnalyticsEvent } from "@/lib/analytics";
import { trackEvent as trackMetaEvent } from "@/lib/meta-pixel";

interface PropertyViewTrackerProps {
  title: string;
  price: number;
  slug?: string;
}

export default function PropertyViewTracker({
  title,
  price,
  slug,
}: PropertyViewTrackerProps) {
  const trackedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${slug ?? title}:${price}`;
    if (trackedKeyRef.current === key) return;
    trackedKeyRef.current = key;

    trackMetaEvent("ViewContent", {
      content_name: title,
      ...(slug ? { content_ids: [slug] } : {}),
      content_type: "product",
      value: price,
      currency: "IDR",
    });

    trackAnalyticsEvent({
      event_name: "ViewContent",
      property_title: title,
    });
  }, [title, price, slug]);

  return null;
}
