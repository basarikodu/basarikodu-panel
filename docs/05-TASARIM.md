# 05 · Tasarım Sistemi ve Ekranlar

## 0. Güncel görsel dil (23 Eki 2026)
- **Logo:** `public/logo.png` (dairesel, şeffaf zemin); favicon `src/app/icon.png`.
- **Renkler logodan alındı:** lacivert `#012E6A` → arayüz birincil `#0B3478`, yeşil `#2E8220`, beyaz; zemin soğuk beyaz `#F3F6FB`.
- **Yerleşim (kurucunun paylaştığı referans ekrana göre):** yüzen, köşeleri 28px yuvarlatılmış koyu lacivert yan menü (logo, panel kartı, menü, altta kullanıcı kartı); büyük "Merhaba, Ad" başlığı + uzun tarih; koyu lacivert degrade istatistik bandı (cam efektli kutular); BÜYÜK HARF aralıklı bölüm etiketleri; beyaz, geniş yuvarlatılmış kartlar.
- **Yazı tipi:** tüm panelde **Montserrat** (gövde ve başlıklar, kurucu kararı).
- Bileşenler: `AppShell`, `HeroStats`, `SectionLabel`, `UserAvatar`, `Logo`.
- Aşağıdaki tablo ilk taslaktır; güncel değerler `src/app/globals.css` içindedir.

## 1. İlke
Ana site ile **aynı markayı** taşıyan, sade ve "iş aleti" hissi veren bir panel: krem zemin, lacivert yapı, yeşil başarı vurgusu. Süs değil, okunabilirlik ve hız. Mobilde öğrenci/eğitmen tek elle kullanabilmeli.

## 2. Renk token'ları (Tailwind / CSS değişkenleri)

| Token | Açık tema | Koyu tema | Kullanım |
|---|---|---|---|
| `--background` | `#F5F4F0` | `#12121F` | Sayfa zemini |
| `--card` | `#FFFFFF` | `#1A1A2E` | Kart, tablo |
| `--foreground` | `#1A1A2E` | `#ECECF3` | Ana metin |
| `--muted-foreground` | `#5A5A7A` | `#8892A4` | İkincil metin |
| `--primary` | `#1B2E6E` | `#5B74C9` | Birincil buton, aktif menü |
| `--accent` / success | `#2E8B3A` | `#6FD48B` | Tamamlandı, CTA, olumlu |
| `--accent-soft` | `#A8F0B8` | `#1F4A2A` | Rozet zemini |
| `--warning` | `#D97706` | `#F59E0B` | Bekleyen ödeme, ertelendi |
| `--destructive` | `#DC2626` | `#F87171` | İptal, gecikmiş |
| `--border` | `#E6E4DC` | `#2A2A40` | |
| `--radius` | 12px | | Sitedeki yuvarlak kart dili |

Font: **Montserrat** (tüm metinler) — `next/font/google`.

## 3. Ders durumu renkleri
| Durum | Renk | İkon |
|---|---|---|
| Onay bekliyor | sarı, **kesikli çerçeve**, yarı saydam | Hourglass |
| Değişiklik onay bekliyor | normal renk + sarı rozet | CalendarClock |
| Reddedildi (yalnızca eğitmen görür) | kırmızı çizili | Ban |
| Planlandı | lacivert | Clock |
| Tamamlandı | yeşil | CheckCircle |
| Öğrenci gelmedi | turuncu | UserX |
| İptal | kırmızı (soluk) | XCircle |
| Ertelendi | gri | CalendarClock |

Takvimde ders rengi **branşa** göre (subjects.color), durum sol kenar şeridi + ikon ile.

## 4. Akademik takvim renkleri
| Kategori | Renk |
|---|---|
| Sınav (YKS/LGS/Yazılı) | Kırmızı |
| Okul takvimi / tatil | Gri-mavi |
| İçerik – Tanıtım | Lacivert |
| İçerik – Viral | Mor |
| İçerik – Eğitici | Yeşil |
| İçerik – Motivasyon | Turuncu |
| İçerik – Eğitmen tanıtımı | Camgöbeği |
| Kampanya | Altın |
Tahmini olaylar kesikli kenarlık; yayınlanmış içerik ✓ rozeti.

## 5. Yerleşim
- **Masaüstü:** Sol sabit sidebar (logo, rol bazlı menü, kullanıcı kartı) + üst bar (sayfa başlığı, arama, hızlı eylem "+ Ders", tema).
- **Mobil:** Alt sekme çubuğu (öğrenci: Ana sayfa / Takvim / Dersler / Araçlar / Profil; eğitmen: Bugün / Takvim / Öğrenciler / Hakediş), takvim mobilde varsayılan "liste/gün" görünümü.
- Boş durumlar, iskelet yükleyiciler, Türkçe hata mesajları her ekranda.

## 6. Ekran listesi

### Kimlik
- `/giris` — Eğitmen & öğrenci girişi (logo, e-posta, şifre, "Şifremi unuttum")
- `/kurucu/giris` — Kurucu girişi (koyu lacivert tema ile ayrışır)
- `/sifre-belirle` — Davet / sıfırlama

### Kurucu (v1)
Genel Bakış · **Onay Bekleyenler** (sayaç rozetli, toplu onay) · Eğitmenler · Öğrenciler (atama dahil) · Dersler (liste + haftalık takvim) · Gelir-Gider & Ödenecekler · Ayarlar
*v1 sonrası:* Akademik & İçerik Takvimi, Paketler

### Eğitmen (v1)
Takvim (haftalık planlama, ana ekran) · Öğrencilerim · Profil

### Öğrenci / Veli (v1)
Haftalık takvim (ana ekran) · Ders geçmişi · Profil
*v1 sonrası:* Ödevler, Araçlar, Ödemeler

> v1'de yalnızca açık tema; koyu tema token'ları v1 sonrası için hazır tutulur.

## 7. Ortak bileşenler
`StatCard`, `StatusBadge`, `MoneyText`, `DateTimeText`, `EmptyState`, `PageHeader`, `DataTable`, `ConfirmDialog`, `LessonDialog` (oluştur/düzenle), `LessonResultDialog` (ders sonrası), `UserAvatar`, `SubjectChip`, `ExamCountdown`, `PackageProgress`, `CalendarView` (FullCalendar sarmalayıcı, tema uyumlu).
