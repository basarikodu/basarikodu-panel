# PLAN — BaşarıKodu Panel v1

> **v1 = sade sürüm.** Eğitmen ders planlar → kurucu onaylar → öğrenci haftalık takvimde görür; kurucular eğitmen/öğrenci, dersler ve gelir-gider/ödenecekleri takip eder. Kapsam: [docs/02-GEREKSINIMLER.md](docs/02-GEREKSINIMLER.md)
>
> Başlangıç: **26 Ekim 2026** · Pilot kullanım: **≈ 10 Kasım** (Faz 4 sonu) · Canlı: **≈ 18 Kasım 2026** (~3 hafta, 15 iş günü)
> 28 Ekim öğleden sonra ve 29 Ekim resmi tatil olarak hesaba katıldı. Tahmin: 1 geliştirici + Claude Code; kurucu geri bildirimi her faz sonunda 1 gün içinde.

## Çalışma kuralı
1. Her faz kendi branch'inde (`faz-N-kisa-ad`); sonunda "Bitti tanımı" sağlanır, buradaki kutucuklar işaretlenir.
2. `npm run lint && npm run typecheck && npm test` yeşil olmadan faz kapanmaz.
3. Faz `main`'e merge edilir → Vercel'e çıkar → kuruculara kısa demo.
4. Commit: `feat(faz-N): <özet>` (Conventional Commits).
5. v1 kapsamı dışındaki istekler aşağıdaki **v1 sonrası** listesine yazılır.

## Zaman çizelgesi

| Faz | Kapsam | Süre | Tarih |
|---|---|---|---|
| 0 | Kurulum & tasarım temeli | 1 gün | 26 Eki |
| 1 | Veritabanı, giriş, roller, panel iskeletleri | 2 gün | 27, 28, 30 Eki |
| 2 | Kurucu: eğitmen & öğrenci yönetimi, atama, **aylık paket / ders hakkı** | 2 gün | 2–3 Kas |
| 3 | Eğitmen ders planlama + kurucu onay akışı | 3,5 gün | 4–9 Kas |
| 4 | Öğrenci / veli paneli (ders hakkı kartı dahil) | 1,5 gün | 9–10 Kas |
| 5 | Kurucu: dersler, gelir-gider, ödenecekler, genel bakış | 2,5 gün | 11–13 Kas |
| 6 | Test, cila, canlıya çıkış | 2 gün | 16–18 Kas |
| **Toplam** | | **~14,5 iş günü** | |

---

## Faz 0 — Kurulum & Tasarım Temeli (1 gün)
- [ ] Next.js 15 + TypeScript (strict) + Tailwind + ESLint/Prettier
- [ ] shadcn/ui + marka renkleri ve fontları ([05-TASARIM.md](docs/05-TASARIM.md)), yalnızca açık tema
- [ ] Ortak bileşenler: `PageHeader`, `StatCard`, `StatusBadge`, `MoneyText`, `EmptyState`
- [ ] `lib/format.ts` (TL, tarih, saat — tr-TR, Europe/Istanbul) + testleri
- [ ] Vitest kurulumu; Supabase projesi + local CLI; `.env.example`
- [ ] GitHub repo + Vercel önizleme deploy'u
**Bitti:** Markalı boş uygulama Vercel'de açılıyor; lint/typecheck/test yeşil.
**Commit:** `feat(faz-0): proje iskeleti ve tasarım temeli`

## Faz 1 — Veritabanı, Giriş, Roller, İskelet (2 gün)
- [ ] Migration'lar: profiles, tutors, students, subjects, tutor_students, lesson_series, lessons, lesson_change_requests, student_packages + student_credit_balance view, payments, tutor_payouts, app_settings ([04-VERITABANI.md](docs/04-VERITABANI.md) — v1 tabloları)
- [ ] Çakışma kısıtları, onay trigger'ı (eğitmen dersi zorla `pending`), ücret snapshot
- [ ] RLS politikaları + rol claim hook'u; `supabase gen types`
- [ ] Giriş sayfaları: `/giris`, `/kurucu/giris`, `/sifre-belirle`, şifremi unuttum
- [ ] Rol bazlı yönlendirme (`middleware.ts`, `requireRole()`)
- [ ] 3 panel için iskelet: sidebar (masaüstü) + alt menü (mobil), çıkış
- [ ] Seed: 3 kurucu, demo eğitmen ve öğrenciler, branşlar, ortak ücret
- [ ] RLS testleri: her rol başkasının verisini göremiyor
**Bitti:** 3 demo hesapla giriş → doğru panel; yetkisiz erişim engelleniyor.
**Commit:** `feat(faz-1): veritabanı, giriş ve rol bazlı iskelet`

## Faz 2 — Kurucu: Eğitmen & Öğrenci Yönetimi + Aylık Paket (2 gün)
- [ ] Eğitmenler: liste, ekle/düzenle (branşlar, üniversite/bölüm, IBAN), pasife al, detay
- [ ] Öğrenciler: liste, ekle/düzenle (sınıf, hedef, veli bilgisi, not), pasife al, detay
- [ ] Davet e-postası → şifre belirleme
- [ ] **Eğitmen atama:** öğrenci detayında branş bazında eğitmen ata / kaldır
- [ ] **Aylık paket:** öğrenciye ay için paket tanımla (4 / 8 / 12 / özel ders, tutar, not); "önceki aydan devam ettir" toplu oluşturma
- [ ] **Ders hakkı gösterimi:** öğrenci listesinde ve detayında bu ay paket / tamamlanan / devreden / **kalan hak**; ay ay ders sayısı
- [ ] Testler: kalan hak hesabı (yalnızca tamamlanan, hediye koçluk hariç, devir)
- [ ] Ayarlar: ortak eğitmen ücreti, branşlar, ders süreleri
**Bitti:** Kurucu eğitmen ve öğrenci ekleyip atama ve aylık paket tanımlayabiliyor; kalan hak doğru görünüyor; davet edilen kullanıcı giriş yapabiliyor.
**Commit:** `feat(faz-2): eğitmen/öğrenci yönetimi, atama ve aylık paket`

## Faz 3 — Eğitmen Ders Planlama + Kurucu Onayı (3,5 gün) ⭐ çekirdek
- [ ] Haftalık takvim bileşeni (FullCalendar: hafta görünümü, mobilde gün listesi, Türkçe, Pazartesi başlangıç)
- [ ] **Ders planla** formu: atanmış öğrenci, branş, tip, tarih, saat, toplantı linki; **her hafta tekrarla** (X hafta)
- [ ] **Ertele / İptal et** talebi (açıklama ile)
- [ ] Onay durumları takvimde: "Onay bekliyor" (kesikli), "Değişiklik onay bekliyor", reddedildi + sebep
- [ ] Çakışma kontrolü (eğitmen ve öğrenci için) — anlaşılır uyarı
- [ ] **Ders sonucu:** Tamamlandı / Öğrenci gelmedi + kısa not
- [ ] **Öğrencilerim:** liste (kalan ders hakkı dahil, tutar yok) + öğrenci detayı (o öğrenciyle yapılan dersler); hakkı biten öğrenciye planlarken uyarı
- [ ] Kurucu **Onay Bekleyenler:** liste, Onayla / Reddet (sebep), seriye toplu onay, menüde sayaç
- [ ] İş kuralı testleri: çakışma, onay uygulama, yalnızca onaylı dersin öğrenciye görünmesi
**Bitti:** Eğitmen bir öğrencisine haftalık tekrarlı ders planlıyor → kurucu onaylıyor → eğitmen erteleme istiyor → kurucu onaylıyor → eğitmen dersi tamamlıyor.
**Commit:** `feat(faz-3): ders planlama ve kurucu onay akışı`

## Faz 4 — Öğrenci / Veli Paneli (1,5 gün)
- [ ] **Ders hakkı kartı:** "Kasım paketi: 8 ders · 5 tamamlandı · Kalan hakkın: 4" + ilerleme çubuğu, devreden hak
- [ ] Ana ekran: sıradaki ders kartı (**Derse Katıl**) + haftalık takvim (yalnızca onaylı dersler)
- [ ] Ders geçmişi: tarih, eğitmen, branş, durum, eğitmen notu; ay ay özet (paket, alınan ders, hangi dersler)
- [ ] Profil: bilgiler, şifre değiştir, WhatsApp destek butonu
- [ ] Mobil görünüm kontrolü
**Bitti:** Demo öğrenci telefondan girip haftalık derslerini ve geçmişini görüyor.
**Commit:** `feat(faz-4): öğrenci ve veli paneli`
> 🎯 **Pilot:** Bu noktada 2–3 eğitmen ve öğrencileriyle gerçek kullanım başlatılabilir.

## Faz 5 — Kurucu: Dersler, Gelir-Gider, Ödenecekler (2,5 gün)
- [ ] **Dersler:** tüm dersler liste + haftalık takvim; filtre (tarih, eğitmen, öğrenci, durum); kurucu doğrudan ekle/düzenle/iptal
- [ ] **Gelir:** öğrenci ödemesi kaydı (öğrenci, tutar, tarih, yöntem, not); öğrenci detayında ödemeler; paket tutarı vs. ödenen → bekleyen tahsilat
- [ ] **Ödenecekler:** hafta / ay seçimi → eğitmen başına tamamlanan ders × ortak ücret, IBAN, "Ödendi" işaretleme (hediye koçluk 0 TL)
- [ ] **Gelir-Gider özeti:** hafta ↔ ay; gelir, gider, net
- [ ] **Genel Bakış:** ders sayısı (yapılan/planlanan), gelir/gider/net, aktif eğitmen/öğrenci, onay bekleyen sayısı
- [ ] Testler: hakediş hesabı (yalnızca tamamlanan dersler, hediye koçluk 0), hafta/ay sınırları
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
