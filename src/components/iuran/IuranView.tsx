"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { IuranData, currentPeriodIndex } from "@/domain/iuran";
import { periodOverview, totalCollected } from "@/application/iuran";
import { rupiah } from "@/shared/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChips } from "@/components/ui/FilterChips";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { IuranSummary } from "./IuranSummary";
import { MemberDetail } from "./MemberDetail";
import { MemberList } from "./MemberList";
import { PaymentSheet } from "./PaymentSheet";
import { PeriodCard } from "./PeriodCard";
import { PeriodSelector } from "./PeriodSelector";

type Filter = "all" | "paid" | "unpaid";
const FILTERS: readonly (readonly [Filter, string])[] = [
  ["all", "Semua"],
  ["paid", "Sudah Bayar"],
  ["unpaid", "Belum Bayar"],
];

export function IuranView({ data }: { data: IuranData }) {
  const [sel, setSel] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{ memberId?: string } | null>(null);
  const curIdx = currentPeriodIndex(
    data.periods,
    new Date().toISOString().slice(0, 10)
  );
  const idx = sel ?? curIdx;

  if (!data.periods.length)
    return (
      <EmptyState
        title="Periode iuran belum dibuat"
        text="Isi tabel payment_periods di Supabase."
      />
    );

  const sheetEl = sheet && (
    <PaymentSheet
      data={data}
      memberId={sheet.memberId}
      onClose={() => setSheet(null)}
      onDone={() => setSheet(null)}
    />
  );
  const detail = data.members.find((m) => m.id === detailId);
  if (detail)
    return (
      <>
        <MemberDetail
          data={data}
          member={detail}
          onBack={() => setDetailId(null)}
          onPay={() => setSheet({ memberId: detail.id })}
        />
        {sheetEl}
      </>
    );

  const cur = periodOverview(data, curIdx),
    p = periodOverview(data, idx);
  const term = q.trim().toLowerCase();
  const rows = p.rows.filter(
    (r) =>
      (filter === "all" || r.paid === (filter === "paid")) &&
      (!term || r.member.name.toLowerCase().includes(term))
  );

  return (
    <>
      <PageHeader
        title="Iuran Misdinar"
        subtitle={`Iuran Mingguan ${rupiah(data.weeklyFee)} / minggu`}
        action={
          <button className="btn small" onClick={() => setSheet({})}>
            <Plus />
            Catat Pembayaran
          </button>
        }
      />
      <IuranSummary
        total={cur.total}
        paid={cur.paidCount}
        collected={totalCollected(data)}
      />
      <PeriodSelector periods={data.periods} selected={idx} onSelect={setSel} />
      <PeriodCard
        title={
          idx === curIdx ? "Iuran Minggu Ini" : `Iuran Minggu ${idx + 1}`
        }
        overview={p}
      />
      <SearchInput value={q} onChange={setQ} placeholder="Cari anggota" />
      <FilterChips<Filter>
        options={FILTERS}
        value={filter}
        onChange={setFilter}
      />
      <MemberList rows={rows} fee={data.weeklyFee} onSelect={setDetailId} />
      {sheetEl}
    </>
  );
}