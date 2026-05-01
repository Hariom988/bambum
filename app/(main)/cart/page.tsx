"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Package,
  Truck,
  ShieldCheck,
  Leaf,
  RotateCcw,
} from "lucide-react";
import { useCart } from "@/context/cartContext";
import { useAuth } from "@/context/authContext";

export default function CartPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, removeItem, updateQty } = useCart();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (!user) {
      router.push("/auth?returnUrl=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <>
      <style>{`
        /* ── Page entrance ── */
        @keyframes cpFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cp-enter   { animation: cpFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .cp-enter-1 { animation-delay: 0.05s; }
        .cp-enter-2 { animation-delay: 0.12s; }
        .cp-enter-3 { animation-delay: 0.20s; }

        /* ── Item row ── */
        .cp-item-row {
          transition: background 0.15s ease;
        }
        .cp-item-row:hover { background: rgba(200,169,126,0.04); }

        /* ── Qty buttons ── */
        .cp-qty-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--nav-border);
          background: transparent;
          cursor: pointer;
          color: var(--nav-fg-muted);
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .cp-qty-btn:hover:not(:disabled) {
          border-color: var(--nav-accent);
          color: var(--nav-accent);
          background: rgba(200,169,126,0.08);
        }
        .cp-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        /* ── Remove button ── */
        .cp-remove-btn {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          color: var(--nav-fg-muted);
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .cp-remove-btn:hover {
          border-color: rgba(217,79,61,0.35);
          color: var(--nav-sale);
          background: rgba(217,79,61,0.06);
        }

        /* ── Checkout button ── */
        .cp-checkout-btn {
          width: 100%; padding: 16px;
          background: var(--nav-accent); color: #fff;
          border: none; cursor: pointer;
          font-family: var(--nav-font-ui); font-size: 11px;
          font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.2s ease;
        }
        .cp-checkout-btn:hover { background: var(--nav-accent-hover); }

        /* ── Trust badge ── */
        .cp-trust {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 0;
          border-top: 1px solid var(--nav-border);
        }
        .cp-trust:first-child { border-top: none; }

        /* ── Continue shopping link ── */
        .cp-continue {
          display: inline-flex; align-items: center; gap: 6px;
          color: var(--nav-fg-muted);
          font-family: var(--nav-font-ui); font-size: 11px;
          font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          text-decoration: none;
          transition: color 0.15s;
          background: none; border: none; cursor: pointer; padding: 0;
        }
        .cp-continue:hover { color: var(--nav-accent); }

        /* ── Item animate in ── */
        @keyframes cpItemIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .cp-item-animate {
          animation: cpItemIn 0.35s cubic-bezier(0.22,1,0.36,1) both;
        }
      `}</style>

      <main
        className="min-h-screen"
        style={{
          background: "var(--nav-bg)",
          fontFamily: "var(--nav-font-ui)",
          color: "var(--nav-fg)",
        }}
      >
        {/* Top accent */}
        <div
          className="h-0.5 w-full"
          style={{ background: "var(--nav-accent)" }}
        />

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* ── Page header ── */}
          <div className="cp-enter mb-8">
            <button
              className="cp-continue mb-5"
              onClick={() => router.push("/products")}
            >
              <ArrowLeft size={13} />
              Continue Shopping
            </button>

            <div className="flex items-end justify-between gap-4">
              <div>
                <p
                  className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-1"
                  style={{ color: "var(--nav-fg)" }}
                >
                  {totalItems > 0
                    ? `${totalItems} item${totalItems !== 1 ? "s" : ""} in your cart`
                    : "Your cart"}
                </p>
                <h1
                  className="text-2xl md:text-4xl font-bold uppercase tracking-widest"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-fg)",
                  }}
                >
                  Shopping Cart
                </h1>
              </div>
              <ShoppingBag
                size={28}
                style={{ color: "var(--nav-fg)", opacity: 0.5 }}
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mt-4">
              <div
                className="h-px flex-1"
                style={{ background: "var(--nav-border)" }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--nav-fg)" }}
              />
              <div
                className="h-px w-8"
                style={{ background: "var(--nav-border)" }}
              />
            </div>
          </div>

          {/* ── Empty state ── */}
          {items.length === 0 && (
            <div
              className="cp-enter cp-enter-1 flex flex-col items-center justify-center py-24 text-center"
              style={{
                background: "#fff",
                border: "1px solid var(--nav-border)",
                boxShadow: "0 2px 16px rgba(200,169,126,0.06)",
              }}
            >
              <div
                className="w-20 h-20 flex items-center justify-center mb-6"
                style={{
                  background: "rgba(200,169,126,0.1)",
                  border: "1px solid var(--nav-border)",
                }}
              >
                <Package
                  size={32}
                  style={{ color: "var(--nav-fg)", opacity: 0.6 }}
                />
              </div>
              <p
                className="text-xl font-bold uppercase tracking-widest mb-3"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--nav-fg)",
                }}
              >
                Your cart is empty
              </p>
              <p
                className="text-sm mb-8 max-w-xs leading-relaxed"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                Add some bamboo comfort to your life. Explore our collection.
              </p>
              <button
                onClick={() => router.push("/products")}
                className="px-8 py-4 text-xs font-bold tracking-[0.14em] uppercase transition-colors duration-200"
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
                Shop the Collection
              </button>
            </div>
          )}

          {/* ── Cart with items ── */}
          {items.length > 0 && (
            <div className="grid md:grid-cols-[1fr_340px] gap-8 items-start">
              {/* LEFT: Cart items */}
              <div
                className="cp-enter cp-enter-1 flex flex-col gap-0 overflow-hidden"
                style={{
                  background: "#fff",
                  border: "1px solid var(--nav-border)",
                  boxShadow: "0 2px 16px rgba(200,169,126,0.06)",
                }}
              >
                {/* Column headers */}
                <div
                  className="hidden md:grid gap-4 px-6 py-3 border-b"
                  style={{
                    gridTemplateColumns: "80px 1fr 130px 100px 40px",
                    borderColor: "var(--nav-border)",
                    background: "rgba(200,169,126,0.04)",
                  }}
                >
                  {["Product", "", "Quantity", "Price", ""].map((h, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-bold tracking-[0.18em] uppercase"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Item rows */}
                <div
                  className="divide-y"
                  style={{ borderColor: "var(--nav-border)" }}
                >
                  {items.map((item, idx) => (
                    <div
                      key={`${item.productId}-${item.colorName}`}
                      className="cp-item-row cp-item-animate px-4 md:px-6 py-5"
                      style={{ animationDelay: `${idx * 0.06}s` }}
                    >
                      {/* Mobile layout */}
                      <div className="flex gap-4 md:hidden">
                        {/* Image */}
                        <div
                          className="w-20 h-24 shrink-0 overflow-hidden"
                          style={{
                            border: "1px solid var(--nav-border)",
                            background: "var(--nav-bg)",
                          }}
                        >
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={80}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-bold uppercase tracking-wide leading-snug mb-0.5"
                            style={{
                              fontFamily: "var(--nav-font)",
                              color: "var(--nav-fg)",
                            }}
                          >
                            {item.name}
                          </p>
                          <p
                            className="text-[10px] uppercase tracking-wide mb-2"
                            style={{ color: "var(--nav-accent)" }}
                          >
                            {item.category}
                          </p>
                          <div className="flex items-center gap-1.5 mb-3">
                            <div
                              className="w-3 h-3 rounded-full border"
                              style={{
                                background: item.colorHex,
                                borderColor: "var(--nav-border)",
                              }}
                            />
                            <span
                              className="text-[10px]"
                              style={{ color: "var(--nav-fg-muted)" }}
                            >
                              {item.colorName}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Qty stepper */}
                            <div
                              className="flex items-center"
                              style={{ border: "1px solid var(--nav-border)" }}
                            >
                              <button
                                className="cp-qty-btn"
                                onClick={() =>
                                  updateQty(
                                    item.productId,
                                    item.colorName,
                                    item.quantity - 1,
                                  )
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={12} />
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
                                className="cp-qty-btn"
                                onClick={() =>
                                  updateQty(
                                    item.productId,
                                    item.colorName,
                                    item.quantity + 1,
                                  )
                                }
                                disabled={item.quantity >= item.stock}
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <p
                                className="text-base font-bold"
                                style={{
                                  fontFamily: "var(--nav-font)",
                                  color: "var(--nav-fg)",
                                }}
                              >
                                ₹
                                {(item.price * item.quantity).toLocaleString(
                                  "en-IN",
                                )}
                              </p>
                              <button
                                className="cp-remove-btn"
                                onClick={() =>
                                  removeItem(item.productId, item.colorName)
                                }
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop layout */}
                      <div
                        className="hidden md:grid gap-4 items-center"
                        style={{
                          gridTemplateColumns: "80px 1fr 130px 100px 40px",
                        }}
                      >
                        {/* Image */}
                        <div
                          className="w-20 h-24 overflow-hidden"
                          style={{
                            border: "1px solid var(--nav-border)",
                            background: "var(--nav-bg)",
                          }}
                        >
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={80}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* Product info */}
                        <div>
                          <p
                            className="text-sm font-bold uppercase tracking-wide leading-snug mb-0.5"
                            style={{
                              fontFamily: "var(--nav-font)",
                              color: "var(--nav-fg)",
                            }}
                          >
                            {item.name}
                          </p>
                          <p
                            className="text-[10px] uppercase tracking-wide mb-1.5"
                            style={{ color: "var(--nav-accent)" }}
                          >
                            {item.category}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-3 h-3 rounded-full border"
                              style={{
                                background: item.colorHex,
                                borderColor: "var(--nav-border)",
                              }}
                            />
                            <span
                              className="text-[10px]"
                              style={{ color: "var(--nav-fg-muted)" }}
                            >
                              {item.colorName}
                            </span>
                          </div>
                          <p
                            className="text-[10px] mt-1"
                            style={{ color: "var(--nav-fg-muted)" }}
                          >
                            ₹{item.price.toLocaleString("en-IN")} each
                          </p>
                        </div>

                        {/* Qty stepper */}
                        <div
                          className="flex items-center"
                          style={{
                            border: "1px solid var(--nav-border)",
                            width: "fit-content",
                          }}
                        >
                          <button
                            className="cp-qty-btn"
                            onClick={() =>
                              updateQty(
                                item.productId,
                                item.colorName,
                                item.quantity - 1,
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={12} />
                          </button>
                          <span
                            className="w-10 text-center font-bold text-sm"
                            style={{
                              color: "var(--nav-fg)",
                              fontFamily: "var(--nav-font)",
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            className="cp-qty-btn"
                            onClick={() =>
                              updateQty(
                                item.productId,
                                item.colorName,
                                item.quantity + 1,
                              )
                            }
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Price */}
                        <div>
                          <p
                            className="text-base font-bold"
                            style={{
                              fontFamily: "var(--nav-font)",
                              color: "var(--nav-fg)",
                            }}
                          >
                            ₹
                            {(item.price * item.quantity).toLocaleString(
                              "en-IN",
                            )}
                          </p>
                        </div>

                        {/* Remove */}
                        <button
                          className="cp-remove-btn"
                          onClick={() =>
                            removeItem(item.productId, item.colorName)
                          }
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom: continue shopping */}
                <div
                  className="px-6 py-4 border-t flex items-center justify-between"
                  style={{
                    borderColor: "var(--nav-border)",
                    background: "rgba(200,169,126,0.03)",
                  }}
                >
                  <button
                    className="cp-continue"
                    onClick={() => router.push("/products")}
                  >
                    <ArrowLeft size={12} />
                    Continue Shopping
                  </button>
                  <p
                    className="text-[10px] tracking-wide"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    {totalItems} item{totalItems !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* RIGHT: Order summary */}
              <div className="cp-enter cp-enter-2 flex flex-col gap-4">
                {/* Summary card */}
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid var(--nav-border)",
                    boxShadow: "0 4px 20px rgba(200,169,126,0.1)",
                    overflow: "hidden",
                  }}
                >
                  {/* Gold top bar */}
                  <div
                    className="h-0.5"
                    style={{ background: "var(--nav-accent)" }}
                  />

                  <div className="px-6 py-5">
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-5"
                      style={{
                        color: "var(--nav-fg)",
                        fontFamily: "var(--nav-font)",
                      }}
                    >
                      Order Summary
                    </p>

                    {/* Line items */}
                    <div className="flex flex-col gap-2.5 mb-4">
                      {items.map((item) => (
                        <div
                          key={`${item.productId}-${item.colorName}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <span
                            className="text-xs truncate flex-1"
                            style={{ color: "var(--nav-fg-muted)" }}
                          >
                            {item.name} × {item.quantity}
                          </span>
                          <span
                            className="text-xs font-semibold shrink-0"
                            style={{ color: "var(--nav-fg)" }}
                          >
                            ₹
                            {(item.price * item.quantity).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      className="h-px mb-4"
                      style={{ background: "var(--nav-border)" }}
                    />

                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-xs"
                        style={{ color: "var(--nav-fg-muted)" }}
                      >
                        Subtotal
                      </span>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "var(--nav-fg)" }}
                      >
                        ₹{totalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-5">
                      <span
                        className="text-xs"
                        style={{ color: "var(--nav-fg-muted)" }}
                      >
                        Shipping
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: "#27ae60" }}
                      >
                        Free
                      </span>
                    </div>

                    <div
                      className="h-px mb-5"
                      style={{ background: "var(--nav-border)" }}
                    />

                    {/* Total */}
                    <div className="flex items-center justify-between mb-6">
                      <span
                        className="text-sm font-bold uppercase tracking-wide"
                        style={{
                          fontFamily: "var(--nav-font)",
                          color: "var(--nav-fg)",
                        }}
                      >
                        Total
                      </span>
                      <span
                        className="text-2xl font-bold"
                        style={{
                          fontFamily: "var(--nav-font)",
                          color: "var(--nav-accent)",
                        }}
                      >
                        ₹{totalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Checkout CTA */}
                    <button
                      className="cp-checkout-btn"
                      onClick={handleCheckout}
                    >
                      Proceed to Pay
                    </button>

                    <p
                      className="text-[10px] text-center mt-3"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      Secured by Razorpay · 256-bit SSL
                    </p>
                  </div>
                </div>

                {/* Trust badges card */}
                <div
                  className="cp-enter cp-enter-3 px-5 py-4"
                  style={{
                    background: "#fff",
                    border: "1px solid var(--nav-border)",
                    boxShadow: "0 2px 12px rgba(200,169,126,0.05)",
                  }}
                >
                  {[
                    {
                      icon: Truck,
                      title: "Free Shipping",
                      sub: "On order over ₹999",
                    },
                    {
                      icon: ShieldCheck,
                      title: "Secure Payment",
                      sub: "100% Secure checkout",
                    },
                    {
                      icon: Leaf,
                      title: "Eco-Certified",
                      sub: "100% organic bamboo",
                    },
                    {
                      icon: RotateCcw,
                      title: "Easy Returns",
                      sub: "30-day return policy",
                    },
                  ].map(({ icon: Icon, title, sub }, i) => (
                    <div key={title} className="cp-trust">
                      <div
                        className="w-9 h-9 flex items-center justify-center shrink-0"
                        style={{
                          background: "rgba(200,169,126,0.1)",
                          border: "1px solid var(--nav-border)",
                        }}
                      >
                        <Icon
                          size={15}
                          style={{ color: "var(--nav-accent)" }}
                          strokeWidth={1.75}
                        />
                      </div>
                      <div>
                        <p
                          className="text-[11px] font-bold uppercase tracking-wide"
                          style={{ color: "var(--nav-fg)" }}
                        >
                          {title}
                        </p>
                        <p
                          className="text-[10px] mt-0.5"
                          style={{ color: "var(--nav-fg-muted)" }}
                        >
                          {sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
