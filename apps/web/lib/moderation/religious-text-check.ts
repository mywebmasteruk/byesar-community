// Hook for the religious-text checker. Default: does nothing. A checker plugs in by
// implementing this interface; a flagged post is held for a human moderator and is
// shown with the "community opinion, not a fatwa or advice" label.
export type ReligiousCheckResult = { flagged: boolean; notes?: string[] };
export interface ReligiousTextChecker {
  check(text: string, locale: "en" | "ar"): Promise<ReligiousCheckResult>;
}
export const noopChecker: ReligiousTextChecker = {
  async check() {
    return { flagged: false };
  },
};
let active: ReligiousTextChecker = noopChecker;
export const setReligiousTextChecker = (c: ReligiousTextChecker) => { active = c; };
export const checkReligiousText = (t: string, l: "en" | "ar") => active.check(t, l);
