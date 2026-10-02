"use client";

import { useRouter } from "next/navigation";
import type { HomeSummary } from "@/application/home";
import { rupiah } from "@/shared/format";
import { TotalsHero } from "@/components/finance/TotalsHero";
import { CategoryCard } from "@/components/kategori/CategoryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { TargetCard } from "./TargetCard";

export function HomeView({ summary }: { summary: HomeSummary }) {
  const router = useRouter();

  return (
    <>
      <PageHeader title="Temu Misdinar Finance" />
      <TotalsHero label="Saldo Kas" totals={summary.totals} large />
      <p className="cap">Pemasukan sudah termasuk iuran {rupiah(summary.iuranCollected)}.</p>
      <TargetCard collected={summary.totals.income} target={summary.target} />

      <div className="sec-head">
        <h2>Recent</h2>
        <button className="link" onClick={() => router.push("/kategori")}>
          Lihat semua
        </button>
      </div>
      {summary.recent.length === 0 ? (
        <EmptyState title="Belum ada kegiatan" text="Tambahkan transaksi di halaman Finance." />
      ) : (
        <div className="stack">
          {summary.recent.map((s) => (
            <CategoryCard
              key={s.category.id}
              summary={s}
              onSelect={() => router.push(`/kategori?c=${s.category.id}`)}
            />
          ))}
        </div>
      )}
    </>
  );
}