"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, AlertCircle, Loader2, Link } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Both fields are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid credentials.");
      } else {
        router.push("/admin/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--nav-bg)" }}
    >
      <div
        className={`w-full max-w-md transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Card */}
        <div
          className="border overflow-hidden"
          style={{
            background: "#fff",
            borderColor: "var(--nav-border)",
            boxShadow: "0 4px 40px rgba(200,169,126,0.10)",
          }}
        >
          {/* Top accent bar */}

          <div className="px-10 py-10">
            {/* Header */}
            <div className="flex flex-row items-center gap-4 mb-10">
              <a href="/" className="text-[#c8a97e]">
                <img src="/logo.png" className="w-22" alt="logo" />
              </a>

              <div className="text-center">
                <h1
                  className="text-2xl font-bold uppercase tracking-widest"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-fg)",
                  }}
                >
                  Admin Portal
                </h1>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="flex-1 h-px"
                style={{ background: "var(--nav-border)" }}
              />
              <div
                className="w-1 h-1 rounded-full"
                style={{ background: "var(--nav-accent)", opacity: 0.5 }}
              />
              <div
                className="flex-1 h-px"
                style={{ background: "var(--nav-border)" }}
              />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} autoComplete="off">
              {/* Username */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label
                  className="text-[0.65rem] tracking-[0.18em] uppercase font-semibold"
                  style={{ color: "var(--nav-fg)" }}
                >
                  Username
                </label>
                <div
                  className="flex items-center border transition-colors duration-200 focus-within:border-[#c8a97e]"
                  style={{
                    borderColor: "var(--nav-border)",
                    background: "var(--nav-bg)",
                  }}
                >
                  <input
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1 bg-transparent outline-none text-sm px-4 py-3 tracking-wide"
                    style={{
                      color: "var(--nav-fg)",
                      fontFamily: "var(--nav-font-ui)",
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5 mb-6">
                <label
                  className="text-[0.65rem] tracking-[0.18em] uppercase font-semibold"
                  style={{ color: "var(--nav-fg)" }}
                >
                  Password
                </label>
                <div
                  className="flex items-center border transition-colors duration-200 focus-within:border-[#c8a97e]"
                  style={{
                    borderColor: "var(--nav-border)",
                    background: "var(--nav-bg)",
                  }}
                >
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="flex-1 bg-transparent outline-none text-sm px-4 py-3 tracking-wide"
                    style={{
                      color: "var(--nav-fg)",
                      fontFamily: "var(--nav-font-ui)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="px-4 py-3 transition-colors duration-150"
                    style={{ color: "var(--nav-fg-muted)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--nav-accent)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--nav-fg-muted)")
                    }
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="flex items-center gap-2.5 px-4 py-3 mb-5 border"
                  style={{
                    background: "rgba(217,79,61,0.06)",
                    borderColor: "rgba(217,79,61,0.2)",
                  }}
                >
                  <AlertCircle
                    size={14}
                    style={{ color: "var(--nav-sale)" }}
                    className="shrink-0"
                  />
                  <span
                    className="text-xs tracking-wide"
                    style={{ color: "var(--nav-sale)" }}
                  >
                    {error}
                  </span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2.5 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--nav-accent)", color: "#fff" }}
                onMouseEnter={(e) => {
                  if (!loading)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--nav-accent-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--nav-accent)";
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  "Access Dashboard →"
                )}
              </button>
            </form>

            {/* Footer */}
          </div>
        </div>
      </div>
    </main>
  );
}
