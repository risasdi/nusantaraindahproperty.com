import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getClusterSukamuktiChoices } from "@/lib/properties";

export const metadata: Metadata = {
  title: "Pilih Tipe Rumah | Cluster Sukamukti Islamic",
  description: "Pilih tipe rumah di Cluster Sukamukti Islamic.",
};

export default async function ClusterSukamuktiIslamicPage() {
  const choices = await getClusterSukamuktiChoices();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070D0C] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 h-[420px] w-[min(92vw,900px)] rounded-full bg-gradient-to-r from-[#063D36]/55 via-[#C8A15A]/24 to-[#063D36]/55 blur-[135px]"
      />

      <main className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8 pt-10 sm:pt-14 pb-20 sm:pb-24">
        <Link
          href="/#catalog"
          className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/14 hover:border-[#C8A15A]/50 px-4 py-2 text-xs font-medium text-white/80 hover:text-[#C8A15A] transition mb-7"
        >
          <span aria-hidden="true">&larr;</span>
          <span>Kembali ke Portofolio</span>
        </Link>

        <header className="max-w-2xl mb-10 sm:mb-12">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C8A15A] mb-2.5">
            Cluster Sukamukti Islamic
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-white leading-tight">
            Pilih Tipe Rumah{" "}
            <span className="font-normal italic text-[#C8A15A]">
              Pilihan Anda
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-base font-light text-white/60 leading-relaxed">
            Cluster Sukamukti Islamic menghadirkan dua pilihan tipe rumah dengan
            karakter ruang dan kebutuhan berbeda. Pilih salah satu untuk melihat
            galeri dan spesifikasi lengkapnya.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {choices.map((choice) => (
            <Link
              key={choice.id}
              href={choice.href}
              className="group rounded-2xl overflow-hidden bg-[#0B1513]/88 backdrop-blur-xl border border-[#C8A15A]/22 hover:border-[#C8A15A]/55 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.45)] hover:-translate-y-1 flex flex-col"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0A1412]">
                <Image
                  src={choice.image.src}
                  alt={choice.image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1513]/70 via-transparent to-transparent" />
              </div>

              <div className="p-6 sm:p-7 flex flex-1 flex-col justify-between gap-5">
                <div>
                  <h2 className="font-sans text-xl sm:text-2xl font-bold text-white">
                    {choice.title}
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm font-light text-white/65 leading-relaxed">
                    {choice.description}
                  </p>

                  <div className="mt-5">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                      Mulai Dari
                    </span>
                    <span className="mt-0.5 block text-xl sm:text-2xl font-bold text-[#C8A15A]">
                      {choice.priceLabel}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
                    {choice.specs.map((spec) => (
                      <span
                        key={spec}
                        className="rounded-full bg-white/[0.05] border border-white/10 px-3 py-1 text-xs text-white/75"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <span className="inline-flex w-full items-center justify-center rounded-full bg-[#C8A15A] group-hover:bg-[#D9B56F] text-[#070D0C] text-xs sm:text-sm font-bold py-3 px-5 transition">
                  {choice.ctaLabel} &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
