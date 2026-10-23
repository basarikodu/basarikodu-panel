import { expect, test, type Page } from "@playwright/test";

// Demo hesaplar (supabase/demo-hesaplar.local.md); canlıda silinir.
const PASSWORD = process.env.E2E_PASSWORD ?? "";
const ACCOUNTS = {
  founder: "kurucu.demo@basarikodu.com",
  tutor: "egitmen1.demo@basarikodu.com",
  student: "ogrenci1.demo@basarikodu.com",
};

test.skip(!PASSWORD, "E2E_PASSWORD tanımlı değil (.env.e2e.local)");

async function login(page: Page, path: string, email: string) {
  await page.goto(path);
  await page.getByLabel("E-posta").fill(email);
  await page.getByLabel("Şifre", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Giriş yap" }).click();
}

test("ana sayfada yalnızca öğrenci ve eğitmen girişi var", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Başarının Kodu Sende Gizli" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Öğrenci \/ Veli Girişi/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Eğitmen Girişi/ })).toBeVisible();
  await expect(page.getByText(/Kurucu/)).toHaveCount(0);
});

test("oturumsuz panel erişimi doğru girişe yönlenir", async ({ page }) => {
  await page.goto("/kurucu/finans");
  await expect(page).toHaveURL(/\/kurucu\/giris$/);
  await page.goto("/egitmen");
  await expect(page).toHaveURL(/\/giris\/egitmen$/);
  await page.goto("/ogrenci/dersler");
  await expect(page).toHaveURL(/\/giris\/ogrenci$/);
});

test("eğitmen öğrenci girişinden giremez", async ({ page }) => {
  await login(page, "/giris/ogrenci", ACCOUNTS.tutor);
  await expect(page.getByText("Bu giriş öğrenci ve veliler içindir")).toBeVisible();
  await expect(page).toHaveURL(/\/giris\/ogrenci$/);
});

test("öğrenci kurucu girişinden giremez", async ({ page }) => {
  await login(page, "/kurucu/giris", ACCOUNTS.student);
  await expect(page.getByText("Bu giriş yalnızca kurucular içindir.")).toBeVisible();
});

test("öğrenci paneli: ders hakkı, takvim ve ders geçmişi", async ({ page }) => {
  await login(page, "/giris/ogrenci", ACCOUNTS.student);
  await expect(page).toHaveURL(/\/ogrenci$/);
  await expect(page.getByRole("heading", { name: /Merhaba, Elif/ })).toBeVisible();
  await expect(page.getByText("Ders hakkım")).toBeVisible();
  await expect(page.getByText("Haftalık takvim")).toBeVisible();

  await page.goto("/ogrenci/dersler");
  await expect(page.getByRole("heading", { name: "Derslerim" })).toBeVisible();
  await expect(page.getByText("Ay ay özet")).toBeVisible();

  // Öğrenci kurucu ve eğitmen sayfalarına giremez
  await page.goto("/kurucu/finans");
  await expect(page).toHaveURL(/\/ogrenci$/);
  await page.goto("/egitmen");
  await expect(page).toHaveURL(/\/ogrenci$/);
});

test("eğitmen paneli: takvim, ders planlama formu ve öğrencilerim", async ({ page }) => {
  await login(page, "/giris/egitmen", ACCOUNTS.tutor);
  await expect(page).toHaveURL(/\/egitmen$/);
  await expect(page.getByText("Haftalık takvim")).toBeVisible();

  await page.getByRole("button", { name: "Ders planla" }).first().click();
  await expect(page.getByRole("dialog").getByText("Ders planla")).toBeVisible();
  await expect(page.getByRole("button", { name: "Onaya gönder" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.goto("/egitmen/ogrencilerim");
  await expect(page.getByRole("heading", { name: "Öğrencilerim" })).toBeVisible();
  await expect(page.getByText("Elif Yılmaz (Demo)")).toBeVisible();
});

test("kurucu paneli: genel bakış, onaylar, dersler, gelir-gider, ayarlar", async ({ page }) => {
  await login(page, "/kurucu/giris", ACCOUNTS.founder);
  await expect(page).toHaveURL(/\/kurucu$/);
  await expect(page.getByRole("heading", { name: /Merhaba/ })).toBeVisible();

  for (const [path, heading] of [
    ["/kurucu/onaylar", "Onay Bekleyenler"],
    ["/kurucu/dersler", "Dersler"],
    ["/kurucu/ogrenciler", "Öğrenciler"],
    ["/kurucu/egitmenler", "Eğitmenler"],
    ["/kurucu/finans", "Gelir-Gider"],
    ["/kurucu/ayarlar", "Ayarlar"],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  }

  await page.goto("/kurucu/finans?donem=hafta");
  await expect(page.getByRole("link", { name: "Haftalık" })).toBeVisible();
  await expect(page.getByText("Gelir (tahsilat)")).toBeVisible();

  await page.goto("/kurucu/ayarlar");
  await expect(page.getByText("Öğrenci ders fiyatları")).toBeVisible();
});

test("olmayan sayfa için bulunamadı ekranı", async ({ page }) => {
  await page.goto("/boyle-bir-sayfa-yok");
  await expect(page.getByRole("heading", { name: "Sayfa bulunamadı" })).toBeVisible();
});
