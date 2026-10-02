"use client";
import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { IuranData, currentPeriodIndex } from "@/domain/iuran";
import { periodOverview, totalCollected } from "@/application/iuran";
import { dayShort, rangeLabel, rupiah } from "@/shared/format";
import { PaymentSheet } from "./PaymentSheet";
import { MemberDetail } from "./MemberDetail";

const FILTERS = [["all", "Semua"], ["paid", "Sudah Bayar"], ["unpaid", "Belum Bayar"]] as const;
const pct = (a: number, b: number) => `${(a / (b || 1)) * 100}%`;

export function IuranView({ data }: { data: IuranData }) {
  const [sel, setSel] = useState<number | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const [q, setQ] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{ memberId?: string } | null>(null);
  const curIdx = currentPeriodIndex(data.periods, new Date().toISOString().slice(0, 10));
  const idx = sel ?? curIdx;

  useEffect(() => { document.querySelector(".wk.on")?.scrollIntoView({ inline: "center", block: "nearest" }); }, [idx]);

  if (!data.periods.length) return <div className="state"><b>Periode iuran belum dibuat</b><p>Isi tabel payment_periods di Supabase.</p></div>;

  const sheetEl = sheet && <PaymentSheet data={data} memberId={sheet.memberId} onClose={() => setSheet(null)} onDone={() => setSheet(null)} />;
  const detail = data.members.find(m => m.id === detailId);
  if (detail) return (
    <><MemberDetail data={data} member={detail} onBack={() => setDetailId(null)} onPay={() => setSheet({ memberId: detail.id })} />{sheetEl}</>
  );

  const cur = periodOverview(data, curIdx), p = periodOverview(data, idx);
  const term = q.trim().toLowerCase();
  const rows = p.rows.filter(r => (filter === "all" || r.paid === (filter === "paid")) && (!term || r.member.name.toLowerCase().includes(term)));

  return (
    <>
      <header className="top"><div><h3>Iuran Misdinar</h3><small>Iuran Mingguan {rupiah(data.weeklyFee)} / minggu</small></div>
        <button className="btn small" onClick={() => setSheet({})}><Plus />Catat Pembayaran</button></header>
      <section className="card iuran-sum">
        <div className="stats">
          <span>Total Anggota<b>{cur.total}</b></span><span>Total Terkumpul<b>{rupiah(totalCollected(data))}</b></span>
          <span>Sudah Bayar<b className="income">{cur.paidCount}</b></span><span>Belum Bayar<b className="expense">{cur.total - cur.paidCount}</b></span>
        </div>
        <div className="bar big"><i style={{ width: pct(cur.paidCount, cur.total) }} /></div>
        <p className="cap">{cur.paidCount} / {cur.total} anggota sudah bayar minggu ini</p>
      </section>

      <div className="wks">
        {data.periods.map((pd, i) => (
          <button key={pd.id} className={"wk" + (i === idx ? " on" : "")} onClick={() => setSel(i)}>
            {dayShort(pd.startDate)}<small>Minggu {i + 1}</small>
          </button>
        ))}
      </div>

      <section className="card iuran-sum">
        <div className="target-head"><b>{idx === curIdx ? "Iuran Minggu Ini" : `Iuran Minggu ${idx + 1}`}</b>
          <span className={"pill " + (p.paidCount === p.total ? "ok" : "no")}>{p.paidCount === p.total ? "Lunas" : "Belum Lunas"}</span></div>
        <p className="cap top0">{rangeLabel(p.period.startDate, p.period.endDate)}</p>
        <div className="bar"><i style={{ width: pct(p.paidCount, p.total) }} /></div>
        <div className="target-foot"><span>{p.paidCount} / {p.total} sudah bayar</span><b>{rupiah(p.collected)} terkumpul</b></div>
      </section>

      <div className="search"><Search /><input type="search" placeholder="Cari anggota" value={q} onChange={e => setQ(e.target.value)} /></div>
      <div className="chips">
        {FILTERS.map(([v, l]) => <button key={v} className={"chip" + (filter === v ? " on" : "")} onClick={() => setFilter(v)}>{l}</button>)}
      </div>

      <ul className="list card">
        {rows.length === 0 && <li><div className="state"><b>Anggota tidak ditemukan</b><p>Ubah pencarian atau filter.</p></div></li>}
        {rows.map(({ member: m, paid }) => (
          <li key={m.id}>
            <button className="mrow" onClick={() => setDetailId(m.id)}>
              <span className="av">{m.name[0]}</span>
              <span className="mname"><b>{m.name}</b><small>{m.nickname}</small></span>
              <span className="mstat"><span className={"pill " + (paid ? "ok" : "no")}>{paid ? "Lunas" : "Belum bayar"}</span>
                <small>{rupiah(paid ? data.weeklyFee : 0)}</small></span>
            </button>
          </li>
        ))}
      </ul>
      {sheetEl}
    </>
  );
}
