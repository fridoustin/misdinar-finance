import type { FormEvent, ReactNode } from "react";

interface Props { title: string; onClose(): void; onSubmit(e: FormEvent): void; children: ReactNode }

export function Sheet({ title, onClose, onSubmit, children }: Props) {
  return (
    <div className="overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <form className="sheet" onSubmit={onSubmit}>
        <div className="grab" /><h2>{title}</h2>
        {children}
      </form>
    </div>
  );
}