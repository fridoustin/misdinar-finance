"use server";

import { revalidatePath } from "next/cache";
import { recordPayment } from "@/application/iuran";
import type { Evidence } from "@/domain/iuran";
import { iuranRepository } from "@/infrastructure/iuranRepository";

type Result = { error?: string };

export async function recordPaymentAction(formData: FormData): Promise<Result> {
  try {
    const files = formData
      .getAll("files")
      .filter((f): f is File => f instanceof File && f.size > 0);

    const evidence: Evidence[] = await Promise.all(
      files.map(async (f) => ({ name: f.name, type: f.type, bytes: await f.arrayBuffer() })),
    );

    await recordPayment(
      iuranRepository,
      {
        memberId: String(formData.get("memberId") ?? ""),
        paymentDate: String(formData.get("paymentDate") ?? ""),
        amount: Number(formData.get("amount")),
        methodId: String(formData.get("methodId") ?? ""),
      },
      evidence,
    );
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/", "layout"); // Iuran, detail anggota, dan Kas Kecil di Home ikut diperbarui
  return {};
}