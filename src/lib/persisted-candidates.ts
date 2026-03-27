import type { Candidate } from "@/types/candidate";

const LS_KEY = "talenttrack:candidates:v1";

export function loadPersistedCandidates(): Candidate[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Candidate[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function persistCandidates(candidates: Candidate[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(candidates));
  } catch {
    // Ignore: storage may be full or disabled.
  }
}

