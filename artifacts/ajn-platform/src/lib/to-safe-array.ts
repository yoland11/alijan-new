export type SafeArrayItem<T> = T;

/**
 * تحويل أي قيمة قادمة من API إلى array آمن.
 * يدعم حالات: data, data.items, data.results, data.data
 * وإلا يرجع [] لتفادي Runtime: "map is not a function" و"includes/length of undefined".
 */
export function toSafeArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];

  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;

    if (Array.isArray(v.items)) return v.items as T[];
    if (Array.isArray(v.data)) return v.data as T[];
    if (Array.isArray(v.results)) return v.results as T[];
  }

  return [];
}
