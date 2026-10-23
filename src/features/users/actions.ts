"use server";

import { revalidatePath } from "next/cache";
import { dbFail, fail, ok, zodFail, type ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth";
import { lessonTypeForSubject } from "@/features/lessons/rules";
import { generateTempPassword } from "@/lib/password";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { assignmentSchema, readStudentForm, readTutorForm } from "./schemas";

const BAN_FOREVER = "876000h"; // ~100 yıl

/** Auth kullanıcısı + profil oluşturur; geri kalan satırlar başarısız olursa hesabı geri siler. */
async function createAccount(
  input: { email: string; full_name: string; phone: string | null },
  role: "tutor" | "student",
  insertRoleRows: (
    admin: ReturnType<typeof createAdminClient>,
    userId: string,
  ) => Promise<ActionState | null>,
): Promise<{ ok: true; password: string } | { ok: false; state: ActionState }> {
  const admin = createAdminClient();
  const password = generateTempPassword();

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: input.full_name },
  });
  if (error || !data.user) {
    const exists = error?.code === "email_exists" || /already/i.test(error?.message ?? "");
    return {
      ok: false,
      state: fail(exists ? "Bu e-posta ile kayıtlı bir hesap zaten var" : "Hesap oluşturulamadı"),
    };
  }
  const userId = data.user.id;

  const { error: profileError } = await admin.from("profiles").insert({
    id: userId,
    role,
    full_name: input.full_name,
    email: input.email,
    phone: input.phone,
  });
  const rowsResult = profileError ? dbFail(profileError) : await insertRoleRows(admin, userId);
  if (rowsResult) {
    await admin.auth.admin.deleteUser(userId);
    return { ok: false, state: rowsResult };
  }
  return { ok: true, password };
}

// Eğitmen ---------------------------------------------------------------------------

export async function createTutor(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireRole("founder");
  const parsed = readTutorForm(fd);
  if (!parsed.success) return zodFail(parsed.error);
  const { subjects, full_name, email, phone, ...tutor } = parsed.data;

  const result = await createAccount({ email, full_name, phone }, "tutor", async (admin, id) => {
    const { error } = await admin.from("tutors").insert({ id, ...tutor });
    if (error) return dbFail(error);
    if (subjects.length) {
      const { error: subjErr } = await admin
        .from("tutor_subjects")
        .insert(subjects.map((subject_id) => ({ tutor_id: id, subject_id })));
      if (subjErr) return dbFail(subjErr);
    }
    return null;
  });
  if (!result.ok) return result.state;

  revalidatePath("/kurucu/egitmenler");
  return ok(`${full_name} eklendi`, { tempPassword: result.password, email });
}

export async function updateTutor(
  id: string,
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireRole("founder");
  const parsed = readTutorForm(fd);
  if (!parsed.success) return zodFail(parsed.error);
  const { subjects, full_name, email, phone, ...tutor } = parsed.data;

  const emailResult = await syncEmail(id, email);
  if (emailResult) return emailResult;

  const supabase = await createClient();
  const { error: pErr } = await supabase
    .from("profiles")
    .update({ full_name, phone, email })
    .eq("id", id);
  if (pErr) return dbFail(pErr);
  const { error: tErr } = await supabase.from("tutors").update(tutor).eq("id", id);
  if (tErr) return dbFail(tErr);

  const { error: dErr } = await supabase.from("tutor_subjects").delete().eq("tutor_id", id);
  if (dErr) return dbFail(dErr);
  if (subjects.length) {
    const { error: sErr } = await supabase
      .from("tutor_subjects")
      .insert(subjects.map((subject_id) => ({ tutor_id: id, subject_id })));
    if (sErr) return dbFail(sErr);
  }

  revalidatePath("/kurucu/egitmenler");
  revalidatePath(`/kurucu/egitmenler/${id}`);
  return ok("Eğitmen bilgileri güncellendi");
}

// Öğrenci ---------------------------------------------------------------------------

export async function createStudent(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireRole("founder");
  const parsed = readStudentForm(fd);
  if (!parsed.success) return zodFail(parsed.error);
  const { full_name, email, phone, notes, ...student } = parsed.data;

  const result = await createAccount({ email, full_name, phone }, "student", async (admin, id) => {
    const { error } = await admin.from("students").insert({ id, ...student });
    if (error) return dbFail(error);
    if (notes) {
      const { error: nErr } = await admin.from("student_notes").insert({ student_id: id, notes });
      if (nErr) return dbFail(nErr);
    }
    return null;
  });
  if (!result.ok) return result.state;

  revalidatePath("/kurucu/ogrenciler");
  return ok(`${full_name} eklendi`, { tempPassword: result.password, email });
}

export async function updateStudent(
  id: string,
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireRole("founder");
  const parsed = readStudentForm(fd);
  if (!parsed.success) return zodFail(parsed.error);
  const { full_name, email, phone, notes, ...student } = parsed.data;

  const emailResult = await syncEmail(id, email);
  if (emailResult) return emailResult;

  const supabase = await createClient();
  const { error: pErr } = await supabase
    .from("profiles")
    .update({ full_name, phone, email })
    .eq("id", id);
  if (pErr) return dbFail(pErr);
  const { error: sErr } = await supabase.from("students").update(student).eq("id", id);
  if (sErr) return dbFail(sErr);
  const { error: nErr } = await supabase
    .from("student_notes")
    .upsert({ student_id: id, notes: notes ?? "" });
  if (nErr) return dbFail(nErr);

  revalidatePath("/kurucu/ogrenciler");
  revalidatePath(`/kurucu/ogrenciler/${id}`);
  return ok("Öğrenci bilgileri güncellendi");
}

// Ortak hesap işlemleri -------------------------------------------------------------

/** Giriş e-postası değiştiyse auth kullanıcısını da günceller. */
async function syncEmail(id: string, email: string): Promise<ActionState | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("email").eq("id", id).single();
  if (data?.email === email) return null;
  const { error } = await createAdminClient().auth.admin.updateUserById(id, {
    email,
    email_confirm: true,
  });
  if (error) {
    return fail(
      /already/i.test(error.message)
        ? "Bu e-posta başka bir hesapta kullanılıyor"
        : "E-posta güncellenemedi",
    );
  }
  return null;
}

export async function setAccountActive(id: string, active: boolean): Promise<ActionState> {
  const me = await requireRole("founder");
  if (id === me.id) return fail("Kendi hesabınızı pasife alamazsınız");

  const { error: banErr } = await createAdminClient().auth.admin.updateUserById(id, {
    ban_duration: active ? "none" : BAN_FOREVER,
  });
  if (banErr) return fail("Hesap durumu değiştirilemedi");

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ is_active: active }).eq("id", id);
  if (error) return dbFail(error);

  revalidatePath("/kurucu", "layout");
  return ok(active ? "Hesap yeniden aktif edildi" : "Hesap pasife alındı; artık giriş yapamaz");
}

export async function resetPassword(id: string): Promise<ActionState> {
  await requireRole("founder");
  const password = generateTempPassword();
  const { error } = await createAdminClient().auth.admin.updateUserById(id, { password });
  if (error) return fail("Şifre sıfırlanamadı");
  return ok("Yeni geçici şifre oluşturuldu", { tempPassword: password });
}

// Eşleştirme ------------------------------------------------------------------------

export async function assignTutor(
  studentId: string,
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const me = await requireRole("founder");
  const parsed = assignmentSchema.safeParse({
    tutor_id: fd.get("tutor_id"),
    subject_ids: fd.getAll("subject_ids"),
  });
  if (!parsed.success) return zodFail(parsed.error);
  const { tutor_id, subject_ids } = parsed.data;

  const supabase = await createClient();
  const { data: subjects, error: subjectError } = await supabase
    .from("subjects")
    .select("id, name")
    .in("id", subject_ids);
  if (subjectError) return dbFail(subjectError);

  // Her branş ayrı eşleştirme; ders tipi branştan çıkar. Zaten atanmış branş atlanır.
  let added = 0;
  for (const subject of subjects ?? []) {
    const { error } = await supabase.from("tutor_students").insert({
      tutor_id,
      student_id: studentId,
      subject_id: subject.id,
      lesson_type: lessonTypeForSubject(subject.name),
      assigned_by: me.id,
    });
    if (error && error.code !== "23505") return dbFail(error);
    if (!error) added++;
  }
  if (!added) return fail("Seçilen branşlar bu eğitmenle zaten atanmış");

  revalidatePath(`/kurucu/ogrenciler/${studentId}`);
  revalidatePath("/kurucu/ogrenciler");
  return ok(added > 1 ? `${added} branş atandı` : "Branş atandı");
}

export async function removeAssignment(
  assignmentId: string,
  studentId: string,
): Promise<ActionState> {
  await requireRole("founder");
  const supabase = await createClient();
  const { error } = await supabase
    .from("tutor_students")
    .update({ is_active: false })
    .eq("id", assignmentId);
  if (error) return dbFail(error);

  revalidatePath(`/kurucu/ogrenciler/${studentId}`);
  revalidatePath("/kurucu/ogrenciler");
  return ok("Atama kaldırıldı; eğitmen bu öğrenciye yeni ders planlayamaz");
}
