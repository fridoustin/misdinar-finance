import { rupiah } from "@/shared/format";

interface Props {
  amount: number;
  onOpen(): void;
}

export function KasKecilCard({ amount, onOpen }: Props) {
  return (
    <button className="card act" onClick={onOpen}>
      <div className="act-head">
        <b>Kas Kecil (Iuran)</b>
        <small>Tabungan baju panitia</small>
      </div>
      <b className="kas-kecil">{rupiah(amount)}</b>
    </button>
  );
}