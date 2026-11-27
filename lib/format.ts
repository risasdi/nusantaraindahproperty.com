export function formatThousands(value: number | string): string {
  const numeric =
    typeof value === "number"
      ? String(Math.round(value))
      : value.replace(/[^0-9]/g, "");

  if (!numeric) return "";
  const normalized = numeric.replace(/^0+(?=\d)/, "");
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatRupiah(value: number): string {
  const rounded = Math.round(value);
  const isNegative = rounded < 0;
  const formatted = formatThousands(Math.abs(rounded));
  return `${isNegative ? "-" : ""}Rp ${formatted}`;
}
