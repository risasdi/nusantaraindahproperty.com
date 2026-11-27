"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackEvent as trackAnalyticsEvent } from "@/lib/analytics";
import { trackEvent as trackMetaEvent } from "@/lib/meta-pixel";

interface TrackedContactLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  contentName: string;
  contentCategory?: string;
  propertyTitle?: string;
  children: ReactNode;
}

export default function TrackedContactLink({
  contentName,
  contentCategory,
  propertyTitle,
  onClick,
  children,
  ...props
}: TrackedContactLinkProps) {
  return (
    <a
      {...props}
      onClick={(e) => {
        trackMetaEvent("Contact", {
          content_name: contentName,
          ...(contentCategory ? { content_category: contentCategory } : {}),
        });
        trackAnalyticsEvent({
          event_name: "Contact",
          property_title: propertyTitle ?? contentName,
        });
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
