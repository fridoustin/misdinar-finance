import { totalsOf, type Category, type Transaction } from "@/domain/finance";
import { dayShort } from "@/shared/format";
import { TotalsHero } from "@/components/finance/TotalsHero";
import { TransactionRow } from "@/components/finance/TransactionRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

interface Props {
  category: Category;
  transactions: Transaction[];
  onBack(): void;
}

const GROUPS = [
  ["income", "Pemasukan"],
  ["expense", "Pengeluaran"],
] as const;

export function CategoryDetail({ category, transactions, onBack }: Props) {
  const own = transactions
    .filter((t) => t.categoryId === category.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader title={category.name} onBack={onBack} />
      <TotalsHero label="Net" totals={totalsOf(own)} />
      {own.length === 0 && (
        <EmptyState title="Belum ada transaksi" text="Tambahkan transaksi dan pilih kategori ini." />
      )}
      {GROUPS.map(([type, label]) => {
        const items = own.filter((t) => t.type === type);
        if (items.length === 0) return null;
        return (
          <section key={type}>
            <h4 className="day">{label}</h4>
            <ul className="list card">
              {items.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  title={t.note || category.name}
                  meta={dayShort(t.date)}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}