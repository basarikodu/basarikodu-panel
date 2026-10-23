import { describe, expect, it } from "vitest";
import {
  creditTone,
  monthProgress,
  packagesToCopy,
  suggestedPackagePrice,
  type CreditRow,
} from "./rules";

const row = (r: Partial<CreditRow>): CreditRow => ({
  total_credits: 8,
  used_credits: 0,
  remaining: 8,
  month_package: 8,
  month_completed: 0,
  carried_over: 0,
  ...r,
});

describe("creditTone", () => {
  it("paket yoksa 'none'", () => {
    expect(creditTone(null)).toBe("none");
    expect(creditTone(row({ total_credits: 0, remaining: 0 }))).toBe("none");
  });
  it("kalan hakka göre ton", () => {
    expect(creditTone(row({ remaining: 5 }))).toBe("ok");
    expect(creditTone(row({ remaining: 2 }))).toBe("low");
    expect(creditTone(row({ remaining: 0 }))).toBe("out");
    expect(creditTone(row({ remaining: -1 }))).toBe("out");
  });
});

describe("monthProgress", () => {
  it("devreden hak bu ayın kullanılabilir hakkına eklenir", () => {
    expect(monthProgress(row({ carried_over: 2, month_package: 8, month_completed: 5 }))).toEqual({
      available: 10,
      pct: 50,
    });
  });
  it("negatif devir (fazla ders) kullanılabilir hakkı azaltmaz", () => {
    expect(
      monthProgress(row({ carried_over: -1, month_package: 4, month_completed: 2 })).available,
    ).toBe(4);
  });
  it("paket yoksa %0", () => {
    expect(monthProgress(row({ month_package: 0, carried_over: 0, month_completed: 0 })).pct).toBe(
      0,
    );
  });
});

describe("packagesToCopy", () => {
  const prev = [
    { student_id: "a", lesson_count: 8, price_total: 6800, note: "Haftada 2" },
    { student_id: "b", lesson_count: 12, price_total: 9600, note: null },
    { student_id: "c", lesson_count: 4, price_total: 3800, note: null },
  ];
  it("yeni ayda paketi olanı ve pasif öğrenciyi atlar", () => {
    const out = packagesToCopy(prev, ["b"], ["a", "b"]);
    expect(out).toEqual([
      { student_id: "a", lesson_count: 8, price_total: 6800, note: "Haftada 2" },
    ]);
  });
});

describe("suggestedPackagePrice", () => {
  const prices = { single: 950, multi: 850 };
  it("haftada 1 ders (4 ders) tek ders fiyatından", () => {
    expect(suggestedPackagePrice(4, prices)).toBe(3800);
  });
  it("haftada 2 ve üzeri (8+ ders) indirimli fiyattan", () => {
    expect(suggestedPackagePrice(8, prices)).toBe(6800);
    expect(suggestedPackagePrice(12, prices)).toBe(10200);
  });
  it("kurucu fiyatı değiştirince öneri değişir", () => {
    expect(suggestedPackagePrice(8, { single: 1000, multi: 900 })).toBe(7200);
  });
  it("geçersiz sayı 0", () => {
    expect(suggestedPackagePrice(0, prices)).toBe(0);
  });
});
