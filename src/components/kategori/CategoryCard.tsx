import type { CategorySummary } from "@/application/finance";
import { rupiah, rupiahSigned } from "@/shared/format";

interface Props {
  summary: CategorySummary;
  onSelect(): void;
}

export function CategoryCard({ summary: s, onSelect }: Props) {
  return (
    <button className="card act" onClick={onSelect}>
      <div className="act-head">
        <b>{s.category.name}</b>
        <small>{s.count} transaksi</small>
      </div>
      <div className="trio">
        <span>
          Pemasukan<b className="income">{rupiah(s.income)}</b>
        </span>
        <span>
          Pengeluaran<b className="expense">{rupiah(s.expense)}</b>
        </span>
        <span>
          Net<b>{rupiahSigned(s.net)}</b>
        </span>
      </div>
    </button>
  );
}