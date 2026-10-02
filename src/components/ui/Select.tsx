import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Picker } from "./Picker";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  title: string;
  value: string;
  options: SelectOption[];
  onChange(value: string): void;
  placeholder?: string;
}

export function Select({ title, value, options, onChange, placeholder = "Pilih" }: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  function choose(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <>
      <button type="button" className="pick-btn" onClick={() => setOpen(true)}>
        <span className={current ? "" : "muted"}>{current?.label ?? placeholder}</span>
        <ChevronDown />
      </button>

      {open && (
        <Picker title={title} onClose={() => setOpen(false)}>
          <ul className="opts">
            {options.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  className={"opt" + (o.value === value ? " on" : "")}
                  onClick={() => choose(o.value)}
                >
                  {o.label}
                  {o.value === value && <Check />}
                </button>
              </li>
            ))}
          </ul>
        </Picker>
      )}
    </>
  );
}