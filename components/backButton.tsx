"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallbackHref?: string; // Where to go if there's no browser history
  label?: string;
}

export default function BackButton({
  fallbackHref = "/",
  label = "Back",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // If user landed directly (no history), go to fallback
    if (window.history.length <= 1) {
      router.push(fallbackHref);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 transition-colors duration-150"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--nav-fg-muted)",
        fontFamily: "var(--nav-font-ui)",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "6px 0",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--nav-accent)")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.color = "var(--nav-fg-muted)")
      }
      aria-label={label}
    >
      <ArrowLeft size={14} />
      {label}
    </button>
  );
}
