/* Iuran: Rp5.000 per minggu, periode pertama Senin 28 September 2026 */
const IURAN = { fee: 5000, weeks: 10 };
const DAY = 864e5, START = Date.UTC(2026, 8, 28);
const iu = { week: null, filter: "all", q: "", memberId: null };

const wkStart = k => new Date(START + (k - 1) * 7 * DAY);
const wkEnd = k => new Date(START + ((k - 1) * 7 + 6) * DAY);
const dShort = d => d.toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });
const dLong = d => d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const wkShort = k => dShort(wkStart(k)) + " - " + dShort(wkEnd(k));
const wkRange = k => wkShort(k) + " " + wkEnd(k).getUTCFullYear();
const currentWeek = () => Math.min(IURAN.weeks, Math.max(1, Math.floor((Date.now() - START) / (7 * DAY)) + 1));

/* Alokasi ke periode paling awal yang belum lunas (preview UI, logika final ada di backend) */
const memberPaid = m => state.data.payments.filter(p => p.memberId === m.id).reduce((s, p) => s + p.amount, 0);
const weeksPaid = m => Math.floor(memberPaid(m) / IURAN.fee);
const isPaid = (m, k) => k >= m.joinWeek && k - m.joinWeek < weeksPaid(m);
const periodStats = k => {
  const el = state.data.members.filter(m => m.joinWeek <= k), paid = el.filter(m => isPaid(m, k)).length;
  return { total: el.length, paid, unpaid: el.length - paid, collected: paid * IURAN.fee };
};
const iuranStats = () => ({ ...periodStats(currentWeek()), collected: state.data.payments.reduce((s, p) => s + p.amount, 0) });

const pill = ok => `<span class="pill ${ok ? "ok" : "no"}">${ok ? "Lunas" : "Belum bayar"}</span>`;

function renderIuran() {
  if (iu.memberId) return renderMemberDetail();
  iu.week ??= currentWeek();
  const k = iu.week, cur = currentWeek(), s = iuranStats(), p = periodStats(k), q = iu.q.trim().toLowerCase();
  const list = state.data.members.filter(m => m.joinWeek <= k
    && (iu.filter === "all" || (iu.filter === "paid") === isPaid(m, k))
    && (!q || m.name.toLowerCase().includes(q)));
  const chip = (v, l) => `<button class="chip ${iu.filter === v ? "on" : ""}" data-iu-f="${v}">${l}</button>`;
  const weeks = Array.from({ length: IURAN.weeks }, (_, i) => i + 1).map(w =>
    `<button class="wk ${w === k ? "on" : ""}" data-iu-wk="${w}">${dShort(wkStart(w))}<small>Minggu ${w}</small></button>`).join("");
  const rows = list.map(m => {
    const ok = isPaid(m, k);
    return `<li><button class="mrow" data-iu-m="${m.id}">
      <span class="av">${esc(m.name[0])}</span>
      <span class="mname"><b>${esc(m.name)}</b><small>${m.level}</small></span>
      <span class="mstat">${pill(ok)}<small>${formatCurrency(ok ? IURAN.fee : 0)}</small></span></button></li>`;
  }).join("");
  return `
  <header class="top"><div><h3>Iuran Misdinar</h3><small>Iuran Mingguan ${formatCurrency(IURAN.fee)} / minggu</small></div>
    <button class="btn small" data-iu-pay=""><i data-lucide="plus"></i>Catat Pembayaran</button></header>
  <section class="card iuran-sum">
    <div class="stats">
      <span>Total Anggota<b>${s.total}</b></span><span>Total Terkumpul<b>${formatCurrency(s.collected)}</b></span>
      <span>Sudah Bayar<b class="income">${s.paid}</b></span><span>Belum Bayar<b class="expense">${s.unpaid}</b></span>
    </div>
    <div class="bar big"><i style="width:${(s.paid / s.total) * 100}%"></i></div>
    <p class="cap">${s.paid} / ${s.total} anggota sudah bayar minggu ini</p>
  </section>
  <div class="wks" id="wks">${weeks}</div>
  <section class="card iuran-sum">
    <div class="target-head"><b>${k === cur ? "Iuran Minggu Ini" : "Iuran Minggu " + k}</b>
      <span class="pill ${p.unpaid ? "no" : "ok"}">${p.unpaid ? "Belum Lunas" : "Lunas"}</span></div>
    <p class="cap top0">${wkRange(k)}</p>
    <div class="bar"><i style="width:${(p.paid / p.total) * 100}%"></i></div>
    <div class="target-foot"><span>${p.paid} / ${p.total} sudah bayar</span><b class="income2">${formatCurrency(p.collected)} terkumpul</b></div>
  </section>
  <div class="search"><i data-lucide="search"></i><input id="iq" type="search" placeholder="Cari anggota" value="${esc(iu.q)}"></div>
  <div class="chips">${chip("all", "Semua")}${chip("paid", "Sudah Bayar")}${chip("unpaid", "Belum Bayar")}</div>
  <ul class="list card">${rows || empty("Anggota tidak ditemukan", "Ubah pencarian atau filter.")}</ul>`;
}

function renderMemberDetail() {
  const m = state.data.members.find(x => x.id === iu.memberId), w = weeksPaid(m);
  const pays = state.data.payments.filter(p => p.memberId === m.id).sort((a, b) => b.date.localeCompare(a.date));
  const periods = Array.from({ length: w + 1 }, (_, i) => m.joinWeek + i).map((k, i) =>
    `<li class="prow"><span>${wkShort(k)}</span>${pill(i < w).replace("Belum bayar", "Belum Lunas")}</li>`).join("");
  const hist = pays.map(p => `<li class="prow"><span><b>${dShort(new Date(p.date + "T00:00:00Z"))}</b><small class="muted"> ${Math.floor(p.amount / IURAN.fee)} minggu</small></span>
    <span><b>${formatCurrency(p.amount)}</b> ${pill(true)}</span></li>`).join("");
  return `
  <header class="top"><button class="icon-btn" data-iu-back aria-label="Kembali"><i data-lucide="chevron-left"></i></button>
    <div><h3>${esc(m.name)}</h3><small>${m.level}</small></div></header>
  <section class="hero compact"><p>Status pembayaran</p>
    <h1>${w ? "Lunas sampai " + dLong(wkEnd(m.joinWeek + w - 1)) : "Belum ada pembayaran"}</h1></section>
  <button class="btn" data-iu-pay="${m.id}"><i data-lucide="plus"></i>Catat Pembayaran</button>
  <h4 class="day">Riwayat</h4>
  <ul class="list card">${hist || empty("Belum ada riwayat", "Catat pembayaran pertama anggota ini.")}</ul>
  <h4 class="day">Periode</h4>
  <ul class="list card">${periods}</ul>`;
}

/* ---------- Bottom sheet: catat pembayaran ---------- */
const $id = id => document.getElementById(id);
const toDMY = iso => iso.split("-").reverse().join("/");
const payAmountValue = () => Number($id("payAmount").value.replace(/\D/g, ""));

function openPayment(memberId) {
  $id("payMember").innerHTML = state.data.members.map(m => `<option value="${m.id}">${esc(m.name)}</option>`).join("");
  if (memberId) $id("payMember").value = memberId;
  $id("payDate").value = new Date().toISOString().slice(0, 10);
  $id("payAmount").value = "";
  $id("quick").innerHTML = [5, 10, 15, 20, 25].map(n => `<button type="button" class="chip" data-amt="${n * 1000}">${formatCurrency(n * 1000)}</button>`).join("");
  $id("payErr").hidden = true;
  updatePayInfo();
  const o = $id("payOverlay"); o.hidden = false;
  requestAnimationFrame(() => o.classList.add("open"));
}
function closePayment() {
  const o = $id("payOverlay"); o.classList.remove("open");
  setTimeout(() => (o.hidden = true), 220);
}

function updatePayInfo() {
  const a = payAmountValue(), box = $id("payInfo"), weeks = Math.floor(a / IURAN.fee);
  document.querySelectorAll("#quick .chip").forEach(c => c.classList.toggle("on", Number(c.dataset.amt) === a));
  if (!a) { box.innerHTML = "Pilih atau isi nominal. Kelipatan " + formatCurrency(IURAN.fee) + " = 1 minggu."; return; }
  if (a % IURAN.fee) { box.innerHTML = `<span class="warn">Nominal harus kelipatan ${formatCurrency(IURAN.fee)}.</span>`; return; }
  const m = state.data.members.find(x => x.id === $id("payMember").value), start = m.joinWeek + weeksPaid(m);
  const shown = Array.from({ length: Math.min(weeks, 6) }, (_, i) => `<li>✓ ${wkShort(start + i)}</li>`).join("");
  box.innerHTML = `${formatCurrency(a)} setara dengan <b>${weeks} minggu</b><p class="cap">Pembayaran akan dialokasikan ke:</p>
    <ul>${shown}${weeks > 6 ? `<li class="muted">+ ${weeks - 6} minggu berikutnya</li>` : ""}</ul>
    <p class="cap">Preview saja. Alokasi final dihitung backend.</p>`;
}

$id("payAmount").addEventListener("input", e => {
  const n = e.target.value.replace(/\D/g, "");
  e.target.value = n ? Number(n).toLocaleString("id-ID") : "";
  updatePayInfo();
});
$id("payMember").addEventListener("change", updatePayInfo);

$id("payForm").addEventListener("submit", async e => {
  e.preventDefault();
  const err = $id("payErr"), amount = payAmountValue(), btn = e.target.querySelector(".btn");
  if (!amount) { err.textContent = "Isi nominal pembayaran."; err.hidden = false; return; }
  btn.disabled = true; btn.textContent = "Menyimpan...";
  try {
    const memberId = $id("payMember").value, date = $id("payDate").value;
    const res = await Api.recordPayment({ memberId, paymentDate: toDMY(date), amount });
    await Api.mockApplyPayment(memberId, date, amount);
    state.data = await Api.load();
    closePayment(); render();
    showToast(res.message || "Pembayaran berhasil dicatat");
  } catch (x) { err.textContent = x.message; err.hidden = false; }
  btn.disabled = false; btn.textContent = "Simpan pembayaran";
});

document.addEventListener("click", e => {
  if (e.target.id === "payOverlay") return closePayment();
  const el = e.target.closest("[data-iu-wk],[data-iu-f],[data-iu-m],[data-iu-back],[data-iu-pay],[data-amt]");
  if (!el) return;
  const d = el.dataset;
  if (d.amt) { $id("payAmount").value = Number(d.amt).toLocaleString("id-ID"); return updatePayInfo(); }
  if (d.iuPay !== undefined) return openPayment(d.iuPay);
  if (d.iuWk) iu.week = Number(d.iuWk);
  if (d.iuF) iu.filter = d.iuF;
  if (d.iuM) { iu.memberId = d.iuM; window.scrollTo({ top: 0 }); }
  if (el.hasAttribute("data-iu-back")) iu.memberId = null;
  render();
  if (d.iuWk) $id("wks")?.querySelector(".on")?.scrollIntoView({ inline: "center", block: "nearest" });
});

document.addEventListener("input", e => {
  if (e.target.id !== "iq") return;
  iu.q = e.target.value; const pos = e.target.selectionStart;
  render(); const q = $id("iq"); q.focus(); q.setSelectionRange(pos, pos);
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$id("payOverlay").hidden) closePayment(); });