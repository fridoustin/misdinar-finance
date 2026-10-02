import { useState, type FormEvent } from "react";
import { IuranData, isValidAmount, previewAllocation } from "@/domain/iuran";
import { recordPaymentAction } from "@/app/iuran/actions";
import { dayShort, rupiah } from "@/shared/format";

interface Props { data: IuranData; memberId?: string; onClose(): void; onDone(): void }

export function PaymentSheet({ data, memberId, onClose, onDone }: Props) {
  const [id, setId] = useState(memberId ?? data.members[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [digits, setDigits] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fee = data.weeklyFee, amount = Number(digits), weeks = amount / fee;
  const member = data.members.find(m => m.id === id);
  const valid = isValidAmount(amount, fee);
  const slots = member && valid ? previewAllocation(member, amount, data) : [];

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const res = await recordPaymentAction({ memberId: id, paymentDate: date, amount });
      if (res.error) throw new Error(res.error);
      onDone();
    } catch (x) { setError((x as Error).message); setBusy(false); }
  }

  return (
    <div className="overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <form className="sheet" onSubmit={submit}>
        <div className="grab" /><h2>Catat pembayaran</h2>
        <label className="field">Nama Anggota
          <select value={id} onChange={e => setId(e.target.value)}>
            {data.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select></label>
        <label className="field">Tanggal Pembayaran
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required /></label>
        <div className="field">Nominal
          <div className="quick">{[1, 2, 3, 4, 5].map(n => (
            <button type="button" key={n} className={"chip" + (amount === n * fee ? " on" : "")} onClick={() => setDigits(String(n * fee))}>{rupiah(n * fee)}</button>))}
          </div>
          <div className="money"><b>Rp</b>
            <input inputMode="numeric" placeholder="0" value={amount ? amount.toLocaleString("id-ID") : ""} onChange={e => setDigits(e.target.value.replace(/\D/g, ""))} /></div>
        </div>
        <div className="payinfo">
          {!amount ? `Kelipatan ${rupiah(fee)} = 1 minggu.` : !valid ? <span className="warn">Nominal harus kelipatan {rupiah(fee)}.</span> : (<>
            {rupiah(amount)} setara dengan <b>{weeks} minggu</b>
            <p className="cap">Pembayaran akan dialokasikan ke:</p>
            <ul>
              {slots.slice(0, 6).map(p => <li key={p.id}>✓ {dayShort(p.startDate)} - {dayShort(p.endDate)}</li>)}
              {slots.length > 6 && <li className="muted">+ {slots.length - 6} minggu berikutnya</li>}
              {weeks > slots.length && <li className="warn">{weeks - slots.length} minggu melebihi periode iuran</li>}
            </ul></>)}
        </div>
        {error && <p className="err">{error}</p>}
        <button className="btn" disabled={busy || !valid}>{busy ? "Menyimpan..." : "Simpan pembayaran"}</button>
      </form>
    </div>
  );
}
