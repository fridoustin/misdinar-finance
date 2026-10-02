import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string | null;
  action?: ReactNode;
  onBack?: () => void;
}

export function PageHeader({ title, subtitle, action, onBack }: Props) {
  return (
    <header className="top">
      {onBack && (
        <button className="icon-btn" onClick={onBack} aria-label="Kembali">
          <ChevronLeft />
        </button>
      )}
      <div>
        <h3>{title}</h3>
        {subtitle && <small>{subtitle}</small>}
      </div>
      {action}
    </header>
  );
}