import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { dayLong, todayIso } from "@/shared/format";
import { Picker } from "./Picker";

interface Props {
  title: string;
  value: string; // YYYY-MM-DD, kosong = belum dipilih
  onChange(value: string): void;
  placeholder?: string;
  clearable?: boolean;
}

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;
const CELLS = 42;

export function DatePicker({
  title,
  value,
  onChange,
  placeholder = "Pilih tanggal",
  clearable,
}: Props) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ year: 0, month: 0 });
  const today = todayIso();

  function show() {
    const base = value || today;
    setView({ year: Number(base.slice(0, 4)), month: Number(base.slice(5, 7)) - 1 });
    setOpen(true);
  }

  function shift(delta: number) {
    const d = new Date(view.year, view.month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  }

  function pick(iso: string) {
    onChange(iso);
    setOpen(false);
  }

  const first = new Date(view.year, view.month, 1);
  const offset = (first.getDay() + 6) % 7; // pekan dimulai hari Senin
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const days: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
  const cells = [...days, ...Array<null>(CELLS - days.length).fill(null)];

  return (
    <>
      <button type="button" className="pick-btn" onClick={show}>
        <span className={value ? "" : "muted"}>{value ? dayLong(value) : placeholder}</span>
        <CalendarDays />
      </button>

      {open && (
        <Picker title={title} onClose={() => setOpen(false)}>
          <div className="cal-head">
            <button type="button" className="icon-btn" aria-label="Bulan sebelumnya" onClick={() => shift(-1)}>
              <ChevronLeft />
            </button>
            <b>{first.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</b>
            <button type="button" className="icon-btn" aria-label="Bulan berikutnya" onClick={() => shift(1)}>
              <ChevronRight />
            </button>
          </div>

          <div className="cal-grid">
            {WEEKDAYS.map((w) => (
              <span key={w} className="cal-wd">
                {w}
              </span>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <span key={`blank-${i}`} className="cal-day" />;
              const iso = toIso(view.year, view.month, day);
              const cls = ["cal-day", iso === value && "on", iso === today && "today"]
                .filter(Boolean)
                .join(" ");
              return (
                <button key={iso} type="button" className={cls} onClick={() => pick(iso)}>
                  {day}
                </button>
              );
            })}
          </div>

          <div className="cal-foot">
            <button type="button" className="link" onClick={() => pick(today)}>
              Hari ini
            </button>
            {clearable && value && (
              <button type="button" className="link" onClick={() => pick("")}>
                Hapus tanggal
              </button>
            )}
          </div>
        </Picker>
      )}
    </>
  );
}