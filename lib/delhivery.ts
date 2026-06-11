// lib/delhivery.ts

function getBaseUrl(): string {
  return process.env.DELHIVERY_ENV === "production"
    ? process.env.DELHIVERY_BASE_URL!
    : process.env.DELHIVERY_TEST_BASE_URL!;
}

function authHeader(): Record<string, string> {
  return {
    Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise phone to exactly 10 digits.
 * Strips country code (+91 / 91 / 0 prefix), spaces, dashes, brackets.
 * Delhivery rejects anything that isn't a plain 10-digit mobile number.
 */
function normalisePhone(raw: string | undefined | null): string {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  const stripped = digits.replace(/^91/, "").replace(/^0/, "");
  return stripped.slice(0, 10);
}

/**
 * Delhivery expects Title Case for city and state, not ALL CAPS.
 * "NEW DELHI" → "New Delhi"
 */
function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Returns today's date as YYYY-MM-DD string (IST).
 */
function todayIST(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface DelhiveryOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface DelhiveryAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface DelhiveryOrderInput {
  orderId: string;
  total: number;
  address: DelhiveryAddress;
  items: DelhiveryOrderItem[];
}

export interface TrackingScan {
  status: string;
  statusType: string;
  location: string;
  time: string;
  activity: string;
  instructions: string;
}

export interface DelhiveryTrackingResult {
  waybill: string;
  status: string;
  statusType: string;
  location: string;
  expectedDelivery: string | null;
  scans: TrackingScan[];
  raw: unknown;
}

// ─── 1. Create Shipment ───────────────────────────────────────────────────────

export interface CreateShipmentResult {
  success: boolean;
  waybill?: string;
  packageCount?: number;
  error?: string;
  raw?: unknown;
}

/**
 * Registers a B2C forward prepaid shipment with Delhivery.
 * Returns the AWB (waybill) number on success.
 *
 * Endpoint: POST /api/cmu/create.json
 * Body format: form-encoded → format=json&data={...JSON...}
 */
export async function createShipment(
  order: DelhiveryOrderInput
): Promise<CreateShipmentResult> {
  try {
    const warehouse     = process.env.DELHIVERY_WAREHOUSE_NAME!;
    const sellerName    = process.env.DELHIVERY_SELLER_NAME!;
    const returnAddress = process.env.DELHIVERY_WAREHOUSE_ADDRESS!;
    const returnCity    = process.env.DELHIVERY_WAREHOUSE_CITY!;
    const returnState   = process.env.DELHIVERY_WAREHOUSE_STATE!;
    const returnPin     = process.env.DELHIVERY_WAREHOUSE_PINCODE!;
    const returnPhone   = process.env.DELHIVERY_WAREHOUSE_PHONE!;

    const defaultWeight = process.env.DELHIVERY_DEFAULT_WEIGHT || "0.3";

    const fullAddress = [order.address.line1, order.address.line2]
      .filter(Boolean)
      .join(", ");

    const productsDesc = order.items.map((i) => i.name).join(", ");
    const totalQty     = order.items.reduce((s, i) => s + i.quantity, 0);

    const shipmentPayload = {
      shipments: [
        {
          // ── Customer / delivery ──────────────────────────────────────────
          name:    order.address.fullName,
          add:     fullAddress,
          pin:     order.address.pincode,
          city:    toTitleCase(order.address.city),
          state:   toTitleCase(order.address.state),
          country: "India",
          phone:   normalisePhone(order.address.phone),

          // ── Order reference ──────────────────────────────────────────────
          order:      order.orderId,
          order_date: todayIST(),
          seller_inv: order.orderId,

          // ── Payment ──────────────────────────────────────────────────────
          // FIX: Delhivery requires exactly "Pre-paid" (capital P, hyphen).
          // "Prepaid" is rejected silently or causes serviceable: false.
          payment_mode: "Pre-paid",
          cod_amount:   "0",

          // ── Return / seller info ─────────────────────────────────────────
          return_name:    sellerName,
          return_add:     returnAddress,
          return_city:    returnCity,
          return_state:   returnState,
          return_pin:     returnPin,
          return_phone:   normalisePhone(returnPhone),
          return_country: "India",
          seller_name:    sellerName,
          seller_add:     returnAddress,

          // ── Items ────────────────────────────────────────────────────────
          products_desc: productsDesc,
          quantity:      String(totalQty),
          total_amount:  String(order.total),

          // ── Physical ─────────────────────────────────────────────────────
          weight:          defaultWeight,
          shipment_width:  "",
          shipment_height: "",

          // ── Routing ──────────────────────────────────────────────────────
          shipping_mode: "Surface",
          address_type:  "home",

          // ── Optional ─────────────────────────────────────────────────────
          waybill:  "",
          hsn_code: "",
          ewbn:     "",
        },
      ],
      pickup_location: {
        // Must exactly match (case-sensitive) the warehouse name registered
        // in the Delhivery portal.
        name: warehouse,
      },
    };

    const formBody = `format=json&data=${encodeURIComponent(
      JSON.stringify(shipmentPayload)
    )}`;

    const url = `${getBaseUrl()}/api/cmu/create.json`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    const data = await res.json();

    if (data.packages && Array.isArray(data.packages)) {
      const pkg = data.packages[0];

      if (pkg) {
        const remarksText = Array.isArray(pkg.remarks)
          ? pkg.remarks.join(" | ")
          : pkg.remarks || "";
        console.log("[delhivery] Package result:", {
          refnum:      pkg.refnum,
          status:      pkg.status,
          waybill:     pkg.waybill,
          serviceable: pkg.serviceable,
          sort_code:   pkg.sort_code,
          remarks:     remarksText,
        });
      }

      const waybill = pkg?.waybill || pkg?.wbn || "";
      if (waybill) {
        return {
          success: true,
          waybill,
          packageCount: data.packages.length,
          raw: data,
        };
      }

      const pkg0 = data.packages[0];
      const remarksError =
        Array.isArray(pkg0?.remarks) && pkg0.remarks.length > 0
          ? pkg0.remarks.join("; ")
          : "";
      const errorMsg =
        remarksError || data.rmk || data.error || data.message || "Shipment creation failed";
      return { success: false, error: errorMsg, raw: data };
    }

    const errorMsg =
      data.rmk || data.error || data.message || "Shipment creation failed";
    return { success: false, error: errorMsg, raw: data };
  } catch (err) {
    console.error("[delhivery] createShipment error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

// ─── 2. Create Pickup Request ─────────────────────────────────────────────────

export interface CreatePickupResult {
  success: boolean;
  pickupId?: string;
  error?: string;
  raw?: unknown;
}

/**
 * Creates a pickup request for the registered warehouse.
 *
 * Endpoint: POST /fm/request/new/
 * Body format: JSON (this endpoint accepts JSON, unlike create/cancel)
 */
export async function createPickupRequest(
  pickup_date: string,
  pickup_time: string,
  expected_package_count: number
): Promise<CreatePickupResult> {
  try {
    const warehouse = process.env.DELHIVERY_WAREHOUSE_NAME!;

    const url = `${getBaseUrl()}/fm/request/new/`;
    const res = await fetch(url, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({
        pickup_time,
        pickup_date,
        pickup_location:        warehouse,
        expected_package_count,
      }),
    });

    const data = await res.json();

   if (data.pk || data.id || data.pickup_id) {
  return {
    success: true,
    pickupId: String(data.pk || data.id || data.pickup_id),
    raw: data,
  };
}

if (res.ok && !data.error) {
  return { success: true, raw: data };
}

const errorParts: string[] = [];
if (data.error)   errorParts.push(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
if (data.message) errorParts.push(data.message);
const errorMsg = errorParts.join(" | ") || `HTTP ${res.status}`;
return { success: false, error: errorMsg, raw: data };


  } catch (err) {
    console.error("[delhivery] createPickupRequest error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

// ─── 3. Track Shipment ────────────────────────────────────────────────────────

/**
 * Fetches current status and full scan history for a waybill.
 *
 * Endpoint: GET /api/v1/packages/json/?waybill=XXX&ref_ids=
 *
 * FIX: Delhivery returns { ShipmentData: [...] }, NOT { data: [...] }.
 * The previous code read raw.data which was always undefined, causing
 * every tracking call to return "No tracking data found".
 *
 * FIX: shipment.Status is a nested object { Status, StatusType, City, ... },
 * not a plain string. The previous code assigned the entire object to the
 * status field, making it unreadable in the UI.
 */
export async function trackShipment(
  waybill: string
): Promise<{ success: boolean; data?: DelhiveryTrackingResult; error?: string }> {
  try {
    const url = `${getBaseUrl()}/api/v1/packages/json/?waybill=${encodeURIComponent(
      waybill
    )}&ref_ids=`;

    const res = await fetch(url, {
      method: "GET",
      headers: authHeader(),
    });

    const raw = await res.json();

    // FIX: top-level key is "ShipmentData", not "data"
    if (
      !raw.ShipmentData ||
      !Array.isArray(raw.ShipmentData) ||
      raw.ShipmentData.length === 0
    ) {
      return { success: false, error: "No tracking data found" };
    }

    const shipmentWrapper = raw.ShipmentData[0];
    const shipment        = shipmentWrapper.Shipment || shipmentWrapper;

    const scans: TrackingScan[] = (shipment.Scans || []).map((s: {
      ScanDetail?: {
        Scan?: string;
        StatusCode?: string;
        ScannedLocation?: string;
        ScanDateTime?: string;
        Instructions?: string;
      };
    }) => ({
      status:       s.ScanDetail?.Scan             || "",
      statusType:   s.ScanDetail?.StatusCode        || "",
      location:     s.ScanDetail?.ScannedLocation   || "",
      time:         s.ScanDetail?.ScanDateTime      || "",
      activity:     s.ScanDetail?.Instructions      || "",
      instructions: s.ScanDetail?.Instructions      || "",
    }));

    // FIX: shipment.Status is an object: { Status, StatusType, City, ... }
    // Extract the string values from inside it, not the object itself.
    const statusObj = shipment.Status ?? {};

    const result: DelhiveryTrackingResult = {
      waybill,
      status:           statusObj.Status     || "",
      statusType:       statusObj.StatusType  || "",
      location:
        statusObj.City           ||
        shipment.DestinationCity ||
        shipment.OriginCity      ||
        scans[0]?.location       ||
        "",
      expectedDelivery: shipment.ExpectedDeliveryDate || null,
      scans,
      raw,
    };

    return { success: true, data: result };
  } catch (err) {
    console.error("[delhivery] trackShipment error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

// ─── 4. Cancel Shipment ───────────────────────────────────────────────────────

export interface CancelShipmentResult {
  success: boolean;
  error?: string;
  raw?: unknown;
}

/**
 * Cancels a shipment by waybill number.
 * Only allowed for: Manifested, In Transit (forward) / Scheduled (RVP).
 *
 * Endpoint: POST /api/p/edit
 *
 * FIX: /api/p/edit reads waybill as a DIRECT form field, not wrapped inside
 * a format=json&data=JSON blob. The previous code used the same encoding as
 * /api/cmu/create.json which caused Delhivery to return waybill: null and
 * "Enter Waybill/OrderID, please try again" on every cancellation attempt.
 *
 * FIX: cancellation must be sent as "1" (string), not boolean true.
 *
 * FIX: success detection now reads Delhivery's actual { status: 'Success' }
 * response shape, with packages[0] as fallback for portal variants that
 * wrap the result the same way as /api/cmu/create.json.
 */
export async function cancelShipment(
  waybill: string
): Promise<CancelShipmentResult> {
  try {
    const url = `${getBaseUrl()}/api/p/edit`;

    // FIX: waybill must be a direct form field, NOT wrapped in data=JSON
    const formBody = new URLSearchParams({
      waybill,
      cancellation: "true",
    }).toString();

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    const data = await res.json();
    console.log("[delhivery] cancelShipment raw response:", JSON.stringify(data, null, 2));

    // Delhivery returns { status: 'Success', ... } on successful cancellation
    if (data.status === "Success" || data.cancellation === true) {
      return { success: true, raw: data };
    }

    // Explicit failure at top level
    if (data.error) {
      return { success: false, error: data.error, raw: data };
    }

    // Some portal versions wrap result inside packages[0]
    const pkg = Array.isArray(data.packages) ? data.packages[0] : null;
    if (pkg?.cancellation === true) {
      return { success: true, raw: data };
    }
    if (pkg?.error) {
      return { success: false, error: pkg.error, raw: data };
    }

    // Fallback: 2xx with no packages and no error → treat as success
    if (res.ok && !pkg && !data.error) {
      return { success: true, raw: data };
    }

    const errorMsg = data.message || data.error || `HTTP ${res.status}`;
    return { success: false, error: errorMsg, raw: data };
  } catch (err) {
    console.error("[delhivery] cancelShipment error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}