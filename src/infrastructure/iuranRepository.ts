import { createClient } from "@supabase/supabase-js";
import type { IuranRepository } from "@/application/iuran";
import { WEEKLY_FEE } from "@/domain/iuran";

const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false }
});

export const iuranRepository: IuranRepository = {
  async getIuran() {
    const [m, p, pay] = await Promise.all([
      db.from("members").select("id,name,nickname,join_date,status").eq("status", "active").order("id"),
      db.from("payment_periods").select("id,start_date,end_date").order("start_date"),
      db.from("payments").select("id,member_id,payment_date,amount").order("payment_date")
    ]);
    const err = m.error ?? p.error ?? pay.error;
    if (err) throw new Error(err.message);
    return {
      weeklyFee: WEEKLY_FEE,
      members: (m.data ?? []).map(x => ({ id: x.id, name: x.name, nickname: x.nickname, joinDate: x.join_date, status: x.status })),
      periods: (p.data ?? []).map(x => ({ id: x.id, startDate: x.start_date, endDate: x.end_date })),
      payments: (pay.data ?? []).map(x => ({ id: x.id, memberId: x.member_id, paymentDate: x.payment_date, amount: x.amount }))
    };
  },

  async recordPayment(p) {
    const { error } = await db.from("payments").insert({ member_id: p.memberId, payment_date: p.paymentDate, amount: p.amount });
    if (error?.code === "23503") throw new Error("Member ID tidak ditemukan.");
    if (error) throw new Error(error.message);
  }
};
