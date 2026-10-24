// Hesap yönetimi için saf kurallar.

/**
 * Öğrenci kalıcı olarak silinebilir mi? Ders veya tahsilat geçmişi olan öğrenci
 * silinmez (hakediş ve gelir kayıtları bozulur); pasife alınır.
 * Silinebiliyorsa null, değilse kullanıcıya gösterilecek sebep döner.
 */
export function studentDeleteBlocker(history: {
  lessons: number;
  payments: number;
}): string | null {
  if (history.lessons === 0 && history.payments === 0) return null;
  const parts = [
    history.lessons > 0 && `${history.lessons} ders`,
    history.payments > 0 && `${history.payments} tahsilat`,
  ].filter(Boolean);
  return `Bu öğrencinin ${parts.join(" ve ")} kaydı var; geçmiş korunsun diye silinemez. Bunun yerine hesabı pasife alın.`;
}
