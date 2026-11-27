import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PropertyDetailView from "@/components/PropertyDetailView";
import { getPropertyDetailBySlug } from "@/lib/properties";

const SLUG = "taman-katapang-indah";

export async function generateMetadata(): Promise<Metadata> {
  const property = await getPropertyDetailBySlug(SLUG);
  return {
    title:
      property?.seoTitle ?? "Taman Indah Katapang | Nusantara Indah Property",
    description:
      property?.seoDescription ??
      "Detail Taman Indah Katapang dari Nusantara Indah Property.",
  };
}

export default async function TamanKatapangIndahPage() {
  const property = await getPropertyDetailBySlug(SLUG);
  if (!property) notFound();
  return <PropertyDetailView property={property} />;
}
