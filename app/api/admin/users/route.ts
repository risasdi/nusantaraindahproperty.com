import { NextResponse } from "next/server";
import { ADMIN_ROLES, type AdminRole } from "@/lib/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const VALID_ROLES = new Set<string>(ADMIN_ROLES);

async function requireSuperAdmin(): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 }
      ),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.is_active === false || profile.role !== "super_admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden. Hanya Super Admin yang memiliki akses." },
        { status: 403 }
      ),
    };
  }

  return { ok: true, userId: user.id };
}

export async function GET() {
  const authCheck = await requireSuperAdmin();
  if (!authCheck.ok) return authCheck.response;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, is_active, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ users: data ?? [] });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal memuat daftar user.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface CreateUserBody {
  full_name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export async function POST(request: Request) {
  const authCheck = await requireSuperAdmin();
  if (!authCheck.ok) return authCheck.response;

  try {
    const body = (await request.json()) as CreateUserBody;
    const fullName = body.full_name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const role = (body.role?.trim() ?? "sales") as AdminRole;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Nama lengkap, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal harus 6 karakter." },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.has(role)) {
      return NextResponse.json(
        { error: "Role tidak valid." },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const { data: created, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role,
        },
      });

    if (createError || !created.user) {
      return NextResponse.json(
        { error: createError?.message ?? "Gagal membuat user baru." },
        { status: 400 }
      );
    }

    const newUserId = created.user.id;

    // Ensure full_name, email, role, and is_active are persisted in public.profiles
    // Try with authenticated super_admin session first (respecting RLS), then fallback to service_role
    const sessionClient = await createClient();
    let profileRow = null;

    const { data: upsertedBySession, error: sessionUpsertError } =
      await sessionClient
        .from("profiles")
        .upsert(
          {
            id: newUserId,
            email,
            full_name: fullName,
            role,
            is_active: true,
          },
          { onConflict: "id" }
        )
        .select("id, email, full_name, role, is_active, created_at")
        .single();

    if (!sessionUpsertError && upsertedBySession) {
      profileRow = upsertedBySession;
    } else {
      const { data: upsertedByAdmin, error: adminUpsertError } =
        await adminClient
          .from("profiles")
          .upsert(
            {
              id: newUserId,
              email,
              full_name: fullName,
              role,
              is_active: true,
            },
            { onConflict: "id" }
          )
          .select("id, email, full_name, role, is_active, created_at")
          .single();

      if (adminUpsertError) {
        return NextResponse.json(
          {
            error: `User Auth berhasil dibuat, tetapi gagal menyimpan profil: ${adminUpsertError.message}`,
          },
          { status: 500 }
        );
      }
      profileRow = upsertedByAdmin;
    }

    return NextResponse.json({ user: profileRow }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan saat membuat user.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface UpdateUserBody {
  id?: string;
  full_name?: string;
  email?: string;
  password?: string;
  role?: string;
  is_active?: boolean;
}

export async function PATCH(request: Request) {
  const authCheck = await requireSuperAdmin();
  if (!authCheck.ok) return authCheck.response;

  try {
    const body = (await request.json()) as UpdateUserBody;
    const targetId = body.id?.trim() ?? "";

    if (!targetId) {
      return NextResponse.json(
        { error: "ID user wajib disertakan." },
        { status: 400 }
      );
    }

    const isSelf = targetId === authCheck.userId;

    if (isSelf && body.is_active === false) {
      return NextResponse.json(
        {
          error:
            "Anda tidak dapat menonaktifkan akun Super Admin yang sedang digunakan.",
        },
        { status: 400 }
      );
    }

    if (isSelf && body.role && body.role !== "super_admin") {
      return NextResponse.json(
        {
          error:
            "Anda tidak dapat menurunkan role akun Super Admin yang sedang digunakan.",
        },
        { status: 400 }
      );
    }

    if (body.role !== undefined && !VALID_ROLES.has(body.role)) {
      return NextResponse.json(
        { error: "Role tidak valid." },
        { status: 400 }
      );
    }

    const newPassword = body.password?.trim() ?? "";
    if (newPassword && newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password baru minimal harus 6 karakter." },
        { status: 400 }
      );
    }

    const newEmail = body.email?.trim().toLowerCase();
    const newFullName =
      body.full_name !== undefined ? body.full_name.trim() : undefined;

    // 1. Update Supabase Auth if email, password, or metadata changed
    const authUpdates: {
      email?: string;
      password?: string;
      email_confirm?: boolean;
      user_metadata?: Record<string, unknown>;
    } = {};

    if (newEmail) {
      authUpdates.email = newEmail;
      authUpdates.email_confirm = true;
    }
    if (newPassword) {
      authUpdates.password = newPassword;
    }
    if (newFullName !== undefined || body.role !== undefined) {
      authUpdates.user_metadata = {
        ...(newFullName !== undefined ? { full_name: newFullName } : {}),
        ...(body.role !== undefined ? { role: body.role } : {}),
      };
    }

    const adminClient = createAdminClient();

    if (Object.keys(authUpdates).length > 0) {
      const { error: authUpdateError } =
        await adminClient.auth.admin.updateUserById(targetId, authUpdates);

      if (authUpdateError) {
        return NextResponse.json(
          { error: authUpdateError.message },
          { status: 400 }
        );
      }
    }

    // 2. Sync updates to public.profiles
    const profileUpdates: Record<string, unknown> = {};
    if (newFullName !== undefined) profileUpdates.full_name = newFullName;
    if (newEmail) profileUpdates.email = newEmail;
    if (body.role !== undefined) profileUpdates.role = body.role;
    if (body.is_active !== undefined) profileUpdates.is_active = body.is_active;

    if (Object.keys(profileUpdates).length === 0) {
      return NextResponse.json({ updated: true });
    }

    const sessionClient = await createClient();
    const { data: updatedBySession, error: sessionUpdateError } =
      await sessionClient
        .from("profiles")
        .update(profileUpdates)
        .eq("id", targetId)
        .select("id, email, full_name, role, is_active, created_at")
        .single();

    if (!sessionUpdateError && updatedBySession) {
      return NextResponse.json({ user: updatedBySession });
    }

    const { data: updatedByAdmin, error: adminUpdateError } = await adminClient
      .from("profiles")
      .update(profileUpdates)
      .eq("id", targetId)
      .select("id, email, full_name, role, is_active, created_at")
      .single();

    if (adminUpdateError) {
      return NextResponse.json(
        { error: adminUpdateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ user: updatedByAdmin });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan saat memperbarui user.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
