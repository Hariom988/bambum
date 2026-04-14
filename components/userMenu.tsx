"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, ChevronDown, Package, Settings } from "lucide-react";
import { useAuth } from "@/context/authContext";

export default function UserMenu() {
  const { user, loading, logout } = useAuth();

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div
        className="icon-btn"
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            border: "2px solid var(--nav-border)",
            borderTopColor: "var(--nav-accent)",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        className="icon-btn"
        onClick={() => router.push("/auth")}
        aria-label="Sign in"
        title="Sign in"
      >
        <User size={20} />
      </button>
    );
  }

  // Get initials for avatar
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 220px;
          background: #fff;
          border: 1px solid var(--nav-border);
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          z-index: 200;
          animation: dropIn 0.18s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .user-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 16px;
          background: transparent;
          border: none;
          font-family: var(--nav-font-ui);
          font-size: 13px;
          color: var(--nav-fg-muted);
          cursor: pointer;
          text-align: left;
          text-decoration: none;
          transition: background 0.12s, color 0.12s;
        }
        .user-menu-item:hover {
          background: rgba(200,169,126,0.08);
          color: var(--nav-fg);
        }
        .user-menu-item.danger:hover {
          background: rgba(217,79,61,0.06);
          color: var(--nav-sale);
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--nav-accent);
          color: #fff;
          font-family: var(--nav-font);
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.18s;
          flex-shrink: 0;
        }
        .user-avatar:hover, .user-avatar.open { border-color: var(--nav-accent); }
        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
      `}</style>

      <div ref={ref} style={{ position: "relative" }}>
        <button
          className={`user-avatar ${open ? "open" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Account menu"
          aria-expanded={open}
        >
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              referrerPolicy="no-referrer"
            />
          ) : (
            initials
          )}
        </button>

        {open && (
          <div className="user-dropdown">
            {/* User info header */}
            <div
              className="px-4 py-3 border-b"
              style={{
                borderColor: "var(--nav-border)",
                background: "var(--nav-bg)",
              }}
            >
              <div
                className="text-xs font-bold truncate"
                style={{ color: "var(--nav-fg)" }}
              >
                {user.name}
              </div>
              <div
                className="text-[10px] truncate mt-0.5"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                {user.email}
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <button className="user-menu-item danger" onClick={handleLogout}>
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
