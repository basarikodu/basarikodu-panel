# 06 · Canlıya Çıkış Rehberi

Panel kodu hazır ve test edildi (birim testleri, 26 yetki testi, 16 uçtan uca test). Canlıya çıkmak için aşağıdaki adımlar sırayla yapılır. ✋ işaretli adımlar kurucuların hesabıyla yapılmalıdır (şifre/anahtar girişi içerir).

## 1. Vercel'e yükleme ✋
1. BaşarıKodu'nun Vercel hesabıyla giriş yapın (yoksa `basarikodupanel` GitHub hesabıyla ücretsiz açın).
2. **Add New → Project → Import** ile `basarikodupanel/basarikodu-panel` deposunu seçin. Framework: Next.js (otomatik).
3. **Environment Variables** (Production + Preview):

| Ad | Değer |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kovudcedviefphsesxby.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys → **publishable** anahtar |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API Keys → **secret** anahtar (asla paylaşmayın) |
| `NEXT_PUBLIC_SITE_URL` | `https://panel.basarikodu.com` |

4. **Deploy**. Her `main` güncellemesi otomatik yeniden yayınlanır.

## 2. Alan adı: panel.basarikodu.com ✋
1. Vercel → Project → **Settings → Domains → Add** → `panel.basarikodu.com`.
2. `basarikodu.com` DNS panelinde (alan adını aldığınız firma): **CNAME** kaydı → ad: `panel`, değer: `cname.vercel-dns.com`.
3. Birkaç dakika içinde Vercel SSL sertifikasını otomatik kurar.

## 3. Supabase giriş ayarları ✋
Supabase Dashboard → **Authentication**:
- **Sign In / Providers → Email → "Allow new users to sign up": KAPALI.** (Hesapları yalnızca kurucular açar.)
- **URL Configuration → Site URL:** `https://panel.basarikodu.com`
- **Redirect URLs:** `https://panel.basarikodu.com/**` ve geliştirme için `http://localhost:3000/**`
- **Password security → Leaked password protection:** açık (planınız destekliyorsa).

## 4. panel@basarikodu.com e-postası (şifremi unuttum için) ✋
Hesaplar geçici şifreyle açıldığı için e-posta yalnızca **"Şifremi unuttum"** akışında gerekir. Supabase'in yerleşik e-postası yalnızca proje ekibine mail atar; gerçek kullanıcılar için özel SMTP gerekir:
1. [resend.com](https://resend.com) hesabı açın → **Domains → Add** → `basarikodu.com`.
2. Resend'in verdiği DNS kayıtlarını (SPF/DKIM TXT, MX) `basarikodu.com` DNS paneline ekleyin, doğrulanmasını bekleyin.
3. Resend → **API Keys** → yeni anahtar.
4. Supabase → Authentication → **SMTP Settings → Enable custom SMTP**:
   - Sender email: `panel@basarikodu.com`, Sender name: `BaşarıKodu`
   - Host: `smtp.resend.com`, Port: `465`, Username: `resend`, Password: Resend API anahtarı
5. Authentication → **Email Templates → Reset Password**: konu "BaşarıKodu Panel – Şifre yenileme"; metni Türkçe yazın, bağlantı olarak `{{ .ConfirmationURL }}` kalsın.

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
- [ ] Vercel projesi ve ortam değişkenleri
- [ ] panel.basarikodu.com DNS + SSL
- [ ] Supabase: kayıt kapalı, Site URL, Redirect URLs
- [ ] SMTP (panel@basarikodu.com) — şifremi unuttum için
- [ ] Kurucu hesapları açıldı
- [ ] Demo veriler silindi
- [ ] Ayarlar: gerçek ücret ve fiyatlar
- [ ] Eğitmen ve öğrenciler girildi, atamalar ve paketler tanımlandı
- [ ] Pilot hafta tamamlandı
