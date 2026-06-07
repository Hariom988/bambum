"use client";

import { usePathname } from "next/navigation";
import { useNavHistory } from "@/hooks/useNavHistory";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

// Pages where the button should not appear
const HIDDEN_ON: string[] = ["/"];

export default function FloatingBackButton() {
  const pathname = usePathname();
  const { goBack } = useNavHistory();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate in/out when pathname changes
  useEffect(() => {
    if (!mounted) return;
    const shouldShow = !HIDDEN_ON.includes(pathname);
    // Small delay so enter animation triggers after route transition
    if (shouldShow) {
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [pathname, mounted]);

  if (!mounted) return null;
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <>
      <style>{`
        @keyframes fbtnSlideIn {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fbtnSlideOut {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-18px); }
        }

        .floating-back-btn {
          position: fixed;
          /* Desktop: vertically centred on left edge */
          left: 20px;
          top: 18%;
          transform: translateY(-50%) translateX(0);
          z-index: 9000;

          display: flex;
          align-items: center;
          gap: 7px;

          padding: 10px 16px 10px 12px;
          border-radius: 100px;

          background: rgba(255, 255, 255, 0.92);
          border: 1px solid var(--nav-border);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);

          color: var(--nav-fg-muted);
          font-family: var(--nav-font-ui);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;

          /* Visibility animation */
          opacity: 0;
          transition:
            opacity 0.25s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
            background 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease,
            box-shadow 0.15s ease;

          /* Keep translateY(-50%) in all states */
          will-change: transform, opacity;
        }

        .floating-back-btn.is-visible {
          opacity: 1;
          animation: fbtnSlideIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .floating-back-btn:hover {
          background: var(--nav-accent);
          border-color: var(--nav-accent);
          color: #fff;
          box-shadow: 0 6px 24px rgba(200, 169, 126, 0.35), 0 2px 8px rgba(0, 0, 0, 0.08);
          transform: translateY(-50%) scale(1.04);
        }

        .floating-back-btn:active {
          transform: translateY(-50%) scale(0.97);
          box-shadow: 0 2px 10px rgba(200, 169, 126, 0.2);
        }

        .floating-back-btn .fbtn-icon {
          transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
          flex-shrink: 0;
        }

        .floating-back-btn:hover .fbtn-icon {
          transform: translateX(-3px);
        }

        .floating-back-btn .fbtn-label {
          /* Hide label on small screens to keep it compact */
          display: none;
        }

        /* Mobile: bottom-left, pill shape, no label */
        @media (max-width: 767px) {
          .floating-back-btn {
            left: 16px;
            top: auto;
            bottom: 24px;
            transform: none;
            padding: 12px;
            border-radius: 50%;
            width: 46px;
            height: 46px;
            justify-content: center;
          }

          .floating-back-btn:hover {
            transform: scale(1.06);
          }

          .floating-back-btn:active {
            transform: scale(0.95);
          }

          .floating-back-btn .fbtn-label {
            display: none;
          }
        }

        /* Desktop md+: show label */
        @media (min-width: 768px) {
          .floating-back-btn .fbtn-label {
            display: inline;
          }
        }

        /* Ensure it doesn't overlap sticky footer on very small viewports */
        @media (max-width: 400px) {
          .floating-back-btn {
            bottom: 16px;
            left: 12px;
          }
        }
      `}</style>

      <button
        className={`floating-back-btn ${visible ? "is-visible" : ""}`}
        onClick={goBack}
        aria-label="Go back"
      >
        <ArrowLeft size={15} strokeWidth={2.5} className="fbtn-icon" />
        <span className="fbtn-label">Back</span>
      </button>
    </>
  );
}
