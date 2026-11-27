import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PropertyDetailView from "@/components/PropertyDetailView";
import { getPropertyBySlug } from "@/data/properties";

const property = getPropertyBySlug("villa-resik");

export const metadata: Metadata = {
  title: property?.seoTitle ?? "Villa Resik | Nusantara Indah Property",
  description:
    property?.seoDescription ??
    "Detail Villa Resik dari Nusantara Indah Property.",
};

export default function VillaResikPage() {
  if (!property) notFound();
  return <PropertyDetailView property={property} />;
}
