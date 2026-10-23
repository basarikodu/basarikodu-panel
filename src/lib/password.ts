import "server-only";
import { randomInt } from "node:crypto";

// Karıştırılabilecek karakterler (0/O, 1/l/I) yok; WhatsApp'tan okunup yazılabilir.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/** "bk-7hq2-m9xp" biçiminde geçici şifre */
export function generateTempPassword(): string {
  const part = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `bk-${part()}-${part()}`;
}
