// context/wishlistContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { WishlistItem } from "@/lib/types/wishlist";
import { useAuth } from "@/context/authContext";

interface WishlistContextValue {
  items: WishlistItem[];
  totalItems: number;
  isOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  mergeGuestWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const LS_KEY = "bambumm_wishlist";

// ── localStorage helpers ───────────────────────────────────────────────────

const lsGet = (): WishlistItem[] => {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
};

const lsSet = (items: WishlistItem[]): void => {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
};

const lsClear = (): void => {
  try {
    window.localStorage.removeItem(LS_KEY);
  } catch {}
};

// ── Provider ───────────────────────────────────────────────────────────────

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [serverLoaded, setServerLoaded] = useState(false);

  const openWishlist = useCallback(() => setIsOpen(true), []);
  const closeWishlist = useCallback(() => setIsOpen(false), []);

  // ── Server fetch for logged-in users ──────────────────────────────────────

  const loadFromServer = useCallback(async () => {
    try {
      const res = await fetch("/api/user/wishlist");
      if (!res.ok) return;
      const data = await res.json();
      const serverItems: WishlistItem[] = data.items ?? [];
      setItems(serverItems);
      setServerLoaded(true);
    } catch {
      // fall through — keep existing state
    }
  }, []);

  const syncToServer = useCallback(async (nextItems: WishlistItem[]) => {
    try {
      await fetch("/api/user/wishlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: nextItems }),
      });
    } catch {}
  }, []);

  // ── Guest → DB merge on login ─────────────────────────────────────────────
  // Called by authContext after successful login/register.
  // Takes localStorage items and merges them into the server wishlist,
  // then clears localStorage.

  const mergeGuestWishlist = useCallback(async () => {
    const guestItems = lsGet();
    if (guestItems.length === 0) {
      // No guest items — just load from server
      await loadFromServer();
      return;
    }

    try {
      const res = await fetch("/api/user/wishlist");
      if (!res.ok) {
        await loadFromServer();
        return;
      }
      const data = await res.json();
      const serverItems: WishlistItem[] = data.items ?? [];

      // Merge: guest items take precedence for addedAt, dedup by productId
      const merged = [...serverItems];
      for (const guestItem of guestItems) {
        const exists = merged.some((s) => s.productId === guestItem.productId);
        if (!exists) {
          merged.push(guestItem);
        }
      }

      // Persist merged list
      await syncToServer(merged);
      setItems(merged);
      setServerLoaded(true);
      lsClear(); // guest list no longer needed
    } catch {
      await loadFromServer();
    }
  }, [loadFromServer, syncToServer]);
  const { registerLoginCallback } = useAuth();
  useEffect(() => {
    registerLoginCallback(mergeGuestWishlist);
  }, [registerLoginCallback, mergeGuestWishlist]);

  useEffect(() => {
    setItems(lsGet());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || authLoading) return;

    if (user && !serverLoaded) {
      // User is logged in — load from server (mergeGuestWishlist handles
      // the guest merge path; this handles page refresh while logged in)
      loadFromServer();
    }

    if (!user) {
      // Logged out — reset server state flag so next login triggers reload
      setServerLoaded(false);
    }
  }, [user, authLoading, hydrated, serverLoaded, loadFromServer]);

  // ── Persist to localStorage for guests ───────────────────────────────────

  useEffect(() => {
    if (!hydrated || authLoading) return;
    if (user) return; // logged-in: server is source of truth
    lsSet(items);
  }, [items, hydrated, user, authLoading]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const addItem = useCallback(
    (incoming: WishlistItem) => {
      setItems((prev) => {
        const exists = prev.some((i) => i.productId === incoming.productId);
        if (exists) return prev;
        const next = [{ ...incoming, addedAt: Date.now() }, ...prev];
        if (user) syncToServer(next);
        return next;
      });
    },
    [user, syncToServer],
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.productId !== productId);
        if (user) syncToServer(next);
        return next;
      });
    },
    [user, syncToServer],
  );

  const isInWishlist = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items],
  );

  const totalItems = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        totalItems,
        isOpen,
        openWishlist,
        closeWishlist,
        addItem,
        removeItem,
        isInWishlist,
        mergeGuestWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
