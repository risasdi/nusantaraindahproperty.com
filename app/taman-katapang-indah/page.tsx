import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PropertyDetailView from "@/components/PropertyDetailView";
import { getPropertyBySlug } from "@/data/properties";

const property = getPropertyBySlug("taman-katapang-indah");

export const metadata: Metadata = {
  title:
    property?.seoTitle ?? "Taman Indah Katapang | Nusantara Indah Property",
  description:
    property?.seoDescription ??
    "Detail Taman Indah Katapang dari Nusantara Indah Property.",
};

export default function TamanKatapangIndahPage() {
  if (!property) notFound();
  return <PropertyDetailView property={property} />;
}
