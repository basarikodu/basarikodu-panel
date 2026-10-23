# CLAUDE.md — BaşarıKodu Panel

Bu dosya Claude Code'un bu projede nasıl çalışacağını tanımlar. Önce `PLAN.md`'yi oku; hangi fazda olduğumuzu kontrol listelerinden anla.

## Proje
BaşarıKodu (online özel ders & koçluk) için 3 rollü panel: `founder` (kurucu), `tutor` (eğitmen), `student` (öğrenci/veli). Detaylar `docs/` altında.

## Çalışma şekli
- Faz faz ilerlenir. Her faz kendi branch'inde (`faz-N-kisa-ad`), sonunda "Bitti tanımı" sağlanır, `PLAN.md` kutucukları işaretlenir, commit atılır.
- Commit: Conventional Commits, Türkçe özet. Faz kapanışı: `feat(faz-N): ...`
- Faz kapanmadan önce: `npm run lint && npm run typecheck && npm test`.
- Kapsam dışı istekler `PLAN.md` → BACKLOG'a yazılır, sessizce eklenmez.

## Kod kuralları
- **Next.js 16** kullanılıyor: kod yazmadan önce `AGENTS.md` uyarısına uy, ilgili rehberi `node_modules/next/dist/docs/` içinden oku. `middleware` → `proxy.ts`; Cache Components açık (`new Date()`, cookies vb. dinamik veriler `<Suspense>` / `"use cache"` kurallarına tabi).
- Komutlar: `npm run dev`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- TypeScript strict; `any` yok. DB tipleri `src/types/database.ts`'den (`supabase gen types`).
- Okuma: Server Component + `features/<alan>/queries.ts`. Yazma: `features/<alan>/actions.ts` Server Action → zod → `requireRole()` → Supabase → `revalidatePath`.
- İş kuralları saf fonksiyon olarak `features/<alan>/rules.ts`'te ve unit test'li.
- **Güvenlik RLS'dedir.** Her yeni tablo RLS açık + politika ile gelir. `SUPABASE_SERVICE_ROLE_KEY` yalnızca sunucuda ve yalnızca kullanıcı oluşturma gibi admin işlerinde.
- Şema değişikliği yalnızca yeni migration dosyasıyla (`supabase/migrations/NNNN_ad.sql`); eski migration düzenlenmez.
- Zaman: DB'de `timestamptz` (UTC), arayüzde `Europe/Istanbul`, `lib/format.ts` yardımcıları. Hafta Pazartesi başlar.
- Para: `numeric(10,2)`, arayüzde `MoneyText` (`1.234,56 ₺`).
- UI: shadcn/ui + marka token'ları (`docs/05-TASARIM.md`). Yeni renk/font uydurma. Her ekranda boş/yükleniyor/hata durumu. Mobil öncelikli.
- Arayüz metinleri Türkçe; kod (değişken, fonksiyon, tablo) İngilizce; URL'ler Türkçe (`/kurucu/ogrenciler`).

## Alan sözlüğü
| Arayüz | Kod |
|---|---|
| Kurucu | founder |
| Eğitmen / Hoca / Koç | tutor |
| Öğrenci / Veli | student / guardian |
| Ders | lesson |
| Özel ders / Koçluk | `ozel_ders` / `kocluk` |
| Branş | subject |
| Eşleştirme | tutor_students |
| Paket / Ders hakkı | student_package / credit |
| Tahsilat | payment |
| Hakediş | tutor_payout |
| Akademik & içerik takvimi | calendar_events |
