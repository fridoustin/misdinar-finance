interface Props<T extends string> {
  options: readonly (readonly [T, string])[];
  value: T;
  onChange(v: T): void;
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <div className="chips">
      {options.map(([v, label]) => (
        <button
          key={v}
          className={"chip" + (value === v ? " on" : "")}
          onClick={() => onChange(v)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}