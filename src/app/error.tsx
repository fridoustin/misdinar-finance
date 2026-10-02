"use client";

import { EmptyState } from "@/components/ui/EmptyState";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState title="Data belum bisa dimuat" text={error.message}>
      <button className="btn small" onClick={reset}>
        Muat ulang
      </button>
    </EmptyState>
  );
}