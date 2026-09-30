/* ---------- Utilities ---------- */
const $ = (s, el = document) => el.querySelector(s);
const view = $("#view");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const formatCurrency = n => "Rp" + Math.abs(n).toLocaleString("id-ID");
const formatDate = d => new Date(d + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
const sumBy = (list, type) => list.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);
const totals = list => { const income = sumBy(list, "income"), expense = sumBy(list, "expense"); return { income, expense, net: income - expense }; };
const icons = () => lucide.createIcons();

const CATEGORIES = {
  income: ["Iuran", "Penjualan", "Donasi", "Sponsorship", "Registrasi", "Lainnya"],
  expense: ["Konsumsi", "Perlengkapan", "Transportasi", "Dekorasi", "Bahan", "Lainnya"]
};

/* ---------- State ---------- */
const state = {
  data: null, status: "loading", page: "home", activityId: null,
  filter: { type: "all", q: "", category: "", activity: "", from: "" }
};

const txOf = id => state.data.transactions.filter(t => t.activityId === id);
const activityName = id => state.data.activities.find(a => a.id === id)?.name || "Umum";

function filterTransactions(list, f) {
  const q = f.q.trim().toLowerCase();
  return list
    .filter(t => (f.type === "all" || t.type === f.type)
      && (!f.category || t.category === f.category)
      && (!f.activity || t.activityId === f.activity)
      && (!f.from || t.date >= f.from)
      && (!q || [t.note, t.category, activityName(t.activityId)].join(" ").toLowerCase().includes(q)))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/* ---------- Reusable pieces ---------- */
const txRow = (t, showActivity = true) => `
  <li class="tx">
    <span class="dot ${t.type}"><i data-lucide="${t.type === "income" ? "arrow-down-left" : "arrow-up-right"}"></i></span>
    <div class="tx-body">
      <b>${esc(t.note || t.category)}</b>
      <small>${esc(t.category)} · ${formatDate(t.date)}${showActivity ? " · " + esc(activityName(t.activityId)) : ""}</small>
    </div>
    <span class="amt ${t.type}">${t.type === "income" ? "+" : "-"} ${formatCurrency(t.amount)}</span>
  </li>`;

const empty = (title, text) => `<div class="state"><i data-lucide="inbox"></i><b>${title}</b><p>${text}</p></div>`;

const skeleton = () => `<div class="skel h180"></div><div class="skel h90"></div><div class="skel h90"></div>`;

const errorState = () => `<div class="state"><i data-lucide="wifi-off"></i><b>Data belum bisa dimuat</b>
  <p>Periksa koneksi internet, lalu coba lagi.</p><button class="btn small" data-act="retry">Muat ulang</button></div>`;

const filterBar = (opts = {}) => {
  const f = state.filter;
  const chip = (v, l) => `<button class="chip ${f.type === v ? "on" : ""}" data-type="${v}">${l}</button>`;
  return `
  <div class="search"><i data-lucide="search"></i><input id="q" type="search" placeholder="Cari transaksi" value="${esc(f.q)}"></div>
  <div class="chips">${chip("all", "Semua")}${chip("income", "Pemasukan")}${chip("expense", "Pengeluaran")}</div>
  ${opts.advanced ? `
  <div class="adv">
    <select id="fCat" aria-label="Kategori"><option value="">Semua kategori</option>
      ${[...new Set([...CATEGORIES.income, ...CATEGORIES.expense])].map(c => `<option ${f.category === c ? "selected" : ""}>${c}</option>`).join("")}</select>
    <select id="fAct" aria-label="Activity"><option value="">Semua activity</option>
      ${state.data.activities.map(a => `<option value="${a.id}" ${f.activity === a.id ? "selected" : ""}>${esc(a.name)}</option>`).join("")}</select>
    <input id="fFrom" type="date" value="${f.from}" aria-label="Sejak tanggal">
  </div>` : ""}`;
};

/* ---------- Renderers ---------- */
function renderSummary() {
  const t = totals(state.data.transactions);
  return `
  <section class="hero">
    <p>Saldo Kas</p>
    <h1>${formatCurrency(t.net)}</h1>
    <div class="hero-row">
      <div><i data-lucide="arrow-down-left"></i><span>Total Pemasukan<b>${formatCurrency(t.income)}</b></span></div>
      <div><i data-lucide="arrow-up-right"></i><span>Total Pengeluaran<b>${formatCurrency(t.expense)}</b></span></div>
    </div>
  </section>`;
}

function renderTarget() {
  const income = totals(state.data.transactions).income;
  const pct = Math.min(100, (income / TARGET_DANA) * 100);
  return `
  <section class="card target">
    <div class="target-head"><b>Target dana</b><span>${formatCurrency(TARGET_DANA)}</span></div>
    <div class="bar big"><i style="width:${Math.max(pct, 2)}%"></i></div>
    <div class="target-foot">
      <span><b>${pct.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%</b> tercapai</span>
      <span>Kurang ${formatCurrency(Math.max(TARGET_DANA - income, 0))}</span>
    </div>
  </section>`;
}

function activityCard(a) {
  if (a.type === "iuran") {
    const s = iuranStats();
    return `<button class="card act" data-open-activity="${a.id}">
      <div class="act-head"><b>${esc(a.name)}</b><small>${formatDate(a.date)}</small></div>
      <div class="bar"><i style="width:${(s.paid / s.total) * 100}%"></i></div>
      <div class="act-foot"><span>${s.paid} / ${s.total} anggota</span><b>${formatCurrency(s.collected)} terkumpul</b></div></button>`;
  }
  const t = totals(txOf(a.id));
  return `<button class="card act" data-open-activity="${a.id}">
    <div class="act-head"><b>${esc(a.name)}</b><small>${formatDate(a.date)}</small></div>
    <div class="trio">
      <span>Pemasukan<b class="income">${formatCurrency(t.income)}</b></span>
      <span>Pengeluaran<b class="expense">${formatCurrency(t.expense)}</b></span>
      <span>Net<b>${formatCurrency(t.net)}</b></span>
    </div></button>`;
}

function renderRecentActivities(limit = 3) {
  const list = state.data.activities.filter(a => a.type !== "iuran")
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  return `<div class="sec-head"><h2>Recent</h2><button class="link" data-page-go="activity">Lihat semua</button></div>
    <div class="stack">${list.map(activityCard).join("")}</div>`;
}

function renderHome() {
  return `<header class="top"><div><small>Temu Misdinar</small><h3>Finance</h3></div></header>${renderSummary()}${renderTarget()}${renderRecentActivities()}`;
}

function renderTransactions() {
  const list = filterTransactions(state.data.transactions, state.filter);
  return `<header class="top"><h3>Finance</h3>
      <button class="link" data-page-go="history"><i data-lucide="history"></i>Riwayat</button></header>
    ${filterBar()}
    <ul class="list card" id="txList">${list.length ? list.map(t => txRow(t)).join("") : empty("Tidak ada transaksi", "Ubah pencarian atau filter, atau tambah transaksi baru.")}</ul>`;
}

function renderHistory() {
  const list = filterTransactions(state.data.transactions, state.filter);
  const groups = list.reduce((g, t) => ((g[t.date] ||= []).push(t), g), {});
  const body = Object.keys(groups).map(d => `<h4 class="day">${formatDate(d)}</h4>
    <ul class="list card">${groups[d].map(t => txRow(t)).join("")}</ul>`).join("");
  return `<header class="top"><button class="icon-btn" data-page-go="finance" aria-label="Kembali"><i data-lucide="chevron-left"></i></button><h3>History</h3></header>
    ${filterBar({ advanced: true })}
    <div id="histList">${body || empty("Riwayat kosong", "Tidak ada transaksi yang cocok dengan filter.")}</div>`;
}

function renderActivities() {
  if (state.activityId) return renderActivityDetail();
  const list = [...state.data.activities].sort((a, b) => b.date.localeCompare(a.date));
  return `<header class="top"><h3>Activity</h3></header><div class="stack">${list.map(activityCard).join("")}</div>`;
}

function renderActivityDetail() {
  const a = state.data.activities.find(x => x.id === state.activityId);
  const txs = txOf(a.id), t = totals(txs);
  const group = (type, label) => {
    const l = txs.filter(x => x.type === type);
    return l.length ? `<h4 class="day">${label}</h4><ul class="list card">${l.map(x => txRow(x, false)).join("")}</ul>` : "";
  };
  return `<header class="top"><button class="icon-btn" data-act="back" aria-label="Kembali"><i data-lucide="chevron-left"></i></button>
      <div><h3>${esc(a.name)}</h3><small>${formatDate(a.date)}</small></div></header>
    <section class="hero compact">
      <p>Net</p><h1>${formatCurrency(t.net)}</h1>
      <div class="hero-row">
        <div><i data-lucide="arrow-down-left"></i><span>Pemasukan<b>${formatCurrency(t.income)}</b></span></div>
        <div><i data-lucide="arrow-up-right"></i><span>Pengeluaran<b>${formatCurrency(t.expense)}</b></span></div>
      </div></section>
    ${a.type === "iuran" ? `<button class="btn" data-page-go="iuran">Buka daftar anggota</button>` : ""}
    ${txs.length ? group("income", "Pemasukan") + group("expense", "Pengeluaran") : empty("Belum ada transaksi", "Tambahkan transaksi dan pilih activity ini.")}`;
}

/* ---------- Router ---------- */
const pages = { home: renderHome, finance: renderTransactions, history: renderHistory, activity: renderActivities, iuran: renderIuran };

function render() {
  document.querySelectorAll(".nav [data-page]").forEach(b => {
    const on = b.dataset.page === state.page || (state.page === "history" && b.dataset.page === "finance");
    b.classList.toggle("on", on);
  });
  view.innerHTML = state.status === "loading" ? skeleton() : state.status === "error" ? errorState() : pages[state.page]();
  icons();
}

function go(page, activityId = null) {
  state.page = page; state.activityId = activityId; iu.memberId = null;
  state.filter = { type: "all", q: "", category: "", activity: "", from: "" };
  window.scrollTo({ top: 0 });
  render();
}

async function load() {
  state.status = "loading"; render();
  try { state.data = await Api.load(); state.status = "ready"; }
  catch (e) { state.status = "error"; }
  render();
}

/* ---------- Modal / bottom sheet ---------- */
const overlay = $("#overlay"), form = $("#txForm");

function fillCategories() {
  const type = form.type.value;
  $("#category").innerHTML = CATEGORIES[type].map(c => `<option>${c}</option>`).join("");
}
function openModal() {
  form.reset(); fillCategories();
  $("#date").value = new Date().toISOString().slice(0, 10);
  $("#activitySel").innerHTML = state.data.activities.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join("");
  $("#formErr").hidden = true;
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("open"));
  setTimeout(() => $("#amount").focus(), 250);
}
function closeModal() {
  overlay.classList.remove("open");
  setTimeout(() => (overlay.hidden = true), 220);
}

function showToast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(showToast.id); showToast.id = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Events ---------- */
$("#fab").onclick = () => { if (!state.data) return; state.page === "iuran" ? openPayment(iu.memberId) : openModal(); };
overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !overlay.hidden) closeModal(); });
form.addEventListener("change", e => { if (e.target.name === "type") fillCategories(); });
$("#amount").addEventListener("input", e => {
  const n = e.target.value.replace(/\D/g, "");
  e.target.value = n ? Number(n).toLocaleString("id-ID") : "";
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  const amount = Number($("#amount").value.replace(/\D/g, ""));
  const err = $("#formErr");
  if (!amount) { err.textContent = "Isi nominal lebih dari Rp0."; err.hidden = false; return; }
  const fd = new FormData(form);
  const btn = form.querySelector(".btn"); btn.disabled = true; btn.textContent = "Menyimpan...";
  try {
    await Api.addTransaction({ type: fd.get("type"), amount, category: fd.get("category"), date: fd.get("date"), activityId: fd.get("activityId"), note: fd.get("note").trim() });
    state.data = await Api.load();
    closeModal(); render(); showToast("Transaksi disimpan");
  } catch (x) { err.textContent = "Gagal menyimpan. Coba lagi."; err.hidden = false; }
  btn.disabled = false; btn.textContent = "Simpan transaksi";
});

document.addEventListener("click", async e => {
  const el = e.target.closest("[data-page],[data-page-go],[data-open-activity],[data-act],[data-type]");
  if (!el) return;
  const d = el.dataset;
  if (d.page || d.pageGo) return go(d.page || d.pageGo);
  if (d.openActivity) return go("activity", d.openActivity);
  if (d.act === "back") return go("activity");
  if (d.act === "retry") return load();
  if (d.type) { state.filter.type = d.type; return render(); }
});

/* Input filter: render ulang hanya daftar agar fokus search tidak hilang */
document.addEventListener("input", e => {
  const id = e.target.id, f = state.filter;
  if (!["q", "fCat", "fAct", "fFrom"].includes(id)) return;
  ({ q: () => (f.q = e.target.value), fCat: () => (f.category = e.target.value), fAct: () => (f.activity = e.target.value), fFrom: () => (f.from = e.target.value) })[id]();
  const pos = e.target.selectionStart;
  render();
  const again = document.getElementById(id);
  if (again) { again.focus(); if (id === "q") again.setSelectionRange(pos, pos); }
});

load();