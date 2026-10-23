# 02 · Ürün Gereksinimleri (PRD)

> **v1 ilkesi: sade ve hızlı.** İlk sürüm yalnızca ders planlama–onay akışını ve kurucuların gelir-gider / ders takibini kapsar. Diğer her şey "v1 sonrası" listesindedir ve uygulama kullanılmaya başladıktan sonra eklenir.

## 1. Roller ve giriş

| Rol | Kim | Giriş |
|---|---|---|
| `founder` (Kurucu) | 3 kurucu | `/kurucu/giris` |
| `tutor` (Eğitmen) | Hocalar ve koçlar | `/giris` |
| `student` (Öğrenci / Veli) | Öğrenci; veli aynı hesabı kullanır | `/giris` |

- Kayıt (sign-up) yok. Hesapları kurucular açar; **`panel@basarikodu.com`** adresinden davet e-postası gider, kullanıcı şifresini belirler.
- Öğrenci ve veli **aynı hesap, aynı panel**.

## 2. Kurucu paneli (v1)

### K1 — Genel Bakış
Basit sayı kartları; **hafta ↔ ay** geçişli:
- Yapılan ders sayısı, planlanan ders sayısı
- Gelir (tahsilat), gider (eğitmen hakedişi), net
- Aktif eğitmen / öğrenci sayısı
- Onay bekleyen talep sayısı (tıklayınca listeye gider)

### K2 — Onay Bekleyenler
- Eğitmenin **yeni ders, tekrarlayan ders, erteleme ve iptal** talepleri buraya düşer.
- Her satır: eğitmen, öğrenci, branş, talep türü, eski → yeni tarih/saat, eğitmenin açıklaması.
- **Onayla / Reddet (sebep)**; tekrarlayan seri tek tıkla toplu onay.
- Üç kurucudan birinin onayı yeterli; kimin onayladığı kaydedilir.

### K3 — Eğitmenler
- Liste: ad, branşlar, öğrenci sayısı, bu hafta/ay ders sayısı, aktif/pasif
- Ekle / düzenle (ad, telefon, e-posta, branşlar, üniversite/bölüm, IBAN) / pasife al, davet gönder
- Detay: öğrencileri ve ders geçmişi

### K4 — Öğrenciler
- Liste: ad, sınıf, hedef (YKS/LGS/Okul), eğitmen(ler)i, bu ay ders sayısı
- Ekle / düzenle (ad, sınıf, hedef, veli adı/telefonu, not) / pasife al, davet gönder
- **Eğitmen atama:** öğrenciye branş bazında eğitmen ata (ör. Matematik → Ahmet Hoca). Eğitmen yalnızca atanan öğrencileri görür.
- Detay: ders geçmişi, ödemeleri

### K5 — Dersler
- **Ne zaman, kim, hangi ders:** tüm derslerin listesi ve haftalık takvimi
- Filtre: tarih aralığı, eğitmen, öğrenci, durum
- Kurucu dersi doğrudan ekleyebilir/düzenleyebilir/iptal edebilir (onaysız)

### K6 — Gelir-Gider ve Ödemeler (hafta ↔ ay)
- **Gelir:** öğrenciden alınan ödemeleri manuel kaydet (öğrenci, tutar, tarih, yöntem, not)
- **Gider / Ödenecekler:** seçilen hafta veya ayda her eğitmenin **tamamlanan ders sayısı × ortak ücret** = ödenecek tutar, IBAN, durum (Bekliyor / Ödendi)
- Ödeme panel dışında yapılır; kurucu "Ödendi" işaretler (tarih, not)
- Özet: toplam gelir, toplam gider, net

### K7 — Ayarlar
- Ortak eğitmen ücreti (özel ders / ücretli koçluk), branş listesi, ders süreleri (60 / 40 dk)

## 3. Eğitmen paneli (v1)

### E1 — Takvim (ana ekran, haftalık)
- Haftalık takvim (mobilde gün listesi); bugünkü dersler üstte, "Derse Git" linki
- **Ders planla:** öğrenci (yalnızca atanmış öğrencilerinden), branş, tip (özel ders/koçluk), tarih, saat, toplantı linki
- **Her hafta tekrarla** seçeneği (ör. her Pazartesi 19:00, 8 hafta)
- **Ertele / İptal et** talebi (açıklama ile)
- Tüm bu işlemler **kurucu onayına gider**: takvimde kesikli çerçeve + "Onay bekliyor"; reddedilirse sebep görünür. Onaylanana kadar öğrenci görmez.

### E2 — Ders sonucu
- Geçmiş derste: **Tamamlandı** veya **Öğrenci gelmedi** + kısa not (işlenen konu). Onaysız kaydedilir; kurucular düzeltebilir.
- Öğrencinin hakkı yanmaz: gelmedi/iptal durumunda ders ileri tarihe ertelenir. Yalnızca tamamlanan ders sayılır ve eğitmene ödenir.

### E3 — Öğrencilerim
- Atanmış öğrenciler: sınıf, hedef, veli telefonu, son/sıradaki ders
- Öğrenci detayı: o öğrenciyle yapılan dersler

## 4. Öğrenci / Veli paneli (v1)

### Ö1 — Haftalık takvim (ana ekran)
- Sıradaki ders kartı (tarih, saat, eğitmen, branş, **Derse Katıl** linki)
- Haftalık takvimde onaylı dersler (mobilde gün listesi)

### Ö2 — Ders geçmişi
- Liste: tarih, eğitmen, branş, durum, eğitmenin notu
- Üstte basit toplam: "Toplam 24 ders · Bu ay 8 ders"

### Ö3 — Profil
- Bilgiler, şifre değiştir, WhatsApp destek butonu

## 5. Ortak gereksinimler
- Türkçe, Europe/Istanbul, TL (`1.234,56 ₺`), hafta Pazartesi başlar
- **Mobil uyumlu** (öğrenci ve eğitmenlerin çoğu telefondan girer)
- Her rol yalnızca kendi verisini görür (veritabanında Row Level Security). Para tutarlarını yalnızca kurucular görür.
- Çakışma kontrolü: aynı eğitmen veya aynı öğrenci için üst üste ders planlanamaz.
- KVKK: minimum veri; veli telefonu yalnızca kurucu ve atanmış eğitmen tarafından görülür.

## 6. v1 sonrası (kullanım başladıktan sonra, öncelik sırasıyla)
1. **Akademik & içerik takvimi** — reels planı (Sal/Per/Cmt ritmi), sürükle-bırak, YKS/LGS/yazılı tarihleri, içerik durum hattı (Fikir → Yayınlandı). Ayrıntılar ve 2026–27 tarihleri `01-PROJE-ANALIZI.md`'de hazır.
2. Paket / ders hakkı takibi (8 / 12 derslik paketler, kalan hak, bitmek üzere uyarısı)
3. Siteden gelen ön görüşme formlarının panele düşmesi
4. Öğrenci için ödev takibi, sınav geri sayımı, Pomodoro, çalışma programı
5. Eğitmen "Hakedişlerim" sayfası, sürükle-bırak ile erteleme, "haftayı kopyala"
6. Grafikli raporlar, CSV dışa aktarma, aktivite günlüğü, koyu tema
7. Bildirimler (e-posta/WhatsApp hatırlatma), aylık veli raporu
8. Online ödeme, Zoom/Meet otomatik link, yapay zekâ özellikleri
