import { rupiah } from "@/shared/format";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface Props {
  collected: number;
  target: number;
}

export function TargetCard({ collected, target }: Props) {
  const percent = Math.min(100, (collected / target) * 100);

  return (
    <section className="card target">
      <div className="target-head">
        <b>Target dana</b>
        <span>{rupiah(target)}</span>
      </div>
      <ProgressBar value={Math.min(collected, target)} max={target} big />
      <div className="target-foot">
        <span>
          <b>{percent.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%</b> tercapai
        </span>
        <span>Kurang {rupiah(Math.max(target - collected, 0))}</span>
      </div>
    </section>
  );
}