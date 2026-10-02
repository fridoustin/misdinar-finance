import { rupiah } from "@/shared/format";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface Props {
  total: number;
  paid: number;
  collected: number;
}

export function IuranSummary({ total, paid, collected }: Props) {
  return (
    <section className="card iuran-sum">
      <div className="stats">
        <span>
          Total Anggota<b>{total}</b>
        </span>
        <span>
          Total Terkumpul<b>{rupiah(collected)}</b>
        </span>
        <span>
          Sudah Bayar<b className="income">{paid}</b>
        </span>
        <span>
          Belum Bayar<b className="expense">{total - paid}</b>
        </span>
      </div>
      <ProgressBar value={paid} max={total} big />
      <p className="cap">
        {paid} / {total} anggota sudah bayar minggu ini
      </p>
    </section>
  );
}