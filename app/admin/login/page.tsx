"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, AlertCircle, Loader2 } from "lucide-react";

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
    <main className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4">
      <div
        className={`w-full max-w-md transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <div className="bg-[#111114] border border-white/5 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-0.5 w-full bg-[#c8a97e]" />

          <div className="px-10 py-10">
            {/* Header */}
            <div className="flex flex-col items-center gap-4 mb-10">
              <div className="w-12 h-12 flex items-center justify-center border border-[#c8a97e]/30 bg-[#c8a97e]/10">
                <Shield
                  size={20}
                  className="text-[#c8a97e]"
                  strokeWidth={1.5}
                />
              </div>
              <div className="text-center">
                <h1
                  className="text-2xl font-bold uppercase tracking-widest text-[#e8e0d0]"
                  style={{ fontFamily: "var(--nav-font)" }}
                >
                  Admin Portal
                </h1>
                <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#6b6460] mt-1">
                  Bambumm · Secure Access
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px bg-white/5" />
              <div className="w-1 h-1 rounded-full bg-[#c8a97e] opacity-50" />
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} autoComplete="off">
              {/* Username */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-[0.65rem] tracking-[0.18em] uppercase text-[#6b6460] font-medium">
                  Username
                </label>
                <div className="flex items-center bg-[#17171b] border border-white/5 focus-within:border-[#c8a97e]/40 transition-colors duration-200">
                  <input
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1 bg-transparent outline-none text-sm text-[#e8e0d0] placeholder-[#6b6460]/50 px-4 py-3 tracking-wide font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5 mb-6">
                <label className="text-[0.65rem] tracking-[0.18em] uppercase text-[#6b6460] font-medium">
                  Password
                </label>
                <div className="flex items-center bg-[#17171b] border border-white/5 focus-within:border-[#c8a97e]/40 transition-colors duration-200">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="flex-1 bg-transparent outline-none text-sm text-[#e8e0d0] placeholder-[#6b6460]/50 px-4 py-3 tracking-wide font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="px-4 py-3 text-[#6b6460] hover:text-[#c8a97e] transition-colors duration-150"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/20 mb-5">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <span className="text-xs text-red-400 tracking-wide">
                    {error}
                  </span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#c8a97e] hover:bg-[#d4b48e] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0a0b] text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2.5 transition-colors duration-200"
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
            <div className="flex items-center justify-center gap-2 mt-7 pt-6 border-t border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c8a97e] animate-pulse" />
              <span className="text-[0.6rem] tracking-[0.12em] uppercase text-[#6b6460]">
                Session ends on tab close · 30 min idle timeout
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
