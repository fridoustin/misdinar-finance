import type { ReactNode } from "react";

export function Pill({ ok, children }: { ok: boolean; children: ReactNode }) {
  return <span className={"pill " + (ok ? "ok" : "no")}>{children}</span>;
}