import type { PeriodOverview } from "@/application/iuran";
import { rangeLabel, rupiah } from "@/shared/format";
import { Pill } from "@/components/ui/Pill";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function PeriodCard({
  title,
  overview: o,
}: {
  title: string;
  overview: PeriodOverview;
}) {
  const done = o.paidCount === o.total;
  return (
    <section className="card iuran-sum">
      <div className="target-head">
        <b>{title}</b>
        <Pill ok={done}>{done ? "Lunas" : "Belum Lunas"}</Pill>
      </div>
      <p className="cap top0">
        {rangeLabel(o.period.startDate, o.period.endDate)}
      </p>
      <ProgressBar value={o.paidCount} max={o.total} />
      <div className="target-foot">
        <span>
          {o.paidCount} / {o.total} sudah bayar
        </span>
        <b>{rupiah(o.collected)} terkumpul</b>
      </div>
    </section>
  );
}