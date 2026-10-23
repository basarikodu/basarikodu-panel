import { PencilIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import { FormDialog } from "@/components/shared/form-dialog";
import { SelectField, TextField } from "@/components/shared/form-fields";
import { MoneyText } from "@/components/shared/money-text";
import { PageHeader } from "@/components/shared/page-header";
import { SubjectChip } from "@/components/shared/subject-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSubject, updateSettings, updateSubject } from "@/features/settings/actions";
import { getSubjects } from "@/features/users/queries";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ayarlar" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const [{ data: settings }, subjects] = await Promise.all([
    supabase.from("app_settings").select("*").eq("id", 1).single(),
    getSubjects({ activeOnly: false }),
  ]);

  return (
    <>
      <PageHeader title="Ayarlar" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Eğitmen ders ücreti</CardTitle>
              <CardDescription>
                Tüm eğitmenler için aynıdır. Hediye koçluk için ödeme yapılmaz.
              </CardDescription>
            </div>
            {settings && (
              <FormDialog
                title="Ücret ve süreleri düzenle"
                description="Değişiklik yalnızca bundan sonra tamamlanan dersleri etkiler; geçmiş hakedişler değişmez."
                action={updateSettings}
                trigger={
                  <Button size="sm" variant="outline">
                    <PencilIcon className="size-4" /> Düzenle
                  </Button>
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    name="tutor_rate_private"
                    label="Özel ders başı (₺)"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    defaultValue={settings.tutor_rate_private}
                  />
                  <TextField
                    name="tutor_rate_coaching"
                    label="Ücretli koçluk başı (₺)"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    defaultValue={settings.tutor_rate_coaching}
                  />
                  <TextField
                    name="duration_private"
                    label="Özel ders süresi (dk)"
                    type="number"
                    min={15}
                    max={240}
                    required
                    defaultValue={settings.duration_private}
                  />
                  <TextField
                    name="duration_coaching"
                    label="Koçluk süresi (dk)"
                    type="number"
                    min={15}
                    max={240}
                    required
                    defaultValue={settings.duration_coaching}
                  />
                </div>
              </FormDialog>
            )}
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                Özel ders ({settings?.duration_private} dk)
              </p>
              <MoneyText
                value={settings?.tutor_rate_private}
                className="font-heading text-2xl font-bold"
              />
            </div>
            <div className="rounded-xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                Koçluk ({settings?.duration_coaching} dk)
              </p>
              <MoneyText
                value={settings?.tutor_rate_coaching}
                className="font-heading text-2xl font-bold"
              />
            </div>
            {settings && (
              <p className="text-xs text-muted-foreground sm:col-span-2">
                Son güncelleme: {formatDateTime(settings.updated_at)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Branşlar</CardTitle>
              <CardDescription>Takvimde dersler branş rengiyle gösterilir.</CardDescription>
            </div>
            <FormDialog
              title="Branş ekle"
              action={createSubject}
              trigger={
                <Button size="sm">
                  <PlusIcon className="size-4" /> Branş
                </Button>
              }
            >
              <SubjectFields />
            </FormDialog>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {subjects.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <SubjectChip name={s.name} color={s.color} />
                    {!s.is_active && <Badge variant="secondary">Pasif</Badge>}
                  </div>
                  <FormDialog
                    title="Branşı düzenle"
                    action={updateSubject.bind(null, s.id)}
                    trigger={
                      <Button size="icon" variant="ghost" aria-label={`${s.name} düzenle`}>
                        <PencilIcon className="size-4" />
                      </Button>
                    }
                  >
                    <SubjectFields defaults={s} />
                  </FormDialog>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function SubjectFields({
  defaults,
}: {
  defaults?: { name: string; color: string; is_active: boolean };
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
      <TextField name="name" label="Ad" required defaultValue={defaults?.name} />
      <TextField
        name="color"
        label="Renk"
        type="color"
        className="w-20"
        defaultValue={defaults?.color ?? "#1b2e6e"}
      />
      <SelectField
        name="is_active"
        label="Durum"
        defaultValue={defaults?.is_active === false ? "off" : "on"}
        options={[
          { value: "on", label: "Aktif" },
          { value: "off", label: "Pasif" },
        ]}
      />
    </div>
  );
}
