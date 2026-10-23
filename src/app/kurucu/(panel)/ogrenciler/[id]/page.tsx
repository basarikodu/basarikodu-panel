import { ArrowLeftIcon, PencilIcon, PlusIcon, Trash2Icon, UserPlusIcon, XIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountActions } from "@/components/founder/account-dialogs";
import { AssignFields } from "@/components/founder/assign-fields";
import { PackageFields } from "@/components/founder/package-fields";
import { StudentFields } from "@/components/founder/student-fields";
import { ActionButton } from "@/components/shared/action-button";
import { CreditSummary } from "@/components/shared/credit-summary";
import { FormDialog } from "@/components/shared/form-dialog";
import { LessonTable } from "@/components/shared/lesson-table";
import { MoneyText } from "@/components/shared/money-text";
import { PageHeader } from "@/components/shared/page-header";
import { SubjectChip } from "@/components/shared/subject-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recordPayment } from "@/features/finance/actions";
import { toDateKey } from "@/features/lessons/rules";
import { deletePackage, savePackage } from "@/features/packages/actions";
import { PaymentFields } from "@/components/founder/payment-fields";
import {
  assignTutor,
  removeAssignment,
  resetPassword,
  setAccountActive,
  updateStudent,
} from "@/features/users/actions";
import { getLessonPrices } from "@/features/settings/queries";
import { getStudentDetail, getSubjects, getTutorOptions } from "@/features/users/queries";
import { LESSON_TYPE_LABELS, PAYMENT_METHOD_LABELS, STUDENT_GOAL_LABELS } from "@/lib/constants";
import { formatDate, formatMonthKey, shiftMonthKey, toMonthKey, type MonthKey } from "@/lib/format";

export const metadata: Metadata = { title: "Öğrenci" };

export default async function StudentDetailPage({ params }: PageProps<"/kurucu/ogrenciler/[id]">) {
  const { id } = await params;
  const month = toMonthKey();
  const [detail, subjects, tutors, prices] = await Promise.all([
    getStudentDetail(id, month),
    getSubjects(),
    getTutorOptions(),
    getLessonPrices(),
  ]);
  if (!detail) notFound();
  const { student, notes, assignments, packages, lessons, payments, credit } = detail;
  const p = student.profile;

  const monthOptions = [-2, -1, 0, 1, 2].map((d) => {
    const m = shiftMonthKey(month, d);
    return { value: m, label: formatMonthKey(m) };
  });

  // Ay ay alınan (tamamlanan) dersler
  const completedByMonth = new Map<string, number>();
  for (const l of lessons) {
    if (l.status !== "completed") continue;
    const key = toMonthKey(new Date(l.starts_at));
    completedByMonth.set(key, (completedByMonth.get(key) ?? 0) + 1);
  }
  const paid = payments.reduce((sum, x) => sum + Number(x.amount), 0);
  const billed = packages.reduce((sum, x) => sum + Number(x.price_total), 0);

  return (
    <>
      <Link
        href="/kurucu/ogrenciler"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" /> Öğrenciler
      </Link>
      <PageHeader
        title={p.full_name}
        description={`${student.grade ? (student.grade === 13 ? "Mezun" : `${student.grade}. sınıf`) : "Sınıf belirtilmemiş"} · ${STUDENT_GOAL_LABELS[student.goal]}`}
        actions={
          <FormDialog
            wide
            title="Öğrenciyi düzenle"
            action={updateStudent.bind(null, id)}
            trigger={
              <Button variant="outline">
                <PencilIcon className="size-4" /> Düzenle
              </Button>
            }
          >
            <StudentFields
              defaults={{
                ...student,
                full_name: p.full_name,
                email: p.email,
                phone: p.phone,
                notes,
              }}
            />
          </FormDialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Ders hakkı */}
        <Card>
          <CardHeader>
            <CardTitle>Ders hakkı</CardTitle>
          </CardHeader>
          <CardContent>
            <CreditSummary row={credit} monthLabel={formatMonthKey(month)} />
          </CardContent>
        </Card>

        {/* Eğitmenler */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Eğitmenleri</CardTitle>
            <FormDialog
              title="Eğitmen ata"
              description="Eğitmeni ve öğrencinin ondan alacağı branşları seçin. Eğitmen ders planlarken bu branşlardan birini seçer."
              action={assignTutor.bind(null, id)}
              submitLabel="Ata"
              trigger={
                <Button size="sm" variant="outline">
                  <UserPlusIcon className="size-4" /> Ata
                </Button>
              }
            >
              <AssignFields
                subjects={subjects}
                tutors={tutors}
                assigned={assignments.map((a) => `${a.tutor?.id}:${a.subject?.id}`)}
              />
            </FormDialog>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="text-sm text-warning">Henüz eğitmen atanmadı.</p>
            ) : (
              <ul className="divide-y">
                {assignments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <Link
                        href={`/kurucu/egitmenler/${a.tutor?.id}`}
                        className="font-medium hover:underline"
                      >
                        {a.tutor?.profile.full_name}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-2">
                        {a.subject && <SubjectChip name={a.subject.name} color={a.subject.color} />}
                        <span className="text-xs text-muted-foreground">
                          {LESSON_TYPE_LABELS[a.lesson_type]}
                        </span>
                      </div>
                    </div>
                    <ActionButton
                      size="icon"
                      variant="ghost"
                      aria-label="Atamayı kaldır"
                      action={removeAssignment.bind(null, a.id, id)}
                      confirmTitle="Atama kaldırılsın mı?"
                      confirmText="Eğitmen bu öğrenciye yeni ders planlayamaz. Geçmiş dersler silinmez."
                      confirmLabel="Kaldır"
                      destructive
                    >
                      <XIcon className="size-4" />
                    </ActionButton>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Bilgiler {!p.is_active && <Badge variant="secondary">Pasif</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <Info label="E-posta" value={p.email} />
            <Info label="Telefon" value={p.phone} />
            <Info label="Okul" value={student.school} />
            <Info label="Veli" value={student.guardian_name} />
            <Info label="Veli telefonu" value={student.guardian_phone} />
            {notes && (
              <p className="rounded-lg bg-muted p-3 text-xs whitespace-pre-line">{notes}</p>
            )}
            <div className="pt-2">
              <AccountActions
                email={p.email}
                isActive={p.is_active}
                onSetActive={setAccountActive.bind(null, id)}
                onResetPassword={resetPassword.bind(null, id)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Paketler */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Aylık paketler</CardTitle>
            <FormDialog
              title="Paket tanımla"
              description="Aynı ay için tekrar kaydederseniz mevcut paket güncellenir."
              action={savePackage.bind(null, id)}
              trigger={
                <Button size="sm">
                  <PlusIcon className="size-4" /> Paket
                </Button>
              }
            >
              <PackageFields monthOptions={monthOptions} prices={prices} defaults={{ month }} />
            </FormDialog>
          </CardHeader>
          <CardContent>
            {packages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz paket tanımlanmadı.</p>
            ) : (
              <ul className="divide-y">
                {packages.map((pk) => {
                  const done = completedByMonth.get(pk.month) ?? 0;
                  return (
                    <li
                      key={pk.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                    >
                      <div>
                        <p className="font-medium">
                          {formatMonthKey(pk.month as MonthKey)}
                          {pk.month === month && (
                            <Badge variant="secondary" className="ml-2">
                              Bu ay
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pk.lesson_count} ders · {done} tamamlandı
                          {pk.note ? ` · ${pk.note}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <MoneyText value={pk.price_total} className="mr-2 text-sm font-semibold" />
                        <FormDialog
                          title={`${formatMonthKey(pk.month as MonthKey)} paketini düzenle`}
                          action={savePackage.bind(null, id)}
                          trigger={
                            <Button size="icon" variant="ghost" aria-label="Paketi düzenle">
                              <PencilIcon className="size-4" />
                            </Button>
                          }
                        >
                          <PackageFields
                            monthOptions={[
                              { value: pk.month, label: formatMonthKey(pk.month as MonthKey) },
                            ]}
                            prices={prices}
                            defaults={pk}
                          />
                        </FormDialog>
                        <ActionButton
                          size="icon"
                          variant="ghost"
                          aria-label="Paketi sil"
                          action={deletePackage.bind(null, pk.id, id)}
                          confirmTitle="Paket silinsin mi?"
                          confirmText="Öğrencinin toplam ders hakkı bu paket kadar azalır."
                          confirmLabel="Sil"
                          destructive
                        >
                          <Trash2Icon className="size-4" />
                        </ActionButton>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Ödemeler */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Ödemeler</CardTitle>
            <FormDialog
              title="Tahsilat kaydet"
              description={`${p.full_name} için alınan ödemeyi girin.`}
              action={recordPayment}
              trigger={
                <Button size="sm" variant="outline">
                  <PlusIcon className="size-4" /> Tahsilat
                </Button>
              }
            >
              <PaymentFields
                studentOptions={[{ value: id, label: p.full_name }]}
                studentId={id}
                today={toDateKey(new Date())}
              />
            </FormDialog>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Paket toplamı</p>
                <MoneyText value={billed} className="font-semibold" />
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Ödenen</p>
                <MoneyText value={paid} className="font-semibold" />
              </div>
            </div>
            {billed - paid > 0 && (
              <p className="text-xs text-warning">
                Bekleyen: <MoneyText value={billed - paid} className="font-semibold" />
              </p>
            )}
            <ul className="divide-y">
              {payments.slice(0, 6).map((pay) => (
                <li key={pay.id} className="flex justify-between py-1.5">
                  <span>
                    {formatDate(pay.paid_at)}
                    <span className="text-xs text-muted-foreground">
                      {" "}
                      · {PAYMENT_METHOD_LABELS[pay.method]}
                    </span>
                  </span>
                  <MoneyText value={pay.amount} />
                </li>
              ))}
            </ul>
            {payments.length === 0 && <p className="text-muted-foreground">Kayıtlı ödeme yok.</p>}
          </CardContent>
        </Card>

        {/* Ders geçmişi */}
        <Card className="py-0 lg:col-span-3">
          <CardHeader className="pt-6">
            <CardTitle>Ders geçmişi</CardTitle>
            {completedByMonth.size > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {[...completedByMonth.entries()].map(([m, n]) => (
                  <Badge key={m} variant="secondary">
                    {formatMonthKey(m as MonthKey)}: {n} ders
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="px-0">
            <LessonTable
              personLabel="Eğitmen"
              lessons={lessons.map((l) => ({ ...l, person: l.tutor?.profile.full_name }))}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right font-medium">{value || "—"}</span>
    </div>
  );
}
