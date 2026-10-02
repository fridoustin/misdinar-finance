import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface Props {
  title: string;
  onClose(): void;
  children: ReactNode;
}

/** Panel pilihan dari bawah layar. Dirender di body agar tidak ikut men-submit form. */
export function Picker({ title, onClose, children }: Props) {
  return createPortal(
    <div
      className="overlay open picker-layer"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="sheet">
        <div className="grab" />
        <h2>{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}