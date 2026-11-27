"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackEvent } from "@/lib/meta-pixel";

interface TrackedContactLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  contentName: string;
  contentCategory?: string;
  children: ReactNode;
}

export default function TrackedContactLink({
  contentName,
  contentCategory,
  onClick,
  children,
  ...props
}: TrackedContactLinkProps) {
  return (
    <a
      {...props}
      onClick={(e) => {
        trackEvent("Contact", {
          content_name: contentName,
          ...(contentCategory ? { content_category: contentCategory } : {}),
        });
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
