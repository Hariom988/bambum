import { useEffect } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export type ToastState = { type: "success" | "error"; msg: string } | null;

interface AdminToastProps {
  toast: ToastState;
  onDismiss: () => void;
}

export default function AdminToast({ toast, onDismiss }: AdminToastProps) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[999] flex items-center gap-2.5 px-4 py-3"
      style={{
        background: "var(--adm-bg-white)",
        border: `1px solid ${
          toast.type === "success" ? "var(--adm-accent)" : "var(--adm-danger)"
        }`,
        boxShadow: "var(--adm-shadow-toast)",
      }}
    >
      {toast.type === "success" ? (
        <CheckCircle2
          size={15}
          style={{ color: "var(--adm-accent)", flexShrink: 0 }}
        />
      ) : (
        <AlertCircle
          size={15}
          style={{ color: "var(--adm-danger)", flexShrink: 0 }}
        />
      )}
      <span
        className="font-sans text-[13px] font-semibold"
        style={{ color: "var(--adm-fg)" }}
      >
        {toast.msg}
      </span>
    </div>
  );
}
