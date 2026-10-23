import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountActions } from "@/components/founder/account-dialogs";
import { TutorFields } from "@/components/founder/tutor-fields";
import { FormDialog } from "@/components/shared/form-dialog";
import { LessonTable } from "@/components/shared/lesson-table";
import { PageHeader } from "@/components/shared/page-header";
import { SubjectChip } from "@/components/shared/subject-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPassword, setAccountActive, updateTutor } from "@/features/users/actions";
import { getSubjects, getTutorDetail } from "@/features/users/queries";
import { LESSON_TYPE_LABELS, STUDENT_GOAL_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "Eğitmen" };

export default async function TutorDetailPage({ params }: PageProps<"/kurucu/egitmenler/[id]">) {
  const { id } = await params;
  const [detail, subjects] = await Promise.all([
    getTutorDetail(id),
    getSubjects({ activeOnly: false }),
  ]);
  if (!detail) notFound();
  const { tutor, assignments, lessons } = detail;
  const p = tutor.profile;

  return (
    <>
      <Link
        href="/kurucu/egitmenler"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" /> Eğitmenler
      </Link>
      <PageHeader
        title={p.full_name}
        description={[tutor.university, tutor.department].filter(Boolean).join(" · ") || undefined}
        actions={
          <>
            <FormDialog
              wide
              title="Eğitmeni düzenle"
              action={updateTutor.bind(null, id)}
              trigger={
                <Button variant="outline">
                  <PencilIcon className="size-4" /> Düzenle
                </Button>
              }
            >
              <TutorFields
                subjects={subjects}
                defaults={{
                  ...tutor,
                  full_name: p.full_name,
                  email: p.email,
                  phone: p.phone,
                  subjectIds: tutor.tutor_subjects.map((s) => s.subject_id),
                }}
              />
            </FormDialog>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Bilgiler {!p.is_active && <Badge variant="secondary">Pasif</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <Info label="E-posta" value={p.email} />
            <Info label="Telefon" value={p.phone} />
            <Info
              label="YKS derecesi"
              value={tutor.yks_rank ? `Türkiye ${tutor.yks_rank}.` : null}
            />
            <Info label="IBAN" value={tutor.iban} mono />
            <Info
              label="Ödeme"
              value={tutor.payout_frequency === "weekly" ? "Haftalık" : "Aylık"}
            />
            <Info label="Ders linki" value={tutor.default_meeting_url} />
            <div className="flex flex-wrap gap-1 pt-1">
              {subjects
                .filter((s) => tutor.tutor_subjects.some((ts) => ts.subject_id === s.id))
                .map((s) => (
                  <SubjectChip key={s.id} name={s.name} color={s.color} />
                ))}
            </div>
            <div className="pt-3">
              <AccountActions
                email={p.email}
                isActive={p.is_active}
                onSetActive={setAccountActive.bind(null, id)}
                onResetPassword={resetPassword.bind(null, id)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Öğrencileri ({assignments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Henüz atanmış öğrenci yok. Atamayı öğrenci sayfasından yapın.
              </p>
            ) : (
              <ul className="divide-y">
                {assignments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <Link
                        href={`/kurucu/ogrenciler/${a.student?.id}`}
                        className="font-medium hover:underline"
                      >
                        {a.student?.profile.full_name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {a.student?.grade ? `${a.student.grade}. sınıf · ` : ""}
                        {a.student ? STUDENT_GOAL_LABELS[a.student.goal] : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.subject && <SubjectChip name={a.subject.name} color={a.subject.color} />}
                      <span className="text-xs text-muted-foreground">
                        {LESSON_TYPE_LABELS[a.lesson_type]}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="py-0 lg:col-span-3">
          <CardHeader className="pt-6">
            <CardTitle>Son dersler</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <LessonTable
              personLabel="Öğrenci"
              lessons={lessons.map((l) => ({ ...l, person: l.student?.profile.full_name }))}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Info({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`min-w-0 truncate text-right font-medium ${mono ? "font-mono text-xs" : ""}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}
