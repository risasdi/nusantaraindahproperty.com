import FadeUp from "./FadeUp";

const STATS = [
  { value: "12,500+", label: "Properti Terdaftar", delay: 0.08 },
  { value: "8,900+", label: "Pelanggan Puas", delay: 0.16 },
  { value: "320+", label: "Agen Profesional", delay: 0.24 },
  { value: "28+", label: "Tahun Pengalaman", delay: 0.32 },
] as const;

export default function StatsSection() {
  return (
    <section className="relative bg-[#070D0C] border-y border-[#C8A15A]/18 py-14 sm:py-16">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((stat) => (
            <FadeUp
              key={stat.label}
              delay={stat.delay}
              className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 px-5 py-6 text-center"
            >
              <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#C8A15A]">
                {stat.value}
              </h2>
              <p className="mt-2 text-[11px] sm:text-xs font-medium uppercase tracking-[0.14em] text-white/60">
                {stat.label}
              </p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
