"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dbFail, formValue, ok, zodFail, type ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { isDateKey } from "@/features/lessons/rules";

function revalidateFinance() {
  revalidatePath("/kurucu", "layout");
}

const paymentSchema = z.object({
  student_id: z.uuid("Öğrenci seçin"),
  amount: z.coerce.number().positive("Tutar 0'dan büyük olmalı").max(1_000_000),
  paid_at: z.string().refine(isDateKey, "Ödeme tarihini seçin"),
  method: z.enum(["havale", "nakit", "kart", "diger"]),
  note: z.string().max(300).nullable(),
});

/** Öğrenciden alınan ödemeyi kaydeder (para transferi panel dışında yapılır) */
export async function recordPayment(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireRole("founder");
  const parsed = paymentSchema.safeParse({
    student_id: formValue(fd, "student_id"),
    amount: formValue(fd, "amount"),
    paid_at: formValue(fd, "paid_at"),
    method: formValue(fd, "method") ?? "havale",
    note: formValue(fd, "note"),
  });
  if (!parsed.success) return zodFail(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("payments").insert({ ...parsed.data, recorded_by: me.id });
  if (error) return dbFail(error);
  revalidateFinance();
  return ok(`${formatMoney(parsed.data.amount)} tahsilat kaydedildi`);
}

export async function deletePayment(id: string): Promise<ActionState> {
  await requireRole("founder");
  const supabase = await createClient();
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) return dbFail(error);
  revalidateFinance();
  return ok("Tahsilat kaydı silindi");
}

/** Eğitmene yapılan ödemeyi işaretler: dönemdeki ödenmemiş dersler bu ödemeye bağlanır */
export async function markTutorPaid(
  tutorId: string,
  start: string,
  end: string,
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireRole("founder");
  const paidAt = formValue(fd, "paid_at");
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_tutor_paid", {
    p_tutor: tutorId,
    p_start: start,
    p_end: end,
    p_paid_at: isDateKey(paidAt) ? paidAt : undefined,
    p_note: formValue(fd, "note") ?? undefined,
  });
  if (error) return dbFail(error);
  revalidateFinance();
  revalidatePath("/egitmen", "layout");
  return ok("Ödeme kaydedildi");
}

/** Yanlış girilen eğitmen ödemesini geri alır; dersler yeniden "bekliyor" olur */
export async function undoTutorPayout(payoutId: string): Promise<ActionState> {
  await requireRole("founder");
  const supabase = await createClient();
  const { error } = await supabase.from("tutor_payouts").delete().eq("id", payoutId);
  if (error) return dbFail(error);
  revalidateFinance();
  return ok("Ödeme kaydı geri alındı");
}
