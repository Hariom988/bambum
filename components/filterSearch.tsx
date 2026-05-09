"use client";

import { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface FilterSearchProps {
  value: string;
  onChange: (val: string) => void;
}

/**
 * Standalone search input for the products filter panel.
 * Uses an uncontrolled input + ref so it never loses focus
 * when parent state updates cause re-renders.
 */
export function FilterSearch({ value, onChange }: FilterSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Only sync external value → input when it changes from OUTSIDE
  // (e.g. "Clear All Filters" resets the query to "")
  // We do NOT set input value on every keystroke to avoid focus loss.
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 mb-2 transition-colors duration-150"
      style={{ border: "1px solid var(--nav-border)", background: "#fff" }}
      onFocus={() => {
        (document.activeElement as HTMLElement | null)
          ?.closest?.("div")
          ?.setAttribute(
            "style",
            "border: 1px solid var(--brand-teal); background: #fff",
          );
      }}
    >
      <Search
        size={13}
        style={{ color: "var(--nav-fg-muted)", flexShrink: 0 }}
      />

      <input
        ref={inputRef}
        type="text"
        placeholder="Search products…"
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: "0.82rem",
          color: "var(--nav-fg)",
          fontFamily: "var(--nav-font-ui)",
          minWidth: 0,
        }}
      />

      {value && (
        <button
          onClick={() => {
            onChange("");
            if (inputRef.current) inputRef.current.value = "";
            inputRef.current?.focus();
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            padding: 0,
            flexShrink: 0,
          }}
        >
          <X size={12} style={{ color: "var(--nav-fg-muted)" }} />
        </button>
      )}
    </div>
  );
}
