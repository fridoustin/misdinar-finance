"use client";
import { EmptyState } from "@/components/ui/EmptyState";

export default function IuranError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState title="Data iuran belum bisa dimuat" text={error.message}>
      <button className="btn small" onClick={reset}>Muat ulang</button>
    </EmptyState>
  );
}