import type { ReactNode } from "react";

export function EmptyState({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <div className="state">
      <b>{title}</b>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}