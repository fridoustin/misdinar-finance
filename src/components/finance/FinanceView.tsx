"use client";

import { useState } from "react";
import {
  filterTransactions,
  totalsOf,
  type FinanceData,
  type TransactionFilter,
} from "@/domain/finance";
import { FilterChips } from "@/components/ui/FilterChips";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { TotalsHero } from "./TotalsHero";
import { TransactionList } from "./TransactionList";

type TypeFilter = TransactionFilter["type"];

const TYPE_OPTIONS: readonly (readonly [TypeFilter, string])[] = [
  ["all", "Semua"],
  ["income", "Pemasukan"],
  ["expense", "Pengeluaran"],
];

const INITIAL_FILTER: TransactionFilter = { type: "all", query: "", categoryId: "", from: "" };

export function FinanceView({ data }: { data: FinanceData }) {
  const [filter, setFilter] = useState(INITIAL_FILTER);

  const update = (patch: Partial<TransactionFilter>) => setFilter((f) => ({ ...f, ...patch }));
  const visible = filterTransactions(data.transactions, filter, data.categories);

  return (
    <>
      <PageHeader title="Finance" />
      <TotalsHero label="Net" totals={totalsOf(visible)} />
      <SearchInput
        value={filter.query}
        onChange={(query) => update({ query })}
        placeholder="Cari transaksi"
      />
      <FilterChips<TypeFilter>
        options={TYPE_OPTIONS}
        value={filter.type}
        onChange={(type) => update({ type })}
      />
      <div className="adv two">
        <select
          value={filter.categoryId}
          onChange={(e) => update({ categoryId: e.target.value })}
          aria-label="Kategori"
        >
          <option value="">Semua kategori</option>
          {data.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filter.from}
          onChange={(e) => update({ from: e.target.value })}
          aria-label="Sejak tanggal"
        />
      </div>
      <TransactionList transactions={visible} categories={data.categories} />
    </>
  );
}