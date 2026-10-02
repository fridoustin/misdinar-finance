import { useEffect } from "react";
import type { Period } from "@/domain/iuran";
import { dayShort } from "@/shared/format";

interface Props {
  periods: Period[];
  selected: number;
  onSelect(i: number): void;
}

export function PeriodSelector({ periods, selected, onSelect }: Props) {
  useEffect(() => {
    document
      .querySelector(".wk.on")
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [selected]);
  return (
    <div className="wks">
      {periods.map((p, i) => (
        <button
          key={p.id}
          className={"wk" + (i === selected ? " on" : "")}
          onClick={() => onSelect(i)}
        >
          {dayShort(p.startDate)}
          <small>Minggu {i + 1}</small>
        </button>
      ))}
    </div>
  );
}