# 06 · Canlıya Çıkış Rehberi

Panel kodu hazır ve test edildi (birim testleri, 26 yetki testi, 16 uçtan uca test). Canlıya çıkmak için aşağıdaki adımlar sırayla yapılır. ✋ işaretli adımlar kurucuların hesabıyla yapılmalıdır (şifre/anahtar girişi içerir).

## 1. Vercel ✅ (24 Eki 2026)
- Hesap: BaşarıKodu Vercel (basarikodu0@gmail.com), ekip **basari-kodus-projects**, proje **basarikodu-panel**.
- Depo: `basarikodu/basarikodu-panel` (basarikodupanel hesabından taşındı; ana site `basarikodu/asil_basarikodu`). `main`'e her gönderim otomatik yayınlanır.
- Sunucu bölgesi: **dub1** (Dublin) — Supabase eu-west-1 ile aynı bölge.
- Ortam değişkenleri: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable), `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Secret, kurucular girdi).

## 2. Alan adı ✅
- basarikodu.com Vercel'den alındı ve DNS'i Vercel'de; `panel.basarikodu.com` projeye eklendi, kayıt ve SSL otomatik. Ana site (basarikodu.com) ayrı projede, etkilenmez.

## 3. Supabase giriş ayarları ✋
Supabase Dashboard → **Authentication**:
- **Sign In / Providers → Email → "Allow new users to sign up": KAPALI.** (Hesapları yalnızca kurucular açar.)
- **URL Configuration → Site URL:** `https://panel.basarikodu.com`
- **Redirect URLs:** `https://panel.basarikodu.com/**` ve geliştirme için `http://localhost:3000/**`
- **Password security → Leaked password protection:** açık (planınız destekliyorsa).

## 4. panel@basarikodu.com e-postası (şifremi unuttum için)
Hesaplar geçici şifreyle açıldığı için e-posta yalnızca **"Şifremi unuttum"** akışında gerekir.
1. ✅ Resend hesabı (basarikodu0@gmail.com), alan adı `basarikodu.com`, bölge eu-west-1. DNS kayıtları (`send`, `rsend` CNAME, `resend._domainkey` TXT) Vercel DNS'ine Resend–Vercel bağlantısıyla eklendi.
2. ✋ Resend → **API Keys** → "Sending access", alan adı basarikodu.com.
3. ✋ Supabase → Authentication → **Emails → SMTP Settings → Enable custom SMTP**:
   - Sender email: `panel@basarikodu.com`, Sender name: `BaşarıKodu`
   - Host: `smtp.resend.com`, Port: `465`, Username: `resend`, Password: Resend API anahtarı
4. ✋ Authentication → **Emails → Templates → Reset Password**: konu `BaşarıKodu Panel – Şifre yenileme`, gövde `supabase/templates/sifre-sifirlama.html`. Bağlantı `{{ .SiteURL }}/auth/confirm?token_hash=…&type=recovery` biçimindedir; kişi isteği bir cihazdan yapıp e-postayı başka cihazda açsa da çalışır.
5. `panel@basarikodu.com` gelen posta almaz (alan adında posta kutusu yok).

## 5. Gerçek veriye geçiş
1. **Kurucu hesapları:** `scripts/kurucular.example.json` → `scripts/kurucular.local.json` olarak doldurulur, `node scripts/kurucu-hesaplari.mjs` çalıştırılır. Geçici şifreler git'e girmeyen `scripts/kurucular-sifreler.local.md` dosyasına yazılır (kurucu hesabını panelden açma özelliği bilinçli olarak yok).
2. **Demo verilerin silinmesi:** `supabase/scripts/demo-temizle.sql` — yalnızca `*.demo@basarikodu.com` hesapları ve bağlı kayıtlar silinir; branşlar ve ayarlar korunur, tek işlemdir (hata olursa hiçbir şey silinmez). Geri alınamaz; kurucu hesapları açıldıktan sonra çalıştırılır.
3. **Ayarlar:** gerçek eğitmen ücretleri (özel ders / koçluk) ve öğrenci ders fiyatları (950 / 850 ₺) kontrol edilir. *Demo değerleri: eğitmen 400 / 250 ₺.*
4. **Eğitmenler** (Kurucu → Eğitmenler → Eğitmen ekle): ad, e-posta, branşlar, IBAN, ödeme sıklığı. Geçici şifreyi WhatsApp'tan iletin.
5. **Öğrenciler** (Kurucu → Öğrenciler → Öğrenci ekle) → **eğitmen ata** → **bu ayın paketi**.
6. **Pilot:** 2–3 eğitmenle bir hafta deneyin, sonra herkese açın.

## 6. Yedekleme ve izleme
- Supabase ücretsiz planda otomatik günlük yedek ve geri dönüş (PITR) **yoktur**; gerçek veriyle kullanıma geçince **Pro plan** önerilir (günlük yedek).
- Hatalar: Vercel → Project → **Logs**; veritabanı: Supabase → **Logs**.

## Kontrol listesi
- [x] Vercel projesi ve ortam değişkenleri
- [x] panel.basarikodu.com DNS + SSL
- [x] Supabase: kayıt kapalı, Site URL, Redirect URLs
- [ ] SMTP (panel@basarikodu.com) — şifremi unuttum için (DNS ✅, Supabase ayarı bekliyor)
- [ ] Kurucu hesapları açıldı
- [ ] Demo veriler silindi
- [ ] Ayarlar: gerçek ücret ve fiyatlar
- [ ] Eğitmen ve öğrenciler girildi, atamalar ve paketler tanımlandı
- [ ] Pilot hafta tamamlandı
