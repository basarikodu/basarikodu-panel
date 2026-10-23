/** Türkçe büyük/küçük harf duyarsız arama */
export function matchesQuery(q: string | undefined, ...fields: (string | null | undefined)[]) {
  if (!q) return true;
  const needle = q.toLocaleLowerCase("tr-TR");
  return fields.some((f) => f?.toLocaleLowerCase("tr-TR").includes(needle));
}
