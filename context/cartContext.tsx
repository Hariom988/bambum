"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// ─── Types

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  colorName: string;
  colorHex: string;
  image: string;
  quantity: number;
  stock: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, colorName: string) => void;
  updateQty: (productId: string, colorName: string, qty: number) => void;
  clearCart: () => void;
  isInCart: (productId: string, colorName: string) => boolean;
  getItemQty: (productId: string, colorName: string) => number;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "bambumm_cart";

// Safe sessionStorage accessor — SSR-safe
const ssGet = (): CartItem[] => {
  try {
    const raw = window.sessionStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const ssSet = (items: CartItem[]): void => {
  try {
    window.sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // sessionStorage quota exceeded or blocked — fail silently
  }
};

const ssClear = (): void => {
  try {
    window.sessionStorage.removeItem(CART_KEY);
  } catch {}
};

function itemKey(productId: string, colorName: string) {
  return `${productId}__${colorName}`;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from sessionStorage once on mount (client only)
  useEffect(() => {
    setItems(ssGet());
    setHydrated(true);
  }, []);

  // Persist to sessionStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    ssSet(items);
  }, [items, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((incoming: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const key = itemKey(incoming.productId, incoming.colorName);
      const existing = prev.find(
        (i) => itemKey(i.productId, i.colorName) === key,
      );
      if (existing) {
        return prev.map((i) =>
          itemKey(i.productId, i.colorName) === key
            ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
            : i,
        );
      }
      return [...prev, { ...incoming, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, colorName: string) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          itemKey(i.productId, i.colorName) !== itemKey(productId, colorName),
      ),
    );
  }, []);

  const updateQty = useCallback(
    (productId: string, colorName: string, qty: number) => {
      if (qty <= 0) {
        removeItem(productId, colorName);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          itemKey(i.productId, i.colorName) === itemKey(productId, colorName)
            ? { ...i, quantity: Math.min(qty, i.stock) }
            : i,
        ),
      );
    },
    [removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    ssClear();
  }, []);

  const isInCart = useCallback(
    (productId: string, colorName: string) =>
      items.some(
        (i) =>
          itemKey(i.productId, i.colorName) === itemKey(productId, colorName),
      ),
    [items],
  );

  const getItemQty = useCallback(
    (productId: string, colorName: string) =>
      items.find(
        (i) =>
          itemKey(i.productId, i.colorName) === itemKey(productId, colorName),
      )?.quantity ?? 0,
    [items],
  );

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        isInCart,
        getItemQty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
