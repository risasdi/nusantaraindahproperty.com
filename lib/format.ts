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

const MONTHS_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

export function formatDateTimeWIB(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "-";

  // Shift deterministically to WIB (UTC+7) so SSR and client output match identically
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const day = String(wib.getUTCDate()).padStart(2, "0");
  const month = MONTHS_ID[wib.getUTCMonth()];
  const year = wib.getUTCFullYear();
  const hours = String(wib.getUTCHours()).padStart(2, "0");
  const minutes = String(wib.getUTCMinutes()).padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}
