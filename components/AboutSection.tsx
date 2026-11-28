import FadeUp from "./FadeUp";

const ABOUT_POINTS = [
  {
    number: "01",
    title: "Properti Terkurasi",
    description:
      "Rumah modern yang dipilih berdasarkan estetika arsitektur, kualitas lingkungan, dan potensi kenaikan nilai jangka panjang.",
  },
  {
    number: "02",
    title: "Pendampingan KPR Ahli",
    description:
      "Konsultasi terarah mulai dari simulasi angsuran, pemilihan bank rekanan, hingga proses akad yang lancar.",
  },
  {
    number: "03",
    title: "Transparan & Legalitas Aman",
    description:
      "Tanpa biaya tersembunyi — seluruh proses AJB, Sertifikat, hingga serah terima dikawal secara jelas.",
  },
] as const;

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#0A1412] py-20 sm:py-24 scroll-mt-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C8A15A]/22 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/2 -translate-y-1/2 h-[380px] w-[380px] rounded-full bg-[#063D36]/40 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <FadeUp
            delay={0.08}
            className="lg:col-span-7 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-[#C8A15A]/18 p-7 sm:p-10 flex flex-col justify-between"
          >
            <div>
              <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C8A15A] mb-3">
                Tentang Kami
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-snug">
                Kemudahan Investasi{" "}
                <span className="font-normal italic text-[#C8A15A]">
                  Tanpa Biaya Tersembunyi
                </span>{" "}
                untuk Masa Depan Anda.
              </h2>
              <p className="mt-5 text-sm sm:text-base font-light leading-relaxed text-white/65">
                Nusantara Indah Property bukan sekadar membangun hunian berakar
                pada kearifan lokal, melainkan berkomitmen memberikan nilai
                investasi terbaik dan termudah bagi keluarga Anda. Melalui
                layanan yang transparan, kami merancang program kepemilikan
                rumah tanpa Uang Muka dan membebaskan Anda dari kerumitan biaya
                perizinan.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-6 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#C8A15A]" />
                <span>Program KPR DP 0%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#C8A15A]" />
                <span>Bebas Biaya AJB &amp; Sertifikat</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#C8A15A]" />
                <span>Bank Rekanan Resmi</span>
              </div>
            </div>
          </FadeUp>

          <FadeUp
            delay={0.18}
            className="lg:col-span-5 flex flex-col gap-4 justify-between"
          >
            {ABOUT_POINTS.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-[#C8A15A]/16 hover:border-[#C8A15A]/40 p-5 sm:p-6 transition-colors duration-300"
              >
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C8A15A]/15 border border-[#C8A15A]/30 text-xs font-bold text-[#C8A15A]">
                    {point.number}
                  </span>
                  <div>
                    <h3 className="font-sans text-base font-semibold text-white">
                      {point.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-white/60">
                      {point.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
