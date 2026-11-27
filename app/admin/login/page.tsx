import AdminLoginForm from "@/components/admin/AdminLoginForm";

interface AdminLoginPageProps {
  searchParams: Promise<{ error?: string | string[] }>;
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams;
  const errorParam = Array.isArray(params.error)
    ? params.error[0]
    : params.error;

  const initialError =
    errorParam === "inactive"
      ? "Akun Anda dinonaktifkan. Silakan hubungi Super Admin."
      : null;

  return <AdminLoginForm initialError={initialError} />;
}
