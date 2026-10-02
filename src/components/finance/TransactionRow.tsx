import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { Transaction } from "@/domain/finance";
import { rupiah } from "@/shared/format";

interface Props {
  transaction: Transaction;
  title: string;
  meta: string;
}

export function TransactionRow({ transaction: t, title, meta }: Props) {
  const isIncome = t.type === "income";
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;

  return (
    <li className="tx">
      <span className={`dot ${t.type}`}>
        <Icon />
      </span>
      <div className="tx-body">
        <b>{title}</b>
        <small>{meta}</small>
      </div>
      <span className={`amt ${t.type}`}>
        {isIncome ? "+" : "-"} {rupiah(t.amount)}
      </span>
    </li>
  );
}