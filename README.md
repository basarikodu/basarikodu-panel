# BaşarıKodu Panel

[basarikodu.com](https://basarikodu.com) özel ders & koçluk platformunun yönetim paneli.

Üç alan, tek uygulama:

| Panel | Kim | Ne yapar |
|---|---|---|
| **Kurucu** (`/kurucu`) | 3 kurucu | Eğitmen/öğrenci yönetimi, eşleştirme, tüm dersler, paket–tahsilat–hakediş, akademik & içerik (reels) takvimi, dashboard |
| **Eğitmen** (`/egitmen`) | Hocalar & koçlar | Haftalık ders planlama (takvim, tekrarlayan ders, sürükle-bırak), ders sonucu, öğrencilerim, hakedişlerim |
| **Öğrenci / Veli** (`/ogrenci`) | Öğrenciler ve veliler | Ders takvimi ve geçmişi, ödevler, paket durumu, sınav sayacı, çalışma araçları |

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
| [CLAUDE.md](CLAUDE.md) | Geliştirme kuralları (Claude Code için) |

## Geliştirme (Faz 0 sonrası geçerli olacak)
```bash
npm install
```
```bash
npx supabase start
```
```bash
npm run dev
```
