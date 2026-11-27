import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PropertyDetailView from "@/components/PropertyDetailView";
import { getPropertyDetailBySlug } from "@/lib/properties";

interface DynamicPropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: DynamicPropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyDetailBySlug(slug);

  if (!property) {
    return {
      title: "Properti Tidak Ditemukan | Nusantara Indah Property",
    };
  }

  return {
    title: property.seoTitle,
    description: property.seoDescription,
  };
}

export default async function DynamicPropertyPage({
  params,
}: DynamicPropertyPageProps) {
  const { slug } = await params;
  const property = await getPropertyDetailBySlug(slug);

  if (!property) {
    notFound();
  }

  return <PropertyDetailView property={property} />;
}
