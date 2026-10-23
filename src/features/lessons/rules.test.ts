import { describe, expect, it } from "vitest";
import {
  addDays,
  buildOccurrences,
  canRecordResult,
  canRequestChange,
  canWithdraw,
  findConflicts,
  istanbulToUtc,
  isDateKey,
  isTimeValue,
  toDateKey,
  toTimeValue,
  weekStartOf,
} from "./rules";

describe("İstanbul tarih yardımcıları", () => {
  it("İstanbul saatini UTC'ye çevirir", () => {
    expect(istanbulToUtc("2026-10-27", "19:00").toISOString()).toBe("2026-10-27T16:00:00.000Z");
    expect(istanbulToUtc("2026-10-27", "01:30").toISOString()).toBe("2026-10-26T22:30:00.000Z");
  });
  it("UTC anından İstanbul günü ve saati", () => {
    expect(toDateKey(new Date("2026-10-26T22:30:00Z"))).toBe("2026-10-27");
    expect(toTimeValue(new Date("2026-10-26T22:30:00Z"))).toBe("01:30");
  });
  it("gün ekler ve haftanın Pazartesisini bulur", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(weekStartOf("2026-10-23")).toBe("2026-10-19"); // Cuma → Pazartesi
    expect(weekStartOf("2026-10-25")).toBe("2026-10-19"); // Pazar → aynı hafta
    expect(weekStartOf("2026-10-26")).toBe("2026-10-26"); // Pazartesi
  });
  it("biçimleri doğrular", () => {
    expect(isDateKey("2026-10-27")).toBe(true);
    expect(isDateKey("27.10.2026")).toBe(false);
    expect(isTimeValue("19:00")).toBe(true);
    expect(isTimeValue("24:00")).toBe(false);
  });
});

describe("buildOccurrences", () => {
  it("haftalık tekrar eden dersleri üretir", () => {
    const occ = buildOccurrences("2026-10-27", "19:00", 60, 3);
    expect(occ).toEqual([
      { starts_at: "2026-10-27T16:00:00.000Z", ends_at: "2026-10-27T17:00:00.000Z" },
      { starts_at: "2026-11-03T16:00:00.000Z", ends_at: "2026-11-03T17:00:00.000Z" },
      { starts_at: "2026-11-10T16:00:00.000Z", ends_at: "2026-11-10T17:00:00.000Z" },
    ]);
  });
  it("koçluk süresi 40 dk", () => {
    expect(buildOccurrences("2026-10-27", "20:00", 40, 1)[0].ends_at).toBe(
      "2026-10-27T17:40:00.000Z",
    );
  });
});

describe("findConflicts", () => {
  const existing = [{ starts_at: "2026-11-03T16:30:00.000Z", ends_at: "2026-11-03T17:30:00.000Z" }];
  it("yalnızca çakışan oturumları döndürür", () => {
    const occ = buildOccurrences("2026-10-27", "19:00", 60, 3);
    expect(findConflicts(occ, existing).map((o) => o.starts_at)).toEqual([
      "2026-11-03T16:00:00.000Z",
    ]);
  });
  it("arka arkaya dersler çakışma sayılmaz", () => {
    const occ = buildOccurrences("2026-11-03", "20:30", 60, 1);
    expect(findConflicts(occ, existing)).toEqual([]);
  });
});

describe("eğitmen işlem izinleri", () => {
  const now = new Date("2026-10-23T12:00:00Z");
  const past = "2026-10-20T16:00:00Z";
  const future = "2026-10-27T16:00:00Z";
  it("sonuç yalnızca onaylı ve başlamış derse girilir", () => {
    expect(
      canRecordResult({ status: "planned", approval_status: "approved", starts_at: past }, now),
    ).toBe(true);
    expect(
      canRecordResult({ status: "planned", approval_status: "approved", starts_at: future }, now),
    ).toBe(false);
    expect(
      canRecordResult({ status: "planned", approval_status: "pending", starts_at: past }, now),
    ).toBe(false);
    expect(
      canRecordResult(
        { status: "cancelled_by_tutor", approval_status: "approved", starts_at: past },
        now,
      ),
    ).toBe(false);
  });
  it("talep yalnızca onaylı planlı derse ve bekleyen talep yokken", () => {
    const l = { status: "planned", approval_status: "approved", starts_at: future };
    expect(canRequestChange(l)).toBe(true);
    expect(canRequestChange({ ...l, hasPendingChange: true })).toBe(false);
    expect(canRequestChange({ ...l, status: "completed" })).toBe(false);
  });
  it("geri çekme yalnızca onaylanmamış derste", () => {
    expect(canWithdraw({ status: "planned", approval_status: "pending", starts_at: future })).toBe(
      true,
    );
    expect(canWithdraw({ status: "planned", approval_status: "approved", starts_at: future })).toBe(
      false,
    );
  });
});
