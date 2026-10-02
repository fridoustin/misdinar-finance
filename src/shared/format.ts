const utc = (iso: string) => new Date(iso + "T00:00:00Z");
export const rupiah = (n: number) =>
  "Rp" + Math.abs(n).toLocaleString("id-ID");
export const dayShort = (iso: string) =>
  utc(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
export const rangeLabel = (a: string, b: string) =>
  `${dayShort(a)} - ${dayShort(b)} ${b.slice(0, 4)}`;
export const dayLong = (iso: string) =>
  utc(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });