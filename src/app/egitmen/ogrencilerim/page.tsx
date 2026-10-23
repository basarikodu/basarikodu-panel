import { ChevronRightIcon, GraduationCapIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CreditBadge } from "@/components/shared/credit-summary";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SubjectChip } from "@/components/shared/subject-chip";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Card } from "@/components/ui/card";
import { getTutorStudents } from "@/features/lessons/queries";
import { requireRole } from "@/lib/auth";
import { STUDENT_GOAL_LABELS } from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/format";

export const metadata: Metadata = { title: "Öğrencilerim" };

export default async function MyStudentsPage() {
  const profile = await requireRole("tutor");
  const students = await getTutorStudents(profile.id);

  return (
    <>
      <PageHeader
        title="Öğrencilerim"
        description="Kurucuların size atadığı öğrenciler. Ders planlarken yalnızca bu öğrencileri seçebilirsiniz."
      />
      {students.length === 0 ? (
        <EmptyState
          icon={GraduationCapIcon}
          title="Henüz atanmış öğrenciniz yok"
          description="Öğrenci ataması kurucular tarafından yapılır."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {students.map((s) => (
            <Link key={s.id} href={`/egitmen/ogrencilerim/${s.id}`}>
              <Card className="flex-row items-center gap-4 p-4 transition hover:shadow-md">
                <UserAvatar name={s.fullName} className="size-12 bg-accent" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{s.fullName}</p>
                    <CreditBadge row={s.credit} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {s.grade ? (s.grade === 13 ? "Mezun" : `${s.grade}. sınıf`) : ""}
                    {s.grade ? " · " : ""}
                    {STUDENT_GOAL_LABELS[s.goal]} · {s.completedCount} ders yapıldı
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {s.subjects.map((sub) => (
                      <SubjectChip key={sub.name} name={sub.name} color={sub.color} />
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Sıradaki:{" "}
                    <b className="text-foreground">
                      {s.nextLessonAt
                        ? `${formatDate(s.nextLessonAt)} ${formatTime(s.nextLessonAt)}`
                        : "planlanmadı"}
                    </b>
                  </p>
                </div>
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
