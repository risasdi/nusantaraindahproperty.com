import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-[78vh] flex items-center justify-center overflow-hidden bg-[#070D0C] text-white px-5 py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[480px] rounded-full bg-gradient-to-r from-[#063D36]/55 via-[#C8A15A]/24 to-[#063D36]/55 blur-[130px]"
      />

      <div className="relative z-10 max-w-lg w-full rounded-2xl bg-[#0B1513]/88 backdrop-blur-xl border border-[#C8A15A]/22 p-8 sm:p-10 text-center shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] border border-[#C8A15A]/30 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C8A15A]">
          Error 404
        </span>

        <h1 className="mt-5 font-sans text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Halaman Tidak{" "}
          <span className="font-normal italic text-[#C8A15A]">Ditemukan</span>
        </h1>

        <p className="mt-3 text-sm text-white/60 leading-relaxed">
          Maaf, halaman atau properti yang Anda cari sudah berpindah atau tidak
          tersedia. Jelajahi koleksi hunian terbaru kami melalui beranda.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#C8A15A] hover:bg-[#D9B56F] text-[#070D0C] text-xs sm:text-sm font-bold px-6 py-3 transition"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/search"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/20 hover:border-[#C8A15A]/55 text-white text-xs sm:text-sm font-semibold px-6 py-3 transition"
          >
            Cari Properti
          </Link>
        </div>
      </div>
    </div>
  );
}
