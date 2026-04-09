"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

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
        // Set the sessionStorage flag — this is wiped automatically when the tab closes
        sessionStorage.setItem("admin_session_active", "true");
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
      style={{ background: "var(--nav-bg)", fontFamily: "var(--nav-font-ui)" }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--nav-border) 1px, transparent 1px), linear-gradient(90deg, var(--nav-border) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: 0.5,
        }}
      />

      <div
        className={`relative w-full max-w-md transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--nav-border)",
            boxShadow: "0 8px 40px rgba(200,169,126,0.12)",
          }}
        >
          <div className="px-10 py-10">
            <div className="flex items-center gap-4 mb-10">
              <a href="/">
                <img className="w-25" src="/logo.png" alt="Bambumm Logo" />
              </a>
              <div>
                <h1
                  className="text-xl font-bold uppercase tracking-widest"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-fg)",
                  }}
                >
                  Admin Portal
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div
                className="flex-1 h-px"
                style={{ background: "var(--nav-border)" }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--nav-accent)", opacity: 0.5 }}
              />
              <div
                className="flex-1 h-px"
                style={{ background: "var(--nav-border)" }}
              />
            </div>

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="flex flex-col gap-1.5 mb-4">
                <label
                  className="text-[0.65rem] tracking-[0.18em] uppercase font-semibold"
                  style={{ color: "var(--nav-fg)" }}
                >
                  Username
                </label>
                <div
                  className="flex items-center"
                  style={{
                    border: "1px solid var(--nav-border)",
                    background: "var(--nav-bg)",
                  }}
                  onFocusCapture={(e) =>
                    (e.currentTarget.style.borderColor = "var(--nav-accent)")
                  }
                  onBlurCapture={(e) =>
                    (e.currentTarget.style.borderColor = "var(--nav-border)")
                  }
                >
                  <input
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1 bg-transparent outline-none text-sm px-4 py-3 tracking-wide"
                    style={{ color: "var(--nav-fg)" }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mb-6">
                <label
                  className="text-[0.65rem] tracking-[0.18em] uppercase font-semibold"
                  style={{ color: "var(--nav-fg)" }}
                >
                  Password
                </label>
                <div
                  className="flex items-center"
                  style={{
                    border: "1px solid var(--nav-border)",
                    background: "var(--nav-bg)",
                  }}
                  onFocusCapture={(e) =>
                    (e.currentTarget.style.borderColor = "var(--nav-accent)")
                  }
                  onBlurCapture={(e) =>
                    (e.currentTarget.style.borderColor = "var(--nav-border)")
                  }
                >
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="flex-1 bg-transparent outline-none text-sm px-4 py-3 tracking-wide"
                    style={{ color: "var(--nav-fg)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="px-4 py-3"
                    style={{
                      color: "var(--nav-fg-muted)",
                      background: "none",
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
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="flex items-center gap-2.5 px-4 py-3 mb-5"
                  style={{
                    background: "rgba(217,79,61,0.06)",
                    border: "1px solid rgba(217,79,61,0.2)",
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2.5 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--nav-accent)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
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
          </div>
        </div>
      </div>
    </main>
  );
}
