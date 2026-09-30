/* Mock data + lapisan Api.
   Iuran: recordPayment memakai HTTP API asli (Google Apps Script). Lainnya masih mock. */

const API_URL = "https://script.google.com/macros/s/AKfycby4t5ded1878bEF8yM5Z6_hkaY3otkCWJuNuOH-fdyXsJdzyqelSr_VzQBLwQneMOrf/exec";
// Frontend di GitHub Pages memanggil Apps Script lintas domain. Apps Script tidak
// menjawab preflight CORS, jadi gunakan text/plain (body tetap JSON, backend tidak berubah).
const API_CONTENT_TYPE = "text/plain;charset=utf-8";

const DB = (() => {
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
    T("t7", "income", 0, "Iuran", "2026-09-28", "a2", "Iuran mingguan anggota"),
    T("t8", "income", 2500000, "Penjualan", "2026-09-20", "a3", "Penjualan kaos dan pin"),
    T("t9", "expense", 1300000, "Bahan", "2026-09-18", "a3", "Produksi merchandise"),
    T("t10", "income", 5000000, "Donasi", "2026-09-15", "a4", "Donasi paroki"),
    T("t11", "income", 2250000, "Donasi", "2026-09-14", "a4", "Donasi umat"),
    T("t12", "expense", 250000, "Konsumsi", "2026-09-10", "a5", "Konsumsi rapat panitia")
  ];
  return { activities, transactions };
})();

const TARGET_DANA = 250000000;

const Api = {
  delay: (ms = 600) => new Promise(r => setTimeout(r, ms)),

  /* Activity dan transaksi non-iuran masih MOCK. Data iuran dibaca dari Google Sheets. */
  async load() {
    await this.delay(300);
    const data = structuredClone(DB);
    try {
      Object.assign(data, mapIuran(await this.getIuran()));
    } catch (e) {
      Object.assign(data, { members: [], payments: [], periods: [], fee: 0, iuranError: e.message });
    }
    data.transactions.find(t => t.id === "t7").amount = data.payments.reduce((s, p) => s + p.amount, 0);
    return data;
  },

  /* REAL: GET ?action=iuran */
  async getIuran() {
    let json;
    try {
      const res = await fetch(API_URL + "?action=iuran");
      json = await res.json();
    } catch (e) {
      throw new Error("Tidak dapat terhubung ke server (" + e.message + ")");
    }
    if (json.status !== "success") throw new Error(json.message || "Gagal memuat data iuran.");
    return json.data;
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
  }
};

/* Ubah bentuk respons backend ke bentuk yang dipakai UI. Minggu bergabung = periode pertama yang berakhir pada/setelah join_date. */
function mapIuran(d) {
  const periods = d.periods.map(p => ({ id: p.period_id, start: p.start_date, end: p.end_date }));
  const members = d.members.map(m => {
    const i = m.join_date ? periods.findIndex(p => p.end >= m.join_date) : 0;
    return { id: m.member_id, name: m.name, nickname: m.nickname, status: m.status, joinWeek: i < 0 ? periods.length + 1 : i + 1 };
  });
  const payments = d.payments.map(p => ({ id: p.payment_id, memberId: p.member_id, date: p.payment_date, amount: p.amount }));
  return { fee: d.weekly_fee, periods, members, payments };
}