import { Plus } from "lucide-react";
import { IuranData, Member, isPaid, joinIndex } from "@/domain/iuran";
import { dayLong, dayShort, rupiah } from "@/shared/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pill } from "@/components/ui/Pill";

interface Props {
  data: IuranData;
  member: Member;
  onBack(): void;
  onPay(): void;
}

export function MemberDetail({ data, member: m, onBack, onPay }: Props) {
  const paid = data.periods.map((_, i) => isPaid(m, i, data));
  const last = paid.lastIndexOf(true);
  const next = data.periods[Math.max(last + 1, joinIndex(m, data.periods))];
  const rows = [
    ...data.periods.filter((_, i) => paid[i]).map((p) => ({ p, ok: true })),
    ...(next ? [{ p: next, ok: false }] : []),
  ];
  const pays = data.payments
    .filter((p) => p.memberId === m.id)
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

  return (
    <>
      <PageHeader title={m.name} subtitle={m.nickname} onBack={onBack} />
      <section className="hero compact">
        <p>Status pembayaran</p>
        <h1>
          {last >= 0
            ? "Lunas sampai " + dayLong(data.periods[last].endDate)
            : "Belum ada pembayaran"}
        </h1>
      </section>
      <button className="btn" onClick={onPay}>
        <Plus />
        Catat Pembayaran
      </button>
      <h4 className="day">Riwayat</h4>
      <ul className="list card">
        {pays.length === 0 && (
          <li className="prow muted">Belum ada riwayat</li>
        )}
        {pays.map((p) => (
          <li key={p.id} className="prow">
            <span>
              <b>{dayShort(p.paymentDate)}</b>{" "}
              <small className="muted">
                {Math.floor(p.amount / data.weeklyFee)} minggu
              </small>
            </span>
            <span>
              <b>{rupiah(p.amount)}</b> <Pill ok>Lunas</Pill>
            </span>
          </li>
        ))}
      </ul>
      <h4 className="day">Periode</h4>
      <ul className="list card">
        {rows.map(({ p, ok }) => (
          <li key={p.id} className="prow">
            <span>
              {dayShort(p.startDate)} - {dayShort(p.endDate)}
            </span>
            <Pill ok={ok}>{ok ? "Lunas" : "Belum Lunas"}</Pill>
          </li>
        ))}
      </ul>
    </>
  );
}