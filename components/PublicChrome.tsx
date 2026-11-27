"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface PublicChromeProps {
  children: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
  floatingWhatsApp: ReactNode;
}

export default function PublicChrome({
  children,
  navbar,
  footer,
  floatingWhatsApp,
}: PublicChromeProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      {navbar}
      {children}
      {footer}
      {floatingWhatsApp}
    </>
  );
}
