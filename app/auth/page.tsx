"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, Check, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/authContext";
import Image from "next/image";
import Link from "next/link";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path
        d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.4z"
        fill="#4285F4"
      />
      <path
        d="M24 48c6.5 0 12-2.1 16-5.8l-7.9-6c-2.2 1.5-5 2.3-8.1 2.3-6.2 0-11.5-4.2-13.4-9.9H2.5v6.2C6.5 42.6 14.7 48 24 48z"
        fill="#34A853"
      />
      <path
        d="M10.6 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6v-6.2H2.5C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.8l8.1-6.2z"
        fill="#FBBC05"
      />
      <path
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.5 0 24 0 14.7 0 6.5 5.4 2.5 13.2l8.1 6.2C12.5 13.7 17.8 9.5 24 9.5z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// Reusable icon-prefixed input
function IconInput({
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
  rightSlot,
}: {
  icon: React.ReactNode;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center rounded-lg">
      <span
        className="absolute left-3 flex items-center pointer-events-none"
        style={{ color: "var(--brand-teal-light)" }}
      >
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full py-3 pl-10 pr-10 text-sm border outline-none transition-all duration-150 rounded-lg"
        style={{
          border: "1px solid var(--nav-border)",
          background: "#fff",
          color: "var(--nav-fg)",
          fontFamily: "var(--nav-font-ui)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--brand-teal)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(25,99,94,0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--nav-border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {rightSlot && (
        <span className="absolute right-3 flex items-center">{rightSlot}</span>
      )}
    </div>
  );
}

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, register, loading } = useAuth();

  const redirectTo = searchParams.get("redirectTo") ?? "/";

  const [tab, setTab] = useState<"login" | "register">(
    searchParams.get("tab") === "register" ? "register" : "login",
  );
  const [mounted, setMounted] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  const googleError = searchParams.get("error");

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!loading && user) router.replace(redirectTo);
  }, [user, loading, router, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError("Please fill in all fields.");
      return;
    }
    setLoginLoading(true);
    setLoginError("");
    const { error } = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (error) setLoginError(error);
    else router.push(redirectTo);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirm) {
      setRegError("Please fill in all fields.");
      return;
    }
    if (!agreeTerms) {
      setRegError("Please agree to the Terms & Conditions.");
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError("Passwords do not match.");
      return;
    }
    if (regPassword.length < 8) {
      setRegError("Password must be at least 8 characters.");
      return;
    }
    setRegLoading(true);
    setRegError("");
    const { error } = await register(regName, regEmail, regPassword);
    setRegLoading(false);
    if (error) setRegError(error);
    else {
      setRegSuccess(true);
      setTimeout(() => router.push(redirectTo), 1200);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `/api/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`;
  };

  const EyeToggle = ({
    show,
    onToggle,
  }: {
    show: boolean;
    onToggle: () => void;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      className="transition-colors duration-150"
      style={{
        color: "var(--brand-teal-light)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 2,
        lineHeight: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-teal)")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.color = "var(--brand-teal-light)")
      }
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: "var(--brand-background-page)",
        fontFamily: "var(--nav-font-ui)",
      }}
    >
      {/* Subtle noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
        }}
      />

      <div
        className="relative rounded-2xl overflow-hidden w-full max-w-[440px] transition-all duration-500"
        style={{
          background: "#fff",
          boxShadow:
            "0 4px 32px rgba(25,99,94,0.10), 0 1px 4px rgba(25,99,94,0.06)",
        }}
      >
        {/* Logo + heading outside the card */}
        <div className="text-center  mb-6">
          <a href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="Bambumm"
              width={100}
              height={100}
              priority
            />
          </a>
          <h1
            className="text-3xl mb-1"
            style={{
              fontFamily: "var(--nav-font)",
              color: "var(--brand-teal)",
            }}
          >
            {tab === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm" style={{ color: "var(--brand-teal-light)" }}>
            {tab === "login"
              ? "Sign in to continue to your account"
              : "Join us and get started in seconds"}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#fff",
            boxShadow:
              "0 4px 32px rgba(25,99,94,0.10), 0 1px 4px rgba(25,99,94,0.06)",
          }}
        >
          {/* Tabs */}
          <div
            className="grid grid-cols-2 border-b"
            style={{ borderColor: "var(--nav-border)" }}
          >
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setLoginError("");
                  setRegError("");
                }}
                className="py-4 text-[11px] font-bold tracking-[0.14em] uppercase transition-all duration-150 relative"
                style={{
                  color: tab === t ? "var(--brand-teal)" : "#888",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderBottom:
                    tab === t
                      ? "2px solid var(--brand-teal)"
                      : "2px solid transparent",
                }}
              >
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="px-8 py-7">
            {/* Google error banner */}
            {googleError && (
              <div
                className="flex items-center gap-2.5 px-4 py-3 mb-5 rounded"
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
                <span className="text-xs" style={{ color: "var(--nav-sale)" }}>
                  {googleError === "google_denied"
                    ? "Google sign-in was cancelled."
                    : "Google sign-in failed. Please try again."}
                </span>
              </div>
            )}

            {/* Social buttons */}
            <div className="flex flex-col gap-3 mb-5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 text-sm font-medium transition-all duration-150 rounded-sm border"
                style={{
                  border: "1px solid var(--nav-border)",
                  background: "#fff",
                  color: "var(--nav-fg)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--brand-teal)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(25,99,94,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--nav-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <GoogleIcon /> Continue with Google Account
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="flex-1 h-px"
                style={{ background: "var(--nav-border)" }}
              />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "#aaa" }}
              >
                OR
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "var(--nav-border)" }}
              />
            </div>

            {/* ── LOGIN ── */}
            {tab === "login" && (
              <form onSubmit={handleLogin} noValidate>
                <div className="flex flex-col gap-3">
                  <IconInput
                    icon={<MailIcon />}
                    type="email"
                    placeholder="Enter Your Email Address"
                    value={loginEmail}
                    onChange={setLoginEmail}
                    autoComplete="email"
                  />
                  <IconInput
                    icon={<LockIcon />}
                    type={showLoginPass ? "text" : "password"}
                    placeholder="Enter Your Password"
                    value={loginPassword}
                    onChange={setLoginPassword}
                    autoComplete="current-password"
                    rightSlot={
                      <EyeToggle
                        show={showLoginPass}
                        onToggle={() => setShowLoginPass((v) => !v)}
                      />
                    }
                  />
                  {loginError && (
                    <div
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded"
                      style={{
                        background: "rgba(217,79,61,0.06)",
                        border: "1px solid rgba(217,79,61,0.18)",
                      }}
                    >
                      <AlertCircle
                        size={13}
                        style={{ color: "var(--nav-sale)" }}
                        className="shrink-0"
                      />
                      <span
                        className="text-xs"
                        style={{ color: "var(--nav-sale)" }}
                      >
                        {loginError}
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full rounded-lg py-3.5 mt-1 text-white text-xs font-bold tracking-[0.16em] uppercase flex items-center justify-center gap-2 transition-all duration-150"
                    style={{
                      background: loginLoading
                        ? "var(--brand-teal-light)"
                        : "var(--brand-teal)",
                      border: "none",
                      cursor: loginLoading ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!loginLoading)
                        e.currentTarget.style.background =
                          "var(--brand-teal-dark)";
                    }}
                    onMouseLeave={(e) => {
                      if (!loginLoading)
                        e.currentTarget.style.background = "var(--brand-teal)";
                    }}
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Signing
                        In…
                      </>
                    ) : (
                      "SIGN IN"
                    )}
                  </button>
                </div>

                <p
                  className="text-center text-xs mt-5"
                  style={{ color: "#888" }}
                >
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("register")}
                    className="font-semibold"
                    style={{
                      color: "var(--brand-teal)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Create One
                  </button>
                </p>
              </form>
            )}

            {/* ── REGISTER ── */}
            {tab === "register" && (
              <>
                {regSuccess ? (
                  <div className="text-center py-8">
                    <div
                      className="w-14 h-14 mx-auto flex items-center justify-center mb-4 rounded-full"
                      style={{
                        background: "rgba(25,99,94,0.1)",
                        border: "2px solid var(--brand-teal)",
                      }}
                    >
                      <Check
                        size={24}
                        style={{ color: "var(--brand-teal)" }}
                        strokeWidth={2.5}
                      />
                    </div>
                    <p
                      className="font-bold text-sm tracking-widest uppercase mb-1"
                      style={{ color: "var(--brand-teal)" }}
                    >
                      Welcome to Bambumm!
                    </p>
                    <p className="text-xs" style={{ color: "#888" }}>
                      Redirecting you now…
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} noValidate>
                    <div className="flex flex-col gap-3">
                      <IconInput
                        icon={<UserIcon />}
                        placeholder="Enter Your Full Name"
                        value={regName}
                        onChange={setRegName}
                        autoComplete="name"
                      />
                      <IconInput
                        icon={<MailIcon />}
                        type="email"
                        placeholder="Enter Your Email Address"
                        value={regEmail}
                        onChange={setRegEmail}
                        autoComplete="email"
                      />
                      <IconInput
                        icon={<LockIcon />}
                        type={showRegPass ? "text" : "password"}
                        placeholder="Enter Your Password"
                        value={regPassword}
                        onChange={setRegPassword}
                        autoComplete="new-password"
                        rightSlot={
                          <EyeToggle
                            show={showRegPass}
                            onToggle={() => setShowRegPass((v) => !v)}
                          />
                        }
                      />
                      <IconInput
                        icon={<LockIcon />}
                        type={showRegConfirm ? "text" : "password"}
                        placeholder="Confirm Your Password"
                        value={regConfirm}
                        onChange={setRegConfirm}
                        autoComplete="new-password"
                        rightSlot={
                          <EyeToggle
                            show={showRegConfirm}
                            onToggle={() => setShowRegConfirm((v) => !v)}
                          />
                        }
                      />
                      {regError && (
                        <div
                          className="flex items-center gap-2 px-3.5 py-2.5 rounded"
                          style={{
                            background: "rgba(217,79,61,0.06)",
                            border: "1px solid rgba(217,79,61,0.18)",
                          }}
                        >
                          <AlertCircle
                            size={13}
                            style={{ color: "var(--nav-sale)" }}
                            className="shrink-0"
                          />
                          <span
                            className="text-xs"
                            style={{ color: "var(--nav-sale)" }}
                          >
                            {regError}
                          </span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={regLoading}
                        className="w-full rounded-lg py-3.5 mt-1 text-white text-xs font-bold tracking-[0.16em] uppercase flex items-center justify-center gap-2 transition-all duration-150"
                        style={{
                          background: regLoading
                            ? "var(--brand-teal-light)"
                            : "var(--brand-teal)",
                          border: "none",
                          cursor: regLoading ? "not-allowed" : "pointer",
                        }}
                        onMouseEnter={(e) => {
                          if (!regLoading)
                            e.currentTarget.style.background =
                              "var(--brand-teal-dark)";
                        }}
                        onMouseLeave={(e) => {
                          if (!regLoading)
                            e.currentTarget.style.background =
                              "var(--brand-teal)";
                        }}
                      >
                        {regLoading ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />{" "}
                            Creating Account…
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </button>
                    </div>

                    <p
                      className="text-center text-xs mt-5"
                      style={{ color: "#888" }}
                    >
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setTab("login")}
                        className="font-semibold"
                        style={{
                          color: "var(--brand-teal)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Sign in
                      </button>
                    </p>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthContent />
    </Suspense>
  );
}
