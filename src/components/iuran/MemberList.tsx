import type { MemberRow } from "@/application/iuran";
import { rupiah } from "@/shared/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";

interface Props {
  rows: MemberRow[];
  fee: number;
  onSelect(id: string): void;
}

export function MemberList({ rows, fee, onSelect }: Props) {
  return (
    <ul className="list card">
      {rows.length === 0 && (
        <li>
          <EmptyState
            title="Anggota tidak ditemukan"
            text="Ubah pencarian atau filter."
          />
        </li>
      )}
      {rows.map(({ member: m, paid }) => (
        <li key={m.id}>
          <button className="mrow" onClick={() => onSelect(m.id)}>
            <span className="av">{m.name[0]}</span>
            <span className="mname">
              <b>{m.name}</b>
              <small>{m.nickname}</small>
            </span>
            <span className="mstat">
              <Pill ok={paid}>{paid ? "Lunas" : "Belum bayar"}</Pill>
              <small>{rupiah(paid ? fee : 0)}</small>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}