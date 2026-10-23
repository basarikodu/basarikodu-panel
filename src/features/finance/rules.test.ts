import { describe, expect, it } from "vitest";
import {
  changePct,
  incomeExpense,
  periodLabel,
  periodOf,
  shiftPeriod,
  studentBalances,
  tutorDues,
} from "./rules";

describe("dönemler", () => {
  it("hafta Pazartesi başlar, sonraki Pazartesi hariç", () => {
    expect(periodOf("hafta", "2026-10-23")).toEqual({
      kind: "hafta",
      start: "2026-10-19",
      end: "2026-10-26",
    });
  });
  it("ay 1'inde başlar, yıl geçişi doğru", () => {
    expect(periodOf("ay", "2026-12-15")).toEqual({
      kind: "ay",
      start: "2026-12-01",
      end: "2027-01-01",
    });
  });
  it("önceki/sonraki dönem", () => {
    expect(shiftPeriod(periodOf("ay", "2026-01-10"), -1).start).toBe("2025-12-01");
    expect(shiftPeriod(periodOf("hafta", "2026-10-23"), 1).start).toBe("2026-10-26");
  });
  it("Türkçe etiket", () => {
    expect(periodLabel(periodOf("ay", "2026-10-23"))).toBe("Ekim 2026");
    expect(periodLabel(periodOf("hafta", "2026-10-23"))).toBe("19 – 25 Ekim 2026");
    expect(periodLabel(periodOf("hafta", "2026-10-28"))).toBe("26 Ekim – 1 Kasım 2026");
  });
});

describe("tutorDues", () => {
  const lessons = [
    { tutor_id: "a", tutor_rate_snapshot: 400, payout_id: "p1", is_free: false },
    { tutor_id: "a", tutor_rate_snapshot: 400, payout_id: null, is_free: false },
    { tutor_id: "a", tutor_rate_snapshot: 0, payout_id: null, is_free: true },
    { tutor_id: "b", tutor_rate_snapshot: 250, payout_id: null, is_free: false },
  ];
  it("ödenen ve bekleyeni ders bazında ayırır; hediye koçluk 0 TL", () => {
    const a = tutorDues(lessons).find((d) => d.tutorId === "a")!;
    expect(a).toEqual({
      tutorId: "a",
      lessonCount: 3,
      freeCount: 1,
      total: 800,
      paidTotal: 400,
      dueTotal: 400,
      dueCount: 2,
    });
    expect(tutorDues(lessons).find((d) => d.tutorId === "b")!.dueTotal).toBe(250);
  });
});

describe("gelir-gider ve bakiye", () => {
  it("net = tahsilat – eğitmen hakedişi", () => {
    expect(
      incomeExpense(
        [{ amount: 6800 }, { amount: 5000 }],
        [{ tutor_rate_snapshot: 400 }, { tutor_rate_snapshot: 0 }],
      ),
    ).toEqual({ income: 11800, expense: 400, net: 11400 });
  });
  it("öğrenci bekleyen tahsilatı", () => {
    const b = studentBalances(
      [
        { student_id: "x", price_total: 9600 },
        { student_id: "x", price_total: 9600 },
      ],
      [{ student_id: "x", amount: 5000 }],
    );
    expect(b).toEqual([{ studentId: "x", billed: 19200, paid: 5000, outstanding: 14200 }]);
  });
  it("değişim yüzdesi", () => {
    expect(changePct(120, 100)).toBe(20);
    expect(changePct(50, 0)).toBeNull();
  });
});
