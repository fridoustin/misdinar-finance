"use client";

export default function IuranError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="state"><b>Data iuran belum bisa dimuat</b><p>{error.message}</p>
      <button className="btn small" onClick={reset}>Muat ulang</button></div>
  );
}
