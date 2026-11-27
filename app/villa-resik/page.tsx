import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PropertyDetailView from "@/components/PropertyDetailView";
import { getPropertyDetailBySlug } from "@/lib/properties";

const SLUG = "villa-resik";

export async function generateMetadata(): Promise<Metadata> {
  const property = await getPropertyDetailBySlug(SLUG);
  return {
    title: property?.seoTitle ?? "Villa Resik | Nusantara Indah Property",
    description:
      property?.seoDescription ??
      "Detail Villa Resik dari Nusantara Indah Property.",
  };
}

export default async function VillaResikPage() {
  const property = await getPropertyDetailBySlug(SLUG);
  if (!property) notFound();
  return <PropertyDetailView property={property} />;
}
