# PLAN — BaşarıKodu Panel

> Başlangıç: 26 Ekim 2026 (Pazartesi) · Hedef canlı tarih: **27 Kasım 2026** (~5 hafta, 23 iş günü)
> **Kullanılabilir MVP (eğitmen + öğrenci ders akışı): Faz 4 sonu ≈ 10 Kasım 2026**
> Tahminler: 1 geliştirici + Claude Code, günde ~6 saat odaklı çalışma. Kurucu geri bildirimi her faz sonunda 1 gün içinde verilirse geçerlidir.

## Çalışma kuralı
1. Her faz kendi branch'inde: `faz-0-kurulum`, `faz-1-auth`, …
2. Faz içinde mantıklı küçük commit'ler; faz sonunda **"Bitti tanımı"** kontrol listesi tamamlanır.
3. `npm run lint && npm run typecheck && npm test` yeşil olmadan faz kapanmaz.
4. Faz `main`'e merge edilir, Vercel'de canlıya/önizlemeye çıkar, kuruculara **demo** gösterilir.
5. Faz commit mesajı: `feat(faz-N): <özet>` — Conventional Commits.
6. Bu dosyadaki kutucuklar işaretlenerek ilerleme takip edilir.

## Zaman çizelgesi

| Faz | Kapsam | Süre | Tarih (tahmini) |
|---|---|---|---|
| 0 | Kurulum & tasarım sistemi | 1,5 gün | 26–27 Eki |
| 1 | Veritabanı, kimlik doğrulama, roller, iskelet | 2,5 gün | 27–29 Eki |
| 2 | Kurucu: eğitmen & öğrenci yönetimi, eşleştirme | 2,5 gün | 30 Eki–3 Kas |
| 3 | Ders motoru + Eğitmen paneli (haftalık planlama) | 4 gün | 3–6 Kas |
| 4 | Öğrenci / veli paneli | 2 gün | 9–10 Kas |
| 5 | Finans: paketler, tahsilat, hakediş | 3,5 gün | 11–16 Kas |
| 6 | Akademik & içerik takvimi | 2,5 gün | 16–18 Kas |
| 7 | Kurucu dashboard & raporlar | 1,5 gün | 19–20 Kas |
| 8 | Cila, güvenlik, test, canlıya çıkış | 3 gün | 23–27 Kas |
| **Toplam** | | **~23 iş günü** | |

> Hızlandırma seçeneği: Faz 6 (akademik takvim) Faz 3'ten bağımsızdır; ikinci bir kişi/oturum ile paralel yürütülürse toplam ~4 haftaya iner.

---

## Faz 0 — Kurulum & Tasarım Sistemi (1,5 gün)
**Amaç:** Üzerine hızla inşa edilecek sağlam temel.
- [ ] Next.js 15 + TypeScript (strict) + Tailwind v4 + ESLint + Prettier
- [ ] shadcn/ui kurulumu; marka token'ları (`05-TASARIM.md`), Plus Jakarta Sans + DM Sans, açık/koyu tema
- [ ] Temel bileşenler: Button, Input, Select, Dialog, Sheet, Table, Badge, Card, Tabs, Toast (sonner), Calendar/DatePicker
- [ ] Ortak bileşenler: `PageHeader`, `StatCard`, `EmptyState`, `StatusBadge`, `MoneyText`
- [ ] `lib/format.ts` (TL, tarih, saat — tr-TR, Europe/Istanbul) + unit testleri
- [ ] Vitest + Playwright kurulumu, `npm run typecheck` script'i
- [ ] Supabase projesi (staging) + local CLI, `.env.example`
- [ ] Vercel projesi, GitHub repo, önizleme deploy'u
- [ ] Logo & favicon
**Bitti tanımı:** Boş ama markalı bir "bileşen vitrini" sayfası Vercel'de açılıyor; lint/typecheck/test yeşil.
**Commit:** `feat(faz-0): proje iskeleti ve tasarım sistemi`

## Faz 1 — Veritabanı, Kimlik Doğrulama, Roller, İskelet (2,5 gün)
**Amaç:** Üç rolün güvenli şekilde kendi alanına girmesi.
- [ ] Migration 0001–0007 (`04-VERITABANI.md`): enum'lar, tüm tablolar, exclusion constraint'ler, trigger'lar
- [ ] RLS politikaları + hassas kolon view'ları
- [ ] JWT rol claim hook'u
- [ ] `supabase gen types` → `types/database.ts`
- [ ] Giriş sayfaları: `/giris`, `/kurucu/giris`, `/sifre-belirle`, şifremi unuttum
- [ ] `middleware.ts` rol yönlendirme; `requireRole()` yardımcısı
- [ ] 3 rol için layout: sidebar (masaüstü) + alt sekme (mobil), kullanıcı menüsü, çıkış
- [ ] Seed: 3 kurucu, 3 demo eğitmen, 5 demo öğrenci, branşlar, paket tipleri
- [ ] **RLS testleri:** her rol için "göremeyeceği veriyi göremiyor" senaryoları (SQL/Vitest)
**Bitti tanımı:** 3 demo hesapla giriş → doğru panel; yanlış URL'ye erişim engelleniyor; RLS testleri geçiyor.
**Commit:** `feat(faz-1): veritabanı şeması, auth ve rol bazlı iskelet`

## Faz 2 — Kurucu: Eğitmen & Öğrenci Yönetimi (2,5 gün)
- [ ] Eğitmenler: liste (arama, filtre), detay, ekle/düzenle formu (branşlar, hizmetler, ücretler, IBAN, toplantı linki), pasife al
- [ ] Öğrenciler: liste, detay, ekle/düzenle (sınıf, hedef, veli bilgisi, kurucu notu), pasife al
- [ ] **Davet akışı:** kullanıcı oluştur → davet e-postası (Supabase Auth, Türkçe şablon) → şifre belirleme
- [ ] **Eşleştirme:** öğrenci detayında "Eğitmen ata" (branş + hizmet), aktif/pasif eşleşmeler
- [ ] Ayarlar: branş listesi (renkli), ders tipi süreleri
- [ ] Audit log yazımı (kullanıcı & eşleştirme değişiklikleri)
**Bitti tanımı:** Kurucu gerçek bir eğitmen ve öğrenci ekleyip eşleştirebiliyor, davet e-postası ulaşıyor, eğitmen ilk girişini yapabiliyor.
**Commit:** `feat(faz-2): kurucu kullanıcı yönetimi ve eşleştirme`

## Faz 3 — Ders Motoru + Eğitmen Paneli (4 gün) ⭐ çekirdek
- [ ] `features/lessons`: şemalar, sorgular, actions, `rules.ts` (çakışma, durum geçişleri) + unit testler
- [ ] `CalendarView` (FullCalendar: hafta/gün/ay/liste, tr locale, Pazartesi başlangıç, 07:00–24:00, tema uyumlu)
- [ ] Eğitmen **Takvim:** boş slota tıkla → `LessonDialog` (atanmış öğrenci seçimi, branş, tip, saat, süre, link)
- [ ] **Tekrarlayan ders** (haftalık seri, X hafta) + seriyi/tek oturumu düzenle/iptal et
- [ ] **Sürükle-bırak** taşıma ve süre uzatma; çakışmada geri alma + açıklayıcı uyarı
- [ ] **"Geçen haftayı kopyala"**
- [ ] `LessonResultDialog`: Tamamlandı / Gelmedi / İptal / Ertelendi (+ yeni tarih) — konu, ödev, performans, notlar
- [ ] Eğitmen **Bugün** sayfası: bugünkü/yarınki dersler, "Derse Git", sonuç girilmemiş ders uyarısı
- [ ] **Öğrencilerim:** liste + detay (ders geçmişi, konu/ödev akışı, özel notlar)
- [ ] Kurucu **Dersler** sayfası: tüm dersler takvim + tablo, filtreler, düzenleme, CSV dışa aktarma
- [ ] Playwright: eğitmen ders oluşturur → taşır → tamamlar
**Bitti tanımı:** Eğitmen bir öğrencisine 4 haftalık plan çıkarabiliyor, dersleri sürükleyip taşıyabiliyor, sonuç girebiliyor; çakışmalar engelleniyor; kurucu tümünü görüyor.
**Commit:** `feat(faz-3): ders motoru ve eğitmen haftalık planlama`

## Faz 4 — Öğrenci / Veli Paneli (2 gün)
- [ ] Ana sayfa: sıradaki ders kartı + "Derse Katıl", bu haftanın dersleri, YKS/LGS geri sayımı (hedefe göre)
- [ ] Takvim (salt okunur, branş renkleri, durum ikonları)
- [ ] Ders geçmişi: liste + özet istatistikler (toplam, branş dağılımı grafiği, aylık sayı)
- [ ] Ödevler: liste, "yaptım" işaretleme
- [ ] Araçlar: Pomodoro, sınav sayacı, haftalık çalışma programı
- [ ] Profil: bilgiler, şifre değiştir, WhatsApp destek butonu
- [ ] Mobil görünüm ince ayarı (öğrenci ağırlıklı telefondan girecek)
**Bitti tanımı:** Demo öğrenci telefondan girip derslerini, geçmişini ve ödevlerini görebiliyor.
**Commit:** `feat(faz-4): öğrenci ve veli paneli`
> 🎯 **MVP kilometre taşı:** Bu noktada eğitmen + öğrenci ders akışı gerçek kullanıcılarla pilot olarak başlatılabilir (2–3 eğitmen).

## Faz 5 — Finans (3,5 gün)
- [ ] Paket tipleri yönetimi (seed: Tek Ders 950, Haftada 2 = 6.800, Haftada 3 = 9.600, Koçluk)
- [ ] Öğrenciye paket tanımlama; **ders hakkı otomatik düşümü** (trigger) + kalan hak göstergesi (kurucu, eğitmen, öğrenci)
- [ ] Hediye koçluk kuralı (Haftada 2+ paketinde koçluk dersleri `is_free`)
- [ ] Tahsilatlar: ödeme kaydı formu, öğrenci bazında bakiye (paket tutarı − ödenen), gecikmiş vurgusu
- [ ] Hakedişler: ay seçimi → eğitmen başına otomatik hesap (snapshot ücretler), düzeltme kalemi, "Ödendi" kapatma, dönem kilidi
- [ ] Eğitmen **Hakedişlerim** sayfası; öğrenci **Ödemeler** sayfası (salt okunur)
- [ ] Aylık finans özeti (gelir / eğitmen gideri / brüt kâr) + CSV
- [ ] Unit test: hak düşümü, hakediş hesabı, kilit kuralları
**Bitti tanımı:** Bir aylık gerçek senaryo (paket → dersler → ödeme → hakediş) uçtan uca doğru hesaplanıyor.
**Commit:** `feat(faz-5): paket, tahsilat ve hakediş yönetimi`

## Faz 6 — Akademik & İçerik Takvimi (2,5 gün)
- [ ] `calendar_events` CRUD; ay/hafta/liste görünümü; kategori filtreleri ve renkleri
- [ ] **Sürükle-bırak** ile tarih değiştirme
- [ ] İçerik kartı: tür, durum hattı (Fikir → … → Yayınlandı), sorumlu kurucu, platform, senaryo, yayın linki
- [ ] **Haftalık ritim şablonu:** seçilen aralığa Sal/Per/Cmt boş reels kartları üret (günler ayarlanabilir)
- [ ] İçerik **pano görünümü** (durum sütunları — kanban) — hangi video hangi aşamada
- [ ] Seed: 2026–27 MEB takvimi, YKS/LGS (tahmini), yazılı dönemleri
- [ ] `is_tentative` gösterimi; `visible_to_students` olayların öğrenci takvimine ve geri sayıma yansıması
**Bitti tanımı:** Kurucular yıl boyu reels planını takvimde görüp sürükleyerek yeniden planlayabiliyor; sınav tarihleri öğrenci panelinde görünüyor.
**Commit:** `feat(faz-6): akademik ve içerik takvimi`

## Faz 7 — Kurucu Dashboard & Raporlar (1,5 gün)
- [ ] KPI kartları: haftalık/aylık ders, aktif öğrenci/eğitmen, tahsilat, bekleyen, ödenecek hakediş
- [ ] Grafikler: haftalık ders trendi, branş dağılımı, aylık gelir-gider
- [ ] Uyarılar: paketi bitmek üzere olanlar, gecikmiş ödemeler, sonucu girilmemiş dersler
- [ ] Bu haftanın içerik planı + yaklaşan sınavlar
- [ ] Eğitmen performans tablosu (ders sayısı, iptal oranı, öğrenci sayısı)
**Commit:** `feat(faz-7): kurucu dashboard ve raporlar`

## Faz 8 — Cila, Güvenlik, Test, Canlıya Çıkış (3 gün)
- [ ] RLS ve yetki denetimi (Supabase advisors + manuel senaryo listesi)
- [ ] Playwright kritik akışlar (3 rol), mobil viewport testleri
- [ ] Erişilebilirlik (klavye, kontrast), boş/hata/yükleniyor durumları
- [ ] Performans: sorgu indeksleri, sayfa yükleme ölçümü
- [ ] KVKK: aydınlatma metni linki, veri minimizasyonu kontrolü
- [ ] Production Supabase + `panel.basarikodu.com` alan adı, SMTP (davet e-postaları için özel gönderici)
- [ ] Günlük yedekleme doğrulama, hata izleme (Vercel logs)
- [ ] Gerçek veri girişi: 14 eğitmen, mevcut öğrenciler, aktif paketler
- [ ] Kısa kullanım kılavuzları: `docs/kilavuz-egitmen.md`, `docs/kilavuz-ogrenci.md`
**Bitti tanımı:** Canlı ortamda tüm eğitmen ve öğrenciler hesaplarıyla giriş yapmış durumda.
**Commit:** `chore(faz-8): canlıya çıkış` → `v1.0.0` etiketi

---

## Riskler
| Risk | Etki | Önlem |
|---|---|---|
| Kurucu geri bildirimlerinin gecikmesi | Takvim kayar | Her faz sonunda 15 dk demo, aynı gün yazılı onay |
| Ders hakkı/hakediş kurallarında belirsizlik | Yanlış finans verisi | Faz 5 öncesi Açık Sorular netleşmeli |
| Davet e-postalarının spam'e düşmesi | Kullanıcı giriş yapamaz | Canlıda özel SMTP (Resend/SES) + SPF/DKIM |
| Takvimde saat dilimi hataları | Yanlış ders saati | Tüm testler Europe/Istanbul; DB'de UTC |
| Kapsam genişlemesi | Gecikme | Yeni istekler `BACKLOG` bölümüne, faz bitince değerlendirilir |

## Açık sorular (Faz 5'ten önce netleşmeli)
1. **Öğrenci gelmedi** durumunda ders hakkı yanar mı? (Varsayılan: yanar)
2. Eğitmen ücretleri eğitmene göre mi değişiyor, yoksa sabit mi? Koçluk ücreti farklı mı?
3. Hediye koçluk dersleri için eğitmene ücret ödeniyor mu?
4. Eğitmen ödeme dönemi aylık mı (ayın 1'i–sonu)? Ödeme günü?
5. Velinin ayrı hesabı gerekecek mi, yoksa öğrenci hesabını ortak kullanmaları yeterli mi? (Varsayılan: ortak)
6. Eğitmen, kurucu onayı olmadan ders iptal/erteleme yapabilmeli mi? (Varsayılan: evet, loglanır)
7. Hangi e-posta adresinden davet gönderilecek (ör. `panel@basarikodu.com`)?

## BACKLOG (v1 sonrası)
- Siteden gelen ön görüşme formlarının panele düşmesi (lead takibi) — **öneri: v1.1'in ilk işi**
- Aylık veli ilerleme raporu (PDF)
- E-posta/WhatsApp ders hatırlatmaları
- Online ödeme, Zoom/Meet otomatik link, Google Calendar senkronu
- Ayrı veli hesabı, mesajlaşma
- Yapay zekâ destekli içerik fikirleri ve öğrenci analizi
