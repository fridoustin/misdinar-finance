import { summarizeByCategory, type CategorySummary } from "@/application/finance";
import { TARGET_DANA, totalsOf, type FinanceData, type Totals } from "@/domain/finance";

export interface HomeSummary {
  totals: Totals;
  iuranCollected: number;
  target: number;
  recent: CategorySummary[];
}

/** Iuran dihitung sebagai pemasukan tambahan di atas transaksi. */
export function homeSummary(finance: FinanceData, iuranCollected: number, limit = 3): HomeSummary {
  const base = totalsOf(finance.transactions);
  const income = base.income + iuranCollected;

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

  return {
    totals: { income, expense: base.expense, net: income - base.expense },
    iuranCollected,
    target: TARGET_DANA,
    recent,
  };
}