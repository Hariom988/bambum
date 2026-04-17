"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Loader2, Leaf, Check } from "lucide-react";
import { useAuth } from "@/context/authContext";
import Image from "next/image";

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, register } = useAuth();

  const returnUrl = searchParams.get("returnUrl") || "/";

  const [tab, setTab] = useState<"login" | "register">(
    searchParams.get("tab") === "register" ? "register" : "login",
  );
  const [mounted, setMounted] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  const googleError = searchParams.get("error");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) router.replace(returnUrl);
  }, [user, router, returnUrl]);

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const pwStrength = passwordStrength(regPassword);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#e74c3c", "#e67e22", "#f39c12", "#27ae60"];

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
    if (error) {
      setLoginError(error);
    } else {
      router.push(returnUrl);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirm) {
      setRegError("Please fill in all fields.");
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
    if (error) {
      setRegError(error);
    } else {
      setRegSuccess(true);
      setTimeout(() => router.push(returnUrl), 1200);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <>
      <style>{`
        .auth-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--nav-border);
          background: var(--nav-bg);
          color: var(--nav-fg);
          font-family: var(--nav-font-ui);
          font-size: 14px;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .auth-input:focus {
          border-color: var(--nav-accent);
          box-shadow: 0 0 0 3px rgba(200,169,126,0.12);
        }
        .auth-input::placeholder { color: var(--nav-fg-muted); opacity: 0.7; }

        .auth-btn-primary {
          width: 100%;
          padding: 14px;
          background: var(--nav-accent);
          color: #fff;
          border: none;
          font-family: var(--nav-font-ui);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.18s ease, transform 0.12s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .auth-btn-primary:hover:not(:disabled) {
          background: var(--nav-accent-hover);
          transform: translateY(-1px);
        }
        .auth-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

        .auth-btn-google {
          width: 100%;
          padding: 13px;
          background: #fff;
          color: var(--nav-fg);
          border: 1px solid var(--nav-border);
          font-family: var(--nav-font-ui);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.18s, box-shadow 0.18s, transform 0.12s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .auth-btn-google:hover {
          border-color: var(--nav-accent);
          box-shadow: 0 2px 12px rgba(200,169,126,0.15);
          transform: translateY(-1px);
        }

        .tab-btn {
          flex: 1;
          padding: 12px;
          background: transparent;
          border: none;
          font-family: var(--nav-font-ui);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.18s, border-color 0.18s;
          border-bottom: 2px solid transparent;
          color: var(--nav-fg-muted);
        }
        .tab-btn.active {
          color: var(--nav-accent);
          border-bottom-color: var(--nav-accent);
        }
        .tab-btn:hover:not(.active) {
          color: var(--nav-fg);
        }

        .auth-card {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .auth-card.visible { opacity: 1; transform: translateY(0); }

        .pw-strength-bar {
          height: 3px;
          border-radius: 2px;
          background: var(--nav-border);
          overflow: hidden;
          margin-top: 6px;
        }
        .pw-strength-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s ease, background 0.3s ease;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--nav-border);
        }
        .divider span {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--nav-fg-muted);
          flex-shrink: 0;
        }

        /* Success animation */
        @keyframes successPop {
          0% { transform: scale(0); }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .success-icon { animation: successPop 0.4s cubic-bezier(0.22,1,0.36,1); }

        /* Grid bg */
        .auth-grid-bg {
          background-image:
            linear-gradient(var(--nav-border) 1px, transparent 1px),
            linear-gradient(90deg, var(--nav-border) 1px, transparent 1px);
          background-size: 48px 48px;
          opacity: 0.5;
        }

        @keyframes pulse2 {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .pulse-dot { animation: pulse2 2s ease-in-out infinite; }
      `}</style>

      <main
        className="min-h-screen flex items-center justify-center px-4 py-12 relative"
        style={{
          background: "var(--nav-bg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        {/* Grid background */}
        <div className="auth-grid-bg absolute inset-0 pointer-events-none" />

        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(200,169,126,0.08) 0%, transparent 70%)",
          }}
        />

        <div
          className={`auth-card relative w-full max-w-md ${mounted ? "visible" : ""}`}
        >
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <a href="/" className="inline-block">
              <Image src="/logo.png" alt="Bambumm" width={96} height={96} />
            </a>
          </div>

          {/* Checkout redirect notice */}
          {returnUrl === "/checkout" && (
            <div
              className="mb-4 px-4 py-3 text-xs text-center font-semibold"
              style={{
                background: "rgba(200,169,126,0.12)",
                border: "1px solid var(--nav-border)",
                color: "var(--nav-fg-muted)",
              }}
            >
              Please sign in to complete your purchase
            </div>
          )}

          {/* Card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid var(--nav-border)",
              boxShadow: "0 8px 40px rgba(200,169,126,0.12)",
            }}
          >
            {/* Top accent */}
            <div
              className="h-0.5 w-full"
              style={{ background: "var(--nav-accent)" }}
            />

            {/* Tabs */}
            <div
              className="flex border-b"
              style={{ borderColor: "var(--nav-border)" }}
            >
              <button
                className={`tab-btn ${tab === "login" ? "active" : ""}`}
                onClick={() => {
                  setTab("login");
                  setLoginError("");
                }}
              >
                Sign In
              </button>
              <button
                className={`tab-btn ${tab === "register" ? "active" : ""}`}
                onClick={() => {
                  setTab("register");
                  setRegError("");
                }}
              >
                Create Account
              </button>
            </div>

            <div className="px-8 py-7">
              {/* Google error */}
              {googleError && (
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
                    className="text-xs"
                    style={{ color: "var(--nav-sale)" }}
                  >
                    {googleError === "google_denied"
                      ? "Google sign-in was cancelled."
                      : "Google sign-in failed. Please try again."}
                  </span>
                </div>
              )}

              {/* Google button */}
              <button
                className="auth-btn-google"
                onClick={handleGoogleLogin}
                type="button"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="divider">
                <span>or</span>
              </div>

              {/* ── LOGIN FORM ── */}
              {tab === "login" && (
                <form onSubmit={handleLogin} autoComplete="off" noValidate>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label
                        className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-2"
                        style={{ color: "var(--nav-fg-muted)" }}
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="auth-input"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-2"
                        style={{ color: "var(--nav-fg-muted)" }}
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showLoginPass ? "text" : "password"}
                          className="auth-input"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          autoComplete="current-password"
                          style={{ paddingRight: 44 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPass((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{
                            color: "var(--nav-fg-muted)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 4,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "var(--nav-accent)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color =
                              "var(--nav-fg-muted)")
                          }
                        >
                          {showLoginPass ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                    </div>

                    {loginError && (
                      <div
                        className="flex items-center gap-2 px-3.5 py-2.5"
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
                      className="auth-btn-primary mt-1"
                    >
                      {loginLoading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Signing
                          In…
                        </>
                      ) : returnUrl === "/checkout" ? (
                        "Sign In & Continue to Checkout →"
                      ) : (
                        "Sign In →"
                      )}
                    </button>
                  </div>

                  <p
                    className="text-center text-xs mt-5"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      className="font-semibold underline underline-offset-2 transition-colors duration-150"
                      style={{
                        color: "var(--nav-accent)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => setTab("register")}
                    >
                      Create one
                    </button>
                  </p>
                </form>
              )}

              {/* ── REGISTER FORM ── */}
              {tab === "register" && (
                <>
                  {regSuccess ? (
                    <div className="text-center py-6">
                      <div
                        className="success-icon w-14 h-14 mx-auto flex items-center justify-center mb-4"
                        style={{
                          background: "rgba(200,169,126,0.12)",
                          border: "2px solid var(--nav-accent)",
                        }}
                      >
                        <Check
                          size={24}
                          style={{ color: "var(--nav-accent)" }}
                          strokeWidth={2.5}
                        />
                      </div>
                      <p
                        className="font-bold text-sm tracking-widest uppercase mb-1"
                        style={{
                          fontFamily: "var(--nav-font)",
                          color: "var(--nav-fg)",
                        }}
                      >
                        Welcome to Bambumm!
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--nav-fg-muted)" }}
                      >
                        {returnUrl === "/checkout"
                          ? "Redirecting to checkout…"
                          : "Redirecting you now…"}
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleRegister}
                      autoComplete="off"
                      noValidate
                    >
                      <div className="flex flex-col gap-4">
                        <div>
                          <label
                            className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-2"
                            style={{ color: "var(--nav-fg-muted)" }}
                          >
                            Full Name
                          </label>
                          <input
                            type="text"
                            className="auth-input"
                            placeholder="Your name"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            autoComplete="name"
                          />
                        </div>

                        <div>
                          <label
                            className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-2"
                            style={{ color: "var(--nav-fg-muted)" }}
                          >
                            Email Address
                          </label>
                          <input
                            type="email"
                            className="auth-input"
                            placeholder="you@example.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            autoComplete="email"
                          />
                        </div>

                        <div>
                          <label
                            className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-2"
                            style={{ color: "var(--nav-fg-muted)" }}
                          >
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showRegPass ? "text" : "password"}
                              className="auth-input"
                              placeholder="Min. 8 characters"
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              autoComplete="new-password"
                              style={{ paddingRight: 44 }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPass((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              style={{
                                color: "var(--nav-fg-muted)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 4,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.color =
                                  "var(--nav-accent)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color =
                                  "var(--nav-fg-muted)")
                              }
                            >
                              {showRegPass ? (
                                <EyeOff size={15} />
                              ) : (
                                <Eye size={15} />
                              )}
                            </button>
                          </div>
                          {regPassword && (
                            <div>
                              <div className="pw-strength-bar">
                                <div
                                  className="pw-strength-fill"
                                  style={{
                                    width: `${(pwStrength / 4) * 100}%`,
                                    background: strengthColors[pwStrength],
                                  }}
                                />
                              </div>
                              <p
                                className="text-[10px] mt-1"
                                style={{ color: strengthColors[pwStrength] }}
                              >
                                {strengthLabels[pwStrength]}
                              </p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label
                            className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-2"
                            style={{ color: "var(--nav-fg-muted)" }}
                          >
                            Confirm Password
                          </label>
                          <div className="relative">
                            <input
                              type={showRegConfirm ? "text" : "password"}
                              className="auth-input"
                              placeholder="Repeat password"
                              value={regConfirm}
                              onChange={(e) => setRegConfirm(e.target.value)}
                              autoComplete="new-password"
                              style={{ paddingRight: 44 }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegConfirm((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              style={{
                                color: "var(--nav-fg-muted)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 4,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.color =
                                  "var(--nav-accent)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color =
                                  "var(--nav-fg-muted)")
                              }
                            >
                              {showRegConfirm ? (
                                <EyeOff size={15} />
                              ) : (
                                <Eye size={15} />
                              )}
                            </button>
                          </div>
                          {regConfirm &&
                            regPassword &&
                            regConfirm !== regPassword && (
                              <p
                                className="text-[10px] mt-1"
                                style={{ color: "var(--nav-sale)" }}
                              >
                                Passwords don&apos;t match
                              </p>
                            )}
                          {regConfirm &&
                            regPassword &&
                            regConfirm === regPassword && (
                              <p
                                className="text-[10px] mt-1"
                                style={{ color: "#27ae60" }}
                              >
                                ✓ Passwords match
                              </p>
                            )}
                        </div>

                        {regError && (
                          <div
                            className="flex items-center gap-2 px-3.5 py-2.5"
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
                          className="auth-btn-primary mt-1"
                        >
                          {regLoading ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />{" "}
                              Creating Account…
                            </>
                          ) : returnUrl === "/checkout" ? (
                            "Create Account & Checkout →"
                          ) : (
                            "Create Account →"
                          )}
                        </button>

                        <p
                          className="text-[10px] text-center"
                          style={{ color: "var(--nav-fg-muted)" }}
                        >
                          By creating an account you agree to our{" "}
                          <a
                            href="/terms-conditions"
                            className="underline"
                            style={{ color: "var(--nav-accent)" }}
                          >
                            Terms & Conditions
                          </a>{" "}
                          and{" "}
                          <a
                            href="/privacy-policy"
                            className="underline"
                            style={{ color: "var(--nav-accent)" }}
                          >
                            Privacy Policy
                          </a>
                          .
                        </p>
                      </div>

                      <p
                        className="text-center text-xs mt-5"
                        style={{ color: "var(--nav-fg-muted)" }}
                      >
                        Already have an account?{" "}
                        <button
                          type="button"
                          className="font-semibold underline underline-offset-2"
                          style={{
                            color: "var(--nav-accent)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                          onClick={() => setTab("login")}
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
    </>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthContent />
    </Suspense>
  );
}
