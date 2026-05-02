"use client";

import { useEffect, useRef } from "react";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Package,
  LogIn,
} from "lucide-react";
import { useCart } from "@/context/cartContext";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const {
    items,
    totalItems,
    totalPrice,
    isOpen,
    closeCart,
    removeItem,
    updateQty,
  } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeCart]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout"); // Everyone goes straight to checkout now!
  };

  return (
    <>
      <style>{`
        .cart-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          z-index: 200; opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .cart-overlay.open { opacity: 1; pointer-events: all; }

        .cart-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(420px, 100vw);
          background: #fff;
          z-index: 201;
          display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.32, 0, 0.67, 0);
          box-shadow: -8px 0 40px rgba(0,0,0,0.12);
        }
        .cart-drawer.open {
          transform: translateX(0);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .cart-item-row {
          transition: background 0.15s ease;
        }
        .cart-item-row:hover { background: rgba(200,169,126,0.04); }

        .cart-qty-btn {
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--nav-border);
          background: transparent; cursor: pointer;
          color: var(--nav-fg-muted);
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .cart-qty-btn:hover {
          border-color: var(--nav-accent);
          color: var(--nav-accent);
          background: rgba(200,169,126,0.08);
        }
        .cart-qty-btn:disabled {
          opacity: 0.35; cursor: not-allowed;
        }
        .cart-qty-btn:disabled:hover {
          border-color: var(--nav-border);
          color: var(--nav-fg-muted);
          background: transparent;
        }

        .cart-remove-btn {
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid transparent; background: transparent; cursor: pointer;
          color: var(--nav-fg-muted);
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .cart-remove-btn:hover {
          border-color: rgba(217,79,61,0.3);
          color: var(--nav-sale);
          background: rgba(217,79,61,0.06);
        }

        .cart-checkout-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 16px;
          background: var(--nav-accent); color: #fff;
          border: none; cursor: pointer;
          font-family: var(--nav-font-ui); font-size: 12px;
          font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          transition: background 0.2s ease;
        }
        .cart-checkout-btn:hover { background: var(--nav-accent-hover); }

        .cart-login-note {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 12px; margin-bottom: 12px;
          background: rgba(200,169,126,0.08);
          border: 1px solid var(--nav-border);
          font-size: 11px; color: var(--nav-fg-muted);
        }

        @keyframes cartItemIn {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .cart-item-animate {
          animation: cartItemIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
      `}</style>

      {/* Overlay */}
      <div
        className={`cart-overlay ${isOpen ? "open" : ""}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`cart-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{
            borderBottom: "1px solid var(--nav-border)",
            background: "var(--nav-bg)",
          }}
        >
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} style={{ color: "var(--nav-accent)" }} />
            <div>
              <h2
                className="text-sm font-bold uppercase tracking-widest"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--nav-fg)",
                }}
              >
                Your Cart
              </h2>
              {totalItems > 0 && (
                <p
                  className="text-[10px] tracking-wide"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center transition-all duration-150"
            style={{
              border: "1px solid var(--nav-border)",
              color: "var(--nav-fg-muted)",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--nav-accent)";
              e.currentTarget.style.color = "var(--nav-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--nav-border)";
              e.currentTarget.style.color = "var(--nav-fg-muted)";
            }}
            aria-label="Close cart"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Gold accent line ── */}
        <div
          className="h-0.5 shrink-0"
          style={{ background: "var(--nav-accent)" }}
        />

        {/* ── Items ── */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-5">
              <div
                className="w-16 h-16 flex items-center justify-center"
                style={{
                  background: "rgba(200,169,126,0.1)",
                  border: "1px solid var(--nav-border)",
                }}
              >
                <Package
                  size={28}
                  style={{ color: "var(--nav-accent)", opacity: 0.6 }}
                />
              </div>
              <div>
                <p
                  className="text-base font-bold uppercase tracking-widest mb-2"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-fg)",
                  }}
                >
                  Your cart is empty
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  Add some bamboo comfort to your life.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="px-6 py-3 text-xs font-bold tracking-[0.14em] uppercase transition-colors duration-200"
                style={{
                  background: "var(--nav-accent)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--nav-accent-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--nav-accent)")
                }
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div
              className="divide-y"
              style={{ borderColor: "var(--nav-border)" }}
            >
              {items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.colorName}`}
                  className="cart-item-row cart-item-animate flex gap-4 p-5"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* Image */}
                  <div
                    className="w-18 h-22 shrink-0 overflow-hidden relative"
                    style={{
                      width: 72,
                      height: 88,
                      border: "1px solid var(--nav-border)",
                      background: "var(--nav-bg)",
                    }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package
                          size={20}
                          style={{ color: "var(--nav-accent)", opacity: 0.4 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <p
                          className="text-sm font-bold uppercase tracking-wide leading-tight truncate"
                          style={{
                            fontFamily: "var(--nav-font)",
                            color: "var(--nav-fg)",
                          }}
                        >
                          {item.name}
                        </p>
                        <p
                          className="text-[10px] tracking-[0.1em] uppercase mt-0.5"
                          style={{ color: "var(--nav-fg-muted)" }}
                        >
                          {item.category}
                        </p>
                      </div>
                      <button
                        className="cart-remove-btn flex-shrink-0"
                        onClick={() =>
                          removeItem(item.productId, item.colorName, item.size)
                        }
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Color swatch */}
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0"
                        style={{
                          background: item.colorHex,
                          borderColor: "var(--nav-border)",
                        }}
                      />
                      <span
                        className="text-[10px] "
                        style={{ color: "var(--nav-fg-muted)" }}
                      >
                        {item.colorName}· Size: {item.size} · Qty:{" "}
                        {item.quantity}
                      </span>
                    </div>

                    {/* Qty + Price row */}
                    <div className="flex items-center justify-between">
                      {/* Quantity stepper */}
                      <div
                        className="flex items-center"
                        style={{ border: "1px solid var(--nav-border)" }}
                      >
                        <button
                          className="cart-qty-btn"
                          onClick={() =>
                            updateQty(
                              item.productId,
                              item.colorName,
                              item.size,
                              item.quantity - 1,
                            )
                          }
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={11} />
                        </button>
                        <span
                          className="w-9 text-center font-bold text-sm"
                          style={{
                            color: "var(--nav-fg)",
                            fontFamily: "var(--nav-font)",
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          className="cart-qty-btn"
                          onClick={() =>
                            updateQty(
                              item.productId,
                              item.colorName,
                              item.size,
                              item.quantity + 1,
                            )
                          }
                          aria-label="Increase quantity"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Line price */}
                      <p
                        className="text-sm font-bold"
                        style={{
                          color: "var(--nav-fg)",
                          fontFamily: "var(--nav-font)",
                        }}
                      >
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Stock warning */}
                    {item.quantity >= item.stock && (
                      <p
                        className="text-[10px] mt-1.5"
                        style={{ color: "var(--nav-sale)" }}
                      >
                        Max stock reached ({item.stock} units)
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer / Summary ── */}
        {items.length > 0 && (
          <div
            className="flex-shrink-0 p-5"
            style={{
              borderTop: "1px solid var(--nav-border)",
              background: "var(--nav-bg)",
            }}
          >
            {/* Order summary */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs tracking-wide"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})
                </span>
                <span
                  className="text-sm font-bold"
                  style={{
                    color: "var(--nav-fg)",
                    fontFamily: "var(--nav-font)",
                  }}
                >
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs tracking-wide"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  Shipping
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#27ae60" }}
                >
                  Free
                </span>
              </div>

              {/* Divider */}
              <div
                className="h-px my-1"
                style={{ background: "var(--nav-border)" }}
              />

              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-bold uppercase tracking-widest"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-fg)",
                  }}
                >
                  Total
                </span>
                <span
                  className="text-lg font-bold"
                  style={{
                    color: "var(--nav-accent)",
                    fontFamily: "var(--nav-font)",
                  }}
                >
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Tax note */}
            <p
              className="text-[10px] text-center mb-4"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              Inclusive of all taxes · Free shipping on all orders
            </p>

            {/* Checkout CTA */}
            <button className="cart-checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
              <ArrowRight size={14} />
            </button>

            <button
              onClick={closeCart}
              className="w-full text-center text-[11px] tracking-[0.1em] uppercase mt-3 py-2 transition-colors duration-150"
              style={{
                color: "var(--nav-fg-muted)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--nav-accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--nav-fg-muted)")
              }
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
