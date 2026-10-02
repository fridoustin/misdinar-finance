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

export const rupiahSigned = (n: number) => (n < 0 ? "-" : "") + rupiah(n);

/** Tanggal hari ini (zona waktu perangkat) dalam format YYYY-MM-DD. */
export const todayIso = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};