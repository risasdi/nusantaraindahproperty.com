import FadeUp from "./FadeUp";

const STATS = [
  { value: "12,500+", label: "Properti Terdaftar", delay: 0.1 },
  { value: "8,900+", label: "Pelanggan Puas", delay: 0.2 },
  { value: "320+", label: "Agen Profesional", delay: 0.3 },
  { value: "28+", label: "Tahun Pengalaman", delay: 0.4 },
] as const;

export default function StatsSection() {
  return (
    <section className="stats-section">
      {STATS.map((stat) => (
        <FadeUp key={stat.label} className="stat-box" delay={stat.delay}>
          <h2>{stat.value}</h2>
          <p>{stat.label}</p>
        </FadeUp>
      ))}
    </section>
  );
}
