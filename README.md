# BaşarıKodu Panel

[basarikodu.com](https://basarikodu.com) özel ders & koçluk platformunun yönetim paneli.

Üç alan, tek uygulama:

| Panel | Kim | Ne yapar |
|---|---|---|
| **Kurucu** (`/kurucu`) | 3 kurucu | Eğitmen/öğrenci yönetimi ve atama, ders onayları, tüm dersler, haftalık/aylık gelir-gider ve eğitmen ödenecekleri |
| **Eğitmen** (`/egitmen`) | Hocalar & koçlar | Haftalık ders planlama (tekrarlayan ders, erteleme/iptal talebi — kurucu onaylı), ders sonucu, öğrencilerim |
| **Öğrenci / Veli** (`/ogrenci`) | Öğrenciler ve veliler | Haftalık ders takvimi, ders geçmişi |

> Bu, **v1 (sade sürüm)** kapsamıdır. Akademik & içerik takvimi, paket takibi ve diğer eklentiler için [PLAN.md](PLAN.md) → "v1 sonrası".

**Teknoloji:** Next.js 15 · TypeScript · Tailwind + shadcn/ui · Supabase (Postgres, Auth, RLS) · FullCalendar · Vercel

## Dokümanlar
| Dosya | İçerik |
|---|---|
| [PLAN.md](PLAN.md) | Fazlar, süre, kontrol listeleri, riskler, açık sorular |
| [docs/01-PROJE-ANALIZI.md](docs/01-PROJE-ANALIZI.md) | Site & Instagram incelemesi, iş modeli, paketler, marka, akademik takvim |
| [docs/02-GEREKSINIMLER.md](docs/02-GEREKSINIMLER.md) | Rol bazlı özellikler (PRD) |
| [docs/03-MIMARI.md](docs/03-MIMARI.md) | Teknoloji, klasör yapısı, auth, iş kuralları, kararlar |
| [docs/04-VERITABANI.md](docs/04-VERITABANI.md) | Şema, trigger'lar, RLS matrisi |
| [docs/05-TASARIM.md](docs/05-TASARIM.md) | Renkler, fontlar, ekranlar, bileşenler |
| [docs/06-CANLIYA-CIKIS.md](docs/06-CANLIYA-CIKIS.md) | Canlıya çıkış adımları ve kontrol listesi |
| [docs/kilavuz-kurucu.md](docs/kilavuz-kurucu.md) · [eğitmen](docs/kilavuz-egitmen.md) · [öğrenci](docs/kilavuz-ogrenci.md) | Kullanım kılavuzları |
| [CLAUDE.md](CLAUDE.md) | Geliştirme kuralları (Claude Code için) |

## Geliştirme
```bash
npm install
```
`.env.example` dosyasını `.env.local` olarak kopyalayıp Supabase anahtarlarını girin, sonra:

```bash
npm run dev
```

Testler: `npm test` (birim) · `npm run e2e` (uçtan uca, `.env.e2e.local` gerekir) · `supabase/tests/rls_test.sql` (yetki)
