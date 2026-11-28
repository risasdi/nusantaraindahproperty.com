"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface AdminLoginFormProps {
  initialError?: string | null;
}

export default function AdminLoginForm({
  initialError = null,
}: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "Email atau password salah. Silakan coba lagi."
            : signInError.message
        );
        return;
      }

      if (authData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_active")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (profile && profile.is_active === false) {
          await supabase.auth.signOut();
          setError("Akun Anda dinonaktifkan. Silakan hubungi Super Admin.");
          return;
        }
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan saat login. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070D0C] text-white flex items-center justify-center px-4 py-12">
      {/* Subtle Ambient Emerald + Nusantara Gold Glow behind Login Card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[520px] rounded-full bg-gradient-to-r from-[#063D36]/55 via-[#C8A15A]/22 to-[#063D36]/55 blur-[135px]"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[#0B1513]/92 backdrop-blur-xl border border-[#C8A15A]/24 shadow-[0_28px_70px_rgba(0,0,0,0.65)] p-7 sm:p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4 p-2.5 rounded-2xl bg-white/[0.04] border border-[#C8A15A]/25">
            <Image
              src="/images/logo/logo-10.png"
              alt="Nusantara Indah Property"
              width={56}
              height={56}
              className="rounded-xl"
              priority
            />
          </div>
          <span className="text-[11px] font-semibold tracking-[0.22em] text-[#C8A15A] uppercase mb-2">
            Panel Admin
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Masuk{" "}
            <span className="font-normal italic text-[#C8A15A]">Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-2 leading-relaxed">
            Masuk menggunakan akun admin untuk mengelola properti, leads, dan
            pengaturan website.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-rose-500/15 border border-rose-400/35 px-4 py-3 text-xs sm:text-sm text-rose-100 font-medium"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-medium text-white/75 mb-2"
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@nusantaraindahproperty.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-white/15 bg-[#070D0C] text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-[#C8A15A] focus:ring-2 focus:ring-[#C8A15A]/20 transition"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium text-white/75 mb-2"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-white/15 bg-[#070D0C] text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-[#C8A15A] focus:ring-2 focus:ring-[#C8A15A]/20 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-[#C8A15A] hover:bg-[#D9B56F] text-[#070D0C] font-bold text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_10px_28px_rgba(200,161,90,0.28)] cursor-pointer"
          >
            {loading ? "Memproses..." : "Masuk ke Dashboard"}
          </button>
        </form>

        <div className="mt-7 pt-5 border-t border-white/10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/55 hover:text-[#C8A15A] transition"
          >
            <span aria-hidden="true">&larr;</span>
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
