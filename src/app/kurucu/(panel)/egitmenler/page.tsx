import { ChevronRightIcon, PlusIcon, UsersIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CreateAccountDialog } from "@/components/founder/account-dialogs";
import { TutorFields } from "@/components/founder/tutor-fields";
import { EmptyState } from "@/components/shared/empty-state";
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
import { createTutor } from "@/features/users/actions";
import { getSubjects, listTutors } from "@/features/users/queries";
import { matchesQuery } from "@/lib/search";

export const metadata: Metadata = { title: "Eğitmenler" };

export default async function TutorsPage({ searchParams }: PageProps<"/kurucu/egitmenler">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : undefined;
  const [tutors, subjects] = await Promise.all([listTutors(), getSubjects()]);
  const rows = tutors.filter((t) =>
    matchesQuery(query, t.fullName, t.email, t.university, ...t.subjects.map((s) => s.name)),
  );

  return (
    <>
      <PageHeader
        title="Eğitmenler"
        description={`${tutors.filter((t) => t.isActive).length} aktif eğitmen`}
        actions={
          <CreateAccountDialog
            title="Eğitmen ekle"
            description="Hesap geçici şifreyle oluşturulur; giriş bilgilerini eğitmene iletirsiniz."
            action={createTutor}
            trigger={
              <Button>
                <PlusIcon className="size-4" /> Eğitmen ekle
              </Button>
            }
          >
            <TutorFields subjects={subjects} />
          </CreateAccountDialog>
        }
      />

      <div className="mb-4">
        <Suspense>
          <SearchInput placeholder="İsim, branş, üniversite…" />
        </Suspense>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={tutors.length ? "Sonuç bulunamadı" : "Henüz eğitmen yok"}
          description={
            tutors.length
              ? "Aramayı değiştirip tekrar deneyin."
              : "İlk eğitmeni ekleyerek başlayın."
          }
        />
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Eğitmen</TableHead>
                <TableHead className="hidden md:table-cell">Branşlar</TableHead>
                <TableHead className="text-right">Öğrenci</TableHead>
                <TableHead className="text-right">Bu ay ders</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id} className={t.isActive ? "" : "opacity-60"}>
                  <TableCell>
                    <Link
                      href={`/kurucu/egitmenler/${t.id}`}
                      className="font-medium hover:underline"
                    >
                      {t.fullName}
                    </Link>
                    {!t.isActive && (
                      <Badge variant="secondary" className="ml-2">
                        Pasif
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {[t.university, t.department].filter(Boolean).join(" · ") || t.email}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {t.subjects.map((s) => (
                        <SubjectChip key={s.id} name={s.name} color={s.color} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{t.studentCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{t.lessonsThisMonth}</TableCell>
                  <TableCell>
                    <Link href={`/kurucu/egitmenler/${t.id}`} aria-label={`${t.fullName} detay`}>
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
