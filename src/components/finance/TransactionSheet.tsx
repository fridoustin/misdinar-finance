import { useState, type FormEvent } from "react";
import { categoriesFor, type Category, type TransactionType } from "@/domain/finance";
import { todayIso } from "@/shared/format";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";
import { addTransactionAction } from "@/app/finance/action";

interface Props {
  categories: Category[];
  onClose(): void;
  onDone(): void;
}

const TYPES: readonly (readonly [TransactionType, string])[] = [
  ["income", "Pemasukan"],
  ["expense", "Pengeluaran"],
];

export function TransactionSheet({ categories, onClose, onDone }: Props) {
  const [type, setType] = useState<TransactionType>("income");
  const [digits, setDigits] = useState("");
  const [categoryId, setCategoryId] = useState(categoriesFor("income", categories)[0]?.id ?? "");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const amount = Number(digits);
  const options = categoriesFor(type, categories).map((c) => ({ value: c.id, label: c.name }));

  function changeType(next: TransactionType) {
    setType(next);
    setCategoryId(categoriesFor(next, categories)[0]?.id ?? "");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await addTransactionAction({ type, categoryId, amount, date, note });
      if (result.error) throw new Error(result.error);
      onDone();
    } catch (x) {
      setError((x as Error).message);
      setBusy(false);
    }
  }

  return (
    <Sheet title="Tambah transaksi" onClose={onClose} onSubmit={submit}>
      <div className="seg" role="radiogroup" aria-label="Jenis transaksi">
        {TYPES.map(([value, label]) => (
          <label key={value}>
            <input
              type="radio"
              name="type"
              checked={type === value}
              onChange={() => changeType(value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <label className="field">
        Nominal
        <div className="money">
          <b>Rp</b>
          <input
            inputMode="numeric"
            placeholder="0"
            value={amount ? amount.toLocaleString("id-ID") : ""}
            onChange={(e) => setDigits(e.target.value.replace(/\D/g, ""))}
          />
        </div>
      </label>

      <div className="field">
        Kategori
        <Select title="Pilih kategori" value={categoryId} options={options} onChange={setCategoryId} />
      </div>
      {options.length === 0 && <p className="err">Buat kategori dulu di halaman Kategori.</p>}

      <div className="field">
        Tanggal
        <DatePicker title="Pilih tanggal" value={date} onChange={setDate} />
      </div>

      <label className="field">
        Catatan
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Contoh: Penjualan makanan"
        />
      </label>

      {error && <p className="err">{error}</p>}
      <button className="btn" disabled={busy || !amount || !categoryId}>
        {busy ? "Menyimpan..." : "Simpan transaksi"}
      </button>
    </Sheet>
  );
}