# PLAN — BaşarıKodu Panel v1

> **v1 = sade sürüm.** Eğitmen ders planlar → kurucu onaylar → öğrenci haftalık takvimde görür; kurucular eğitmen/öğrenci, dersler ve gelir-gider/ödenecekleri takip eder. Kapsam: [docs/02-GEREKSINIMLER.md](docs/02-GEREKSINIMLER.md)
>
> **Takvim tarihi yok — olabilecek en hızlı sürede.** Fazlar beklemeden arka arkaya yapılır; bir faz biter, commit edilir, hemen sonrakine geçilir. Pilot kullanım Faz 4 sonunda, canlı Faz 6 sonunda.
> Kurucu demosu fazları durdurmaz: geri bildirimler bir sonraki faz sürerken uygulanır.

## Çalışma kuralı
1. Her faz kendi branch'inde (`faz-N-kisa-ad`); sonunda "Bitti tanımı" sağlanır, buradaki kutucuklar işaretlenir.
2. `npm run lint && npm run typecheck && npm test` yeşil olmadan faz kapanmaz.
3. Faz `main`'e merge edilir → Vercel'e çıkar → kuruculara kısa demo.
4. Commit: `feat(faz-N): <özet>` (Conventional Commits).
5. v1 kapsamı dışındaki istekler aşağıdaki **v1 sonrası** listesine yazılır.

## Faz sırası

| Faz | Kapsam | Durum |
|---|---|---|
| 0 | Kurulum & tasarım temeli | ✅ (GitHub/Vercel/Supabase hesapları bekliyor) |
| 1 | Veritabanı, giriş, roller, panel iskeletleri | ✅ |
| 2 | Kurucu: eğitmen & öğrenci yönetimi, atama, **aylık paket / ders hakkı** | ✅ |
| 3 | Eğitmen ders planlama + kurucu onay akışı | ✅ |
| 4 | Öğrenci / veli paneli (ders hakkı kartı dahil) → **pilot** | ✅ |
| 5 | Kurucu: dersler, gelir-gider, ödenecekler, genel bakış | ✅ |
| 6 | Test, cila, canlıya çıkış → **canlı** | ⏳ |

## Sizden gerekenler (beklemeye yol açmaması için erkenden)
- **Faz 1:** Supabase hesabı/organizasyonu (ücretsiz plan yeterli) — projeyi oluşturmam için onay
- **Faz 0–1:** GitHub reposu ve Vercel projesi (önizleme için) — hesap onayı
- **Faz 2:** Gerçek eğitmen ve öğrenci listesi (ad, e-posta, telefon, branş, atamalar, bu ayki paketler)
- **Faz 6:** `basarikodu.com` DNS paneline erişim (`panel.` alt alanı ve `panel@basarikodu.com` e-posta kayıtları)

---

## Faz 0 — Kurulum & Tasarım Temeli (1 gün)
- [x] Next.js 16 + TypeScript (strict) + Tailwind v4 + ESLint/Prettier
- [x] shadcn/ui + marka renkleri ve fontları ([05-TASARIM.md](docs/05-TASARIM.md)), yalnızca açık tema
- [x] Ortak bileşenler: `Logo`, `PageHeader`, `StatCard`, `StatusBadge`, `MoneyText`, `EmptyState`
- [x] `lib/format.ts` (TL, tarih, saat — tr-TR, Europe/Istanbul) + testleri
- [x] Vitest kurulumu; `.env.example`
- [x] Supabase projesi bağlandı (`kovudcedviefphsesxby`)
- [ ] GitHub repo + Vercel önizleme deploy'u → hesaplar bağlanınca
**Bitti:** Markalı boş uygulama Vercel'de açılıyor; lint/typecheck/test yeşil.
**Commit:** `feat(faz-0): proje iskeleti ve tasarım temeli`

## Faz 1 — Veritabanı, Giriş, Roller, İskelet (2 gün)
- [x] Migration'lar: profiles, tutors, students, subjects, tutor_students, lesson_series, lessons, lesson_change_requests, student_packages + student_credit_balance view, payments, tutor_payouts, app_settings ([04-VERITABANI.md](docs/04-VERITABANI.md) — v1 tabloları)
- [x] Çakışma kısıtları, onay trigger'ı (eğitmen dersi zorla `pending`), ücret snapshot
- [x] RLS politikaları (rol profiles tablosundan, `private.*` yardımcıları); `supabase gen types`
- [x] Giriş sayfaları: `/giris`, `/kurucu/giris`, `/sifre-belirle`, şifremi unuttum
- [x] Rol bazlı yönlendirme (`src/proxy.ts`, `requireRole()`)
- [x] 3 panel için iskelet: sidebar (masaüstü) + alt menü (mobil), çıkış
- [x] Seed: demo kurucu, 2 eğitmen, 3 öğrenci, branşlar, demo ücret (hesaplar: `supabase/demo-hesaplar.local.md`, canlıdan önce silinecek)
- [x] RLS testleri: `supabase/tests/rls_test.sql` — 27/27 geçti
**Bitti:** 3 demo hesapla giriş → doğru panel; yetkisiz erişim engelleniyor.
**Commit:** `feat(faz-1): veritabanı, giriş ve rol bazlı iskelet`

## Faz 2 — Kurucu: Eğitmen & Öğrenci Yönetimi + Aylık Paket (2 gün)
- [x] Eğitmenler: liste, ekle/düzenle (branşlar, üniversite/bölüm, IBAN), pasife al, detay
- [x] Öğrenciler: liste, ekle/düzenle (sınıf, hedef, veli bilgisi, not), pasife al, detay
- [x] Hesap açma: **geçici şifre** (WhatsApp ile iletilir, Profil'den değiştirilir) + şifre sıfırlama. E-posta daveti Faz 6'da SMTP ile
- [x] **Eğitmen atama:** öğrenci detayında branş bazında eğitmen ata / kaldır
- [x] **Aylık paket:** öğrenciye ay için paket tanımla (4 / 8 / 12 / özel ders, tutar, not); "önceki aydan devam ettir" toplu oluşturma
- [x] **Ders hakkı gösterimi:** öğrenci listesinde ve detayında bu ay paket / tamamlanan / devreden / **kalan hak**; ay ay ders sayısı
- [x] Testler: kalan hak hesabı (yalnızca tamamlanan, hediye koçluk hariç, devir)
- [x] Ayarlar: ortak eğitmen ücreti, branşlar, ders süreleri
**Bitti:** Kurucu eğitmen ve öğrenci ekleyip atama ve aylık paket tanımlayabiliyor; kalan hak doğru görünüyor; davet edilen kullanıcı giriş yapabiliyor.
**Commit:** `feat(faz-2): eğitmen/öğrenci yönetimi, atama ve aylık paket`

## Faz 3 — Eğitmen Ders Planlama + Kurucu Onayı (3,5 gün) ⭐ çekirdek
- [x] Haftalık takvim bileşeni (kendi bileşenimiz: saat ızgaralı hafta görünümü, mobilde gün seçici + liste, Pazartesi başlangıç)
- [x] **Ders planla** formu: atanmış öğrenci, branş, tip, tarih, saat, toplantı linki; **her hafta tekrarla** (X hafta)
- [x] **Ertele / İptal et** talebi (açıklama ile)
- [x] Onay durumları takvimde: "Onay bekliyor" (kesikli), "Değişiklik onay bekliyor", reddedildi + sebep
- [x] Çakışma kontrolü (eğitmen ve öğrenci için) — anlaşılır uyarı
- [x] **Ders sonucu:** Tamamlandı / Öğrenci gelmedi + kısa not
- [x] **Öğrencilerim:** liste (kalan ders hakkı dahil, tutar yok) + öğrenci detayı (o öğrenciyle yapılan dersler); hakkı biten öğrenciye planlarken uyarı
- [x] Kurucu **Onay Bekleyenler:** liste, Onayla / Reddet (sebep), seriye toplu onay, menüde sayaç
- [x] İş kuralı testleri: çakışma, onay uygulama, yalnızca onaylı dersin öğrenciye görünmesi
**Bitti:** Eğitmen bir öğrencisine haftalık tekrarlı ders planlıyor → kurucu onaylıyor → eğitmen erteleme istiyor → kurucu onaylıyor → eğitmen dersi tamamlıyor.
**Commit:** `feat(faz-3): ders planlama ve kurucu onay akışı`

## Faz 4 — Öğrenci / Veli Paneli (1,5 gün)
- [x] **Ders hakkı kartı:** "Kasım paketi: 8 ders · 5 tamamlandı · Kalan hakkın: 4" + ilerleme çubuğu, devreden hak
- [x] Ana ekran: sıradaki ders kartı (**Derse Katıl**) + haftalık takvim (yalnızca onaylı dersler)
- [x] Ders geçmişi: tarih, eğitmen, branş, durum, eğitmen notu; ay ay özet (paket, alınan ders, hangi dersler)
- [x] Profil: bilgiler, şifre değiştir, WhatsApp destek butonu
- [x] Mobil görünüm kontrolü
**Bitti:** Demo öğrenci telefondan girip haftalık derslerini ve geçmişini görüyor.
**Commit:** `feat(faz-4): öğrenci ve veli paneli`
> 🎯 **Pilot:** Bu noktada 2–3 eğitmen ve öğrencileriyle gerçek kullanım başlatılabilir.

## Faz 5 — Kurucu: Dersler, Gelir-Gider, Ödenecekler (2,5 gün)
- [x] **Dersler:** tüm dersler liste + haftalık takvim; filtre (tarih, eğitmen, öğrenci, durum); kurucu doğrudan ekle/düzenle/iptal
- [x] **Gelir:** öğrenci ödemesi kaydı (öğrenci, tutar, tarih, yöntem, not); öğrenci detayında ödemeler; paket tutarı vs. ödenen → bekleyen tahsilat
- [x] **Ödenecekler:** hafta / ay seçimi → eğitmen başına tamamlanan ders × ortak ücret, IBAN, "Ödendi" işaretleme (hediye koçluk 0 TL)
- [x] **Gelir-Gider özeti:** hafta ↔ ay; gelir, gider, net
- [x] **Genel Bakış:** ders sayısı (yapılan/planlanan), gelir/gider/net, aktif eğitmen/öğrenci, onay bekleyen sayısı
- [x] Testler: hakediş hesabı (yalnızca tamamlanan dersler, hediye koçluk 0), hafta/ay sınırları
**Bitti:** Bir haftalık gerçekçi senaryoda kurucular kime ne kadar ödeyeceklerini ve gelir-gideri doğru görüyor.
**Commit:** `feat(faz-5): dersler, gelir-gider ve ödenecekler`

## Faz 6 — Test, Cila, Canlıya Çıkış (2 gün)
- [ ] Uçtan uca test (Playwright): planla → onayla → öğrenci görür → tamamla → ödenecekler
- [ ] RLS / yetki kontrolü (Supabase advisors), mobil kontrol, boş/hata durumları
- [ ] Production Supabase + `panel.basarikodu.com`
- [ ] Davet e-postaları `panel@basarikodu.com`: Resend SMTP + SPF/DKIM DNS kayıtları (**basarikodu.com DNS erişimi gerekli**)
- [ ] Gerçek veri girişi: eğitmenler, öğrenciler, atamalar
- [ ] Kısa kullanım notları (eğitmen ve öğrenci için 1'er sayfa)
**Bitti:** Tüm eğitmen ve öğrenciler canlı panele giriş yapmış durumda.
**Commit:** `chore(faz-6): canlıya çıkış` → `v1.0.0`

---

## Netleşen kararlar (23 Eki 2026)
- İlk sürüm **sade**: ders planlama–onay akışı + kurucu takibi. Ekstralar v1 sonrasına.
- Öğrenci–eğitmen atamasını kurucular yapar; eğitmen yalnızca atanan öğrencileri görür ve ders planlar.
- Eğitmenin ders oluşturma, erteleme ve iptali **kurucu onayına** bağlı; eğitmende "Onay bekliyor" yazar.
- Ders sonucu (Tamamlandı / Öğrenci gelmedi) onaysız kaydedilir; kurucular düzeltebilir.
- Öğrencinin hakkı yanmaz; yapılmayan ders ertelenir. Eğitmene yalnızca **tamamlanan** ders ödenir.
- **Aylık paket v1'de:** kurucu her ay öğrenciye 4/8/12/özel ders paketi tanımlar; öğrenci panelde toplam/kullanılan/kalan hakkını görür. Kullanılmayan hak sonraki aya devreder.
- Eğitmen ücreti **herkese aynı**; hediye koçluk için ekstra ödeme yok.
- Panel para transferi yapmaz; ödemeler manuel, panel **haftalık ve aylık** gelir-gider ve ödenecekleri gösterir.
- Öğrenci ve veli **aynı hesap**. Davetler `panel@basarikodu.com`'dan.

## Riskler
| Risk | Önlem |
|---|---|
| Onay bekleyen talepler birikir, eğitmen bekler | Menüde sayaç + seriye toplu onay; v1 sonrası e-posta bildirimi |
| Davet e-postası spam'e düşer | Özel SMTP + SPF/DKIM; gerekirse şifreyi kurucu iletir |
| Saat dilimi hataları | DB'de UTC, arayüzde Europe/Istanbul, testli |
| Kapsam genişlemesi | Yeni istekler aşağıdaki listeye; v1 bitince sıralanır |

## v1 sonrası (öncelik sırasıyla)
1. **Akademik & içerik takvimi** (reels planı Sal/Per/Cmt, sürükle-bırak, YKS/LGS/yazılı tarihleri) — tasarımı ve 2026–27 verisi hazır, ~2,5 gün
2. Paket şablonları, hakkı bitmek üzere bildirimi
3. Siteden gelen ön görüşme formlarının panele düşmesi
4. Öğrenci araçları: ödevler, sınav geri sayımı, Pomodoro, çalışma programı
5. Eğitmen hakediş sayfası, sürükle-bırak erteleme, "haftayı kopyala"
6. Grafikli raporlar, CSV, aktivite günlüğü, koyu tema
7. Bildirimler, aylık veli raporu
8. Online ödeme, Zoom/Meet entegrasyonu, yapay zekâ özellikleri
