import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { getCurrentAdminProfile } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin Dashboard | Nusantara Indah Property",
  description: "Panel manajemen properti PT Nusantara Indah Property.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getCurrentAdminProfile();

  return <AdminShell profile={profile}>{children}</AdminShell>;
}
