import { randomUUID } from "node:crypto";
import type { IuranRepository } from "@/application/iuran";
import { WEEKLY_FEE, type AttachmentLink } from "@/domain/iuran";
import { db } from "./supabase";

const BUCKET = "bukti";
const SIGNED_URL_SECONDS = 60 * 60;

const safeName = (name: string) => name.replace(/[^\w.-]+/g, "_");

export const iuranRepository: IuranRepository = {
  async getIuran() {
    const [members, periods, payments, methods] = await Promise.all([
      db
        .from("members")
        .select("id,name,nickname,join_date,status")
        .eq("status", "active")
        .order("id"),
      db.from("payment_periods").select("id,start_date,end_date").order("start_date"),
      db
        .from("payments")
        .select("id,payment_number,member_id,payment_method_id,payment_date,amount")
        .order("payment_date"),
      db.from("payment_methods").select("id,name,is_active").order("name"),
    ]);

    const error = members.error ?? periods.error ?? payments.error ?? methods.error;
    if (error) throw new Error(error.message);

    return {
      weeklyFee: WEEKLY_FEE,
      members: (members.data ?? []).map((x) => ({
        id: x.id,
        name: x.name,
        nickname: x.nickname,
        joinDate: x.join_date,
        status: x.status,
      })),
      periods: (periods.data ?? []).map((x) => ({
        id: x.id,
        startDate: x.start_date,
        endDate: x.end_date,
      })),
      payments: (payments.data ?? []).map((x) => ({
        id: x.id,
        number: x.payment_number,
        memberId: x.member_id,
        methodId: x.payment_method_id,
        paymentDate: x.payment_date,
        amount: x.amount,
      })),
      paymentMethods: (methods.data ?? []).map((x) => ({
        id: x.id,
        name: x.name,
        isActive: x.is_active,
      })),
    };
  },

  async getAttachments(memberId) {
    const owned = await db.from("payments").select("id").eq("member_id", memberId);
    if (owned.error) throw new Error(owned.error.message);

    const paymentIds = (owned.data ?? []).map((p) => p.id);
    if (paymentIds.length === 0) return [];

    const rows = await db
      .from("payment_attachments")
      .select("payment_id,file_path,file_name")
      .in("payment_id", paymentIds)
      .order("created_at");
    if (rows.error) throw new Error(rows.error.message);

    const files = rows.data ?? [];
    if (files.length === 0) return [];

    const signed = await db.storage
      .from(BUCKET)
      .createSignedUrls(files.map((f) => f.file_path), SIGNED_URL_SECONDS);
    if (signed.error) throw new Error(signed.error.message);

    return files.flatMap((f, i): AttachmentLink[] => {
      const url = signed.data[i]?.signedUrl;
      return url ? [{ paymentId: f.payment_id, name: f.file_name, url }] : [];
    });
  },

  async recordPayment(p, evidence) {
    const id = randomUUID();
    const storage = db.storage.from(BUCKET);
    const uploaded: { payment_id: string; file_path: string; file_name: string }[] = [];

    try {
      // File diunggah lebih dulu agar pembayaran tidak tersimpan tanpa bukti jika unggahan gagal.
      for (const [i, file] of evidence.entries()) {
        const path = `payments/${id}/${i + 1}-${safeName(file.name)}`;
        const { error } = await storage.upload(path, file.bytes, { contentType: file.type });
        if (error) throw new Error(`Gagal mengunggah bukti: ${error.message}`);
        uploaded.push({ payment_id: id, file_path: path, file_name: file.name });
      }

      const inserted = await db.from("payments").insert({
        id,
        member_id: p.memberId,
        payment_date: p.paymentDate,
        amount: p.amount,
        payment_method_id: p.methodId,
      });
      if (inserted.error?.code === "23503") {
        throw new Error("Anggota atau metode pembayaran tidak ditemukan.");
      }
      if (inserted.error) throw new Error(inserted.error.message);

      if (uploaded.length > 0) {
        const attached = await db.from("payment_attachments").insert(uploaded);
        if (attached.error) {
          await db.from("payments").delete().eq("id", id);
          throw new Error(attached.error.message);
        }
      }
    } catch (e) {
      if (uploaded.length > 0) await storage.remove(uploaded.map((u) => u.file_path));
      throw e;
    }
  },
};