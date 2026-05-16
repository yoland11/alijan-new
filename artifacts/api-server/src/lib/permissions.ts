export const PERMISSIONS = [
  "view_orders",
  "create_order",
  "edit_order",
  "delete_order",
  "change_order_status",
  "manage_products",
  "manage_services",
  "manage_customers",
  "manage_inventory",
  "manage_accounting",
  "create_receipt_voucher",
  "create_payment_voucher",
  "create_transfer_voucher",
  "manage_delivery",
  "manage_portfolio",
  "manage_reviews",
  "manage_settings",
  "manage_employees",
  "print_invoices",
  "view_dashboard",
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number];

export function normalizePermissions(value: unknown): PermissionKey[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is PermissionKey =>
    typeof item === "string" && PERMISSIONS.includes(item as PermissionKey),
  );
}

export function hasPermission(
  user: { role: string; permissions?: string[] } | undefined,
  permission: PermissionKey,
): boolean {
  if (!user) return false;
  if (user.role === "owner") return true;
  return Boolean(user.permissions?.includes(permission));
}
