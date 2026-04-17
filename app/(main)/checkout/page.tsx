"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  ShoppingBag,
  Plus,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Leaf,
  X,
  Save,
} from "lucide-react";
import { useCart } from "@/context/cartContext";
import { useAuth } from "@/context/authContext";
import Image from "next/image";

interface Address {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const EMPTY_FORM = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, totalPrice, clearCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [savingAddress, setSavingAddress] = useState(false);
  const [paying, setPaying] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth?returnUrl=/checkout");
    }
  }, [user, authLoading, router]);

  // Empty cart guard
  useEffect(() => {
    if (!authLoading && user && items.length === 0) {
      router.replace("/products");
    }
  }, [items, user, authLoading, router]);

  // Load Razorpay script
  useEffect(() => {
    if (
      document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      )
    ) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Toast auto dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const d = await res.json();
        const list: Address[] = d.addresses || [];
        setAddresses(list);
        const def = list.find((a) => a.isDefault);
        if (def) setSelectedAddressId(def._id);
        else if (list.length > 0) setSelectedAddressId(list[0]._id);
      }
    } catch {}
    setLoadingAddresses(false);
  }, []);

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user, fetchAddresses]);

  const handleSaveAddress = async () => {
    if (
      !form.fullName ||
      !form.phone ||
      !form.line1 ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      setToast({ type: "error", msg: "Please fill in all required fields." });
      return;
    }
    setSavingAddress(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setToast({ type: "success", msg: "Address saved!" });
        setShowAddForm(false);
        setForm(EMPTY_FORM);
        await fetchAddresses();
      } else {
        const d = await res.json();
        setToast({ type: "error", msg: d.error || "Failed to save address." });
      }
    } catch {
      setToast({ type: "error", msg: "Network error." });
    }
    setSavingAddress(false);
  };

  const handlePay = async () => {
    if (!selectedAddressId) {
      setToast({ type: "error", msg: "Please select a delivery address." });
      return;
    }
    if (!scriptLoaded) {
      setToast({
        type: "error",
        msg: "Payment gateway loading, please wait...",
      });
      return;
    }

    const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
    if (!selectedAddress) return;

    setPaying(true);

    try {
      // Create Razorpay order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice }),
      });

      if (!orderRes.ok) {
        const d = await orderRes.json();
        setToast({
          type: "error",
          msg: d.error || "Failed to initiate payment.",
        });
        setPaying(false);
        return;
      }

      const {
        orderId: rzpOrderId,
        amount,
        currency,
        keyId,
      } = await orderRes.json();

      const options: RazorpayOptions = {
        key: keyId,
        amount,
        currency,
        name: "Bambumm",
        description: "Premium Bamboo Innerwear",
        image: "/logo.png",
        order_id: rzpOrderId,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: selectedAddress.phone,
        },
        theme: { color: "#c8a97e" },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                items: items.map((i) => ({
                  productId: i.productId,
                  name: i.name,
                  slug: i.slug,
                  image: i.image,
                  colorName: i.colorName,
                  colorHex: i.colorHex,
                  price: i.price,
                  quantity: i.quantity,
                })),
                total: totalPrice,
                address: {
                  fullName: selectedAddress.fullName,
                  phone: selectedAddress.phone,
                  line1: selectedAddress.line1,
                  line2: selectedAddress.line2,
                  city: selectedAddress.city,
                  state: selectedAddress.state,
                  pincode: selectedAddress.pincode,
                },
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              clearCart();
              router.push(`/order-success?orderId=${verifyData.orderId}`);
            } else {
              setToast({
                type: "error",
                msg: verifyData.error || "Payment verification failed.",
              });
              setPaying(false);
            }
          } catch {
            setToast({
              type: "error",
              msg: "Something went wrong after payment.",
            });
            setPaying(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setToast({ type: "error", msg: "Failed to initiate payment." });
      setPaying(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--nav-bg)" }}
      >
        <Loader2
          size={28}
          className="animate-spin"
          style={{ color: "var(--nav-accent)" }}
        />
      </div>
    );
  }

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
  const LABELS = ["Home", "Work", "Other"];

  return (
    <>
      <style>{`
        .co-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--nav-border);
          background: var(--nav-bg);
          color: var(--nav-fg);
          font-family: var(--nav-font-ui);
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s;
        }
        .co-input:focus { border-color: var(--nav-accent); background: #fff; }
        .co-input::placeholder { color: var(--nav-fg-muted); opacity: 0.6; }
        .addr-card {
          border: 1px solid var(--nav-border);
          transition: border-color 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .addr-card:hover { border-color: var(--nav-accent); }
        .addr-card.selected {
          border-color: var(--nav-accent);
          box-shadow: 0 0 0 2px rgba(200,169,126,0.2);
        }
        @keyframes coFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .co-section { animation: coFadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .co-section:nth-child(2) { animation-delay: 0.08s; }
        .co-section:nth-child(3) { animation-delay: 0.16s; }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .co-toast { animation: toastIn 0.25s ease both; }
      `}</style>

      <main
        className="min-h-screen"
        style={{
          background: "var(--nav-bg)",
          fontFamily: "var(--nav-font-ui)",
          color: "var(--nav-fg)",
        }}
      >
        <div
          className="h-0.5 w-full"
          style={{ background: "var(--nav-accent)" }}
        />

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <p
              className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-1"
              style={{ color: "var(--nav-accent)" }}
            >
              Almost there
            </p>
            <h1
              className="text-2xl md:text-3xl font-bold uppercase tracking-widest"
              style={{ fontFamily: "var(--nav-font)" }}
            >
              Checkout
            </h1>
          </div>

          <div className="grid md:grid-cols-[1fr_360px] gap-8">
            {/* LEFT: Address + items */}
            <div className="flex flex-col gap-6">
              {/* Delivery Address */}
              <div
                className="co-section overflow-hidden"
                style={{
                  background: "#fff",
                  border: "1px solid var(--nav-border)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="flex items-center gap-3 px-6 py-4 border-b"
                  style={{
                    borderColor: "var(--nav-border)",
                    background: "rgba(200,169,126,0.04)",
                  }}
                >
                  <div
                    className="w-8 h-8 flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(200,169,126,0.12)",
                      border: "1px solid var(--nav-border)",
                    }}
                  >
                    <MapPin size={14} style={{ color: "var(--nav-accent)" }} />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-[10px] font-bold tracking-[0.16em] uppercase"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      Step 1
                    </p>
                    <p
                      className="text-sm font-bold"
                      style={{ fontFamily: "var(--nav-font)" }}
                    >
                      Delivery Address
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  {loadingAddresses ? (
                    <div className="flex justify-center py-8">
                      <Loader2
                        size={20}
                        className="animate-spin"
                        style={{ color: "var(--nav-accent)" }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {addresses.map((addr) => (
                        <div
                          key={addr._id}
                          className={`addr-card p-4 ${selectedAddressId === addr._id ? "selected" : ""}`}
                          style={{
                            background:
                              selectedAddressId === addr._id
                                ? "rgba(200,169,126,0.04)"
                                : "var(--nav-bg)",
                          }}
                          onClick={() => setSelectedAddressId(addr._id)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Radio */}
                            <div
                              className="mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                              style={{
                                borderColor:
                                  selectedAddressId === addr._id
                                    ? "var(--nav-accent)"
                                    : "var(--nav-border)",
                                background: "transparent",
                              }}
                            >
                              {selectedAddressId === addr._id && (
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ background: "var(--nav-accent)" }}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span
                                  className="text-[10px] font-bold tracking-[0.12em] uppercase px-2 py-0.5"
                                  style={{
                                    background: "rgba(200,169,126,0.1)",
                                    border: "1px solid rgba(200,169,126,0.25)",
                                    color: "var(--nav-accent)",
                                  }}
                                >
                                  {addr.label}
                                </span>
                                {addr.isDefault && (
                                  <span
                                    className="text-[10px] font-bold"
                                    style={{ color: "#27ae60" }}
                                  >
                                    ✓ Default
                                  </span>
                                )}
                              </div>
                              <p
                                className="text-sm font-bold"
                                style={{ color: "var(--nav-fg)" }}
                              >
                                {addr.fullName}
                              </p>
                              <p
                                className="text-xs mt-0.5"
                                style={{ color: "var(--nav-fg-muted)" }}
                              >
                                {addr.phone}
                              </p>
                              <p
                                className="text-xs mt-1 leading-relaxed"
                                style={{ color: "var(--nav-fg-muted)" }}
                              >
                                {addr.line1}
                                {addr.line2 ? `, ${addr.line2}` : ""},{" "}
                                {addr.city}, {addr.state} – {addr.pincode}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add new address button */}
                      {!showAddForm && (
                        <button
                          onClick={() => setShowAddForm(true)}
                          className="flex items-center gap-2 px-4 py-3 text-[11px] font-bold tracking-widest uppercase transition-all duration-150"
                          style={{
                            border: "1px dashed var(--nav-border)",
                            color: "var(--nav-accent)",
                            background: "transparent",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.borderColor =
                              "var(--nav-accent)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.borderColor =
                              "var(--nav-border)")
                          }
                        >
                          <Plus size={13} /> Add New Address
                        </button>
                      )}

                      {/* Add address form */}
                      {showAddForm && (
                        <div
                          className="p-5 flex flex-col gap-4"
                          style={{
                            border: "1px solid var(--nav-accent)",
                            background: "rgba(200,169,126,0.02)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <p
                              className="text-xs font-bold uppercase tracking-widest"
                              style={{ color: "var(--nav-fg)" }}
                            >
                              New Address
                            </p>
                            <button
                              onClick={() => {
                                setShowAddForm(false);
                                setForm(EMPTY_FORM);
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "var(--nav-fg-muted)",
                              }}
                            >
                              <X size={16} />
                            </button>
                          </div>

                          {/* Label */}
                          <div className="flex gap-2">
                            {LABELS.map((l) => (
                              <button
                                key={l}
                                onClick={() =>
                                  setForm((f) => ({ ...f, label: l }))
                                }
                                className="px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all"
                                style={{
                                  background:
                                    form.label === l
                                      ? "var(--nav-accent)"
                                      : "var(--nav-bg)",
                                  color:
                                    form.label === l
                                      ? "#fff"
                                      : "var(--nav-fg-muted)",
                                  border: `1px solid ${form.label === l ? "var(--nav-accent)" : "var(--nav-border)"}`,
                                  cursor: "pointer",
                                }}
                              >
                                {l}
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label
                                className="block text-[10px] font-bold tracking-widest uppercase mb-1.5"
                                style={{ color: "var(--nav-fg-muted)" }}
                              >
                                Full Name *
                              </label>
                              <input
                                type="text"
                                className="co-input"
                                value={form.fullName}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    fullName: e.target.value,
                                  }))
                                }
                                placeholder="John Doe"
                              />
                            </div>
                            <div>
                              <label
                                className="block text-[10px] font-bold tracking-widest uppercase mb-1.5"
                                style={{ color: "var(--nav-fg-muted)" }}
                              >
                                Phone *
                              </label>
                              <input
                                type="tel"
                                className="co-input"
                                value={form.phone}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    phone: e.target.value,
                                  }))
                                }
                                placeholder="+91 9999999999"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              className="block text-[10px] font-bold tracking-widest uppercase mb-1.5"
                              style={{ color: "var(--nav-fg-muted)" }}
                            >
                              Address Line 1 *
                            </label>
                            <input
                              type="text"
                              className="co-input"
                              value={form.line1}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  line1: e.target.value,
                                }))
                              }
                              placeholder="Flat / House No., Building, Street"
                            />
                          </div>

                          <div>
                            <label
                              className="block text-[10px] font-bold tracking-widest uppercase mb-1.5"
                              style={{ color: "var(--nav-fg-muted)" }}
                            >
                              Address Line 2{" "}
                              <span style={{ opacity: 0.6 }}>(optional)</span>
                            </label>
                            <input
                              type="text"
                              className="co-input"
                              value={form.line2}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  line2: e.target.value,
                                }))
                              }
                              placeholder="Area, Colony, Landmark"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label
                                className="block text-[10px] font-bold tracking-widest uppercase mb-1.5"
                                style={{ color: "var(--nav-fg-muted)" }}
                              >
                                City *
                              </label>
                              <input
                                type="text"
                                className="co-input"
                                value={form.city}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    city: e.target.value,
                                  }))
                                }
                                placeholder="Delhi"
                              />
                            </div>
                            <div>
                              <label
                                className="block text-[10px] font-bold tracking-widest uppercase mb-1.5"
                                style={{ color: "var(--nav-fg-muted)" }}
                              >
                                State *
                              </label>
                              <input
                                type="text"
                                className="co-input"
                                value={form.state}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    state: e.target.value,
                                  }))
                                }
                                placeholder="Delhi"
                              />
                            </div>
                            <div>
                              <label
                                className="block text-[10px] font-bold tracking-widest uppercase mb-1.5"
                                style={{ color: "var(--nav-fg-muted)" }}
                              >
                                Pincode *
                              </label>
                              <input
                                type="text"
                                className="co-input"
                                value={form.pincode}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    pincode: e.target.value,
                                  }))
                                }
                                placeholder="110001"
                                maxLength={6}
                              />
                            </div>
                          </div>

                          <div className="flex gap-3 pt-1">
                            <button
                              onClick={() => {
                                setShowAddForm(false);
                                setForm(EMPTY_FORM);
                              }}
                              className="flex-1 py-2.5 text-[11px] font-bold tracking-widest uppercase border transition-all"
                              style={{
                                border: "1px solid var(--nav-border)",
                                color: "var(--nav-fg-muted)",
                                background: "transparent",
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveAddress}
                              disabled={savingAddress}
                              className="flex-[1.5] flex items-center justify-center gap-2 py-2.5 text-[11px] font-bold tracking-widest uppercase disabled:opacity-50"
                              style={{
                                background: "var(--nav-accent)",
                                color: "#fff",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              {savingAddress ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Save size={12} />
                              )}
                              {savingAddress ? "Saving…" : "Save Address"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div
                className="co-section overflow-hidden"
                style={{
                  background: "#fff",
                  border: "1px solid var(--nav-border)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="flex items-center gap-3 px-6 py-4 border-b"
                  style={{
                    borderColor: "var(--nav-border)",
                    background: "rgba(200,169,126,0.04)",
                  }}
                >
                  <div
                    className="w-8 h-8 flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(200,169,126,0.12)",
                      border: "1px solid var(--nav-border)",
                    }}
                  >
                    <ShoppingBag
                      size={14}
                      style={{ color: "var(--nav-accent)" }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-bold tracking-[0.16em] uppercase"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      Step 2
                    </p>
                    <p
                      className="text-sm font-bold"
                      style={{ fontFamily: "var(--nav-font)" }}
                    >
                      Order Items ({items.length})
                    </p>
                  </div>
                </div>

                <div
                  className="divide-y"
                  style={{ borderColor: "var(--nav-border)" }}
                >
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.colorName}`}
                      className="flex gap-4 px-6 py-4"
                    >
                      <div
                        className="w-16 h-20 shrink-0 overflow-hidden"
                        style={{
                          border: "1px solid var(--nav-border)",
                          background: "var(--nav-bg)",
                        }}
                      >
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-bold uppercase tracking-wide leading-snug"
                          style={{
                            fontFamily: "var(--nav-font)",
                            color: "var(--nav-fg)",
                          }}
                        >
                          {item.name}
                        </p>
                        <p
                          className="text-[10px] uppercase tracking-wide mt-0.5"
                          style={{ color: "var(--nav-accent)" }}
                        >
                          {item.category}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
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
                          <span
                            className="text-[10px]"
                            style={{ color: "var(--nav-fg-muted)" }}
                          >
                            · Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className="text-sm font-bold"
                          style={{
                            fontFamily: "var(--nav-font)",
                            color: "var(--nav-fg)",
                          }}
                        >
                          ₹
                          {(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                        <p
                          className="text-[10px] mt-0.5"
                          style={{ color: "var(--nav-fg-muted)" }}
                        >
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Order Summary */}
            <div className="flex flex-col gap-4">
              <div
                className="co-section sticky top-20 overflow-hidden"
                style={{
                  background: "#fff",
                  border: "1px solid var(--nav-border)",
                  boxShadow: "0 4px 20px rgba(200,169,126,0.1)",
                }}
              >
                <div
                  className="h-0.5"
                  style={{ background: "var(--nav-accent)" }}
                />

                <div className="px-6 py-5">
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-5"
                    style={{ color: "var(--nav-fg)" }}
                  >
                    Order Summary
                  </p>

                  {/* Price breakdown */}
                  <div className="flex flex-col gap-3 mb-4">
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
                          {(item.price * item.quantity).toLocaleString("en-IN")}
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
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-xs"
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

                  <div
                    className="h-px mb-4"
                    style={{ background: "var(--nav-border)" }}
                  />

                  <div className="flex items-center justify-between mb-6">
                    <span
                      className="text-sm font-bold uppercase tracking-wide"
                      style={{ fontFamily: "var(--nav-font)" }}
                    >
                      Total
                    </span>
                    <span
                      className="text-xl font-bold"
                      style={{
                        fontFamily: "var(--nav-font)",
                        color: "var(--nav-accent)",
                      }}
                    >
                      ₹{totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Selected address preview */}
                  {selectedAddress && (
                    <div
                      className="p-3 mb-5 text-xs leading-relaxed"
                      style={{
                        background: "rgba(200,169,126,0.06)",
                        border: "1px solid var(--nav-border)",
                      }}
                    >
                      <p
                        className="font-bold mb-0.5 flex items-center gap-1"
                        style={{ color: "var(--nav-fg)" }}
                      >
                        <MapPin
                          size={10}
                          style={{ color: "var(--nav-accent)" }}
                        />
                        Delivering to
                      </p>
                      <p style={{ color: "var(--nav-fg-muted)" }}>
                        {selectedAddress.fullName}, {selectedAddress.line1},
                        {selectedAddress.line2
                          ? ` ${selectedAddress.line2},`
                          : ""}{" "}
                        {selectedAddress.city} – {selectedAddress.pincode}
                      </p>
                    </div>
                  )}

                  {!selectedAddress &&
                    addresses.length === 0 &&
                    !loadingAddresses && (
                      <div
                        className="flex items-center gap-2 p-3 mb-5 text-xs"
                        style={{
                          background: "rgba(217,79,61,0.05)",
                          border: "1px solid rgba(217,79,61,0.15)",
                        }}
                      >
                        <AlertCircle
                          size={13}
                          style={{ color: "var(--nav-sale)", flexShrink: 0 }}
                        />
                        <span style={{ color: "var(--nav-sale)" }}>
                          Please add a delivery address first.
                        </span>
                      </div>
                    )}

                  {/* Pay button */}
                  <button
                    onClick={handlePay}
                    disabled={
                      paying || !selectedAddressId || items.length === 0
                    }
                    className="w-full flex items-center justify-center gap-2 py-4 text-xs font-bold tracking-[0.16em] uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "var(--nav-accent)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!paying)
                        e.currentTarget.style.background =
                          "var(--nav-accent-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--nav-accent)";
                    }}
                  >
                    {paying ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />{" "}
                        Processing…
                      </>
                    ) : (
                      <>
                        Pay ₹{totalPrice.toLocaleString("en-IN")}
                        <ChevronRight size={14} />
                      </>
                    )}
                  </button>

                  <p
                    className="text-[10px] text-center mt-3"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    Secured by Razorpay · 256-bit SSL
                  </p>
                </div>

                {/* Trust badges */}
                <div className="px-6 pb-5 flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Leaf size={11} style={{ color: "var(--nav-accent)" }} />
                    <span
                      className="text-[9px] font-semibold uppercase tracking-wide"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      Eco-Friendly
                    </span>
                  </div>
                  <div
                    className="w-px h-3"
                    style={{ background: "var(--nav-border)" }}
                  />
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      size={11}
                      style={{ color: "var(--nav-accent)" }}
                    />
                    <span
                      className="text-[9px] font-semibold uppercase tracking-wide"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      Quality Assured
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className="co-toast fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3"
            style={{
              background: "#fff",
              border: `1px solid ${toast.type === "success" ? "var(--nav-accent)" : "var(--nav-sale)"}`,
              boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
            }}
          >
            {toast.type === "success" ? (
              <CheckCircle2
                size={15}
                style={{ color: "var(--nav-accent)", flexShrink: 0 }}
              />
            ) : (
              <AlertCircle
                size={15}
                style={{ color: "var(--nav-sale)", flexShrink: 0 }}
              />
            )}
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--nav-fg)" }}
            >
              {toast.msg}
            </span>
          </div>
        )}
      </main>
    </>
  );
}
