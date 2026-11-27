import FadeUp from "./FadeUp";

const ABOUT_POINTS = [
  {
    title: "Properti Terpilih",
    description:
      "Rumah premium yang dipilih berdasarkan gaya, nilai, dan potensi jangka panjang.",
  },
  {
    title: "Panduan Ahli",
    description:
      "Konsultasi yang terarah mulai dari pemilihan lokasi hingga proses closing.",
  },
  {
    title: "Layanan Terpercaya",
    description:
      "Proses yang transparan, agen responsif, dan komunikasi yang jelas.",
  },
] as const;

export default function AboutSection() {
  return (
    <section id="about" className="about-section">
      <div className="about-content">
        <FadeUp className="about-copy" delay={0.1}>
          <span className="section-tag">TENTANG KAMI</span>
          <h2>
            KEMUDAHAN INVESTASI TANPA BIAYA TERSEMBUNYI, UNTUK MASA DEPAN YANG
            LEBIH BERARTI.
          </h2>
          <p>
            Nusantara Indah Property bukan sekadar membangun hunian berakar pada
            kearifan lokal, melainkan berkomitmen memberikan nilai investasi
            terbaik dan termudah bagi Anda. Melalui layanan yang transparan,
            kami merancang program kepemilikan rumah tanpa Uang Muka dan
            membebaskan Anda dari kerumitan biaya perizinan. Setiap keputusan
            properti Anda kini terasa lebih ringan, aman, dan percaya diri.
          </p>
        </FadeUp>

        <FadeUp className="about-points" delay={0.3}>
          {ABOUT_POINTS.map((point) => (
            <div key={point.title}>
              <strong>{point.title}</strong>
              <p>{point.description}</p>
            </div>
          ))}
        </FadeUp>
      </div>
    </section>
  );
}
