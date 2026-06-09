"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  Loader2,
  Trash2,
  RefreshCw,
  X,
  MapPin,
  CreditCard,
  User,
  Calendar,
  ArrowLeft,
  Search,
  Hash,
  Phone,
  Mail,
  ShoppingBag,
  AlertCircle,
  Circle,
  ChevronRight,
  Send,
  ScanLine,
  Ban,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  colorName: string;
  colorHex: string;
  price: number;
  size: string;
  quantity: number;
}

interface TrackingScan {
  status: string;
  statusType: string;
  location: string;
  time: string;
  activity: string;
  instructions: string;
}

interface DelhiveryInfo {
  waybill?: string;
  status?: string;
  statusType?: string;
  location?: string;
  expectedDelivery?: string | null;
  shipmentCreatedAt?: string;
  pickupRequestedAt?: string;
  cancelledAt?: string;
  lastTrackedAt?: string;
  trackingHistory?: TrackingScan[];
}

interface Order {
  _id: string;
  orderId: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  address: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  isGuest?: boolean;
  guestInfo?: {
    name: string;
    phone: string;
    email?: string;
  };
  payment?: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    method: string;
  };
  delhivery?: DelhiveryInfo;
  createdAt: string;
  updatedAt: string;
}

type PageView = "list" | "detail";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  Order["status"],
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ElementType;
    step: number;
  }
> = {
  pending: {
    label: "Pending",
    color: "#e67e22",
    bg: "rgba(230,126,34,0.08)",
    border: "rgba(230,126,34,0.25)",
    icon: Clock,
    step: 0,
  },
  confirmed: {
    label: "Confirmed",
    color: "var(--adm-accent)",
    bg: "var(--adm-bg-active)",
    border: "var(--adm-accent-border)",
    icon: CheckCircle,
    step: 1,
  },
  shipped: {
    label: "Shipped",
    color: "#2980b9",
    bg: "rgba(41,128,185,0.08)",
    border: "rgba(41,128,185,0.25)",
    icon: Truck,
    step: 2,
  },
  delivered: {
    label: "Delivered",
    color: "#27ae60",
    bg: "rgba(39,174,96,0.08)",
    border: "rgba(39,174,96,0.25)",
    icon: CheckCircle,
    step: 3,
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--adm-danger)",
    bg: "var(--adm-bg-danger-lt)",
    border: "var(--adm-danger-border)",
    icon: XCircle,
    step: -1,
  },
};

const TIMELINE_STEPS: {
  key: Order["status"];
  label: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  {
    key: "pending",
    label: "Order Placed",
    desc: "Awaiting confirmation",
    icon: ShoppingBag,
  },
  {
    key: "confirmed",
    label: "Confirmed",
    desc: "Order accepted",
    icon: CheckCircle,
  },
  { key: "shipped", label: "Shipped", desc: "Out for delivery", icon: Truck },
  {
    key: "delivered",
    label: "Delivered",
    desc: "Order complete",
    icon: Package,
  },
];

const ALL_STATUSES = [
  "all",
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex rounded-lg items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
      }}
    >
      <Icon size={9} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

// ─── Delivery Timeline ────────────────────────────────────────────────────────

interface TimelineEvent {
  status: Order["status"];
  timestamp?: string;
  location?: string;
  note?: string;
}

function DeliveryTimeline({
  currentStatus,
  createdAt,
  updatedAt,
  events,
}: {
  currentStatus: Order["status"];
  createdAt: string;
  updatedAt: string;
  events?: TimelineEvent[];
}) {
  const isCancelled = currentStatus === "cancelled";
  const currentStep = STATUS_CONFIG[currentStatus].step;

  if (isCancelled) {
    return (
      <div
        className="p-4 flex items-center gap-3"
        style={{
          background: "var(--adm-bg-danger-lt)",
          border: "1px solid var(--adm-danger-border)",
        }}
      >
        <XCircle
          size={16}
          style={{ color: "var(--adm-danger)", flexShrink: 0 }}
        />
        <div>
          <p
            className="text-xs font-bold"
            style={{ color: "var(--adm-danger)" }}
          >
            Order Cancelled
          </p>
          <p
            className="text-[10px] mt-0.5"
            style={{ color: "var(--adm-fg-muted)" }}
          >
            Last updated {formatDate(updatedAt)} · {formatTime(updatedAt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="absolute top-5 left-5 right-5 h-px"
        style={{ background: "var(--adm-border)" }}
      />
      <div
        className="absolute top-5 left-5 h-px transition-all duration-500"
        style={{
          background: "var(--adm-accent)",
          width: `${(currentStep / (TIMELINE_STEPS.length - 1)) * 100}%`,
          maxWidth: "calc(100% - 40px)",
        }}
      />
      <div className="relative flex justify-between px-0">
        {TIMELINE_STEPS.map((step, idx) => {
          const isDone = idx <= currentStep;
          const isCurrent = idx === currentStep;
          const StepIcon = step.icon;
          const matchedEvent = events?.find((e) => e.status === step.key);
          return (
            <div
              key={step.key}
              className="flex flex-col items-center gap-2"
              style={{ flex: 1 }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center transition-all duration-300 relative z-10"
                style={{
                  background: isDone
                    ? "var(--adm-accent)"
                    : "var(--adm-bg-white)",
                  border: `2px solid ${isDone ? "var(--adm-accent)" : "var(--adm-border)"}`,
                  boxShadow: isCurrent
                    ? "0 0 0 4px rgba(42,122,114,0.15)"
                    : "none",
                }}
              >
                <StepIcon
                  size={14}
                  strokeWidth={2}
                  style={{ color: isDone ? "#fff" : "var(--adm-fg-faint)" }}
                />
              </div>
              <div className="text-center px-1">
                <p
                  className="text-[10px] font-bold tracking-wide"
                  style={{
                    color: isDone ? "var(--adm-fg)" : "var(--adm-fg-faint)",
                  }}
                >
                  {step.label}
                </p>
                {matchedEvent?.timestamp ? (
                  <p
                    className="text-[9px] mt-0.5"
                    style={{ color: "var(--adm-fg-faint)" }}
                  >
                    {formatDate(matchedEvent.timestamp)}
                  </p>
                ) : idx === 0 ? (
                  <p
                    className="text-[9px] mt-0.5"
                    style={{ color: "var(--adm-fg-faint)" }}
                  >
                    {formatDate(createdAt)}
                  </p>
                ) : isCurrent ? (
                  <p
                    className="text-[9px] mt-0.5"
                    style={{ color: "var(--adm-fg-faint)" }}
                  >
                    {formatDate(updatedAt)}
                  </p>
                ) : null}
                {matchedEvent?.location && (
                  <p
                    className="text-[9px] mt-0.5 flex items-center justify-center gap-0.5"
                    style={{ color: "var(--adm-fg-faint)" }}
                  >
                    <MapPin size={7} /> {matchedEvent.location}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Delhivery Shipping Card ──────────────────────────────────────────────────

function DelhiveryCard({
  order,
  onShipmentCreated,
  onCancelled,
}: {
  order: Order;
  onShipmentCreated: (waybill: string) => void;
  onCancelled: () => void;
}) {
  const dlv = order.delhivery;

  // ── Local state ────────────────────────────────────────────────────────────
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [showPickupForm, setShowPickupForm] = useState(false);
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // default tomorrow
    return d.toISOString().split("T")[0];
  });
  const [pickupTime, setPickupTime] = useState("11:00:00");
  const [packageCount, setPackageCount] = useState(
    order.items.reduce((s, i) => s + i.quantity, 0),
  );
  const [requestingPickup, setRequestingPickup] = useState(false);
  const [pickupSuccess, setPickupSuccess] = useState("");
  const [pickupError, setPickupError] = useState("");

  const [tracking, setTracking] = useState<DelhiveryInfo["trackingHistory"]>(
    dlv?.trackingHistory || [],
  );
  const [trackingStatus, setTrackingStatus] = useState(dlv?.status || "");
  const [trackingLocation, setTrackingLocation] = useState(dlv?.location || "");
  const [lastTracked, setLastTracked] = useState(dlv?.lastTrackedAt || "");
  const [refreshingTrack, setRefreshingTrack] = useState(false);
  const [trackError, setTrackError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  const [cancelling, setCancelling] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelError, setCancelError] = useState("");

  async function handleCreateShipment() {
    setCreating(true);
    setCreateError("");

    try {
      const res = await fetch("/api/admin/delhivery/shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order._id }),
      });
      const data = await res.json();
      console.log(order);
      if (!res.ok || !data.ok) {
        setCreateError(data.error || "Failed to create shipment.");
      } else {
        onShipmentCreated(data.waybill);
      }
    } catch {
      setCreateError("Network error. Please try again.");
    }
    setCreating(false);
  }

  // ── Create Pickup Request ──────────────────────────────────────────────────
  async function handlePickupRequest() {
    setRequestingPickup(true);
    setPickupError("");
    setPickupSuccess("");
    try {
      const res = await fetch("/api/admin/delhivery/pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup_date: pickupDate,
          pickup_time:
            pickupTime.length === 5 ? `${pickupTime}:00` : pickupTime,
          expected_package_count: Number(packageCount),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setPickupError(data.error || "Failed to create pickup request.");
      } else {
        setPickupSuccess(
          data.message || "Pickup request created successfully.",
        );
        setShowPickupForm(false);
      }
    } catch {
      setPickupError("Network error. Please try again.");
    }
    setRequestingPickup(false);
  }

  // ── Refresh Tracking ───────────────────────────────────────────────────────
  async function handleRefreshTracking() {
    if (!dlv?.waybill) return;
    setRefreshingTrack(true);
    setTrackError("");
    try {
      const res = await fetch(
        `/api/admin/delhivery/track?waybill=${dlv.waybill}&orderId=${order._id}`,
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setTrackError(data.error || "Tracking unavailable.");
      } else {
        const t = data.tracking;
        setTrackingStatus(t.status || "");
        setTrackingLocation(t.location || "");
        setTracking(t.scans || []);
        setLastTracked(new Date().toISOString());
      }
    } catch {
      setTrackError("Network error. Please try again.");
    }
    setRefreshingTrack(false);
  }

  // ── Cancel Shipment ────────────────────────────────────────────────────────
  async function handleCancel() {
    if (!dlv?.waybill) return;
    setCancelling(true);
    setCancelError("");
    try {
      const res = await fetch("/api/admin/delhivery/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waybill: dlv.waybill, orderId: order._id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setCancelError(data.error || "Cancellation failed.");
        setCancelConfirm(false);
      } else {
        onCancelled();
      }
    } catch {
      setCancelError("Network error. Please try again.");
    }
    setCancelling(false);
    setCancelConfirm(false);
  }

  // ── Shared style helpers ───────────────────────────────────────────────────
  const btnBase =
    "flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-150 cursor-pointer border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  // ── STATE A: No shipment yet ───────────────────────────────────────────────
  if (!dlv?.waybill) {
    const canCreate = order.status === "confirmed";
    return (
      <div
        style={{
          background: "var(--adm-bg-white)",
          border: "1px solid var(--adm-border-soft)",
          boxShadow: "var(--adm-shadow-card)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2.5 px-5 py-3.5 border-b"
          style={{ borderColor: "var(--adm-border-soft)" }}
        >
          <Truck size={13} style={{ color: "var(--adm-accent)" }} />
          <p
            className="text-[10px] font-bold tracking-[0.16em] uppercase"
            style={{ color: "var(--adm-accent)" }}
          >
            Delhivery Shipping
          </p>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          {/* Info note */}
          <div
            className="flex items-start gap-2.5 p-3"
            style={{
              background: "var(--adm-bg-soft)",
              border: "1px solid var(--adm-border-soft)",
            }}
          >
            <AlertCircle
              size={12}
              style={{
                color: "var(--adm-fg-faint)",
                flexShrink: 0,
                marginTop: 1,
              }}
            />
            <p
              className="text-[11px] leading-relaxed"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              {canCreate
                ? "Order is confirmed and ready for shipment creation."
                : `Shipment can only be created for confirmed orders. Current status: ${STATUS_CONFIG[order.status].label}.`}
            </p>
          </div>

          {/* Error */}
          {createError && (
            <p
              className="text-[11px] px-3 py-2"
              style={{
                background: "var(--adm-bg-danger-lt)",
                border: "1px solid var(--adm-danger-border)",
                color: "var(--adm-danger)",
              }}
            >
              {createError}
            </p>
          )}

          {/* Create button */}
          <button
            onClick={handleCreateShipment}
            disabled={!canCreate || creating}
            className={btnBase}
            style={{
              background: canCreate
                ? "var(--adm-accent)"
                : "var(--adm-bg-soft)",
              color: canCreate ? "#fff" : "var(--adm-fg-faint)",
              border: `1px solid ${canCreate ? "var(--adm-accent)" : "var(--adm-border)"}`,
              justifyContent: "center",
            }}
          >
            {creating ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Send size={11} />
            )}
            {creating ? "Creating Shipment…" : "Create Delhivery Shipment"}
          </button>
        </div>
      </div>
    );
  }

  // ── STATE B/C: Shipment exists ─────────────────────────────────────────────
  const isCancelledDlv =
    dlv.status === "Cancelled" || order.status === "cancelled";

  return (
    <div
      style={{
        background: "var(--adm-bg-white)",
        border: "1px solid var(--adm-border-soft)",
        boxShadow: "var(--adm-shadow-card)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-5 py-3.5 border-b"
        style={{ borderColor: "var(--adm-border-soft)" }}
      >
        <Truck size={13} style={{ color: "var(--adm-accent)" }} />
        <p
          className="text-[10px] font-bold tracking-[0.16em] uppercase"
          style={{ color: "var(--adm-accent)" }}
        >
          Delhivery Shipping
        </p>
        {isCancelledDlv && (
          <span
            className="ml-auto text-[9px] font-bold tracking-widest uppercase px-2 py-0.5"
            style={{
              background: "var(--adm-bg-danger-lt)",
              border: "1px solid var(--adm-danger-border)",
              color: "var(--adm-danger)",
            }}
          >
            Cancelled
          </span>
        )}
      </div>

      <div className="px-5 py-4 flex flex-col gap-3">
        {/* AWB number */}
        <div
          className="flex items-center justify-between p-3"
          style={{
            background: "var(--adm-bg-soft)",
            border: "1px solid var(--adm-border-soft)",
          }}
        >
          <div>
            <p
              className="text-[9px] font-bold tracking-widest uppercase"
              style={{ color: "var(--adm-fg-faint)" }}
            >
              AWB / Waybill
            </p>
            <p
              className="text-[13px] font-bold font-mono mt-0.5"
              style={{ color: "var(--adm-fg)" }}
            >
              {dlv.waybill}
            </p>
          </div>
          {dlv.shipmentCreatedAt && (
            <p className="text-[10px]" style={{ color: "var(--adm-fg-faint)" }}>
              {formatDate(dlv.shipmentCreatedAt)}
            </p>
          )}
        </div>

        {/* Latest tracking status (if available) */}
        {(trackingStatus || dlv.status) && (
          <div
            className="flex items-start gap-2.5 p-3"
            style={{
              background: "rgba(41,128,185,0.05)",
              border: "1px solid rgba(41,128,185,0.18)",
            }}
          >
            <ScanLine
              size={12}
              style={{ color: "#2980b9", flexShrink: 0, marginTop: 1 }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold" style={{ color: "#2980b9" }}>
                {trackingStatus || dlv.status}
                {(trackingLocation || dlv.location) && (
                  <span
                    className="font-normal ml-1"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    · {trackingLocation || dlv.location}
                  </span>
                )}
              </p>
              {lastTracked && (
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: "var(--adm-fg-faint)" }}
                >
                  Updated {formatDate(lastTracked)} · {formatTime(lastTracked)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Track error */}
        {trackError && (
          <p
            className="text-[11px] px-3 py-2"
            style={{
              background: "var(--adm-bg-danger-lt)",
              border: "1px solid var(--adm-danger-border)",
              color: "var(--adm-danger)",
            }}
          >
            {trackError}
          </p>
        )}

        {/* Scan history (collapsible) */}
        {(tracking || dlv.trackingHistory || []).length > 0 && (
          <div
            style={{
              border: "1px solid var(--adm-border-soft)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setHistoryOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left"
              style={{
                background: "var(--adm-bg-soft)",
                border: "none",
                cursor: "pointer",
                color: "var(--adm-fg-muted)",
              }}
            >
              <span className="text-[10px] font-bold tracking-widest uppercase">
                Scan History ({(tracking || dlv.trackingHistory || []).length})
              </span>
              {historyOpen ? (
                <ChevronUp size={11} />
              ) : (
                <ChevronDown size={11} />
              )}
            </button>
            {historyOpen && (
              <div
                className="flex flex-col divide-y"
                style={{ borderColor: "var(--adm-border-soft)" }}
              >
                {(tracking || dlv.trackingHistory || []).map((scan, idx) => (
                  <div key={idx} className="px-3 py-2.5 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className="text-[11px] font-bold"
                        style={{ color: "var(--adm-fg)" }}
                      >
                        {scan.status}
                        {scan.statusType && (
                          <span
                            className="ml-1.5 text-[9px] font-bold tracking-wide px-1 py-0.5"
                            style={{
                              background: "var(--adm-bg-soft)",
                              border: "1px solid var(--adm-border)",
                              color: "var(--adm-fg-faint)",
                            }}
                          >
                            {scan.statusType}
                          </span>
                        )}
                      </p>
                      {scan.time && (
                        <span
                          className="text-[10px] shrink-0"
                          style={{ color: "var(--adm-fg-faint)" }}
                        >
                          {formatDate(scan.time)}
                        </span>
                      )}
                    </div>
                    {scan.location && (
                      <p
                        className="text-[10px] flex items-center gap-1"
                        style={{ color: "var(--adm-fg-muted)" }}
                      >
                        <MapPin size={9} />
                        {scan.location}
                      </p>
                    )}
                    {scan.activity && (
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--adm-fg-faint)" }}
                      >
                        {scan.activity}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pickup success message */}
        {pickupSuccess && (
          <p
            className="text-[11px] px-3 py-2"
            style={{
              background: "rgba(39,174,96,0.06)",
              border: "1px solid rgba(39,174,96,0.2)",
              color: "#27ae60",
            }}
          >
            ✓ {pickupSuccess}
          </p>
        )}

        {/* Pickup request form */}
        {showPickupForm && !isCancelledDlv && (
          <div
            className="flex flex-col gap-3 p-3"
            style={{
              background: "var(--adm-bg-soft)",
              border: "1px solid var(--adm-border)",
            }}
          >
            <p
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              Schedule Pickup
            </p>

            {/* Date */}
            <div className="flex flex-col gap-1">
              <label
                className="text-[9px] font-bold tracking-widest uppercase"
                style={{ color: "var(--adm-fg-faint)" }}
              >
                Pickup Date
              </label>
              <input
                type="date"
                value={pickupDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setPickupDate(e.target.value)}
                className="px-2.5 py-2 text-[12px] outline-none"
                style={{
                  background: "var(--adm-bg-white)",
                  border: "1px solid var(--adm-border)",
                  color: "var(--adm-fg)",
                  fontFamily: "var(--nav-font-ui)",
                }}
              />
            </div>

            {/* Time */}
            <div className="flex flex-col gap-1">
              <label
                className="text-[9px] font-bold tracking-widest uppercase"
                style={{ color: "var(--adm-fg-faint)" }}
              >
                Pickup Time
              </label>
              <input
                type="time"
                value={pickupTime.slice(0, 5)}
                onChange={(e) => setPickupTime(`${e.target.value}:00`)}
                className="px-2.5 py-2 text-[12px] outline-none"
                style={{
                  background: "var(--adm-bg-white)",
                  border: "1px solid var(--adm-border)",
                  color: "var(--adm-fg)",
                  fontFamily: "var(--nav-font-ui)",
                }}
              />
            </div>

            {/* Package count */}
            <div className="flex flex-col gap-1">
              <label
                className="text-[9px] font-bold tracking-widest uppercase"
                style={{ color: "var(--adm-fg-faint)" }}
              >
                Expected Package Count
              </label>
              <input
                type="number"
                min={1}
                value={packageCount}
                onChange={(e) => setPackageCount(Number(e.target.value))}
                className="px-2.5 py-2 text-[12px] outline-none"
                style={{
                  background: "var(--adm-bg-white)",
                  border: "1px solid var(--adm-border)",
                  color: "var(--adm-fg)",
                  fontFamily: "var(--nav-font-ui)",
                }}
              />
            </div>

            {/* Pickup error */}
            {pickupError && (
              <p
                className="text-[11px] px-2 py-1.5"
                style={{
                  background: "var(--adm-bg-danger-lt)",
                  border: "1px solid var(--adm-danger-border)",
                  color: "var(--adm-danger)",
                }}
              >
                {pickupError}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowPickupForm(false);
                  setPickupError("");
                }}
                disabled={requestingPickup}
                className={`${btnBase} flex-1 justify-center`}
                style={{
                  background: "transparent",
                  border: "1px solid var(--adm-border)",
                  color: "var(--adm-fg-muted)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePickupRequest}
                disabled={requestingPickup || !pickupDate || !pickupTime}
                className={`${btnBase} flex-[1.5] justify-center`}
                style={{
                  background: "var(--adm-accent)",
                  border: "1px solid var(--adm-accent)",
                  color: "#fff",
                }}
              >
                {requestingPickup ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Send size={11} />
                )}
                {requestingPickup ? "Requesting…" : "Confirm Pickup"}
              </button>
            </div>
          </div>
        )}

        {/* Cancel error */}
        {cancelError && (
          <p
            className="text-[11px] px-3 py-2"
            style={{
              background: "var(--adm-bg-danger-lt)",
              border: "1px solid var(--adm-danger-border)",
              color: "var(--adm-danger)",
            }}
          >
            {cancelError}
          </p>
        )}

        {/* Cancel confirmation */}
        {cancelConfirm && !isCancelledDlv && (
          <div
            className="flex flex-col gap-2.5 p-3"
            style={{
              background: "var(--adm-bg-danger-lt)",
              border: "1px solid var(--adm-danger-border)",
            }}
          >
            <p
              className="text-[11px] font-bold"
              style={{ color: "var(--adm-danger)" }}
            >
              Cancel shipment {dlv.waybill}? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCancelConfirm(false)}
                disabled={cancelling}
                className={`${btnBase} flex-1 justify-center`}
                style={{
                  background: "transparent",
                  border: "1px solid var(--adm-danger-border)",
                  color: "var(--adm-danger)",
                }}
              >
                Keep It
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className={`${btnBase} flex-[1.5] justify-center`}
                style={{
                  background: "var(--adm-danger)",
                  border: "1px solid var(--adm-danger)",
                  color: "#fff",
                }}
              >
                {cancelling ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Ban size={11} />
                )}
                {cancelling ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        )}
        {/* Re-ship button */}
        {isCancelledDlv && order.status === "confirmed" && (
          <div className="flex flex-col gap-2 pt-1">
            {createError && (
              <p
                className="text-[11px] px-3 py-2"
                style={{
                  background: "var(--adm-bg-danger-lt)",
                  border: "1px solid var(--adm-danger-border)",
                  color: "var(--adm-danger)",
                }}
              >
                {createError}
              </p>
            )}
            <button
              onClick={handleCreateShipment}
              disabled={creating}
              className={btnBase}
              style={{
                background: "var(--adm-accent)",
                border: "1px solid var(--adm-accent)",
                color: "#fff",
                justifyContent: "center",
              }}
            >
              {creating ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Send size={11} />
              )}
              {creating ? "Creating Shipment…" : "Create New Shipment"}
            </button>
          </div>
        )}

        {/* Action buttons row */}
        {!isCancelledDlv && (
          <div className="flex flex-wrap gap-2 pt-1">
            {/* Refresh tracking */}
            <button
              onClick={handleRefreshTracking}
              disabled={refreshingTrack}
              className={btnBase}
              style={{
                background: "var(--adm-bg-active)",
                border: "1px solid var(--adm-accent-border)",
                color: "var(--adm-accent)",
                flex: 1,
                justifyContent: "center",
              }}
            >
              {refreshingTrack ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <RefreshCw size={10} />
              )}
              {refreshingTrack ? "Refreshing…" : "Refresh Track"}
            </button>

            {/* Request pickup */}
            {!showPickupForm && (
              <button
                onClick={() => {
                  setShowPickupForm(true);
                  setPickupSuccess("");
                  setPickupError("");
                }}
                className={btnBase}
                style={{
                  background: "var(--adm-bg-soft)",
                  border: "1px solid var(--adm-border)",
                  color: "var(--adm-fg-muted)",
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <Truck size={10} />
                Request Pickup
              </button>
            )}

            {/* Cancel shipment */}
            {!cancelConfirm && (
              <button
                onClick={() => {
                  setCancelConfirm(true);
                  setCancelError("");
                }}
                className={btnBase}
                style={{
                  background: "var(--adm-bg-danger-lt)",
                  border: "1px solid var(--adm-danger-border)",
                  color: "var(--adm-danger)",
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <Ban size={10} />
                Cancel Shipment
              </button>
            )}
          </div>
        )}
        {!isCancelledDlv && (
          <div className="flex flex-wrap gap-2 pt-1">
            {/* Refresh tracking */}
            <button
              onClick={handleRefreshTracking}
              disabled={refreshingTrack}
              className={btnBase}
              style={{
                background: "var(--adm-bg-active)",
                border: "1px solid var(--adm-accent-border)",
                color: "var(--adm-accent)",
                flex: 1,
                justifyContent: "center",
              }}
            >
              {refreshingTrack ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <RefreshCw size={10} />
              )}
              {refreshingTrack ? "Refreshing…" : "Refresh Track"}
            </button>

            {/* Request pickup */}
            {!showPickupForm && (
              <button
                onClick={() => {
                  setShowPickupForm(true);
                  setPickupSuccess("");
                  setPickupError("");
                }}
                className={btnBase}
                style={{
                  background: "var(--adm-bg-soft)",
                  border: "1px solid var(--adm-border)",
                  color: "var(--adm-fg-muted)",
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <Truck size={10} />
                Request Pickup
              </button>
            )}

            {/* Cancel shipment */}
            {!cancelConfirm && (
              <button
                onClick={() => {
                  setCancelConfirm(true);
                  setCancelError("");
                }}
                className={btnBase}
                style={{
                  background: "var(--adm-bg-danger-lt)",
                  border: "1px solid var(--adm-danger-border)",
                  color: "var(--adm-danger)",
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <Ban size={10} />
                Cancel Shipment
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Order Detail (Full Page) ─────────────────────────────────────────────────

function OrderDetail({
  order,
  onBack,
  onStatusChange,
  onOrderUpdate,
}: {
  order: Order;
  onBack: () => void;
  onStatusChange: (id: string, status: Order["status"]) => Promise<void>;
  onOrderUpdate: (updater: (prev: Order | null) => Order | null) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const cfg = STATUS_CONFIG[order.status];

  const handleStatusChange = async (newStatus: Order["status"]) => {
    setUpdating(true);
    await onStatusChange(order._id, newStatus);
    setUpdating(false);
  };

  // When Delhivery card creates a shipment — update local order state
  const handleShipmentCreated = (waybill: string) => {
    onOrderUpdate((prev) =>
      prev
        ? {
            ...prev,
            status: "shipped",
            delhivery: {
              ...prev.delhivery,
              waybill,
              status: "Manifested",
              shipmentCreatedAt: new Date().toISOString(),
              trackingHistory: [],
            },
          }
        : prev,
    );
  };
  const handleCancelled = () => {
    onOrderUpdate((prev) =>
      prev
        ? {
            ...prev,
            status: "cancelled",
            delhivery: {
              status: "Cancelled",
              cancelledAt: new Date().toISOString(),
            },
          }
        : prev,
    );
  };

  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--adm-bg)" }}>
      {/* ── Page Header ── */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b"
        style={{
          background: "var(--adm-bg-white)",
          borderColor: "var(--adm-border-soft)",
          boxShadow: "var(--adm-shadow-card)",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[0.7rem] font-bold tracking-widest uppercase transition-colors duration-150"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--adm-fg-muted)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--adm-accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--adm-fg-muted)")
            }
          >
            <ArrowLeft size={13} /> Orders
          </button>
          <div
            className="w-px h-4"
            style={{ background: "var(--adm-border)" }}
          />
          <div className="flex items-center gap-2">
            <Hash size={12} style={{ color: "var(--adm-fg-faint)" }} />
            <span
              className="text-[0.7rem] font-bold tracking-widest uppercase"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              {order.orderId}
            </span>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="flex items-center gap-3">
          <span
            className="text-[0.65rem] font-bold tracking-widest uppercase hidden sm:block"
            style={{ color: "var(--adm-fg-faint)" }}
          >
            Update Status
          </span>
          <div className="relative">
            <select
              value={order.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as Order["status"])
              }
              disabled={updating}
              className="appearance-none text-[10px] font-bold tracking-widest uppercase px-3 py-2 pr-8 outline-none cursor-pointer"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.color,
                fontFamily: "var(--nav-font-ui)",
              }}
            >
              {(Object.keys(STATUS_CONFIG) as Order["status"][]).map((s) => (
                <option
                  key={s}
                  value={s}
                  style={{ background: "#fff", color: "#1a1a1a" }}
                >
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              {updating ? (
                <Loader2
                  size={10}
                  className="animate-spin"
                  style={{ color: cfg.color }}
                />
              ) : (
                <ChevronDown size={10} style={{ color: cfg.color }} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Top summary strip */}
        <div
          className="flex flex-wrap items-center gap-4 px-5 py-4 mb-6"
          style={{
            background: "var(--adm-bg-white)",
            border: "1px solid var(--adm-border-soft)",
            boxShadow: "var(--adm-shadow-card)",
          }}
        >
          <div className="h-8 w-1 shrink-0" style={{ background: cfg.color }} />
          <div className="flex-1 min-w-0">
            <h1
              className="text-[1.1rem] font-bold leading-tight"
              style={{ fontFamily: "var(--nav-font)", color: "var(--adm-fg)" }}
            >
              {order.items[0]?.name}
              {order.items.length > 1
                ? ` + ${order.items.length - 1} more`
                : ""}
            </h1>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span
                className="text-[11px] flex items-center gap-1"
                style={{ color: "var(--adm-fg-muted)" }}
              >
                <Calendar size={10} />
                {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
              </span>
              <span
                className="text-[10px] font-bold tracking-wide px-2 py-0.5"
                style={{
                  background: order.isGuest
                    ? "rgba(200,169,126,0.12)"
                    : "var(--adm-bg-accent-lt)",
                  color: order.isGuest ? "#8b6914" : "var(--adm-accent)",
                  border: `1px solid ${order.isGuest ? "rgba(200,169,126,0.3)" : "var(--adm-accent-border)"}`,
                }}
              >
                {order.isGuest ? "Guest Order" : "Registered User"}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p
              className="text-[1.4rem] font-bold leading-none"
              style={{ fontFamily: "var(--nav-font)", color: "var(--adm-fg)" }}
            >
              ₹{order.total.toLocaleString("en-IN")}
            </p>
            <p
              className="text-[11px] mt-1"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-5">
            {/* Order Items */}
            <div
              style={{
                background: "var(--adm-bg-white)",
                border: "1px solid var(--adm-border-soft)",
                boxShadow: "var(--adm-shadow-card)",
              }}
            >
              <div
                className="flex items-center gap-2.5 px-5 py-3.5 border-b"
                style={{ borderColor: "var(--adm-border-soft)" }}
              >
                <Package size={13} style={{ color: "var(--adm-accent)" }} />
                <p
                  className="text-[10px] font-bold tracking-[0.16em] uppercase"
                  style={{ color: "var(--adm-accent)" }}
                >
                  Ordered Items
                </p>
                <span
                  className="ml-auto text-[10px] font-bold"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  {order.items.length} product
                  {order.items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="px-5 py-4 flex flex-col gap-4">
                {order.items.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-start gap-4">
                      <div
                        className="w-16 h-20 shrink-0 overflow-hidden"
                        style={{
                          border: "1px solid var(--adm-border)",
                          background: "var(--adm-bg-input)",
                        }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package
                              size={18}
                              style={{
                                color: "var(--adm-fg-faint)",
                                opacity: 0.5,
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[0.875rem] font-bold leading-snug"
                          style={{
                            fontFamily: "var(--nav-font)",
                            color: "var(--adm-fg)",
                          }}
                        >
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {item.colorName && (
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold tracking-widest uppercase"
                              style={{
                                background: "var(--adm-bg-soft)",
                                border: "1px solid var(--adm-border)",
                                color: "var(--adm-fg-muted)",
                              }}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                                style={{ background: item.colorHex }}
                              />
                              {item.colorName}
                            </span>
                          )}
                          {item.size && (
                            <span
                              className="inline-flex items-center px-2 py-1 text-[9px] font-bold tracking-widest uppercase"
                              style={{
                                background: "var(--adm-bg-soft)",
                                border: "1px solid var(--adm-border)",
                                color: "var(--adm-fg-muted)",
                              }}
                            >
                              Size: {item.size}
                            </span>
                          )}
                          <span
                            className="inline-flex items-center px-2 py-1 text-[9px] font-bold tracking-widest uppercase"
                            style={{
                              background: "var(--adm-bg-soft)",
                              border: "1px solid var(--adm-border)",
                              color: "var(--adm-fg-muted)",
                            }}
                          >
                            Qty: {item.quantity}
                          </span>
                        </div>
                        <p
                          className="text-[11px] mt-1.5"
                          style={{ color: "var(--adm-fg-muted)" }}
                        >
                          ₹{item.price.toLocaleString("en-IN")} ×{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className="text-[0.9rem] font-bold"
                          style={{
                            fontFamily: "var(--nav-font)",
                            color: "var(--adm-fg)",
                          }}
                        >
                          ₹
                          {(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    {idx < order.items.length - 1 && (
                      <div
                        className="mt-4 border-t"
                        style={{ borderColor: "var(--adm-border-soft)" }}
                      />
                    )}
                  </div>
                ))}
                <div
                  className="flex items-center justify-between pt-4 mt-1 border-t"
                  style={{ borderColor: "var(--adm-border)" }}
                >
                  <div>
                    <p
                      className="text-[10px] font-bold tracking-widest uppercase"
                      style={{ color: "var(--adm-fg-muted)" }}
                    >
                      Order Total
                    </p>
                    <p
                      className="text-[10px] mt-0.5"
                      style={{ color: "var(--adm-fg-faint)" }}
                    >
                      {totalItems} item{totalItems !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p
                    className="text-[1.25rem] font-bold"
                    style={{
                      fontFamily: "var(--nav-font)",
                      color: "var(--adm-accent)",
                    }}
                  >
                    ₹{order.total.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div
              style={{
                background: "var(--adm-bg-white)",
                border: "1px solid var(--adm-border-soft)",
                boxShadow: "var(--adm-shadow-card)",
              }}
            >
              <div
                className="flex items-center gap-2.5 px-5 py-3.5 border-b"
                style={{ borderColor: "var(--adm-border-soft)" }}
              >
                <MapPin size={13} style={{ color: "var(--adm-accent)" }} />
                <p
                  className="text-[10px] font-bold tracking-[0.16em] uppercase"
                  style={{ color: "var(--adm-accent)" }}
                >
                  Delivery Address
                </p>
              </div>
              <div className="px-5 py-4">
                <div
                  className="p-4"
                  style={{
                    background: "var(--adm-bg-soft)",
                    border: "1px solid var(--adm-border-soft)",
                  }}
                >
                  <p
                    className="text-[0.875rem] font-bold"
                    style={{
                      fontFamily: "var(--nav-font)",
                      color: "var(--adm-fg)",
                    }}
                  >
                    {order.address.fullName}
                  </p>
                  {order.address.phone && (
                    <p
                      className="text-[12px] mt-1.5 flex items-center gap-1.5"
                      style={{ color: "var(--adm-fg-muted)" }}
                    >
                      <Phone
                        size={11}
                        style={{ color: "var(--adm-fg-faint)" }}
                      />
                      {order.address.phone}
                    </p>
                  )}
                  <p
                    className="text-[12px] mt-2 leading-relaxed"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    {order.address.line1}
                    {order.address.line2 ? `, ${order.address.line2}` : ""}
                  </p>
                  <p
                    className="text-[12px] mt-0.5"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    {order.address.city}, {order.address.state} –{" "}
                    {order.address.pincode}
                  </p>
                </div>
              </div>
            </div>
            {/* Order Meta */}
            <div
              style={{
                background: "var(--adm-bg-white)",
                border: "1px solid var(--adm-border-soft)",
                boxShadow: "var(--adm-shadow-card)",
              }}
            >
              <div
                className="flex items-center gap-2.5 px-5 py-3.5 border-b"
                style={{ borderColor: "var(--adm-border-soft)" }}
              >
                <AlertCircle size={13} style={{ color: "var(--adm-accent)" }} />
                <p
                  className="text-[10px] font-bold tracking-[0.16em] uppercase"
                  style={{ color: "var(--adm-accent)" }}
                >
                  Order Info
                </p>
              </div>
              <div className="px-5 py-4 flex flex-col gap-2.5">
                <InfoRow label="Order ID" value={`#${order.orderId}`} />
                <InfoRow
                  label="Placed"
                  value={`${formatDate(order.createdAt)} · ${formatTime(order.createdAt)}`}
                />
                <InfoRow
                  label="Last Updated"
                  value={`${formatDate(order.updatedAt)} · ${formatTime(order.updatedAt)}`}
                />
                <InfoRow
                  label="Type"
                  value={order.isGuest ? "Guest Checkout" : "Registered"}
                />
                {order.delhivery?.waybill && (
                  <InfoRow label="AWB" value={order.delhivery.waybill} mono />
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="flex flex-col gap-5">
            {/* Customer Info */}
            <div
              style={{
                background: "var(--adm-bg-white)",
                border: "1px solid var(--adm-border-soft)",
                boxShadow: "var(--adm-shadow-card)",
              }}
            >
              <div
                className="flex items-center gap-2.5 px-5 py-3.5 border-b"
                style={{ borderColor: "var(--adm-border-soft)" }}
              >
                <User size={13} style={{ color: "var(--adm-accent)" }} />
                <p
                  className="text-[10px] font-bold tracking-[0.16em] uppercase"
                  style={{ color: "var(--adm-accent)" }}
                >
                  Customer
                </p>
              </div>
              <div className="px-5 py-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center text-[0.75rem] font-bold flex-shrink-0"
                    style={{
                      background: "var(--adm-bg-active)",
                      border: "1px solid var(--adm-accent-border)",
                      color: "var(--adm-accent)",
                    }}
                  >
                    {(order.isGuest
                      ? order.guestInfo?.name || order.address.fullName || "UC"
                      : order.address.fullName || "UC"
                    )
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p
                      className="text-[0.8125rem] font-bold"
                      style={{ color: "var(--adm-fg)" }}
                    >
                      {order.isGuest
                        ? order.guestInfo?.name ||
                          order.address.fullName ||
                          "UC"
                        : order.address.fullName || "UC"}
                    </p>
                    <p
                      className="text-[10px] mt-0.5"
                      style={{ color: "var(--adm-fg-faint)" }}
                    >
                      {order.isGuest ? "Guest Checkout" : "Registered Customer"}
                    </p>
                  </div>
                </div>
                <div
                  className="border-t"
                  style={{ borderColor: "var(--adm-border-soft)" }}
                />
                <div className="flex flex-col gap-2.5">
                  {(order.guestInfo?.phone || order.address.phone) && (
                    <div className="flex items-center gap-2">
                      <Phone
                        size={11}
                        style={{ color: "var(--adm-fg-faint)", flexShrink: 0 }}
                      />
                      <span
                        className="text-[12px]"
                        style={{ color: "var(--adm-fg-muted)" }}
                      >
                        {order.guestInfo?.phone || order.address.phone}
                      </span>
                    </div>
                  )}
                  {order.guestInfo?.email && (
                    <div className="flex items-center gap-2">
                      <Mail
                        size={11}
                        style={{ color: "var(--adm-fg-faint)", flexShrink: 0 }}
                      />
                      <span
                        className="text-[12px] break-all"
                        style={{ color: "var(--adm-fg-muted)" }}
                      >
                        {order.guestInfo.email}
                      </span>
                    </div>
                  )}
                  {!order.isGuest && (
                    <div className="flex items-start gap-2">
                      <Hash
                        size={11}
                        style={{
                          color: "var(--adm-fg-faint)",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      />
                      <span
                        className="text-[11px] font-mono break-all leading-relaxed"
                        style={{ color: "var(--adm-fg-faint)" }}
                      >
                        {order.userId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div
              style={{
                background: "var(--adm-bg-white)",
                border: "1px solid var(--adm-border-soft)",
                boxShadow: "var(--adm-shadow-card)",
              }}
            >
              <div
                className="flex items-center gap-2.5 px-5 py-3.5 border-b"
                style={{ borderColor: "var(--adm-border-soft)" }}
              >
                <CreditCard size={13} style={{ color: "var(--adm-accent)" }} />
                <p
                  className="text-[10px] font-bold tracking-[0.16em] uppercase"
                  style={{ color: "var(--adm-accent)" }}
                >
                  Payment
                </p>
              </div>
              <div className="px-5 py-4 flex flex-col gap-2.5">
                <div
                  className="flex items-center justify-between p-3"
                  style={{
                    background: "rgba(39,174,96,0.06)",
                    border: "1px solid rgba(39,174,96,0.2)",
                  }}
                >
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: "#27ae60" }}
                  >
                    Payment Status
                  </span>
                  <span
                    className="text-[10px] font-bold flex items-center gap-1"
                    style={{ color: "#27ae60" }}
                  >
                    <CheckCircle size={10} /> Paid
                  </span>
                </div>
                {order.payment?.method && (
                  <InfoRow
                    label="Method"
                    value={
                      order.payment.method.charAt(0).toUpperCase() +
                      order.payment.method.slice(1)
                    }
                  />
                )}
                {order.payment?.razorpay_order_id && (
                  <InfoRow
                    label="Razorpay Order"
                    value={order.payment.razorpay_order_id}
                    mono
                    truncate
                  />
                )}
                {order.payment?.razorpay_payment_id && (
                  <InfoRow
                    label="Payment ID"
                    value={order.payment.razorpay_payment_id}
                    mono
                    truncate
                  />
                )}
                <div
                  className="border-t pt-2.5 mt-0.5"
                  style={{ borderColor: "var(--adm-border-soft)" }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold tracking-widest uppercase"
                      style={{ color: "var(--adm-fg-muted)" }}
                    >
                      Amount Paid
                    </span>
                    <span
                      className="text-[0.9rem] font-bold"
                      style={{
                        fontFamily: "var(--nav-font)",
                        color: "var(--adm-fg)",
                      }}
                    >
                      ₹{order.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── DELHIVERY CARD — inserted here in right column ── */}
            <DelhiveryCard
              order={order}
              onShipmentCreated={handleShipmentCreated}
              onCancelled={handleCancelled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Small reusable info row
function InfoRow({
  label,
  value,
  mono,
  truncate,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div
      className="flex items-start justify-between gap-3 p-2.5"
      style={{
        background: "var(--adm-bg-soft)",
        border: "1px solid var(--adm-border-soft)",
      }}
    >
      <span
        className="text-[9px] font-bold tracking-widest uppercase shrink-0"
        style={{ color: "var(--adm-fg-faint)" }}
      >
        {label}
      </span>
      <span
        className={[
          "text-[10px] text-right",
          mono ? "font-mono" : "font-semibold",
          truncate ? "truncate max-w-[140px]" : "",
        ].join(" ")}
        style={{ color: "var(--adm-fg)" }}
        title={truncate ? value : undefined}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Order Card (list view) ───────────────────────────────────────────────────

function OrderCard({
  order,
  onStatusChange,
  onViewDetail,
  onDelete,
}: {
  order: Order;
  onStatusChange: (id: string, status: Order["status"]) => Promise<void>;
  onViewDetail: (order: Order) => void;
  onDelete: (id: string, orderId: string) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const cfg = STATUS_CONFIG[order.status];

  const handleStatusChange = async (newStatus: Order["status"]) => {
    setUpdating(true);
    await onStatusChange(order._id, newStatus);
    setUpdating(false);
  };

  return (
    <div
      className="overflow-hidden rounded-lg transition-all duration-200 hover:-translate-y-px"
      style={{
        background: "var(--adm-bg-white)",
        border: "1px solid var(--adm-border-soft)",
        boxShadow: "var(--adm-shadow-card)",
      }}
    >
      <div className="flex items-center gap-3 px-5 py-4 flex-wrap">
        {/* Thumbnail + info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-11 h-14 shrink-0 overflow-hidden"
            style={{
              border: "1px solid var(--adm-border)",
              background: "var(--adm-bg-input)",
            }}
          >
            {order.items[0]?.image ? (
              <img
                src={order.items[0].image}
                alt={order.items[0].name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package
                  size={14}
                  style={{ color: "var(--adm-fg-faint)", opacity: 0.5 }}
                />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span
                className="text-[10px] font-bold tracking-[0.12em] uppercase flex items-center gap-1"
                style={{ color: "var(--adm-fg-faint)" }}
              >
                <Hash size={8} />
                {order.orderId}
              </span>
              <StatusBadge status={order.status} />
              {order.isGuest && (
                <span
                  className="text-[9px] rounded-lg font-bold tracking-widest uppercase px-1.5 py-0.5"
                  style={{
                    background: "rgba(200,169,126,0.1)",
                    border: "1px solid rgba(200,169,126,0.3)",
                    color: "#8b6914",
                  }}
                >
                  Guest
                </span>
              )}
              {/* ── Delhivery AWB badge on list card ── */}
              {order.delhivery?.waybill && (
                <span
                  className="text-[9px] font-bold tracking-wide px-1.5 py-0.5 flex items-center gap-1 font-mono"
                  style={{
                    background: "rgba(41,128,185,0.08)",
                    border: "1px solid rgba(41,128,185,0.22)",
                    color: "#2980b9",
                  }}
                >
                  <Truck size={8} />
                  {order.delhivery.waybill}
                </span>
              )}
            </div>
            <p
              className="text-[0.8125rem] font-bold truncate"
              style={{ fontFamily: "var(--nav-font)", color: "var(--adm-fg)" }}
            >
              {order.items[0]?.name}
              {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span
                className="text-[10px] flex items-center gap-1"
                style={{ color: "var(--adm-fg-faint)" }}
              >
                <Calendar size={9} />
                {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
              </span>
              {order.guestInfo?.email && (
                <span
                  className="text-[10px] flex items-center gap-1"
                  style={{ color: "var(--adm-fg-faint)" }}
                >
                  <Mail size={9} />
                  {order.guestInfo.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="text-right">
            <p
              className="text-[0.9rem] font-bold"
              style={{ fontFamily: "var(--nav-font)", color: "var(--adm-fg)" }}
            >
              ₹{order.total.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px]" style={{ color: "var(--adm-fg-faint)" }}>
              {order.items.reduce((s, i) => s + i.quantity, 0)} items
            </p>
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <select
              value={order.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as Order["status"])
              }
              disabled={updating}
              className="appearance-none rounded-sm text-[10px] font-bold tracking-widest uppercase px-3 py-2 pr-8 outline-none cursor-pointer"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.color,
                fontFamily: "var(--nav-font-ui)",
              }}
            >
              {(Object.keys(STATUS_CONFIG) as Order["status"][]).map((s) => (
                <option
                  key={s}
                  value={s}
                  style={{ background: "#fff", color: "#1a1a1a" }}
                >
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              {updating ? (
                <Loader2
                  size={10}
                  className="animate-spin"
                  style={{ color: cfg.color }}
                />
              ) : (
                <ChevronDown size={10} style={{ color: cfg.color }} />
              )}
            </div>
          </div>

          {/* Delete button */}
          {(order.status === "delivered" || order.status === "cancelled") && (
            <button
              onClick={() => onDelete(order._id, order.orderId)}
              className="flex items-center rounded-sm gap-1.5 px-3 py-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-150"
              style={{
                background: "var(--adm-bg-danger-lt)",
                border: "1px solid var(--adm-danger-border)",
                color: "var(--adm-danger)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--adm-danger)";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "var(--adm-danger)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--adm-bg-danger-lt)";
                e.currentTarget.style.color = "var(--adm-danger)";
                e.currentTarget.style.borderColor = "var(--adm-danger-border)";
              }}
            >
              <Trash2 size={10} />
            </button>
          )}

          {/* Details button */}
          <button
            onClick={() => onViewDetail(order)}
            className="flex items-center rounded-sm gap-1.5 px-3 py-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-150"
            style={{
              background: "var(--adm-bg-active)",
              border: "1px solid var(--adm-accent-border)",
              color: "var(--adm-accent)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--adm-accent)";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "var(--adm-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--adm-bg-active)";
              e.currentTarget.style.color = "var(--adm-accent)";
              e.currentTarget.style.borderColor = "var(--adm-accent-border)";
            }}
          >
            Details
            <ChevronRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [pageView, setPageView] = useState<PageView>("list");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => {
      if (searchRef.current) clearTimeout(searchRef.current);
    };
  }, [searchQuery]);

  const fetchOrders = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (debouncedSearch) params.set("search", debouncedSearch);
        const res = await fetch(`/api/admin/orders?${params}`);
        if (res.ok) {
          const d = await res.json();
          setOrders(d.orders || []);
        }
      } catch {}
      setLoading(false);
      setRefreshing(false);
    },
    [statusFilter, debouncedSearch],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (id: string, newStatus: Order["status"]) => {
    try {
      await fetch(`/api/admin/orders?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o)),
      );
      if (selectedOrder?._id === id) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus } : prev,
        );
      }
    } catch {}
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    orderId: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteOrder = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders?id=${deleteConfirm.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o._id !== deleteConfirm.id));
        setDeleteConfirm(null);
      }
    } catch {}
    setDeleting(false);
  };

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setPageView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBackToList = () => {
    setPageView("list");
    setSelectedOrder(null);
    // Refresh list to pick up any status/delhivery changes made in detail view
    fetchOrders(true);
  };

  const statusCounts = ALL_STATUSES.reduce(
    (acc, s) => {
      if (s === "all") acc[s] = orders.length;
      else acc[s] = orders.filter((o) => o.status === s).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  // ── Detail View ──
  if (pageView === "detail" && selectedOrder) {
    return (
      <>
        <style>{`
          @keyframes admDetailIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .detail-enter { animation: admDetailIn 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        `}</style>
        <div className="detail-enter">
          <OrderDetail
            order={selectedOrder}
            onBack={goBackToList}
            onStatusChange={handleStatusChange}
            onOrderUpdate={setSelectedOrder}
          />
        </div>
      </>
    );
  }

  // ── List View ──
  return (
    <>
      <style>{`
        @keyframes admOrderIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .order-row { animation: admOrderIn 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        .order-row:nth-child(1)  { animation-delay: 0.03s; }
        .order-row:nth-child(2)  { animation-delay: 0.07s; }
        .order-row:nth-child(3)  { animation-delay: 0.11s; }
        .order-row:nth-child(n+4){ animation-delay: 0.15s; }

        .status-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          border-radius: 8px;
          padding: 6px 14px;
          border: 1px solid var(--adm-border);
          background: var(--adm-bg-white);
          color: var(--adm-fg-muted);
          font-family: var(--nav-font-ui);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .status-pill:hover { border-color: var(--adm-accent); color: var(--adm-accent); }
        .status-pill[data-active="true"] {
          background: var(--adm-accent);
          border-color: var(--adm-accent);
          color: #fff;
        }
      `}</style>

      <div style={{ fontFamily: "var(--nav-font-ui)", color: "var(--adm-fg)" }}>
        {/* Page header */}
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 border-b"
          style={{
            background: "var(--adm-bg-white)",
            borderColor: "var(--adm-border-soft)",
          }}
        >
          <div>
            <p
              className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1"
              style={{ color: "var(--adm-accent)" }}
            >
              Bambumm Admin
            </p>
            <h1
              className="text-[1.4rem] font-bold"
              style={{ fontFamily: "var(--nav-font)", color: "var(--adm-fg)" }}
            >
              Orders Management
            </h1>
            <p
              className="text-[12px] mt-0.5"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              {orders.length} order{orders.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex rounded-sm items-center gap-2 px-3 py-2"
              style={{
                background: "var(--adm-bg-white)",
                border: "1px solid var(--adm-border)",
              }}
              onFocus={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor =
                  "var(--adm-accent)")
              }
              onBlur={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor =
                  "var(--adm-border)")
              }
            >
              <Search
                size={13}
                style={{ color: "var(--adm-fg-faint)", flexShrink: 0 }}
              />
              <input
                type="text"
                placeholder="Search order ID or name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[13px]"
                style={{
                  color: "var(--adm-fg)",
                  fontFamily: "var(--nav-font-ui)",
                  width: 190,
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--adm-fg-faint)",
                    padding: 0,
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="flex items-center rounded-sm justify-center p-2 transition-all"
              style={{
                border: "1px solid var(--adm-border)",
                background: "var(--adm-bg-white)",
                cursor: "pointer",
                color: "var(--adm-fg-muted)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--adm-accent)";
                e.currentTarget.style.color = "var(--adm-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--adm-border)";
                e.currentTarget.style.color = "var(--adm-fg-muted)";
              }}
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* Status filter pills */}
        <div
          className="flex items-center gap-2 flex-wrap px-6 py-4 border-b"
          style={{
            background: "var(--adm-bg-white)",
            borderColor: "var(--adm-border-soft)",
          }}
        >
          {ALL_STATUSES.map((s) => {
            const count = statusCounts[s] || 0;
            const scfg =
              s !== "all" ? STATUS_CONFIG[s as Order["status"]] : null;
            return (
              <button
                key={s}
                className="status-pill"
                data-active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              >
                {scfg && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: statusFilter === s ? "#fff" : scfg.color,
                    }}
                  />
                )}
                {s === "all" ? "All" : scfg?.label}
                <span
                  className="ml-0.5 text-[9px] font-black"
                  style={{ opacity: 0.8 }}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Orders list */}
        <div className="px-6 py-5">
          {loading ? (
            <div
              className="flex items-center justify-center gap-2.5 py-20 text-[13px]"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              <Loader2 size={18} className="animate-spin" /> Loading orders…
            </div>
          ) : orders.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 px-5 text-center"
              style={{
                background: "var(--adm-bg-white)",
                border: "1px solid var(--adm-border-soft)",
              }}
            >
              <div
                className="w-14 h-14 flex items-center justify-center mb-4"
                style={{
                  background: "var(--adm-bg-accent-lt)",
                  border: "1px solid var(--adm-accent-border)",
                }}
              >
                <Package size={22} style={{ color: "var(--adm-accent)" }} />
              </div>
              <p
                className="text-[16px] font-bold mb-2"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--adm-fg)",
                }}
              >
                No Orders Found
              </p>
              <p
                className="text-[13px]"
                style={{ color: "var(--adm-fg-muted)" }}
              >
                {searchQuery
                  ? `No orders matching "${searchQuery}"`
                  : statusFilter !== "all"
                    ? `No ${STATUS_CONFIG[statusFilter as Order["status"]]?.label || statusFilter} Orders`
                    : "Orders will appear here once customers start purchasing."}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="mt-5 text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 transition-colors"
                  style={{
                    background: "var(--adm-accent)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <div key={order._id} className="order-row">
                  <OrderCard
                    order={order}
                    onStatusChange={handleStatusChange}
                    onViewDetail={openDetail}
                    onDelete={(id, orderId) =>
                      setDeleteConfirm({ id, orderId })
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="p-7 w-full max-w-sm"
            style={{
              background: "var(--adm-bg-white)",
              border: "1px solid var(--adm-border)",
              boxShadow: "var(--adm-shadow-modal)",
            }}
          >
            <h3
              className="text-[1rem] font-bold mb-2"
              style={{ fontFamily: "var(--nav-font)", color: "var(--adm-fg)" }}
            >
              Delete Order?
            </h3>
            <p
              className="text-[0.8125rem] leading-relaxed mb-5"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              Permanently delete order{" "}
              <span style={{ color: "var(--adm-fg)", fontWeight: 700 }}>
                #{deleteConfirm.orderId}
              </span>
              ? This cannot be undone.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 py-2.5 text-[0.7rem] font-bold tracking-widest uppercase transition-colors duration-150"
                style={{
                  border: "1px solid var(--adm-border)",
                  background: "transparent",
                  color: "var(--adm-fg-muted)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--adm-accent)";
                  e.currentTarget.style.color = "var(--adm-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--adm-border)";
                  e.currentTarget.style.color = "var(--adm-fg-muted)";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
                disabled={deleting}
                className="flex-[1.5] flex items-center justify-center gap-2 py-2.5 text-[0.7rem] font-bold tracking-widest uppercase text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
                style={{
                  background: "var(--adm-danger)",
                  border: "none",
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                {deleting ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Trash2 size={11} />
                )}
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
