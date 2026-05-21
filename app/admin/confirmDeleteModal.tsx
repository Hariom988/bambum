interface ConfirmDeleteModalProps {
  title: string;
  description: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  title,
  description,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
    >
      <div
        className="w-full max-w-sm p-7"
        style={{
          background: "var(--adm-bg-white)",
          border: "1px solid var(--adm-border)",
          boxShadow: "var(--adm-shadow-modal)",
        }}
      >
        <h3
          className="font-serif text-[16px] font-bold mb-2"
          style={{ color: "var(--adm-fg)" }}
        >
          {title}
        </h3>
        <p
          className="font-sans text-[13px] leading-relaxed mb-5"
          style={{ color: "var(--adm-fg-muted)" }}
        >
          {description}
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 font-sans text-[11px] font-bold tracking-widest uppercase transition-all duration-150"
            style={{
              border: "1px solid var(--adm-border)",
              color: "var(--adm-fg-muted)",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--adm-accent)";
              e.currentTarget.style.color = "var(--adm-fg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--adm-border)";
              e.currentTarget.style.color = "var(--adm-fg-muted)";
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-[1.5] py-2.5 font-sans text-[11px] font-bold tracking-widest uppercase text-white transition-opacity duration-150 hover:opacity-90"
            style={{
              background: "var(--adm-danger)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
