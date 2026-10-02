import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { Totals } from "@/domain/finance";
import { rupiah, rupiahSigned } from "@/shared/format";

export function TotalsHero({ label, totals, large }: { label: string; totals: Totals, large?: boolean }) {
  return (
    <section className={large ? "hero" : "hero compact"}>
      <p>{label}</p>
      <h1>{rupiahSigned(totals.net)}</h1>
      <div className="hero-row">
        <div>
          <ArrowDownLeft />
          <span>
            Pemasukan<b>{rupiah(totals.income)}</b>
          </span>
        </div>
        <div>
          <ArrowUpRight />
          <span>
            Pengeluaran<b>{rupiah(totals.expense)}</b>
          </span>
        </div>
      </div>
    </section>
  );
}