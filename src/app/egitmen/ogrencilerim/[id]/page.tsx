import { ArrowLeftIcon, PhoneIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditSummary } from "@/components/shared/credit-summary";
import { SectionLabel } from "@/components/shared/hero-stats";
import { LessonTable } from "@/components/shared/lesson-table";
import { PageHeader } from "@/components/shared/page-header";
import { SubjectChip } from "@/components/shared/subject-chip";
import { Card, CardContent } from "@/components/ui/card";
import { getTutorStudentLessons, getTutorStudents } from "@/features/lessons/queries";
import { requireRole } from "@/lib/auth";
import { STUDENT_GOAL_LABELS } from "@/lib/constants";
import { formatMonthKey, toMonthKey } from "@/lib/format";

export const metadata: Metadata = { title: "Öğrenci" };

export default async function TutorStudentPage({
  params,
}: PageProps<"/egitmen/ogrencilerim/[id]">) {
  const { id } = await params;
  const profile = await requireRole("tutor");
  const [students, lessons] = await Promise.all([
    getTutorStudents(profile.id),
    getTutorStudentLessons(profile.id, id),
  ]);
  const student = students.find((s) => s.id === id);
  if (!student) notFound();

  return (
    <>
      <Link
        href="/egitmen/ogrencilerim"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" /> Öğrencilerim
      </Link>
      <PageHeader
        title={student.fullName}
        description={`${student.grade ? (student.grade === 13 ? "Mezun" : `${student.grade}. sınıf`) + " · " : ""}${STUDENT_GOAL_LABELS[student.goal]}`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="grid gap-3">
            <SectionLabel className="mb-0">Ders hakkı</SectionLabel>
            <CreditSummary row={student.credit} monthLabel={formatMonthKey(toMonthKey())} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="grid gap-3 text-sm">
            <SectionLabel className="mb-0">İletişim ve branşlar</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {student.subjects.map((s) => (
                <SubjectChip key={s.name} name={s.name} color={s.color} />
              ))}
            </div>
            <Contact label="Öğrenci" name={student.fullName} phone={student.phone} />
            <Contact label="Veli" name={student.guardianName} phone={student.guardianPhone} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <SectionLabel>Bu öğrenciyle derslerim ({lessons.length})</SectionLabel>
        <Card className="py-0">
          <LessonTable
            lessons={lessons.map((l) => ({
              id: l.id,
              starts_at: l.startsAt,
              ends_at: l.endsAt,
              status: l.status,
              approval_status: l.approvalStatus,
              lesson_type: l.lessonType,
              topic: l.topic,
              is_free: l.isFree,
              subject: { name: l.subjectName, color: l.color },
            }))}
          />
        </Card>
      </div>
    </>
  );
}

function Contact({
  label,
  name,
  phone,
}: {
  label: string;
  name: string | null;
  phone: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 p-3">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{name || "—"}</p>
      </div>
      {phone && (
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-medium text-primary shadow-sm"
        >
          <PhoneIcon className="size-3.5" /> {phone}
        </a>
      )}
    </div>
  );
}
