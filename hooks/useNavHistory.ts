/**
 * hooks/useNavHistory.ts
 *
 * Manages internal navigation history in sessionStorage.
 * Mirrors the same sessionStorage pattern used by cartContext (bambumm_cart).
 *
 * Storage key : "bambumm_nav_history"
 * Shape       : string[]  — ordered array of visited pathnames
 *               e.g. ["/", "/products", "/products/bambumm-core"]
 *
 * Rules enforced:
 *   1. Only stores pathnames (no query strings, no external URLs)
 *   2. No consecutive duplicates
 *   3. Survives browser refresh (sessionStorage persists per-tab)
 *   4. Clears naturally when tab closes
 */

import { useCallback } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "bambumm_nav_history";
const MAX_HISTORY = 50; // prevent unbounded growth

// ─── Raw sessionStorage helpers (safe for SSR) ────────────────────────────────

function readHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(history: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Call this from NavigationTracker on every route change.
 * Pushes the pathname if it differs from the last stored entry.
 */
export function pushRoute(pathname: string): void {
  const history = readHistory();
  const last = history[history.length - 1];

  // Deduplicate consecutive identical routes
  if (last === pathname) return;

  const next = [...history, pathname].slice(-MAX_HISTORY);
  writeHistory(next);
}

/**
 * Returns a goBack function.
 * Usage: const { goBack } = useNavHistory();
 *
 * goBack() pops the current route off the stack and navigates
 * to the previous one. If no internal history exists, goes to "/".
 */
export function useNavHistory() {
  const router = useRouter();

  const goBack = useCallback(() => {
    const history = readHistory();

    // Need at least 2 entries: [previous, current]
    if (history.length >= 2) {
      // Remove current page from history
      const next = history.slice(0, -1);
      writeHistory(next);

      // Navigate to what is now the last entry
      const destination = next[next.length - 1];
      router.push(destination);
    } else {
      // No internal history (direct landing / external referrer)
      // Clear whatever fragment is stored and go home
      writeHistory([]);
      router.push("/");
    }
  }, [router]);

  return { goBack };
}