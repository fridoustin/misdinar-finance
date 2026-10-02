import { Category, FinanceData, NewTransaction, Totals, totalsOf } from "@/domain/finance";

/** Port: diimplementasikan oleh layer infrastructure. */
export interface FinanceRepository {
  getFinance(): Promise<FinanceData>;
  getCategories(): Promise<Category[]>;
  addTransaction(t: NewTransaction): Promise<void>;
  addCategory(name: string): Promise<void>;
}

export interface CategorySummary extends Totals {
  category: Category;
  count: number;
}

export function summarizeByCategory(data: FinanceData): CategorySummary[] {
  return data.categories.map((category) => {
    const own = data.transactions.filter((t) => t.categoryId === category.id);
    return { category, count: own.length, ...totalsOf(own) };
  });
}

export async function addTransaction(repo: FinanceRepository, t: NewTransaction): Promise<void> {
  if (t.type !== "income" && t.type !== "expense") {
    throw new Error("Jenis transaksi tidak valid.");
  }
  if (!Number.isInteger(t.amount) || t.amount <= 0) {
    throw new Error("Nominal harus lebih dari Rp0.");
  }
  if (!t.categoryId) {
    throw new Error("Kategori wajib dipilih.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t.date)) {
    throw new Error("Tanggal tidak valid.");
  }
  await repo.addTransaction({ ...t, note: t.note.trim() });
}

export async function addCategory(repo: FinanceRepository, name: string): Promise<void> {
  const clean = name.trim();
  if (!clean) {
    throw new Error("Nama kategori wajib diisi.");
  }
  await repo.addCategory(clean);
}