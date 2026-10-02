import { useState, type FormEvent } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { addCategoryAction } from "@/app/finance/action";

interface Props {
  onClose(): void;
  onDone(): void;
}

export function CategorySheet({ onClose, onDone }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await addCategoryAction(name);
      if (result.error) throw new Error(result.error);
      onDone();
    } catch (x) {
      setError((x as Error).message);
      setBusy(false);
    }
  }

  return (
    <Sheet title="Tambah kategori" onClose={onClose} onSubmit={submit}>
      <label className="field">
        Nama kategori
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Bazaar 2026"
          autoFocus
        />
      </label>
      {error && <p className="err">{error}</p>}
      <button className="btn" disabled={busy || !name.trim()}>
        {busy ? "Menyimpan..." : "Simpan kategori"}
      </button>
    </Sheet>
  );
}