export interface ProductColorOption {
  name: string;
  hex: string;
}

export const PRODUCT_COLOR_LIBRARY: ProductColorOption[] = [
  { name: "أسود", hex: "#000000" },
  { name: "أبيض", hex: "#FFFFFF" },
  { name: "ذهبي", hex: "#D4AF37" },
  { name: "فضي", hex: "#C0C0C0" },
  { name: "أحمر كلاسيكي", hex: "#DC2626" },
  { name: "خمري", hex: "#7F1D1D" },
  { name: "وردي فاتح", hex: "#F9A8D4" },
  { name: "وردي رملي", hex: "#D8B4A0" },
  { name: "بنفسجي ملكي", hex: "#6D28D9" },
  { name: "أزرق ملكي", hex: "#1D4ED8" },
  { name: "سماوي", hex: "#38BDF8" },
  { name: "تركواز", hex: "#14B8A6" },
  { name: "أخضر زمردي", hex: "#059669" },
  { name: "أخضر زيتي", hex: "#556B2F" },
  { name: "أصفر ذهبي", hex: "#FACC15" },
  { name: "برتقالي", hex: "#F97316" },
  { name: "بني شوكولاتة", hex: "#5C4033" },
  { name: "بيج", hex: "#E8D3B9" },
  { name: "رمادي غامق", hex: "#374151" },
  { name: "كحلي", hex: "#0F172A" },
  { name: "أوف وايت", hex: "#F8F5EF" },
  { name: "عاجي", hex: "#FFFFF0" },
  { name: "شامبين", hex: "#F7E7CE" },
  { name: "روز قولد", hex: "#B76E79" },
  { name: "نحاسي", hex: "#B87333" },
  { name: "موف", hex: "#C084FC" },
  { name: "ليلكي", hex: "#C8A2C8" },
  { name: "فوشي", hex: "#D946EF" },
  { name: "أحمر غامق", hex: "#991B1B" },
  { name: "أزرق سماوي فاتح", hex: "#BAE6FD" },
  { name: "نيلي", hex: "#312E81" },
  { name: "أخضر نعناعي", hex: "#A7F3D0" },
  { name: "أخضر فاتح", hex: "#86EFAC" },
  { name: "زيتي غامق", hex: "#3F6212" },
  { name: "أصفر فاتح", hex: "#FEF08A" },
  { name: "كراميل", hex: "#C68E17" },
  { name: "بني فاتح", hex: "#A47551" },
  { name: "رمادي فاتح", hex: "#D1D5DB" },
  { name: "رصاصي", hex: "#6B7280" },
  { name: "كريمي", hex: "#FFF7D6" },
];

export function productColorKey(color: ProductColorOption): string {
  return `${color.name}::${color.hex.toUpperCase()}`;
}

export function normalizeProductColors(value: unknown): ProductColorOption[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const colors: ProductColorOption[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rawName = "name" in item ? String((item as { name?: unknown }).name ?? "").trim() : "";
    const rawHex = "hex" in item ? String((item as { hex?: unknown }).hex ?? "").trim().toUpperCase() : "";
    if (!rawName || !/^#[0-9A-F]{6}$/.test(rawHex)) continue;

    const fixed = PRODUCT_COLOR_LIBRARY.find(
      (color) => color.name === rawName || color.hex.toUpperCase() === rawHex,
    );
    const normalized = fixed ?? { name: rawName, hex: rawHex };
    const key = productColorKey(normalized);
    if (seen.has(key)) continue;

    seen.add(key);
    colors.push(normalized);
  }

  return colors;
}

export function findProductColor(value?: string | null): ProductColorOption | undefined {
  if (!value) return undefined;
  const normalized = value.trim();
  return PRODUCT_COLOR_LIBRARY.find(
    (color) => color.name === normalized || color.hex.toUpperCase() === normalized.toUpperCase(),
  );
}
