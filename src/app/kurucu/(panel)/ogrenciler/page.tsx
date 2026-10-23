import { ChevronRightIcon, CopyPlusIcon, GraduationCapIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CreateAccountDialog } from "@/components/founder/account-dialogs";
import { StudentFields } from "@/components/founder/student-fields";
import { CreditBadge } from "@/components/shared/credit-summary";
import { EmptyState } from "@/components/shared/empty-state";
import { FormDialog } from "@/components/shared/form-dialog";
import { SelectField } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { SubjectChip } from "@/components/shared/subject-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { copyPackagesFromPreviousMonth } from "@/features/packages/actions";
import { createStudent } from "@/features/users/actions";
import { listStudents } from "@/features/users/queries";
import { STUDENT_GOAL_LABELS } from "@/lib/constants";
import { formatMonthKey, shiftMonthKey, toMonthKey } from "@/lib/format";
import { matchesQuery } from "@/lib/search";

export const metadata: Metadata = { title: "Öğrenciler" };

export default async function StudentsPage({ searchParams }: PageProps<"/kurucu/ogrenciler">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : undefined;
  const month = toMonthKey();
  const students = await listStudents(month);
  const rows = students.filter((s) =>
    matchesQuery(
      query,
      s.fullName,
      s.email,
      s.guardianName,
      ...s.assignments.map((a) => a.tutorName),
    ),
  );
  const nextMonth = shiftMonthKey(month, 1);

  return (
    <>
      <PageHeader
        title="Öğrenciler"
        description={`${students.filter((s) => s.isActive).length} aktif öğrenci · ${formatMonthKey(month)}`}
        actions={
          <>
            <FormDialog
              title="Aylık paketleri oluştur"
              description="Seçtiğiniz ay için, önceki aydaki paketler paketi olmayan aktif öğrencilere aynen kopyalanır. Farklı olanları sonra öğrenci sayfasından düzenleyebilirsiniz."
              action={copyPackagesFromPreviousMonth}
              submitLabel="Paketleri oluştur"
              trigger={
                <Button variant="outline">
                  <CopyPlusIcon className="size-4" /> Aylık paketler
                </Button>
              }
            >
              <SelectField
                name="month"
                label="Hangi ay için?"
                defaultValue={month}
                options={[month, nextMonth].map((m) => ({
                  value: m,
                  label: `${formatMonthKey(m)} (${formatMonthKey(shiftMonthKey(m, -1))} paketlerinden)`,
                }))}
              />
            </FormDialog>
            <CreateAccountDialog
              title="Öğrenci ekle"
              description="Öğrenci ve veli aynı hesabı kullanır. Hesap geçici şifreyle oluşturulur."
              action={createStudent}
              trigger={
                <Button>
                  <PlusIcon className="size-4" /> Öğrenci ekle
                </Button>
              }
            >
              <StudentFields />
            </CreateAccountDialog>
          </>
        }
      />

      <div className="mb-4">
        <Suspense>
          <SearchInput placeholder="Öğrenci, veli, eğitmen…" />
        </Suspense>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={GraduationCapIcon}
          title={students.length ? "Sonuç bulunamadı" : "Henüz öğrenci yok"}
          description={
            students.length
              ? "Aramayı değiştirip tekrar deneyin."
              : "İlk öğrenciyi ekleyerek başlayın."
          }
        />
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Öğrenci</TableHead>
                <TableHead className="hidden lg:table-cell">Eğitmenler</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Bu ay</TableHead>
                <TableHead className="text-right">Kalan hak</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id} className={s.isActive ? "" : "opacity-60"}>
                  <TableCell>
                    <Link
                      href={`/kurucu/ogrenciler/${s.id}`}
                      className="font-medium hover:underline"
                    >
                      {s.fullName}
                    </Link>
                    {!s.isActive && (
                      <Badge variant="secondary" className="ml-2">
                        Pasif
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {s.grade ? (s.grade === 13 ? "Mezun" : `${s.grade}. sınıf`) : "Sınıf yok"} ·{" "}
                      {STUDENT_GOAL_LABELS[s.goal]}
                    </p>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      {s.assignments.length === 0 && (
                        <span className="text-xs text-warning">Eğitmen atanmamış</span>
                      )}
                      {s.assignments.map((a) => (
                        <span key={a.id} className="inline-flex items-center gap-1 text-xs">
                          {a.subject && (
                            <SubjectChip name={a.subject.name} color={a.subject.color} />
                          )}
                          <span className="text-muted-foreground">{a.tutorName}</span>
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-right text-sm tabular-nums sm:table-cell">
                    {s.credit && s.credit.month_package > 0 ? (
                      <>
                        <b>{s.credit.month_completed}</b>
                        <span className="text-muted-foreground">
                          {" "}
                          / {s.credit.month_package} ders
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        {s.credit?.month_completed ?? 0} ders
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <CreditBadge row={s.credit} />
                  </TableCell>
                  <TableCell>
                    <Link href={`/kurucu/ogrenciler/${s.id}`} aria-label={`${s.fullName} detay`}>
                      <ChevronRightIcon className="size-4 text-muted-foreground" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
