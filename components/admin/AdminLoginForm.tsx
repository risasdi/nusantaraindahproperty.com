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
    <div className="min-h-screen bg-[#e4e7e5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_45px_rgba(6,61,54,0.12)] border border-[#063d36]/10 p-8 sm:p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <Image
            src="/images/logo/logo-10.png"
            alt="Nusantara Indah Property"
            width={64}
            height={64}
            className="mb-4 rounded-xl"
            priority
          />
          <span className="text-xs font-bold tracking-[0.22em] text-[#c8a15a] uppercase mb-2">
            Panel Admin
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#063d36]">
            Masuk Dashboard
          </h1>
          <p className="text-sm text-[#063d36]/75 mt-2">
            Masuk menggunakan akun admin Supabase Anda untuk mengelola properti.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-bold uppercase tracking-[0.1em] text-[#063d36] mb-2"
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
              className="w-full h-12 px-4 rounded-2xl border border-[#063d36]/20 bg-white text-[#063d36] text-sm focus:outline-none focus:border-[#c8a15a] focus:ring-4 focus:ring-[#c8a15a]/15 transition"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-bold uppercase tracking-[0.1em] text-[#063d36] mb-2"
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
              className="w-full h-12 px-4 rounded-2xl border border-[#063d36]/20 bg-white text-[#063d36] text-sm focus:outline-none focus:border-[#c8a15a] focus:ring-4 focus:ring-[#c8a15a]/15 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-[#063d36] text-white font-semibold text-sm hover:bg-[#052e29] disabled:opacity-60 disabled:cursor-not-allowed transition shadow-[0_10px_20px_rgba(6,61,54,0.18)] cursor-pointer"
          >
            {loading ? "Memproses..." : "Masuk ke Dashboard"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-[#063d36]/70 hover:text-[#c8a15a] transition"
          >
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
