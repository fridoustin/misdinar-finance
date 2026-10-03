import {
  AttachmentLink,
  Evidence,
  IuranData,
  MAX_EVIDENCE_BYTES,
  MAX_EVIDENCE_FILES,
  Member,
  NewPayment,
  Period,
  WEEKLY_FEE,
  isApplicable,
  isEvidenceType,
  isPaid,
  isValidAmount,
} from "@/domain/iuran";

/** Port: diimplementasikan oleh layer infrastructure. */
export interface IuranRepository {
  getIuran(): Promise<IuranData>;
  getAttachments(memberId: string): Promise<AttachmentLink[]>;
  recordPayment(p: NewPayment, evidence: Evidence[]): Promise<void>;
}

export interface MemberRow {
  member: Member;
  paid: boolean;
}
export interface PeriodOverview {
  period: Period;
  rows: MemberRow[];
  paidCount: number;
  total: number;
  collected: number;
}

export function periodOverview(d: IuranData, idx: number): PeriodOverview {
  const rows = d.members
    .filter((m) => isApplicable(m, idx, d.periods))
    .map((member) => ({ member, paid: isPaid(member, idx, d) }));
  const paidCount = rows.filter((r) => r.paid).length;
  return {
    period: d.periods[idx],
    rows,
    paidCount,
    total: rows.length,
    collected: paidCount * d.weeklyFee,
  };
}

export const totalCollected = (d: IuranData): number =>
  d.payments.reduce((s, p) => s + p.amount, 0);

export async function recordPayment(
  repo: IuranRepository,
  p: NewPayment,
  evidence: Evidence[],
): Promise<void> {
  if (!isValidAmount(p.amount, WEEKLY_FEE)) {
    throw new Error(`Nominal pembayaran harus kelipatan Rp${WEEKLY_FEE.toLocaleString("id-ID")}`);
  }
  if (!p.methodId) {
    throw new Error("Metode pembayaran wajib dipilih.");
  }
  if (evidence.length > MAX_EVIDENCE_FILES) {
    throw new Error(`Maksimal ${MAX_EVIDENCE_FILES} file bukti.`);
  }
  if (!evidence.every((f) => isEvidenceType(f.type))) {
    throw new Error("Bukti harus berupa foto atau PDF.");
  }
  if (evidence.reduce((sum, f) => sum + f.bytes.byteLength, 0) > MAX_EVIDENCE_BYTES) {
    throw new Error("Total ukuran bukti maksimal 4 MB.");
  }
  await repo.recordPayment(p, evidence);
}