import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange(v: string): void;
  placeholder: string;
}

export function SearchInput({ value, onChange, placeholder }: Props) {
  return (
    <div className="search">
      <Search />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}