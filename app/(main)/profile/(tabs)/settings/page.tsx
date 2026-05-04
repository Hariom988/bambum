"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/authContext";

type ToastType = "success" | "error";

interface Toast {
  message: string;
  type: ToastType;
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium"
      style={{
        background:
          toast.type === "success" ? "var(--brand-teal)" : "var(--nav-sale)",
        color: "#fff",
        minWidth: "240px",
      }}
    >
      {toast.type === "success" ? (
        <CheckCircle size={16} />
      ) : (
        <AlertCircle size={16} />
      )}
      {toast.message}
    </div>
  );
}

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  // ── Personal Info state ──
  const [profileLoading, setProfileLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Password state ──
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  // Fetch current profile from DB
  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          const parts = (d.user.name ?? "").trim().split(" ");
          setFirstName(parts[0] ?? "");
          setLastName(parts.slice(1).join(" "));
          setEmail(d.user.email ?? "");
          setPhone(d.user.phone ?? "");
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  // Save personal info
  const handleSaveProfile = async () => {
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!firstName.trim()) {
      showToast("First name is required.", "error");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to update profile.", "error");
      } else {
        await refreshUser();
        showToast("Profile updated successfully.", "success");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // Save password
  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("All password fields are required.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to change password.", "error");
      } else {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showToast("Password changed successfully.", "success");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    fontSize: "0.875rem",
    outline: "none",
    background: "#fff",
    border: "1px solid var(--nav-border)",
    color: "var(--nav-fg)",
    borderRadius: "6px",
    transition: "border-color 0.15s",
    fontFamily: "inherit",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    marginBottom: "6px",
    color: "var(--nav-fg-muted)",
    opacity: 0.8,
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2
          size={24}
          className="animate-spin"
          style={{ color: "var(--brand-teal)" }}
        />
      </div>
    );
  }

  return (
    <>
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col gap-6">
        {/* ── Personal Information ── */}
        <div
          className="p-6 md:p-8 rounded-xl"
          style={{ background: "#fff", border: "1px solid var(--nav-border)" }}
        >
          <h3
            className="text-xl mb-6"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label style={labelStyle}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                style={inputStyle}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--brand-teal)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--nav-border)")
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                style={inputStyle}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--brand-teal)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--nav-border)")
                }
              />
            </div>
            <div className="md:col-span-2">
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={email}
                readOnly
                style={{
                  ...inputStyle,
                  opacity: 0.6,
                  cursor: "not-allowed",
                  background: "var(--nav-dropdown-bg)",
                }}
                title="Email cannot be changed"
              />
              <p
                className="mt-1.5 text-xs"
                style={{ color: "var(--nav-fg-muted)", opacity: 0.6 }}
              >
                Email address cannot be changed.
              </p>
            </div>
            <div className="md:col-span-2">
              <label style={labelStyle}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                style={inputStyle}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--brand-teal)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--nav-border)")
                }
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold uppercase tracking-wider rounded-lg transition-opacity"
              style={{
                background: "var(--brand-teal)",
                color: "#fff",
                opacity: savingProfile ? 0.7 : 1,
                cursor: savingProfile ? "not-allowed" : "pointer",
                border: "none",
              }}
            >
              {savingProfile && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>

        {/* ── Security ── */}
        <div
          className="p-6 md:p-8 rounded-xl"
          style={{ background: "#fff", border: "1px solid var(--nav-border)" }}
        >
          <h3
            className="text-xl mb-1"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            Security
          </h3>
          <p className="text-sm mb-6" style={{ color: "var(--nav-fg-muted)" }}>
            Change your account password
          </p>

          {user?.provider && user.provider !== "email" ? (
            <div
              className="p-4 rounded-lg text-sm"
              style={{
                background: "rgba(25,99,94,0.06)",
                border: "1px solid rgba(25,99,94,0.15)",
                color: "var(--nav-fg-muted)",
              }}
            >
              Password change is not available for accounts signed in with{" "}
              <span className="font-bold capitalize">{user.provider}</span>.
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-5">
                <div>
                  <label style={labelStyle}>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    style={inputStyle}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--brand-teal)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--nav-border)")
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    style={inputStyle}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--brand-teal)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--nav-border)")
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    style={inputStyle}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--brand-teal)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--nav-border)")
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSavePassword}
                  disabled={savingPassword}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold uppercase tracking-wider rounded-lg transition-opacity"
                  style={{
                    background: "var(--brand-teal)",
                    color: "#fff",
                    opacity: savingPassword ? 0.7 : 1,
                    cursor: savingPassword ? "not-allowed" : "pointer",
                    border: "none",
                  }}
                >
                  {savingPassword && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  Save Changes
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
