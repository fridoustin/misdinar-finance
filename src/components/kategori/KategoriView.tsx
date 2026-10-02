"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { summarizeByCategory } from "@/application/finance";
import type { FinanceData } from "@/domain/finance";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { CategoryCard } from "./CategoryCard";
import { CategoryDetail } from "./CategoryDetail";
import { CategorySheet } from "./CategorySheet";

export function KategoriView({ data, initialId }: { data: FinanceData; initialId?: string | null }) {
  const [selectedId, setSelectedId] = useState<string | null>(initialId ?? null);
  const [adding, setAdding] = useState(false);

  const selected = data.categories.find((c) => c.id === selectedId);
  if (selected) {
    return (
      <CategoryDetail
        category={selected}
        transactions={data.transactions}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  const summaries = summarizeByCategory(data);

  return (
    <>
      <PageHeader
        title="Kategori"
        action={
          <button className="btn small" onClick={() => setAdding(true)}>
            <Plus />
            Kategori
          </button>
        }
      />
      {summaries.length === 0 ? (
        <EmptyState title="Belum ada kategori" text="Tambahkan kategori pertama." />
      ) : (
        <div className="stack">
          {summaries.map((s) => (
            <CategoryCard key={s.category.id} summary={s} onSelect={() => setSelectedId(s.category.id)} />
          ))}
        </div>
      )}
      {adding && <CategorySheet onClose={() => setAdding(false)} onDone={() => setAdding(false)} />}
    </>
  );
}