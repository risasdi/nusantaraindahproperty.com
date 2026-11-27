import Link from "next/link";

export default function HeroSection() {
  return (
    <header id="home" className="hero">
      <div className="hero-overlay" />
      <div className="hero-inner">
        <div className="hero-content">
          <span className="hero-subtitle">
            GERBANG MENUJU KEHIDUPAN MAPAN KINI LEBIH DEKAT
          </span>
          <h1>KPR DP 0% &amp; BEBAS BIAYA LEGALITAS.</h1>
          <p>
            Nikmati kemudahan melangkah ke rumah baru hanya dengan membayar
            booking fee. Kami menanggung sepenuhnya biaya Uang Muka (DP 0%),
            AJB, Sertifikat, hingga perizinan legalitas.
          </p>
          <div className="hero-actions">
            <a href="#catalog" className="btn-primary">
              Lihat Properti
            </a>
            <a href="#contact" className="btn-secondary">
              Booking Kunjungan
            </a>
          </div>
        </div>

        <Link
          className="hero-panel"
          href="/cluster-sukamukti-islamic"
          aria-label="Lihat detail Cluster Sukamukti Islamic"
        >
          <span className="panel-label">Koleksi Unggulan</span>
          <strong>Cluster Sukamukti Islamic</strong>
          <small>Mulai dari Rp 400 Juta</small>
        </Link>
      </div>
    </header>
  );
}
