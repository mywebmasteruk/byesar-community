// Block list: returns the first blocked term found, or null. Case-insensitive.
export function findBlockedTerm(text: string, terms: string[]): string | null {
  const t = text.toLowerCase();
  return terms.find((x) => x && t.includes(x.toLowerCase())) ?? null;
}
