"use server";

import { revalidatePath } from "next/cache";
import { addCategory, addTransaction } from "@/application/finance";
import type { NewTransaction } from "@/domain/finance";
import { financeRepository } from "@/infrastructure/financeRepository";

type Result = { error?: string };

function refresh() {
  revalidatePath("/", "layout");
}

export async function addTransactionAction(t: NewTransaction): Promise<Result> {
  try {
    await addTransaction(financeRepository, t);
  } catch (e) {
    return { error: (e as Error).message };
  }
  refresh();
  return {};
}

export async function addCategoryAction(name: string): Promise<Result> {
  try {
    await addCategory(financeRepository, name);
  } catch (e) {
    return { error: (e as Error).message };
  }
  refresh();
  return {};
}