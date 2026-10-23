import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatTime,
  formatLongDate,
  formatMonthKey,
  getDayRange,
  isMonthKey,
  shiftMonthKey,
  toMonthKey,
  getPeriodRange,
  shiftPeriod,
} from "./format";

describe("formatMoney", () => {
  it("TL biçiminde binlik ve kuruş ayırır", () => {
    expect(formatMoney(6800)).toBe("6.800,00 ₺");
    expect(formatMoney(1234.5)).toBe("1.234,50 ₺");
    expect(formatMoney("950")).toBe("950,00 ₺");
  });

  it("boş veya geçersiz değeri 0 gösterir", () => {
    expect(formatMoney(null)).toBe("0,00 ₺");
    expect(formatMoney("abc")).toBe("0,00 ₺");
  });
});

describe("tarih/saat", () => {
  it("UTC zamanı İstanbul saatine çevirir", () => {
    // 16:00 UTC = 19:00 İstanbul
    expect(formatTime("2026-11-02T16:00:00Z")).toBe("19:00");
    expect(formatDate("2026-11-02T16:00:00Z")).toBe("2 Kas 2026");
    expect(formatDateTime("2026-11-02T16:00:00Z")).toBe("2 Kas 2026 · 19:00");
  });

  it("gece yarısını geçen UTC saatinde günü doğru verir", () => {
    // 22:30 UTC 1 Kasım = 01:30 İstanbul 2 Kasım
    expect(formatDate("2026-11-01T22:30:00Z")).toBe("2 Kas 2026");
  });
});

describe("getPeriodRange", () => {
  it("hafta Pazartesi 00:00 İstanbul'da başlar", () => {
    // 23 Ekim 2026 Cuma
    const { start, end } = getPeriodRange("week", new Date("2026-10-23T12:00:00Z"));
    expect(start.toISOString()).toBe("2026-10-18T21:00:00.000Z"); // 19 Eki Pzt 00:00 TR
    expect(end.toISOString()).toBe("2026-10-25T21:00:00.000Z"); // 26 Eki Pzt 00:00 TR
  });

  it("Pazar gecesi İstanbul saatiyle hâlâ aynı haftadadır", () => {
    // 25 Ekim Pazar 23:30 TR = 20:30 UTC
    const { start } = getPeriodRange("week", new Date("2026-10-25T20:30:00Z"));
    expect(start.toISOString()).toBe("2026-10-18T21:00:00.000Z");
  });

  it("Pazartesi 00:30 İstanbul yeni haftadır (UTC'de hâlâ Pazar)", () => {
    const { start } = getPeriodRange("week", new Date("2026-10-25T21:30:00Z"));
    expect(start.toISOString()).toBe("2026-10-25T21:00:00.000Z");
  });

  it("ay, ayın 1'i 00:00 İstanbul'da başlar", () => {
    const { start, end } = getPeriodRange("month", new Date("2026-10-31T22:00:00Z")); // 1 Kas 01:00 TR
    expect(start.toISOString()).toBe("2026-10-31T21:00:00.000Z");
    expect(end.toISOString()).toBe("2026-11-30T21:00:00.000Z");
  });

  it("yıl geçişinde haftayı doğru hesaplar", () => {
    // 1 Ocak 2027 Cuma → hafta 28 Aralık 2026 Pazartesi
    const { start } = getPeriodRange("week", new Date("2027-01-01T09:00:00Z"));
    expect(start.toISOString()).toBe("2026-12-27T21:00:00.000Z");
  });
});

describe("shiftPeriod", () => {
  it("önceki/sonraki haftaya ve aya geçer", () => {
    const ref = new Date("2026-10-23T12:00:00Z");
    expect(getPeriodRange("week", shiftPeriod("week", ref, 1)).start.toISOString()).toBe(
      "2026-10-25T21:00:00.000Z",
    );
    expect(getPeriodRange("month", shiftPeriod("month", ref, -1)).start.toISOString()).toBe(
      "2026-08-31T21:00:00.000Z",
    );
    expect(
      getPeriodRange(
        "month",
        shiftPeriod("month", new Date("2027-01-15T12:00:00Z"), -1),
      ).start.toISOString(),
    ).toBe("2026-11-30T21:00:00.000Z");
  });
});

describe("ay anahtarları", () => {
  it("İstanbul saatine göre ayı bulur", () => {
    expect(toMonthKey(new Date("2026-10-31T21:30:00Z"))).toBe("2026-11-01"); // 1 Kas 00:30 TR
    expect(toMonthKey(new Date("2026-10-31T20:30:00Z"))).toBe("2026-10-01");
  });

  it("ay kaydırır ve yıl geçişini doğru yapar", () => {
    expect(shiftMonthKey("2026-12-01", 1)).toBe("2027-01-01");
    expect(shiftMonthKey("2026-01-01", -1)).toBe("2025-12-01");
  });

  it("ay adını Türkçe yazar ve biçimi doğrular", () => {
    expect(formatMonthKey("2026-10-01")).toBe("Ekim 2026");
    expect(isMonthKey("2026-10-01")).toBe(true);
    expect(isMonthKey("2026-10-15")).toBe(false);
  });
});

describe("uzun tarih ve gün aralığı", () => {
  it("referanstaki gibi '23 Ekim 2026 Cuma' yazar", () => {
    expect(formatLongDate("2026-10-23T09:00:00Z")).toBe("23 Ekim 2026 Cuma");
  });
  it("günü İstanbul gece yarısından başlatır", () => {
    const { start, end } = getDayRange(new Date("2026-10-23T22:30:00Z")); // 24 Eki 01:30 TR
    expect(start.toISOString()).toBe("2026-10-23T21:00:00.000Z");
    expect(end.toISOString()).toBe("2026-10-24T21:00:00.000Z");
  });
});
