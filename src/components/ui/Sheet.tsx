import type { FormEvent, ReactNode } from "react";
import { useBackClose } from "@/hooks/useBackClose";

interface Props { title: string; onClose(): void; onSubmit(e: FormEvent): void; children: ReactNode }

export function Sheet({ title, onClose, onSubmit, children }: Props) {
  useBackClose(onClose);
  return (
    <div className="overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <form className="sheet" onSubmit={onSubmit}>
        <div className="grab" /><h2>{title}</h2>
        {children}
      </form>
    </div>
  );
}