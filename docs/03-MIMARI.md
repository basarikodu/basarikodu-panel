# 03 · Teknik Mimari

## 1. Teknoloji seçimi

| Katman | Seçim | Neden |
|---|---|---|
| Framework | **Next.js 16 (App Router, Cache Components) + TypeScript** | Mevcut site de Next.js; tek kod tabanında 3 panel; Server Actions ile ayrı API yazmaya gerek yok |
| UI | **Tailwind CSS v4 + shadcn/ui** (Radix) | Hızlı, erişilebilir, profesyonel bileşenler; marka renklerine kolay uyarlanır |
| İkonlar | lucide-react | shadcn ile uyumlu |
| Veritabanı + Auth | **Supabase** (PostgreSQL, Auth, Row Level Security) | Hazır kimlik doğrulama + davet e-postası, rol bazlı güvenlik DB'de, ücretsiz başlangıç planı, yönetilen yedekleme |
| Takvim | **Kendi `WeekCalendar` bileşenimiz** | v1'de sürükle-bırak yok; markaya tam uyum, mobilde gün listesi, ek bağımlılık yok |
| Formlar | react-hook-form + zod | Tek şema hem istemci hem sunucu doğrulaması |
| Tablolar | TanStack Table (shadcn data-table) | Sıralama, filtre, sayfalama |
| Grafikler | Recharts (shadcn charts) | Dashboard grafikleri |
| Tarih | date-fns + date-fns-tz (`tr` locale) | Europe/Istanbul hesapları |
| Bildirim (UI) | sonner | Toast mesajları |
| Test | Vitest (iş kuralları) + Playwright (kritik akışlar) | |
| Barındırma | **Vercel** | Next.js için sıfır ayar, önizleme ortamları |
| Alan adı | `panel.basarikodu.com` | Ana siteden bağımsız deploy |

**Bilinçli olarak YOK:** ayrı backend servisi, ORM katmanı (Supabase client + üretilmiş TS tipleri yeterli), global state kütüphanesi (Server Components + URL state yeterli), ödeme/Zoom/WhatsApp entegrasyonları.

## 2. Uygulama yapısı

```
src/
  app/
    (auth)/
      giris/                  # Eğitmen & öğrenci girişi
      kurucu/giris/           # Kurucu girişi
      sifre-belirle/          # Davet linki → şifre oluşturma
    kurucu/                   # role = founder
      page.tsx                # Dashboard
      egitmenler/ ogrenciler/ dersler/
      finans/ (paketler, tahsilatlar, hakedisler)
      takvim/                 # Akademik & içerik takvimi
      ayarlar/
    egitmen/                  # role = tutor
      page.tsx  takvim/  ogrencilerim/  hakedislerim/
    ogrenci/                  # role = student
      page.tsx  takvim/  dersler/  odevler/  araclar/  odemeler/  profil/
  components/
    ui/                       # shadcn bileşenleri
    calendar/                 # WeekCalendar, WeekNav
    layout/                   # Sidebar, topbar, mobil menü (rol bazlı)
    shared/                   # StatCard, EmptyState, StatusBadge, MoneyText...
  features/                   # Alan bazlı modüller
    lessons/   (actions.ts, queries.ts, schemas.ts, rules.ts)
    users/  finance/  academic-calendar/  packages/
  lib/
    supabase/ (server.ts, client.ts, middleware.ts)
    auth.ts                   # getCurrentUser(), requireRole()
    format.ts                 # TL, tarih, saat formatları
    constants.ts
  types/database.ts           # supabase gen types çıktısı
proxy.ts                      # (Next 16: eski adıyla middleware) oturum yenileme + rol yönlendirme
supabase/
  migrations/                 # SQL migration dosyaları (versiyonlu)
  seed.sql                    # Branşlar, paketler, 2026-27 akademik takvim, demo veri
```

### Katman kuralı
- **Okuma:** Server Component içinde `features/*/queries.ts` fonksiyonları.
- **Yazma:** `features/*/actions.ts` içindeki Server Action'lar → zod doğrulama → `requireRole()` → Supabase → `revalidatePath`.
- **İş kuralları** (çakışma kontrolü, ders hakkı düşümü, hakediş hesabı) saf fonksiyonlar olarak `rules.ts` içinde, unit test edilir. Kritik olanlar ayrıca DB trigger/constraint ile garanti altına alınır.

## 3. Kimlik doğrulama ve yetkilendirme
- Supabase Auth (e-posta + şifre). Public sign-up **kapalı**.
- Kurucu yeni kullanıcı ekler → sunucu tarafında `service_role` ile `auth.admin.inviteUserByEmail` → kullanıcı `/sifre-belirle` sayfasında şifresini oluşturur.
- Davet ve şifre sıfırlama e-postaları **`panel@basarikodu.com`** adresinden gider: Supabase Auth → özel SMTP (Resend), `basarikodu.com` için SPF/DKIM DNS kayıtları, Türkçe e-posta şablonları.
- Rol bilgisi `profiles.role` tablosunda; JWT custom claim (Auth Hook) ile token'a da yazılır → RLS politikaları hızlı çalışır.
- `src/proxy.ts`: oturumsuz → giriş sayfasına; `/kurucu/*` yalnızca founder, `/egitmen/*` yalnızca tutor, `/ogrenci/*` yalnızca student.
- **Asıl güvenlik RLS'dedir**; proxy sadece yönlendirme kolaylığıdır.
- `service_role` anahtarı yalnızca sunucuda, yalnızca kullanıcı oluşturma işlemlerinde kullanılır.

## 4. Kritik iş kuralları
1. **Çakışma:** Aynı eğitmenin veya aynı öğrencinin `planned` durumdaki dersleri zaman aralığı olarak çakışamaz → PostgreSQL `EXCLUDE USING gist (tutor_id WITH =, tstzrange(starts_at, ends_at) WITH &&)` kısıtı + UI'da önceden uyarı.
2. **Eğitmen yalnızca atanmış öğrencisine ders açabilir** → RLS `insert` politikası `tutor_students` tablosunu kontrol eder.
3. **Ders hakkı — öğrencinin hakkı asla yanmaz:** Kurucu her ay öğrenciye paket (4/8/12/özel ders) tanımlar; kalan hak = toplam paket dersleri − tamamlanan dersler (view ile hesaplanır, devreden hak otomatik). Hak **yalnızca `completed`** derste düşer. `no_show` (öğrenci gelmedi), `cancelled_*` ve `postponed` hak düşürmez; öğrenci eğitmenle görüşüp dersi ileri bir tarihe erteler. Koçluk dersleri `is_free=true` ise hak düşürmez.
4. **Hakediş:** Bir dönemin hakedişi = o dönemde **yalnızca `completed`** derslerin `tutor_rate_snapshot` toplamı + düzeltme kalemleri. Yapılmayan (gelmedi/iptal/ertelendi) ders için eğitmene ödeme yok. Ücret ders anında **snapshot** alınır → sonradan ücret değişse de geçmiş bozulmaz.
4b. **Panel para hareketi yapmaz.** Öğrenci tahsilatları ve eğitmen ödemeleri kurucular tarafından manuel (havale vb.) yapılır; panel yalnızca **kime ne kadar ödenecek / kimden ne kadar alınacak** hesabını gösterir ve "ödendi" kaydını tutar. Gelir-gider ve ders sayıları **haftalık ve aylık** görüntülenebilir.
5. **Kilit:** Hakedişi "ödendi" olarak kapatılmış dönemdeki dersler eğitmen tarafından değiştirilemez (sadece kurucu).
6. **Tekrarlayan dersler:** Seri `lesson_series` tablosunda tutulur, oturumlar gerçek `lessons` satırları olarak üretilir (en fazla 16 hafta ileriye) → raporlama basit kalır, tek oturum bağımsız düzenlenebilir.
7. **Zaman:** Tüm zamanlar DB'de `timestamptz` (UTC), arayüzde Europe/Istanbul.
8. **Kurucu onayı:** Eğitmenin yeni ders/seri oluşturması `lessons.approval_status = 'pending'` olarak kaydedilir; eğitmenin erteleme ve iptal işlemleri dersi değiştirmez, `lesson_change_requests` tablosuna talep yazar. Kurucu onayında talep tek bir DB fonksiyonu (`approve_lesson_request`) ile atomik uygulanır. `pending` dersler çakışma kontrolüne dahildir (aynı saat iki kez talep edilemez), öğrenciye gösterilmez. Kurucu işlemleri doğrudan `approved`.
9. **Eğitmen ücreti tektir:** `app_settings` tablosundaki özel ders ve koçluk ücreti tüm eğitmenlere uygulanır; ders onaylandığında snapshot alınır.

## 5. Ortamlar
| Ortam | Kullanım |
|---|---|
| Local | `supabase start` (Docker) + `next dev` |
| Preview | Her PR/branch için Vercel önizleme + Supabase staging projesi |
| Production | `main` branch → Vercel prod + Supabase prod |

Gizli değişkenler: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (sadece sunucu), `NEXT_PUBLIC_SITE_URL`. `.env.local` git'e girmez; `.env.example` girer.

## 6. Mimari karar kaydı (ADR özet)
| # | Karar | Alternatif | Gerekçe |
|---|---|---|---|
| 1 | Tek Next.js uygulaması, 3 rol alanı | 3 ayrı uygulama | Ortak bileşen/tip, tek deploy, hız |
| 2 | Supabase | Firebase, kendi Postgres + NextAuth | İlişkisel veri (finans/ders) için Postgres şart; RLS ile güvenlik DB'de; auth hazır |
| 3 | Veli = öğrenci hesabı | Ayrı veli rolü | Brifing "öğrenci/veli girişi" diyor; MVP'yi sadeleştirir, şema ileride `guardian` rolüne açık |
| 4 | Eşleştirme kurucuda, eğitmen atanmış öğrenciden seçer | Eğitmen tüm öğrencileri seçer | İş modeli kurucu eşleştirmesine dayanıyor; veri gizliliği |
| 5 | Manuel ödeme kaydı | Online ödeme | Brifing: entegrasyon yok; ödeme yöntemleri ön görüşmede belirleniyor |
| 6 | Tekrarlayan dersler gerçek satır | RRULE ile sanal üretim | Raporlama, hak düşümü ve hakediş hesabı basit ve doğru |
| 7 | Kendi haftalık takvim bileşenimiz (Faz 3'te revize) | FullCalendar | v1 kapsamında sürükle-bırak çıkarıldı; tasarım referansına birebir uyum ve daha hafif |
| 8 | Eğitmen ders işlemleri kurucu onayına bağlı | Eğitmen serbest | Kurucu kararı: ders planı ve iptaller merkezi kontrol altında |
| 9 | Tek eğitmen ücreti (`app_settings`) | Eğitmen başına ücret | Kurucu kararı: tüm eğitmenlere aynı ücret |
| 10 | Next 16 Cache Components kapalı | Açık + Suspense/`use cache: private` | Tüm sayfalar kullanıcıya özel; klasik dinamik render daha basit ve hızlı geliştirilir |
| 11 | Rol `profiles` tablosundan okunur (JWT hook yok) | Custom access token hook | Dashboard ayarı gerektirmez; `private.is_founder()` STABLE fonksiyonu yeterince hızlı |
| 12 | Profil satırlarını sunucu (service role) oluşturur, auth trigger yok | `handle_new_user` trigger | Rolün kullanıcı metadata'sından sızdırılmasını önler |
