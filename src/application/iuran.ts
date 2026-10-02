import { IuranData, Member, NewPayment, Period, WEEKLY_FEE, isApplicable, isPaid, isValidAmount } from "@/domain/iuran";

/** Port: diimplementasikan oleh layer infrastructure. */
export interface IuranRepository {
  getIuran(): Promise<IuranData>;
  recordPayment(p: NewPayment): Promise<void>;
}

export interface MemberRow { member: Member; paid: boolean }
export interface PeriodOverview { period: Period; rows: MemberRow[]; paidCount: number; total: number; collected: number }

export function periodOverview(d: IuranData, idx: number): PeriodOverview {
  const rows = d.members
    .filter(m => isApplicable(m, idx, d.periods))
    .map(member => ({ member, paid: isPaid(member, idx, d) }));
  const paidCount = rows.filter(r => r.paid).length;
  return { period: d.periods[idx], rows, paidCount, total: rows.length, collected: paidCount * d.weeklyFee };
}

export const totalCollected = (d: IuranData): number => d.payments.reduce((s, p) => s + p.amount, 0);

export async function recordPayment(repo: IuranRepository, p: NewPayment): Promise<void> {
  if (!isValidAmount(p.amount, WEEKLY_FEE))
    throw new Error(`Nominal pembayaran harus kelipatan Rp${WEEKLY_FEE.toLocaleString("id-ID")}`);
  await repo.recordPayment(p);
}
