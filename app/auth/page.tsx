"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Image from "next/image";

// ─── Password strength ───────────────────────────────────────────────────────
function getStrength(pw: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "", color: "transparent" },
    { label: "Weak", color: "#d94f3d" },
    { label: "Weak", color: "#d94f3d" },
    { label: "Fair", color: "#e8a030" },
    { label: "Good", color: "#c8a97e" },
    { label: "Strong", color: "#4caf70" },
  ];
  return { score, ...map[score] };
}
function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type Mode = "login" | "register" | "forgot";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const strength = getStrength(password);

  // Handle query params (errors / verified)
  useEffect(() => {
    const err = searchParams.get("error");
    const verified = searchParams.get("verified");
    if (verified) setSuccess("Email verified! You can now log in.");
    if (err === "token-expired")
      setError("Verification link expired. Please register again.");
    if (err === "invalid-token") setError("Invalid verification link.");
    if (err === "CredentialsSignin") setError("Invalid email or password.");
  }, [searchParams]);

  const reset = useCallback(() => {
    setError("");
    setSuccess("");
    setName("");
    setEmail("");
    setPassword("");
    setShowPw(false);
  }, []);

  const switchMode = (m: Mode) => {
    reset();
    setMode(m);
  };

  // ─── Submit handlers
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false);
    if (res?.error) {
      setError(
        res.error === "CredentialsSignin"
          ? "Invalid email or password."
          : res.error,
      );
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (strength.score < 4) {
      setError("Please use a stronger password.");
      return;
    }
    setLoading(true);

    // Step 1: Register
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      setLoading(false);
      setError("Server error. Please try again.");
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Something went wrong.");
      return;
    }

    // Step 2: Auto sign-in with the same credentials
    const signInRes = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (signInRes?.error) {
      setError("Account created but login failed. Please sign in manually.");
      switchMode("login");
      return;
    }

    // Step 3: Redirect home
    router.push("/");
    router.refresh();
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    // Always show generic message
    setSuccess("If that email exists, a reset link has been sent.");
    if (!res.ok) console.error(data.error);
  }

  // ─── Render
  const titles: Record<Mode, { heading: string; sub: string }> = {
    login: { heading: "Welcome", sub: "Sign in to your Bambum account" },
    register: {
      heading: "Create account",
      sub: "Join Bambum — it only takes a moment",
    },
    forgot: {
      heading: "Forgot password",
      sub: "We'll send a reset link to your email",
    },
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-13"
      style={{ background: "var(--nav-bg)" }}
    >
      <div className="w-full max-w-sm">
        {/* Card */}
        <div
          className="px-8 py-10"
          style={{
            background: "var(--nav-dropdown-bg)",
            border: "1px solid var(--nav-border)",
          }}
        >
          {/* Heading */}
          <div className="flex items-center justify-between gap-3 mb-1">
            <h1
              className="text-xl font-semibold"
              style={{
                fontFamily: "Georgia, serif",
                letterSpacing: "0.02em",
                color: "var(--nav-fg)",
              }}
            >
              {titles[mode].heading}
            </h1>
            <Link href="/">
              <img
                src="/logo-removebg-preview.png"
                alt="Bambum"
                className="w-16 mx-auto"
              />
            </Link>
          </div>

          {/* Feedback */}
          {error && (
            <div
              className="text-[0.8rem] px-3 py-2 mb-5 border"
              style={{
                background: "rgba(217,79,61,0.07)",
                borderColor: "rgba(217,79,61,0.25)",
                color: "#d94f3d",
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="text-[0.8rem] px-3 py-2 mb-5 border"
              style={{
                background: "rgba(76,175,112,0.07)",
                borderColor: "rgba(76,175,112,0.25)",
                color: "#3a9a5c",
              }}
            >
              {success}
            </div>
          )}

          {/* ── LOGIN  */}
          {mode === "login" && (
            <form
              onSubmit={handleLogin}
              className="flex flex-col gap-4"
              noValidate
            >
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <PasswordField
                label="Password"
                value={password}
                onChange={setPassword}
                show={showPw}
                onToggle={() => setShowPw((p) => !p)}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="text-[0.78rem] text-right -mt-2 transition-colors"
                style={{
                  color: "var(--nav-accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                // onClick={() => switchMode("forgot")}
              >
                Forgot password?
              </button>

              <SubmitBtn loading={loading}>Sign in</SubmitBtn>
            </form>
          )}

          {/* ── REGISTER  */}
          {mode === "register" && (
            <form
              onSubmit={handleRegister}
              className="flex flex-col gap-4"
              noValidate
            >
              <Field
                label="Full name"
                type="text"
                value={name}
                onChange={setName}
                placeholder="Jane Doe"
                autoComplete="name"
              />
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <div className="flex flex-col gap-1">
                <PasswordField
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  show={showPw}
                  onToggle={() => setShowPw((p) => !p)}
                  autoComplete="new-password"
                />
                {/* Strength meter */}
                {password.length > 0 && (
                  <div className="mt-1">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{
                            background:
                              i <= strength.score
                                ? strength.color
                                : "var(--nav-border)",
                          }}
                        />
                      ))}
                    </div>
                    <p
                      className="text-[0.72rem]"
                      style={{ color: strength.color }}
                    >
                      {strength.label}
                    </p>
                  </div>
                )}
                <p
                  className="text-[0.72rem]"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  Min 12 chars · uppercase · lowercase · number · symbol
                </p>
              </div>

              <SubmitBtn loading={loading}>Create account</SubmitBtn>
            </form>
          )}

          {/* {/* ── FORGOT PASSWORD  */}
          {mode === "forgot" && (
            <form
              onSubmit={handleForgot}
              className="flex flex-col gap-4"
              noValidate
            >
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <SubmitBtn loading={loading}>Send reset link</SubmitBtn>
              <button
                type="button"
                className="text-[0.8rem] text-center transition-colors"
                style={{
                  color: "var(--nav-fg-muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => switchMode("login")}
              >
                ← Back to sign in
              </button>
            </form>
          )}

          {/* OAuth — only for login / register */}
          {mode !== "forgot" && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div
                  className="flex-1 h-px"
                  style={{ background: "var(--nav-border)" }}
                />
                <span
                  className="text-[0.72rem] tracking-widest uppercase"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  or
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "var(--nav-border)" }}
                />
              </div>

              <div className="flex flex-col gap-3">
                <OAuthBtn
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  icon={<GoogleIcon size={17} />}
                >
                  Continue with Google
                </OAuthBtn>
              </div>
            </>
          )}
        </div>

        {/* Switch mode */}
        {mode !== "forgot" && (
          <p
            className="text-center text-[0.82rem] mt-5"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => switchMode("register")}
                  className="font-semibold transition-colors"
                  style={{
                    color: "var(--nav-accent)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => switchMode("login")}
                  className="font-semibold transition-colors"
                  style={{
                    color: "var(--nav-accent)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </main>
  );
}

// ─── Sub-components
function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="text-[0.72rem] font-semibold tracking-widest uppercase"
        style={{ color: "var(--nav-fg-muted)" }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full px-3 py-2.5 text-[0.875rem] outline-none transition-all"
        style={{
          background: "rgba(255,255,255,0.7)",
          border: "1px solid var(--nav-border)",
          color: "var(--nav-fg)",
          fontFamily: "var(--nav-font-ui)",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "var(--nav-accent)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "var(--nav-border)")
        }
      />
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="text-[0.72rem] font-semibold tracking-widest uppercase"
        style={{ color: "var(--nav-fg-muted)" }}
      >
        {label}
      </span>
      <div
        className="flex items-center transition-all"
        style={{
          background: "rgba(255,255,255,0.7)",
          border: "1px solid var(--nav-border)",
        }}
        onFocusCapture={(e) =>
          ((e.currentTarget as HTMLDivElement).style.borderColor =
            "var(--nav-accent)")
        }
        onBlurCapture={(e) =>
          ((e.currentTarget as HTMLDivElement).style.borderColor =
            "var(--nav-border)")
        }
      >
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
          placeholder="••••••••••••"
          className="flex-1 px-3 py-2.5 text-[0.875rem] outline-none bg-transparent"
          style={{ color: "var(--nav-fg)", fontFamily: "var(--nav-font-ui)" }}
        />
        <button
          type="button"
          onClick={onToggle}
          className="px-3 transition-colors"
          style={{
            color: "var(--nav-fg-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}

function SubmitBtn({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full py-3 mt-1 text-[0.82rem] font-semibold tracking-widest uppercase transition-all"
      style={{
        background: loading ? "var(--nav-border)" : "var(--nav-fg)",
        color: loading ? "var(--nav-fg-muted)" : "var(--nav-drodown-bg)",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        letterSpacing: "0.1em",
      }}
      onMouseEnter={(e) => {
        if (!loading) e.currentTarget.style.background = "var(--nav-accent)";
      }}
      onMouseLeave={(e) => {
        if (!loading) e.currentTarget.style.background = "var(--nav-fg)";
      }}
    >
      {loading ? (
        <span
          className="inline-block w-4 h-4 border-2 rounded-full animate-spin"
          style={{
            borderColor:
              "var(--nav-fg-muted) transparent transparent transparent",
          }}
        />
      ) : (
        <>
          {children}
          <ArrowRight size={15} />
        </>
      )}
    </button>
  );
}

function OAuthBtn({
  children,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2.5 w-full py-2.5 text-[0.8rem] font-medium tracking-wide transition-all"
      style={{
        background: "transparent",
        border: "1px solid var(--nav-border)",
        color: "var(--nav-fg)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--nav-accent)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--nav-border)")
      }
    >
      {icon}
      {children}
    </button>
  );
}
