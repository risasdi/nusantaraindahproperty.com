export const ADMIN_ROLES = [
  "super_admin",
  "head_sales",
  "property_admin",
  "marketing",
  "sales",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  is_active: boolean;
}

export interface RolePermissions {
  canManageProperties: boolean;
  canUpdateLeads: boolean;
  canDeleteLeads: boolean;
  canAccessSettings: boolean;
  ownLeadsOnly: boolean;
}

export interface RoleBadgeMeta {
  label: string;
  badgeClass: string;
}

const ROLE_SET = new Set<string>(ADMIN_ROLES);

export function normalizeAdminRole(role: string | null | undefined): AdminRole {
  if (role && ROLE_SET.has(role)) {
    return role as AdminRole;
  }
  return "marketing";
}

export function getRolePermissions(role: AdminRole): RolePermissions {
  switch (role) {
    case "super_admin":
      return {
        canManageProperties: true,
        canUpdateLeads: true,
        canDeleteLeads: true,
        canAccessSettings: true,
        ownLeadsOnly: false,
      };
    case "head_sales":
      return {
        canManageProperties: false,
        canUpdateLeads: true,
        canDeleteLeads: false,
        canAccessSettings: false,
        ownLeadsOnly: false,
      };
    case "property_admin":
      return {
        canManageProperties: true,
        canUpdateLeads: false,
        canDeleteLeads: false,
        canAccessSettings: false,
        ownLeadsOnly: false,
      };
    case "marketing":
      return {
        canManageProperties: false,
        canUpdateLeads: false,
        canDeleteLeads: false,
        canAccessSettings: false,
        ownLeadsOnly: false,
      };
    case "sales":
      return {
        canManageProperties: false,
        canUpdateLeads: true,
        canDeleteLeads: false,
        canAccessSettings: false,
        ownLeadsOnly: true,
      };
  }
}

export function getRoleBadgeMeta(role: AdminRole): RoleBadgeMeta {
  switch (role) {
    case "super_admin":
      return {
        label: "Super Admin",
        badgeClass:
          "bg-[#C8A15A]/20 text-[#8F6822] ring-1 ring-inset ring-[#C8A15A]/45",
      };
    case "head_sales":
      return {
        label: "Head Sales",
        badgeClass:
          "bg-indigo-50 text-indigo-800 ring-1 ring-inset ring-indigo-600/20",
      };
    case "property_admin":
      return {
        label: "Property Admin",
        badgeClass:
          "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/20",
      };
    case "marketing":
      return {
        label: "Marketing",
        badgeClass: "bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-600/20",
      };
    case "sales":
      return {
        label: "Sales",
        badgeClass:
          "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20",
      };
  }
}
