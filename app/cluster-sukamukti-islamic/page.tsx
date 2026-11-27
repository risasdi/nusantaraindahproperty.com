import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CLUSTER_SUKAMUKTI_CHOICES } from "@/data/properties";

export const metadata: Metadata = {
  title: "Pilih Tipe Rumah | Cluster Sukamukti Islamic",
  description: "Pilih tipe rumah di Cluster Sukamukti Islamic.",
};

export default function ClusterSukamuktiIslamicPage() {
  return (
    <div className="cluster-choice-page">
      <main className="choice-main">
        <div className="choice-heading">
          <span className="choice-label">CLUSTER SUKAMUKTI ISLAMIC</span>
          <h1>Pilih tipe rumah yang sesuai untuk keluarga Anda.</h1>
          <p>
            Cluster Sukamukti Islamic memiliki dua pilihan tipe rumah dengan
            karakter ruang dan kebutuhan yang berbeda. Pilih salah satu untuk
            melihat galeri dan detail lengkapnya.
          </p>
        </div>

        <div className="choice-grid">
          {CLUSTER_SUKAMUKTI_CHOICES.map((choice) => (
            <Link key={choice.id} className="choice-card" href={choice.href}>
              <div className="choice-card-img-wrapper">
                <Image
                  src={choice.image.src}
                  alt={choice.image.alt}
                  fill
                  sizes="(max-width: 760px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="choice-card-body">
                <h2>{choice.title}</h2>
                <p>{choice.description}</p>
                <div className="price-container">
                  <span className="price-label">Mulai dari</span>
                  <span className="price-value" style={{ fontSize: "1.4rem" }}>
                    {choice.priceLabel}
                  </span>
                </div>
                <div className="choice-specs">
                  {choice.specs.map((spec) => (
                    <span key={spec}>{spec}</span>
                  ))}
                </div>
                <span className="choice-link">{choice.ctaLabel}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
