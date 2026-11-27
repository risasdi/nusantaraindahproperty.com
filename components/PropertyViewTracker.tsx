"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/meta-pixel";

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
  useEffect(() => {
    trackEvent("ViewContent", {
      content_name: title,
      ...(slug ? { content_ids: [slug] } : {}),
      content_type: "product",
      value: price,
      currency: "IDR",
    });
  }, [title, price, slug]);

  return null;
}
