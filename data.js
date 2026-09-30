/* Mock data + lapisan Api.
   Iuran: recordPayment memakai HTTP API asli (Google Apps Script). Lainnya masih mock. */

const API_URL = "https://script.google.com/macros/s/AKfycbx5OkclwJGukN3D3ff9AtlAHEtCZqN9PN9qliqQeKsEOiX5OiXPBI8MyiL9vCAQf0-h/exec";
// Frontend di GitHub Pages memanggil Apps Script lintas domain. Apps Script tidak
// menjawab preflight CORS, jadi gunakan text/plain (body tetap JSON, backend tidak berubah).
const API_CONTENT_TYPE = "text/plain;charset=utf-8";

const DB = (() => {
  const first = ["Fridolin","Andreas","Maria","Yohanes","Kevin","Agnes","Benedikta","Cornelius","Dominikus","Elisabeth","Felix","Gabriel","Helena","Ignatius","Josephine","Katarina","Laurentius","Margaretha","Nikolaus","Oktavia"];
  const last = ["", "Wijaya", "Santoso"];
  const unpaid = [3,4,9,14,19,23,28,33,38,44,50,55];
  const lv = ["Senior","Senior","Intermediate","Junior"];
  const lvCycle = ["Junior","Intermediate","Senior"];
  const members = [], payments = [];
  let n = 0;
  for (let i = 0; i < 60; i++) {
    const id = "M" + String(i + 1).padStart(3, "0");
    members.push({
      id, joinWeek: 1,
      name: i === 0 ? "Fridolin Austin" : (first[i % 20] + " " + last[Math.floor(i / 20)]).trim(),
      level: i < 4 ? lv[i] : lvCycle[i % 3]
    });
    if (!unpaid.includes(i)) {
      const w = [4,6,8,2,5,4,7,3][n % 8] + (n >= 1 && n <= 6 ? 1 : 0);
      payments.push({ id: "P" + (n + 1), memberId: id, date: n % 2 ? "2026-09-29" : "2026-09-28", amount: w * 5000 });
      n++;
    }
  }

  const activities = [
    { id: "a1", name: "Bazaar 2026", date: "2026-09-28", type: "event" },
    { id: "a2", name: "Iuran Misdinar", date: "2026-09-25", type: "iuran" },
    { id: "a3", name: "Merchandise Temu Misdinar", date: "2026-09-20", type: "event" },
    { id: "a4", name: "Donasi", date: "2026-09-15", type: "event" },
    { id: "a5", name: "Persiapan Temu Misdinar", date: "2026-09-10", type: "event" }
  ];
  const T = (id, type, amount, category, date, activityId, note) => ({ id, type, amount, category, date, activityId, note });
  const transactions = [
    T("t1", "income", 2500000, "Penjualan", "2026-09-28", "a1", "Penjualan makanan"),
    T("t2", "income", 1250000, "Penjualan", "2026-09-28", "a1", "Penjualan minuman"),
    T("t3", "income", 500000, "Donasi", "2026-09-28", "a1", "Donasi pengunjung"),
    T("t4", "expense", 800000, "Bahan", "2026-09-27", "a1", "Bahan makanan"),
    T("t5", "expense", 250000, "Dekorasi", "2026-09-26", "a1", "Dekorasi"),
    T("t6", "expense", 150000, "Perlengkapan", "2026-09-26", "a1", "Perlengkapan"),
    T("t7", "income", payments.reduce((s, p) => s + p.amount, 0), "Iuran", "2026-09-28", "a2", "Iuran mingguan anggota"),
    T("t8", "income", 2500000, "Penjualan", "2026-09-20", "a3", "Penjualan kaos dan pin"),
    T("t9", "expense", 1300000, "Bahan", "2026-09-18", "a3", "Produksi merchandise"),
    T("t10", "income", 5000000, "Donasi", "2026-09-15", "a4", "Donasi paroki"),
    T("t11", "income", 2250000, "Donasi", "2026-09-14", "a4", "Donasi umat"),
    T("t12", "expense", 250000, "Konsumsi", "2026-09-10", "a5", "Konsumsi rapat panitia")
  ];
  return { activities, transactions, members, payments };
})();

const TARGET_DANA = 250000000;

const Api = {
  delay: (ms = 600) => new Promise(r => setTimeout(r, ms)),

  /* MOCK: belum ada endpoint HTTP untuk membaca data. Ganti saat tersedia. */
  async load() { await this.delay(); return structuredClone(DB); },
  async getMembers() { await this.delay(200); return structuredClone(DB.members); },
  async getMemberBalance(memberId) {
    await this.delay(200);
    const paid = DB.payments.filter(p => p.memberId === memberId).reduce((s, p) => s + p.amount, 0);
    return { memberId, paidAmount: paid, paidWeeks: Math.floor(paid / 5000) };
  },
  async addTransaction(tx) { await this.delay(400); DB.transactions.unshift({ ...tx, id: "t" + Date.now() }); },

  /* REAL: POST action "record_payment". paymentDate berformat DD/MM/YYYY. */
  async recordPayment({ memberId, paymentDate, amount }) {
    let res;
    try {
      res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": API_CONTENT_TYPE },
        body: JSON.stringify({ action: "record_payment", member_id: memberId, payment_date: paymentDate, amount })
      });
    } catch (e) {
      throw new Error("Tidak dapat terhubung ke server. Periksa koneksi atau pengaturan CORS (" + e.message + ")");
    }
    let data;
    try { data = await res.json(); } catch (e) { throw new Error("Respons server tidak dapat dibaca."); }
    if (data.status !== "success") throw new Error(data.message || "Pembayaran gagal dicatat.");
    return data;
  },

  /* MOCK: menyamakan tampilan lokal setelah record_payment sukses (sampai endpoint baca tersedia). */
  async mockApplyPayment(memberId, isoDate, amount) {
    DB.payments.push({ id: "P" + Date.now(), memberId, date: isoDate, amount });
    DB.transactions.find(t => t.id === "t7").amount += amount;
  }
};