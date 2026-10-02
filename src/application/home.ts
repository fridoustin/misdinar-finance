import { summarizeByCategory, type CategorySummary } from "@/application/finance";
import { TARGET_DANA, totalsOf, type FinanceData, type Totals } from "@/domain/finance";

export interface HomeSummary {
  kasBesar: Totals;
  kasKecil: number;
  target: number;
  recent: CategorySummary[];
}

/**
 * Kas besar = semua transaksi (finance).
 * Kas kecil = iuran, tabungan baju panitia. Keduanya tidak dicampur.
 */
export function homeSummary(finance: FinanceData, kasKecil: number, limit = 3): HomeSummary {
  const latestDate = new Map<string, string>();
  for (const t of finance.transactions) {
    if (t.date > (latestDate.get(t.categoryId) ?? "")) {
      latestDate.set(t.categoryId, t.date);
    }
  }

  const recent = summarizeByCategory(finance)
    .filter((s) => s.count > 0)
    .sort((a, b) =>
      (latestDate.get(b.category.id) ?? "").localeCompare(latestDate.get(a.category.id) ?? ""),
    )
    .slice(0, limit);

  return { kasBesar: totalsOf(finance.transactions), kasKecil, target: TARGET_DANA, recent };
}