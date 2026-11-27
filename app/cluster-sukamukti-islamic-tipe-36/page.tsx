import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PropertyDetailView from "@/components/PropertyDetailView";
import { getPropertyDetailBySlug } from "@/lib/properties";

const SLUG = "cluster-sukamukti-islamic-tipe-36";

export async function generateMetadata(): Promise<Metadata> {
  const property = await getPropertyDetailBySlug(SLUG);
  return {
    title:
      property?.seoTitle ??
      "Cluster Sukamukti Islamic Tipe 36 | Nusantara Indah Property",
    description:
      property?.seoDescription ??
      "Detail rumah Tipe 36 Cluster Sukamukti Islamic.",
  };
}

export default async function ClusterSukamuktiTipe36Page() {
  const property = await getPropertyDetailBySlug(SLUG);
  if (!property) notFound();
  return <PropertyDetailView property={property} />;
}
