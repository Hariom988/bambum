"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/authContext";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        await refreshUser();
        setToast({ type: "success", msg: "Profile updated successfully." });
      } else {
        const d = await res.json();
        setToast({ type: "error", msg: d.error || "Failed to update." });
      }
    } catch {
      setToast({ type: "error", msg: "Network error." });
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({ type: "error", msg: "Please fill in all password fields." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ type: "error", msg: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setToast({
        type: "error",
        msg: "Password must be at least 8 characters.",
      });
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        setToast({ type: "success", msg: "Password changed successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const d = await res.json();
        setToast({
          type: "error",
          msg: d.error || "Failed to change password.",
        });
      }
    } catch {
      setToast({ type: "error", msg: "Network error." });
    }
    setPwSaving(false);
  };

  const inputCls = `
    w-full px-4 py-3 border text-sm outline-none transition-all duration-150
  `;

  const isGoogleUser = user?.provider === "google";

  return (
    <>
      <style>{`
        .prof-input {
          background: var(--nav-bg);
          border: 1px solid var(--nav-border);
          color: var(--nav-fg);
          font-family: var(--nav-font-ui);
        }
        .prof-input:focus {
          border-color: var(--nav-accent);
          background: #fff;
        }
        .prof-input::placeholder { color: var(--nav-fg-muted); opacity: 0.7; }
        .prof-input:disabled {
          background: rgba(200,169,126,0.05);
          color: var(--nav-fg-muted);
          cursor: not-allowed;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .prof-toast { animation: toastIn 0.28s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes profFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .prof-card { animation: profFadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .prof-card:nth-child(2) { animation-delay: 0.08s; }
      `}</style>

      <div className="flex flex-col gap-5">
        {/* Account Info Card */}
        <div
          className="prof-card overflow-hidden"
          style={{
            background: "#fff",
            border: "1px solid var(--nav-border)",
            boxShadow: "0 2px 16px rgba(200,169,126,0.06)",
          }}
        >
          {/* Card header */}
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
              <User size={14} style={{ color: "var(--nav-accent)" }} />
            </div>
            <div>
              <p
                className="text-[10px] font-bold tracking-[0.16em] uppercase"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                Account Details
              </p>
              <p
                className="text-sm font-bold"
                style={{
                  color: "var(--nav-fg)",
                  fontFamily: "var(--nav-font)",
                }}
              >
                Personal Information
              </p>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-4">
            {/* Name */}
            <div>
              <label
                className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-2"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                Full Name
              </label>
              <input
                type="text"
                className={`${inputCls} prof-input`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label
                className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-2"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  className={`${inputCls} prof-input`}
                  value={user?.email || ""}
                  disabled
                  readOnly
                />
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  <Mail size={11} />
                  {isGoogleUser ? "Google" : "Email"}
                </div>
              </div>
              <p
                className="text-[10px] mt-1.5"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                Email cannot be changed.
              </p>
            </div>

            {/* Provider badge */}
            {isGoogleUser && (
              <div
                className="flex items-center gap-2.5 px-4 py-3"
                style={{
                  background: "rgba(200,169,126,0.06)",
                  border: "1px solid var(--nav-border)",
                }}
              >
                <Shield
                  size={13}
                  style={{ color: "var(--nav-accent)", flexShrink: 0 }}
                />
                <p className="text-xs" style={{ color: "var(--nav-fg-muted)" }}>
                  Signed in with{" "}
                  <strong style={{ color: "var(--nav-fg)" }}>Google</strong>.
                  Password management is handled by Google.
                </p>
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={saving || !name.trim() || name.trim() === user?.name}
              className="self-start flex items-center gap-2 px-6 py-3 text-[11px] font-bold tracking-[0.14em] uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "var(--nav-accent)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!saving)
                  e.currentTarget.style.background = "var(--nav-accent-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--nav-accent)";
              }}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : null}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Change Password Card (only for email users) */}
        {!isGoogleUser && (
          <div
            className="prof-card overflow-hidden"
            style={{
              background: "#fff",
              border: "1px solid var(--nav-border)",
              boxShadow: "0 2px 16px rgba(200,169,126,0.06)",
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
                <Shield size={14} style={{ color: "var(--nav-accent)" }} />
              </div>
              <div>
                <p
                  className="text-[10px] font-bold tracking-[0.16em] uppercase"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  Security
                </p>
                <p
                  className="text-sm font-bold"
                  style={{
                    color: "var(--nav-fg)",
                    fontFamily: "var(--nav-font)",
                  }}
                >
                  Change Password
                </p>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div>
                <label
                  className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-2"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    className={`${inputCls} prof-input`}
                    style={{ paddingRight: 44 }}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--nav-fg-muted)",
                      padding: 4,
                    }}
                  >
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-2"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      className={`${inputCls} prof-input`}
                      style={{ paddingRight: 44 }}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--nav-fg-muted)",
                        padding: 4,
                      }}
                    >
                      {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label
                    className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-2"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className={`${inputCls} prof-input`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                  />
                  {confirmPassword &&
                    newPassword &&
                    confirmPassword !== newPassword && (
                      <p
                        className="text-[10px] mt-1"
                        style={{ color: "var(--nav-sale)" }}
                      >
                        Passwords don't match
                      </p>
                    )}
                </div>
              </div>

              <button
                onClick={handleChangePassword}
                disabled={pwSaving}
                className="self-start flex items-center gap-2 px-6 py-3 text-[11px] font-bold tracking-[0.14em] uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--nav-fg)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!pwSaving)
                    e.currentTarget.style.background = "var(--nav-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--nav-fg)";
                }}
              >
                {pwSaving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : null}
                {pwSaving ? "Updating…" : "Update Password"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="prof-toast fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3"
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
    </>
  );
}
