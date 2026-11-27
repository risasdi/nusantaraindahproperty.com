import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PropertyDetailView from "@/components/PropertyDetailView";
import { getPropertyBySlug } from "@/data/properties";

const property = getPropertyBySlug("cluster-sukamukti-islamic-tipe-36");

export const metadata: Metadata = {
  title:
    property?.seoTitle ??
    "Cluster Sukamukti Islamic Tipe 36 | Nusantara Indah Property",
  description:
    property?.seoDescription ??
    "Detail rumah Tipe 36 Cluster Sukamukti Islamic.",
};

export default function ClusterSukamuktiTipe36Page() {
  if (!property) notFound();
  return <PropertyDetailView property={property} />;
}
