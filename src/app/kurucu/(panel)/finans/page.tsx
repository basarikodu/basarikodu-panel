import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  BookOpenCheckIcon,
  CheckCircle2Icon,
  PlusIcon,
  ScaleIcon,
  Trash2Icon,
  Undo2Icon,
  WalletIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "cn";
import { ActionButton } from "@/components/shared/action-button";
import { EmptyState } from "@/components/shared/empty-state";
import { FormDialog } from "@/components/shared/form-dialog";
import { TextField } from "@/components/shared/form-fields";
import { HeroStats, SectionLabel } from "@/components/shared/hero-stats";
import { MoneyText } from "@/components/shared/money-text";
import { PageHeader } from "@/components/shared/page-header";
import { PeriodNav } from "@/components/shared/period-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deletePayment,
  markTutorPaid,
  recordPayment,
  undoTutorPayout,
} from "@/features/finance/actions";
import {
  getFinanceSummary,
  getOutstandingBalances,
  getStudentOptions,
  getTutorPayables,
} from "@/features/finance/queries";
import { changePct, periodLabel, periodOf, type PeriodKind } from "@/features/finance/rules";
import { addDays, isDateKey, toDateKey } from "@/features/lessons/rules";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { PaymentFields } from "@/components/founder/payment-fields";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Gelir-Gider" };

const TABS = [
  { key: "odenecekler", label: "Eğitmen ödemeleri" },
  { key: "tahsilat", label: "Tahsilatlar" },
  { key: "bekleyen", label: "Bekleyen tahsilat" },
] as const;
type Tab = (typeof TABS)[number]["key"];

export default async function FinancePage({ searchParams }: PageProps<"/kurucu/finans">) {
  const sp = await searchParams;
  const today = toDateKey(new Date());
  const kind: PeriodKind = sp.donem === "hafta" ? "hafta" : "ay";
  const ref = isDateKey(sp.tarih) ? sp.tarih : today;
  const period = periodOf(kind, ref);
  const tab: Tab = TABS.some((t) => t.key === sp.sekme) ? (sp.sekme as Tab) : "odenecekler";

  const [summary, payables, outstanding, studentOptions] = await Promise.all([
    getFinanceSummary(period),
    getTutorPayables(period),
    getOutstandingBalances(),
    getStudentOptions(),
  ]);
  const { current, previous } = summary;
  const dueTotal = payables.reduce((s, p) => s + p.dueTotal, 0);
  const outstandingTotal = outstanding.reduce((s, o) => s + o.outstanding, 0);
  const prevWord = kind === "hafta" ? "geçen hafta" : "geçen ay";
  const delta = (cur: number, prev: number) => {
    const pct = changePct(cur, prev);
    return pct === null
      ? `${prevWord}: ${formatMoney(prev)}`
      : `${pct >= 0 ? "+" : ""}${pct}% (${prevWord})`;
  };
  const tabHref = (t: Tab) => {
    const q = new URLSearchParams({ sekme: t, donem: kind });
    if (ref !== today) q.set("tarih", ref);
    return `/kurucu/finans?${q}`;
  };

  return (
    <>
      <PageHeader
        title="Gelir-Gider"
        description="Para transferleri panel dışında yapılır; burada kayıt ve hesap tutulur."
        actions={
          <FormDialog
            title="Tahsilat kaydet"
            description="Öğrenciden/veliden alınan ödemeyi girin."
            action={recordPayment}
            trigger={
              <Button className="rounded-full">
                <PlusIcon className="size-4" /> Tahsilat kaydet
              </Button>
            }
          >
            <PaymentFields studentOptions={studentOptions} today={today} />
          </FormDialog>
        }
      />

      <div className="mb-5">
        <PeriodNav basePath="/kurucu/finans" period={period} today={today} extra={{ sekme: tab }} />
      </div>

      <HeroStats
        stats={[
          {
            label: "Gelir (tahsilat)",
            value: <MoneyText value={current.income} />,
            icon: ArrowDownLeftIcon,
            hint: delta(current.income, previous.income),
            compact: true,
          },
          {
            label: "Gider (eğitmen hakedişi)",
            value: <MoneyText value={current.expense} />,
            icon: ArrowUpRightIcon,
            hint: delta(current.expense, previous.expense),
            compact: true,
          },
          {
            label: "Net",
            value: <MoneyText value={current.net} />,
            icon: ScaleIcon,
            hint: delta(current.net, previous.net),
            compact: true,
            highlight: current.net < 0,
          },
          {
            label: "Yapılan ders",
            value: current.lessonCount,
            icon: BookOpenCheckIcon,
            hint: `${prevWord}: ${previous.lessonCount}`,
            compact: true,
            href: `/kurucu/dersler`,
          },
        ]}
      />

      <div className="mt-8 mb-4 flex gap-1 overflow-x-auto rounded-full border bg-card p-1 sm:w-fit">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={tabHref(t.key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition",
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {t.key === "odenecekler" && dueTotal > 0 && (
              <span className="ml-2 rounded-full bg-warning px-2 py-0.5 text-xs text-white">
                {formatMoney(dueTotal)}
              </span>
            )}
            {t.key === "bekleyen" && outstanding.length > 0 && (
              <span className="ml-2 rounded-full bg-warning px-2 py-0.5 text-xs text-white">
                {outstanding.length}
              </span>
            )}
          </Link>
        ))}
      </div>

      {tab === "odenecekler" && (
        <section>
          <SectionLabel>{periodLabel(period)} · tamamlanan derslere göre</SectionLabel>
          {payables.length === 0 ? (
            <EmptyState icon={WalletIcon} title="Bu dönemde tamamlanan ders yok" />
          ) : (
            <div className="grid gap-3">
              {payables.map((p) => (
                <Card key={p.tutorId}>
                  <CardContent className="grid gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 text-lg font-bold">
                          {p.fullName}
                          <Badge variant="secondary">
                            {p.payoutFrequency === "weekly" ? "Haftalık ödeme" : "Aylık ödeme"}
                          </Badge>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {p.lessonCount} ders · Toplam <MoneyText value={p.total} />
                        </p>
                        <p className="mt-1 font-mono text-xs text-muted-foreground select-all">
                          {p.iban ?? "IBAN girilmemiş"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Ödenecek</p>
                        <p
                          className={cn(
                            "font-heading text-2xl font-extrabold",
                            p.dueTotal > 0 ? "text-warning" : "text-success",
                          )}
                        >
                          <MoneyText value={p.dueTotal} />
                        </p>
                        {p.paidTotal > 0 && (
                          <p className="text-xs text-success">
                            Ödendi: <MoneyText value={p.paidTotal} />
                          </p>
                        )}
                      </div>
                    </div>

                    {p.dueCount > 0 ? (
                      <div className="flex justify-end">
                        <FormDialog
                          title={`${p.fullName} — ödeme`}
                          description={`${periodLabel(period)} dönemindeki ${p.dueCount} dersin ödemesi (${formatMoney(p.dueTotal)}). Havaleyi yaptıktan sonra kaydedin.`}
                          action={markTutorPaid.bind(null, p.tutorId, period.start, period.end)}
                          submitLabel="Ödendi olarak kaydet"
                          trigger={
                            <Button className="rounded-full bg-success hover:bg-success/90">
                              <CheckCircle2Icon className="size-4" /> Ödendi işaretle
                            </Button>
                          }
                        >
                          <div className="grid gap-4 sm:grid-cols-2">
                            <TextField
                              name="paid_at"
                              label="Ödeme tarihi"
                              type="date"
                              required
                              defaultValue={today}
                            />
                            <TextField name="note" label="Not" placeholder="ör. Havale dekont no" />
                          </div>
                        </FormDialog>
                      </div>
                    ) : (
                      <p className="flex items-center justify-end gap-1 text-sm font-semibold text-success">
                        <CheckCircle2Icon className="size-4" /> Bu dönemin ödemesi tamam
                      </p>
                    )}

                    {p.payouts.length > 0 && (
                      <ul className="divide-y rounded-xl bg-muted/50 px-3 text-sm">
                        {p.payouts.map((x) => (
                          <li key={x.id} className="flex items-center justify-between gap-2 py-2">
                            <span>
                              {formatDate(x.paid_at)} · {x.lesson_count} ders ·{" "}
                              <MoneyText value={x.amount} className="font-semibold" />
                              {x.note && <span className="text-muted-foreground"> · {x.note}</span>}
                              <span className="block text-xs text-muted-foreground">
                                Dönem: {formatDate(x.period_start)} –{" "}
                                {formatDate(addDays(x.period_end, -1))}
                              </span>
                            </span>
                            <ActionButton
                              size="sm"
                              variant="ghost"
                              action={undoTutorPayout.bind(null, x.id)}
                              confirmTitle="Ödeme kaydı geri alınsın mı?"
                              confirmText="Bu ödemeye bağlı dersler yeniden 'ödenecek' olur. Gerçek para iadesi panel dışında yapılır."
                              confirmLabel="Geri al"
                              destructive
                            >
                              <Undo2Icon className="size-4" /> Geri al
                            </ActionButton>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "tahsilat" && (
        <section>
          <SectionLabel>{periodLabel(period)} tahsilatları</SectionLabel>
          {summary.payments.length === 0 ? (
            <EmptyState icon={WalletIcon} title="Bu dönemde tahsilat kaydı yok" />
          ) : (
            <Card className="py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Öğrenci</TableHead>
                    <TableHead className="hidden sm:table-cell">Yöntem</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.payments.map((x) => (
                    <TableRow key={x.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(x.paidAt)}</TableCell>
                      <TableCell>
                        <Link
                          href={`/kurucu/ogrenciler/${x.studentId}`}
                          className="font-medium hover:underline"
                        >
                          {x.studentName}
                        </Link>
                        {x.note && <p className="text-xs text-muted-foreground">{x.note}</p>}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {PAYMENT_METHOD_LABELS[x.method]}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <MoneyText value={x.amount} />
                      </TableCell>
                      <TableCell>
                        <ActionButton
                          size="icon"
                          variant="ghost"
                          aria-label="Tahsilatı sil"
                          action={deletePayment.bind(null, x.id)}
                          confirmTitle="Tahsilat kaydı silinsin mi?"
                          confirmLabel="Sil"
                          destructive
                        >
                          <Trash2Icon className="size-4" />
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </section>
      )}

      {tab === "bekleyen" && (
        <section>
          <SectionLabel>
            Paket tutarı – ödenen (tüm zamanlar) · Toplam {formatMoney(outstandingTotal)}
          </SectionLabel>
          {outstanding.length === 0 ? (
            <EmptyState icon={CheckCircle2Icon} title="Bekleyen tahsilat yok" />
          ) : (
            <Card className="py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Öğrenci</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Paket toplamı</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Ödenen</TableHead>
                    <TableHead className="text-right">Bekleyen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstanding.map((o) => (
                    <TableRow key={o.studentId}>
                      <TableCell>
                        <Link
                          href={`/kurucu/ogrenciler/${o.studentId}`}
                          className="font-medium hover:underline"
                        >
                          {o.fullName}
                        </Link>
                        {o.phone && <p className="text-xs text-muted-foreground">{o.phone}</p>}
                      </TableCell>
                      <TableCell className="hidden text-right sm:table-cell">
                        <MoneyText value={o.billed} />
                      </TableCell>
                      <TableCell className="hidden text-right sm:table-cell">
                        <MoneyText value={o.paid} />
                      </TableCell>
                      <TableCell className="text-right font-bold text-warning">
                        <MoneyText value={o.outstanding} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </section>
      )}
    </>
  );
}
