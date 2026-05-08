"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ArrowLeft, Package } from "lucide-react";
import { useCart } from "@/context/cartContext";
import { useAuth } from "@/context/authContext";
import easyReturn from "@/public/vectors/easyReturn.svg";
import ecoCertified from "@/public/vectors/eco-certified.svg";
import securePayment from "@/public/vectors/securePayment.svg";
import shipping from "@/public/vectors/shipping.svg";
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

  const trustBadges = [
    { icon: shipping, title: "Free Shipping", sub: "On order over ₹999" },
    {
      icon: securePayment,
      title: "Secure Payment",
      sub: "100% Secure checkout",
    },
    { icon: ecoCertified, title: "Eco-Certified", sub: "100% organic bamboo" },
    { icon: easyReturn, title: "Easy Returns", sub: "30-day return policy" },
  ];

  return (
    <main
      className="min-h-screen"
      style={{
        background: "var(--nav-bg)",
        fontFamily: "var(--nav-font-ui)",
        color: "var(--nav-fg)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* ── Page header ── */}
        <div className="mb-6">
          <h1
            className="text-2xl md:text-3xl font-bold mb-1"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            Shopping Cart
          </h1>
          <p className="text-sm" style={{ color: "var(--nav-fg-muted)" }}>
            {totalItems > 0
              ? `${totalItems} item${totalItems !== 1 ? "s" : ""} in your cart`
              : "Your cart is empty"}
          </p>
        </div>

        {/* ── Empty state ── */}
        {items.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-24 text-center rounded-xl border bg-white"
            style={{ borderColor: "var(--nav-border)" }}
          >
            <div
              className="w-20 h-20 flex items-center justify-center mb-6 rounded-full border"
              style={{
                background: "rgba(25,99,94,0.08)",
                borderColor: "var(--nav-border)",
              }}
            >
              <Package
                size={32}
                style={{ color: "var(--nav-fg)", opacity: 0.5 }}
              />
            </div>
            <p
              className="text-xl font-bold uppercase tracking-widest mb-3"
              style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
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
              className="px-8 py-4 text-xs font-bold tracking-widest uppercase rounded-md text-white border-0 cursor-pointer transition-colors duration-200"
              style={{ background: "var(--nav-accent)" }}
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
          <div className="flex flex-col gap-6">
            {/* Two-column grid */}
            <div className="grid md:grid-cols-[1fr_300px] gap-6 items-start">
              {/* LEFT: Cart items */}
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.colorName}`}
                    className="flex gap-4 items-start p-4 rounded-xl border bg-white transition-shadow duration-150 hover:shadow-md"
                    style={{ borderColor: "var(--nav-border)" }}
                  >
                    {/* Image */}
                    <div
                      className="shrink-0 overflow-hidden rounded-lg border"
                      style={{
                        width: 90,
                        height: 110,
                        borderColor: "var(--nav-border)",
                        background: "var(--nav-bg)",
                      }}
                    >
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={90}
                          height={110}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Info + controls */}
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      {/* Top row: name + trash */}
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="text-sm font-bold leading-snug"
                          style={{
                            fontFamily: "var(--nav-font)",
                            color: "var(--nav-fg)",
                          }}
                        >
                          {item.name}
                        </p>
                        <button
                          onClick={() =>
                            removeItem(item.productId, item.colorName, item.size)
                          }
                          aria-label="Remove item"
                          className="shrink-0 w-8 h-8 flex items-center justify-center bg-transparent border-0 cursor-pointer transition-colors duration-150 rounded"
                          style={{ color: "var(--nav-fg-muted)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "var(--nav-sale)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color =
                              "var(--nav-fg-muted)")
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Color */}
                      <p
                        className="text-xs"
                        style={{ color: "var(--nav-fg-muted)" }}
                      >
                        Color:{" "}
                        <span
                          className="font-medium"
                          style={{ color: "var(--nav-fg)" }}
                        >
                          {item.colorName}
                        </span>
                      </p>

                      {/* Bottom row: qty stepper + price */}
                      <div className="flex items-center justify-between gap-3 mt-auto pt-1">
                        {/* Qty stepper */}
                        <div
                          className="flex items-center rounded-md overflow-hidden border"
                          style={{ borderColor: "var(--nav-border)" }}
                        >
                          <button
                            onClick={() =>
                              updateQty(
                                item.productId,
                                item.colorName,
                                item.size,
                                item.quantity - 1,
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center bg-transparent border-0 cursor-pointer transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ color: "var(--nav-fg)" }}
                            onMouseEnter={(e) => {
                              if (item.quantity > 1)
                                e.currentTarget.style.background =
                                  "rgba(25,99,94,0.08)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <Minus size={12} />
                          </button>
                          <span
                            className="w-8 h-8 flex items-center justify-center text-sm font-semibold border-l border-r"
                            style={{
                              color: "var(--nav-fg)",
                              borderColor: "var(--nav-border)",
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQty(
                                item.productId,
                                item.colorName,
                                item.size,
                                item.quantity + 1,
                              )
                            }
                            disabled={item.quantity >= item.stock}
                            className="w-8 h-8 flex items-center justify-center bg-transparent border-0 cursor-pointer transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ color: "var(--nav-fg)" }}
                            onMouseEnter={(e) => {
                              if (item.quantity < item.stock)
                                e.currentTarget.style.background =
                                  "rgba(25,99,94,0.08)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
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
                          <p
                            className="text-[10px]"
                            style={{ color: "var(--nav-fg-muted)" }}
                          >
                            ₹{item.price.toLocaleString("en-IN")} Each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Continue shopping */}
                <div className="pt-1">
                  <button
                    onClick={() => router.push("/products")}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide bg-transparent border-0 cursor-pointer transition-colors duration-150 p-0"
                    style={{ color: "var(--nav-fg-muted)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--nav-accent)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--nav-fg-muted)")
                    }
                  >
                    <ArrowLeft size={12} />
                    Continue Shopping
                  </button>
                </div>
              </div>

              {/* RIGHT: Order summary */}
              <div
                className="rounded-xl border bg-white p-5 shadow-sm"
                style={{ borderColor: "var(--nav-border)" }}
              >
                <p
                  className="text-sm font-bold mb-5"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-fg)",
                  }}
                >
                  Order Summary
                </p>

                {/* Subtotal */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-sm"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    Subtotal
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--nav-fg)" }}
                  >
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Shipping */}
                <div className="flex items-center justify-between mb-5">
                  <span
                    className="text-sm"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    Shipping
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    FREE
                  </span>
                </div>

                {/* Divider */}
                <div
                  className="h-px mb-5"
                  style={{ background: "var(--nav-border)" }}
                />

                {/* Total */}
                <div className="flex items-center justify-between mb-6">
                  <span
                    className="text-sm font-bold"
                    style={{
                      fontFamily: "var(--nav-font)",
                      color: "var(--nav-fg)",
                    }}
                  >
                    Total
                  </span>
                  <span
                    className="text-xl font-bold"
                    style={{
                      fontFamily: "var(--nav-font)",
                      color: "var(--nav-fg)",
                    }}
                  >
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 text-[11px] font-bold tracking-widest uppercase rounded-md text-white border-0 cursor-pointer transition-colors duration-200"
                  style={{ background: "var(--nav-accent)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--nav-accent-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--nav-accent)")
                  }
                >
                  Proceed to Pay
                </button>
              </div>
            </div>

            {/* ── Trust badges — full-width horizontal row ── */}
            <div
              className="flex items-center rounded-xl border bg-white px-6 py-5"
              style={{ borderColor: "var(--nav-border)" }}
            >
              {trustBadges.map(({ icon: Icon, title, sub }, i) => (
                <div key={title} className="flex items-center flex-1">
                  {i > 0 && (
                    <div
                      className="w-px h-10 shrink-0 mx-4"
                      style={{ background: "var(--nav-border)" }}
                    />
                  )}
                  <div className="flex flex-col items-center text-center gap-2 flex-1">
                    <Image
                      src={Icon.src}
                      width={30}
                      alt={title}
                      height={30}
                      style={{ color: "var(--nav-accent)", opacity: 0.7 }}
                    />
                    <div>
                      <p
                        className="text-sm font-bold uppercase tracking-wide"
                        style={{ color: "var(--nav-fg)" }}
                      >
                        {title}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--nav-fg-muted)" }}
                      >
                        {sub}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
