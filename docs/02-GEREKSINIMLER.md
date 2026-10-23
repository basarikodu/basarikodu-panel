# 02 · Ürün Gereksinimleri (PRD)

## 1. Roller

| Rol | Kim | Sayı | Giriş |
|---|---|---|---|
| `founder` (Kurucu) | Yönetici kurucular | 3 | `/kurucu` — ayrı giriş ekranı |
| `tutor` (Eğitmen) | Özel ders hocaları ve koçlar | ~15+ | `/giris` (ortak giriş) |
| `student` (Öğrenci / Veli) | Öğrenci; veli aynı hesabı kullanır | ~yüzlerce | `/giris` (ortak giriş) |

- **İki giriş kapısı:** Kurucu girişi (`/kurucu/giris`) ve Eğitmen/Öğrenci girişi (`/giris`). Teknik olarak aynı kimlik sistemi; giriş sonrası role göre yönlendirme yapılır, yanlış kapıdan girişte rol kontrolü ile reddedilir.
- **Kayıt (sign-up) yok.** Tüm hesapları kurucular oluşturur, kullanıcıya davet e-postası/şifre belirleme linki gider.
- Bir eğitmen hem özel ders hem koçluk verebilir (alanı: `services: ["ozel_ders","kocluk"]`).

## 2. Kurucu paneli

### K1 — Genel Bakış (Dashboard)
- Bu hafta / bu ay: yapılan ders sayısı, planlanan ders, iptal/erteleme oranı
- Aktif öğrenci, aktif eğitmen sayısı
- Bu ay tahsilat, bekleyen tahsilat (vadesi geçmiş kırmızı), eğitmenlere ödenecek toplam
- Bitmek üzere olan paketler (≤2 ders hakkı kalan öğrenciler)
- Yaklaşan sınavlar (geri sayım) + bu haftanın içerik planı (reels)
- Son aktiviteler (ders tamamlandı, ödeme alındı vb.)

### K2 — Eğitmenler
- Liste: ad, branşlar, üniversite/bölüm, YKS derecesi, aktif öğrenci sayısı, bu ay ders sayısı, durum (aktif/pasif)
- Detay: profil, ders ücreti (eğitmene ödenen birim ücret — ders tipine göre), atanmış öğrenciler, ders geçmişi, hakediş geçmişi
- Ekle / düzenle / pasife al (silme yok — geçmiş korunur), davet e-postası gönder

### K3 — Öğrenciler
- Liste: ad, sınıf, hedef (YKS/LGS/Okul), atanmış eğitmen(ler), aktif paket, kalan ders hakkı, ödeme durumu
- Detay: veli bilgileri (ad, telefon), notlar, eğitmen atamaları (branş bazında), paketleri, ders geçmişi, ödemeleri
- Ekle / düzenle / pasife al, davet gönder
- **Eşleştirme:** öğrenciye branş bazında eğitmen ata (ör. Matematik → Ahmet, Koçluk → Ayşe)

### K4 — Dersler
- Tüm derslerin takvimi (eğitmene / öğrenciye / branşa göre filtre) ve liste görünümü
- Kurucu her dersi görebilir, düzenleyebilir, iptal edebilir, durumunu düzeltebilir
- Dışa aktarma (CSV)

### K5 — Finans
- **Paketler (tanım):** Tek Ders, Haftada 2, Haftada 3, Koçluk — fiyat ve ders adedi düzenlenebilir
- **Öğrenci paketleri:** öğrenciye paket tanımla (başlangıç tarihi, ders hakkı, tutar, indirim) → ders tamamlandıkça hak düşer
- **Tahsilatlar (öğrenciden):** manuel ödeme kaydı (tarih, tutar, yöntem: Havale/EFT, Nakit, Kart, Diğer; açıklama), paketle ilişkilendirme, borç/alacak bakiyesi
- **Hakedişler (eğitmene):** seçilen dönemde (**hafta veya ay**) tamamlanan dersler × eğitmen birim ücreti = otomatik hesap; yalnızca `Tamamlandı` dersler sayılır, hediye koçluk için ekstra ödeme yok. Kurucu ödemeyi panel dışında manuel yapar ve panelde "ödendi" işaretler (tarih, tutar, not); düzeltme kalemi eklenebilir (prim/kesinti). Her eğitmenin ödeme sıklığı ayarlanabilir (haftalık / aylık).
- **"Ödenecekler" listesi:** seçilen hafta/ay için eğitmen bazında ödenecek tutar, IBAN, ödendi/bekliyor — kurucular bu listeye bakarak havaleleri yapar
- **Gelir-Gider görünümü (haftalık ↔ aylık geçiş):** tahsilat (gelir), eğitmen hakedişi (gider), net; aynı dönemde yapılan ders sayısı (branş/eğitmen kırılımı); önceki dönemle karşılaştırma
- Panelde online ödeme/para transferi **yok** — sadece kayıt ve hesap

### K6 — Akademik & İçerik Takvimi
- Ay / hafta / liste görünümleri; **sürükle-bırak ile tarih değiştirme**
- Olay türleri (renkli):
  - **Sınav:** YKS, LGS, okul yazılı dönemleri, deneme sınavları
  - **Okul takvimi:** dönem başlangıç/bitiş, ara tatil, yarıyıl tatili, resmi tatil
  - **İçerik (Reels):** Tanıtım, Viral, Eğitmen Tanıtımı, Eğitici, Motivasyon, Kampanya
  - **Kampanya / Operasyon:** ör. "Yarıyıl kampanyası", "LGS son 30 gün paketi"
- İçerik kartı alanları: başlık, tür, durum (**Fikir → Senaryo → Çekildi → Kurgu → Hazır → Yayınlandı**), sorumlu kurucu, platform (Instagram/TikTok/YouTube Shorts), senaryo/not, yayın linki
- **Haftalık ritim şablonu:** "Salı/Perşembe/Cumartesi" slotlarını seçilen tarih aralığına boş içerik kartı olarak oluştur
- "Tahmini" bayrağı: resmi açıklanmamış tarihler (YKS/LGS) kesikli çerçeve ile gösterilir
- Sınav olayları öğrenci panelindeki geri sayıma beslenir (kurucu "öğrencilere göster" işaretlerse)
- İçerik olayları **sadece kurucular** tarafından görülür

### K7 — Ayarlar
- Branş listesi (Matematik, Fizik, Kimya, Biyoloji, Türkçe/Edebiyat, Tarih, Coğrafya, İngilizce, Fen Bilimleri, Sosyal Bilgiler, Koçluk…)
- Ders tipleri ve varsayılan süreleri (Özel ders 60 dk, Koçluk 40 dk)
- Kurucu hesapları, şirket bilgileri
- Aktivite günlüğü (kim neyi değiştirdi)

## 3. Eğitmen paneli

### E1 — Bugün / Genel Bakış
- Bugünkü ve yarınki dersler (saat, öğrenci, branş, toplantı linki — tek tıkla "Derse Git")
- Durumu işaretlenmemiş geçmiş dersler uyarısı ("3 dersin sonucunu girmedin")
- Bu ay tamamlanan ders sayısı ve tahmini hakediş

### E2 — Takvim & Haftalık Planlama (çekirdek özellik)
- Hafta görünümü (varsayılan), gün ve ay görünümü
- Boş saate tıkla → **Ders oluştur:** öğrenci (yalnızca atanmış öğrencilerinden), branş, tip (özel ders/koçluk), tarih, saat, süre, toplantı linki, not
- **Tekrarlayan ders:** "Her Pazartesi 19:00, 8 hafta" → seri oluşturulur; seriyi veya tek oturumu düzenleme
- **Sürükle-bırak** ile saat/gün değiştirme (çakışma kontrolü: aynı eğitmen veya aynı öğrenci için üst üste binme engellenir)
- **"Geçen haftayı kopyala"** → haftalık planı tek tıkla bir sonraki haftaya taşı
- Müsaitlik (opsiyonel, Faz 3 sonu): eğitmen haftalık müsait saatlerini işaretler, takvimde gölge olarak görünür

### E3 — Ders sonrası işlem
- Dersi işaretle: **Tamamlandı / Öğrenci gelmedi / İptal (eğitmen) / İptal (öğrenci) / Ertelendi**
- Tamamlandıysa: işlenen konu, ödev, öğrenci performans notu (1–5), veliye görünür kısa not
- Ertelendiyse: yeni tarih seç → ders hakkı yanmaz
- **Öğrencinin hakkı hiçbir durumda yanmaz:** "Öğrenci gelmedi" / iptal / erteleme durumlarında hak düşmez; eğitmen öğrenciyle görüşüp dersi ileri bir tarihe planlar ("Yeniden planla" kısayolu). Bu derslerden eğitmene ödeme çıkmaz.

### E4 — Öğrencilerim
- Atanmış öğrenci listesi: sınıf, hedef, kalan ders hakkı, son ders tarihi
- Öğrenci detayı: ders geçmişi, konu/ödev akışı, eğitmene özel notlar (öğrenci görmez)

### E5 — Hakedişlerim
- Hafta ve ay bazında tamamlanan dersler ve tutar, ödenen/bekleyen (hediye koçluklar 0 TL olarak listelenir)

## 4. Öğrenci / Veli paneli

### Ö1 — Ana sayfa
- Sıradaki ders kartı (geri sayım, eğitmen, branş, **Derse Katıl** butonu)
- YKS/LGS geri sayımı (öğrencinin hedefine göre)
- Paket durumu: "12 dersin 7'si tamamlandı, 5 hak kaldı" ilerleme çubuğu
- Bu haftanın dersleri

### Ö2 — Takvim
- Geçmiş ve gelecek tüm dersler (renk: branşa göre; durum ikonları)
- Akademik takvimden öğrencilere açık olaylar (sınavlar, tatiller)

### Ö3 — Ders Geçmişi
- Liste: tarih, eğitmen, branş, süre, durum, işlenen konu, ödev, eğitmen notu
- Özet istatistik: toplam ders, branşa göre dağılım (grafik), aylık ders sayısı

### Ö4 — Ödevler & Notlar
- Eğitmenlerin girdiği ödevler (yapıldı işaretlenebilir)

### Ö5 — Araçlar
- Pomodoro, sınav sayacı, haftalık çalışma programı (sitedeki araçların panel versiyonu)

### Ö6 — Ödemeler (salt okunur)
- Paketler, yapılan ödemeler, kalan bakiye

### Ö7 — Profil & İletişim
- Bilgiler, şifre değiştir, WhatsApp destek butonu

## 5. Ortak / fonksiyonel olmayan gereksinimler
- **Dil:** Türkçe. **Saat dilimi:** Europe/Istanbul. Para birimi TL, `1.234,56 ₺` formatı. Hafta Pazartesi başlar.
- **Mobil uyumlu:** öğrenci ve eğitmenlerin çoğu telefondan girecek → mobil öncelikli tasarım.
- **Güvenlik:** her rol yalnızca kendi verisine erişir (veritabanı seviyesinde Row Level Security). Eğitmen başka eğitmenin öğrencisini göremez; öğrenci sadece kendi derslerini görür; finansal tutarları sadece kurucular görür (eğitmen yalnızca kendi hakedişini).
- **KVKK:** reşit olmayan öğrenci verisi → minimum veri, veli telefonu sadece kurucu & atanmış eğitmen görür; hesap pasife alındığında veriler anonimleştirilebilir.
- **Performans:** ilk yükleme < 2 sn, takvim etkileşimleri anlık (optimistic update).
- **Denetim izi:** finans ve ders durum değişiklikleri loglanır.
- **Yedekleme:** günlük otomatik veritabanı yedeği.

## 6. Kapsam dışı (MVP sonrası backlog)
- Siteden gelen **ön görüşme formlarının panele düşmesi** (lead/CRM hattı) — en değerli ilk eklenti
- Online ödeme (iyzico/PayTR), otomatik fatura
- Zoom/Google Meet API ile otomatik link üretimi, Google Calendar senkronu
- WhatsApp/SMS hatırlatma, e-posta bildirimleri (MVP'de yalnızca davet e-postası)
- Aylık veli ilerleme raporunun PDF olarak otomatik üretimi
- Ayrı veli hesabı (birden fazla çocuk), mesajlaşma
- Yapay zekâ destekli içerik fikri/senaryo, öğrenci analizi
