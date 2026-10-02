"use server";
import { revalidatePath } from "next/cache";
import { recordPayment } from "@/application/iuran";
import type { NewPayment } from "@/domain/iuran";
import { iuranRepository } from "@/infrastructure/iuranRepository";

export async function recordPaymentAction(p: NewPayment): Promise<{ error?: string }> {
  try { await recordPayment(iuranRepository, p); }
  catch (e) { return { error: (e as Error).message }; }
  revalidatePath("/iuran");
  return {};
}