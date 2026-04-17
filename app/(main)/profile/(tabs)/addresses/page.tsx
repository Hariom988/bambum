"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Save,
  Home,
  Briefcase,
} from "lucide-react";

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

const EMPTY_FORM: Omit<Address, "_id" | "isDefault"> = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const d = await res.json();
        setAddresses(d.addresses || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr._id);
    setForm({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
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
    setSaving(true);
    try {
      const body = editingId ? { ...form, _id: editingId } : form;
      const res = await fetch("/api/user/addresses", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setToast({
          type: "success",
          msg: editingId ? "Address updated." : "Address added.",
        });
        setShowForm(false);
        fetchAddresses();
      } else {
        const d = await res.json();
        setToast({ type: "error", msg: d.error || "Failed to save." });
      }
    } catch {
      setToast({ type: "error", msg: "Network error." });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setToast({ type: "success", msg: "Address deleted." });
        fetchAddresses();
      }
    } catch {}
    setConfirmDelete(null);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetch("/api/user/addresses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, isDefault: true }),
      });
      fetchAddresses();
    } catch {}
  };

  const inputCls =
    "w-full px-3.5 py-2.5 border text-sm outline-none transition-all duration-150";

  const LABELS = ["Home", "Work", "Other"];

  return (
    <>
      <style>{`
        .addr-input {
          background: var(--nav-bg);
          border: 1px solid var(--nav-border);
          color: var(--nav-fg);
          font-family: var(--nav-font-ui);
        }
        .addr-input:focus { border-color: var(--nav-accent); background: #fff; }
        .addr-input::placeholder { color: var(--nav-fg-muted); opacity: 0.7; }
        .addr-card { transition: border-color 0.2s, box-shadow 0.2s; }
        .addr-card:hover { border-color: var(--nav-accent) !important; box-shadow: 0 4px 20px rgba(200,169,126,0.1); }
        @keyframes addrFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .addr-anim { animation: addrFadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .addr-anim:nth-child(2) { animation-delay: 0.07s; }
        .addr-anim:nth-child(3) { animation-delay: 0.14s; }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .addr-toast { animation: toastIn 0.28s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div className="flex flex-col gap-5">
        {/* Header */}
        <div
          className="addr-anim flex items-center justify-between px-6 py-4 overflow-hidden"
          style={{
            background: "#fff",
            border: "1px solid var(--nav-border)",
            boxShadow: "0 2px 16px rgba(200,169,126,0.06)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center shrink-0"
              style={{
                background: "rgba(200,169,126,0.12)",
                border: "1px solid var(--nav-border)",
              }}
            >
              <MapPin size={14} style={{ color: "var(--nav-accent)" }} />
            </div>
            <div>
              <p
                className="text-[10px] font-bold tracking-[0.16em] uppercase"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                Saved Locations
              </p>
              <p
                className="text-sm font-bold"
                style={{
                  color: "var(--nav-fg)",
                  fontFamily: "var(--nav-font)",
                }}
              >
                My Addresses
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold tracking-[0.14em] uppercase transition-all duration-200"
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
            <Plus size={12} /> Add Address
          </button>
        </div>

        {/* Address list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2
              size={24}
              className="animate-spin"
              style={{ color: "var(--nav-accent)" }}
            />
          </div>
        ) : addresses.length === 0 ? (
          <div
            className="addr-anim flex flex-col items-center justify-center py-16 text-center"
            style={{
              background: "#fff",
              border: "1px solid var(--nav-border)",
            }}
          >
            <div
              className="w-14 h-14 flex items-center justify-center mb-4"
              style={{
                background: "rgba(200,169,126,0.1)",
                border: "1px solid var(--nav-border)",
              }}
            >
              <MapPin
                size={22}
                style={{ color: "var(--nav-accent)", opacity: 0.6 }}
              />
            </div>
            <p
              className="text-base font-bold uppercase tracking-widest mb-2"
              style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
            >
              No addresses saved
            </p>
            <p
              className="text-sm mb-5"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              Add a delivery address to speed up checkout.
            </p>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold tracking-[0.14em] uppercase"
              style={{
                background: "var(--nav-accent)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Plus size={13} /> Add First Address
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="addr-card addr-anim relative"
                style={{
                  background: "#fff",
                  border: "1px solid var(--nav-border)",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                }}
              >
                {/* Gold accent if default */}
                {addr.isDefault && (
                  <div
                    className="h-0.5 w-full"
                    style={{ background: "var(--nav-accent)" }}
                  />
                )}
                <div className="p-5 flex gap-4">
                  <div
                    className="w-10 h-10 flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: addr.isDefault
                        ? "rgba(200,169,126,0.12)"
                        : "rgba(0,0,0,0.03)",
                      border: "1px solid var(--nav-border)",
                    }}
                  >
                    {addr.label === "Work" ? (
                      <Briefcase
                        size={15}
                        style={{
                          color: addr.isDefault
                            ? "var(--nav-accent)"
                            : "var(--nav-fg-muted)",
                        }}
                      />
                    ) : (
                      <Home
                        size={15}
                        style={{
                          color: addr.isDefault
                            ? "var(--nav-accent)"
                            : "var(--nav-fg-muted)",
                        }}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="text-[10px] font-bold tracking-[0.14em] uppercase px-2 py-0.5"
                        style={{
                          background: addr.isDefault
                            ? "rgba(200,169,126,0.12)"
                            : "rgba(0,0,0,0.04)",
                          border: `1px solid ${addr.isDefault ? "rgba(200,169,126,0.3)" : "var(--nav-border)"}`,
                          color: addr.isDefault
                            ? "var(--nav-accent)"
                            : "var(--nav-fg-muted)",
                        }}
                      >
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span
                          className="text-[10px] font-bold tracking-wide flex items-center gap-1"
                          style={{ color: "var(--nav-accent)" }}
                        >
                          <CheckCircle2 size={11} /> Default
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
                      {addr.line2 ? `, ${addr.line2}` : ""},<br />
                      {addr.city}, {addr.state} – {addr.pincode}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(addr)}
                      className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase border transition-all duration-150"
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
                    >
                      <Edit3 size={10} /> Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(addr._id)}
                      className="flex items-center justify-center p-1.5 border transition-all duration-150"
                      style={{
                        border: "1px solid var(--nav-border)",
                        color: "var(--nav-fg-muted)",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--nav-sale)";
                        e.currentTarget.style.color = "var(--nav-sale)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--nav-border)";
                        e.currentTarget.style.color = "var(--nav-fg-muted)";
                      }}
                    >
                      <Trash2 size={11} />
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr._id)}
                        className="text-[9px] font-bold tracking-wide uppercase text-center"
                        style={{
                          color: "var(--nav-accent)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Set Default
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div
            className="w-full max-w-lg overflow-hidden"
            style={{
              background: "#fff",
              border: "1px solid var(--nav-border)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              className="h-0.5"
              style={{ background: "var(--nav-accent)" }}
            />
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "var(--nav-border)" }}
            >
              <p
                className="text-sm font-bold uppercase tracking-widest"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--nav-fg)",
                }}
              >
                {editingId ? "Edit Address" : "New Address"}
              </p>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--nav-fg-muted)",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {/* Label selector */}
              <div>
                <label
                  className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-2"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  Address Label
                </label>
                <div className="flex gap-2">
                  {LABELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setForm((f) => ({ ...f, label: l }))}
                      className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-150"
                      style={{
                        background:
                          form.label === l
                            ? "var(--nav-accent)"
                            : "var(--nav-bg)",
                        color:
                          form.label === l ? "#fff" : "var(--nav-fg-muted)",
                        border: `1px solid ${form.label === l ? "var(--nav-accent)" : "var(--nav-border)"}`,
                        cursor: "pointer",
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className={`${inputCls} addr-input`}
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label
                    className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    Phone *
                  </label>
                  <input
                    type="tel"
                    className={`${inputCls} addr-input`}
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="+91 9999999999"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  className={`${inputCls} addr-input`}
                  value={form.line1}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, line1: e.target.value }))
                  }
                  placeholder="Flat / House No., Building, Street"
                />
              </div>

              <div>
                <label
                  className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  Address Line 2{" "}
                  <span style={{ opacity: 0.6 }}>(optional)</span>
                </label>
                <input
                  type="text"
                  className={`${inputCls} addr-input`}
                  value={form.line2}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, line2: e.target.value }))
                  }
                  placeholder="Area, Colony, Landmark"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label
                    className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    City *
                  </label>
                  <input
                    type="text"
                    className={`${inputCls} addr-input`}
                    value={form.city}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, city: e.target.value }))
                    }
                    placeholder="Delhi"
                  />
                </div>
                <div>
                  <label
                    className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    State *
                  </label>
                  <input
                    type="text"
                    className={`${inputCls} addr-input`}
                    value={form.state}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, state: e.target.value }))
                    }
                    placeholder="Delhi"
                  />
                </div>
                <div>
                  <label
                    className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    Pincode *
                  </label>
                  <input
                    type="text"
                    className={`${inputCls} addr-input`}
                    value={form.pincode}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, pincode: e.target.value }))
                    }
                    placeholder="110001"
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 text-[11px] font-bold tracking-[0.14em] uppercase border transition-all duration-150"
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
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-[1.5] flex items-center justify-center gap-2 py-3 text-[11px] font-bold tracking-[0.14em] uppercase disabled:opacity-50"
                  style={{
                    background: "var(--nav-accent)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {saving ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  {saving
                    ? "Saving…"
                    : editingId
                      ? "Update Address"
                      : "Save Address"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div
            className="w-full max-w-sm p-7"
            style={{
              background: "#fff",
              border: "1px solid var(--nav-border)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
            }}
          >
            <h3
              className="text-base font-bold mb-2"
              style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
            >
              Delete Address?
            </h3>
            <p
              className="text-sm mb-5"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              This address will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 text-[11px] font-bold tracking-widest uppercase border"
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
                onClick={() => handleDelete(confirmDelete)}
                className="flex-[1.5] py-2.5 text-[11px] font-bold tracking-widest uppercase text-white"
                style={{
                  background: "var(--nav-sale)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="addr-toast fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3"
          style={{
            background: "#fff",
            border: `1px solid ${toast.type === "success" ? "var(--nav-accent)" : "var(--nav-sale)"}`,
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={15} style={{ color: "var(--nav-accent)" }} />
          ) : (
            <AlertCircle size={15} style={{ color: "var(--nav-sale)" }} />
          )}
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--nav-fg)" }}
          >
            {toast.msg}
          </span>
        </div>
      )}
    </>
  );
}
