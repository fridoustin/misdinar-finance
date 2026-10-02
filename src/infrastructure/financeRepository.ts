import type { FinanceRepository } from "@/application/finance";
import { db } from "./supabase";

export const financeRepository: FinanceRepository = {
  async getFinance() {
    const [transactions, categories] = await Promise.all([
      db
        .from("transactions")
        .select("id,type,category_id,amount,transaction_date,note")
        .order("transaction_date", { ascending: false }),
      db.from("categories").select("id,name").order("name"),
    ]);

    const error = transactions.error ?? categories.error;
    if (error) throw new Error(error.message);

    return {
      transactions: (transactions.data ?? []).map((x) => ({
        id: x.id,
        type: x.type,
        categoryId: x.category_id,
        amount: x.amount,
        date: x.transaction_date,
        note: x.note,
      })),
      categories: (categories.data ?? []).map((x) => ({ id: x.id, name: x.name })),
    };
  },

  async getCategories() {
    const { data, error } = await db.from("categories").select("id,name").order("name");
    if (error) throw new Error(error.message);
    return (data ?? []).map((x) => ({ id: x.id, name: x.name }));
  },

  async addTransaction(t) {
    const { error } = await db.from("transactions").insert({
      type: t.type,
      category_id: t.categoryId,
      amount: t.amount,
      transaction_date: t.date,
      note: t.note || null,
    });
    if (error) throw new Error(error.message);
  },

  async addCategory(name) {
    const { error } = await db.from("categories").insert({ name });
    if (error) throw new Error(error.message);
  },
};