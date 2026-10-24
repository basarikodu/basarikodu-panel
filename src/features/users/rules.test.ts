import { describe, expect, it } from "vitest";
import { studentDeleteBlocker } from "./rules";

describe("studentDeleteBlocker", () => {
  it("geçmişi olmayan öğrenci silinebilir", () => {
    expect(studentDeleteBlocker({ lessons: 0, payments: 0 })).toBeNull();
  });

  it("ders veya tahsilat varsa silmeyi engeller ve sebebi söyler", () => {
    expect(studentDeleteBlocker({ lessons: 3, payments: 0 })).toContain("3 ders");
    expect(studentDeleteBlocker({ lessons: 0, payments: 1 })).toContain("1 tahsilat");
    expect(studentDeleteBlocker({ lessons: 2, payments: 1 })).toContain("2 ders ve 1 tahsilat");
  });
});
