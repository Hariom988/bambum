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

// ─── Shared Types 

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

/** Minimal order shape required to build a Delhivery shipment payload. */
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
  status: string;           // e.g. "In Transit", "Delivered", "Manifested"
  statusType: string;       // e.g. "UD", "DL", "IT"
  location: string;
  expectedDelivery: string | null;
  scans: TrackingScan[];
  raw: unknown;             // full Delhivery response for debugging
}

// ─── 1. Create Shipment 

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
 * Body format: form-encoded  →  format=json&data={...JSON...}
 */
export async function createShipment(
  order: DelhiveryOrderInput
): Promise<CreateShipmentResult> {
  try {
    const warehouse = process.env.DELHIVERY_WAREHOUSE_NAME!;
    const sellerName = process.env.DELHIVERY_SELLER_NAME!;
    const returnAddress = process.env.DELHIVERY_WAREHOUSE_ADDRESS!;
    const returnCity = process.env.DELHIVERY_WAREHOUSE_CITY!;
    const returnState = process.env.DELHIVERY_WAREHOUSE_STATE!;
    const returnPin = process.env.DELHIVERY_WAREHOUSE_PINCODE!;
    const returnPhone = process.env.DELHIVERY_WAREHOUSE_PHONE!;

    const fullAddress = [order.address.line1, order.address.line2]
      .filter(Boolean)
      .join(", ");

    const productsDesc = order.items.map((i) => i.name).join(", ");
    const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

    const shipmentPayload = {
      shipments: [
        {
          name: order.address.fullName,
          add: fullAddress,
          pin: order.address.pincode,
          city: order.address.city,
          state: order.address.state,
          country: "India",
          phone: order.address.phone,
          order: order.orderId,
          payment_mode: "Prepaid",
          return_name: sellerName,
          return_add: returnAddress,
          return_city: returnCity,
          return_state: returnState,
          return_pin: returnPin,
          return_phone: returnPhone,
          return_country: "India",
          products_desc: productsDesc,
          quantity: String(totalQty),
          total_amount: String(order.total),
          seller_name: sellerName,
          seller_add: returnAddress,
          cod_amount: "",
          order_date: null,
          seller_inv: "",
          waybill: "",
          shipment_width: "",
          shipment_height: "",
          weight: "",
          shipping_mode: "Surface",
          address_type: "home",
          hsn_code: "",
          ewbn: "",
        },
      ],
      pickup_location: {
        name: warehouse,
      },
    };

    // Delhivery requires form-encoded body: format=json&data=<JSON string>
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

    // Delhivery returns { packages: [...], upload_wbn_list: [...], success: bool, ... }
    if (
      data.packages &&
      Array.isArray(data.packages) &&
      data.packages.length > 0
    ) {
      const pkg = data.packages[0];
      const waybill = pkg.waybill || pkg.wbn || "";
      if (waybill) {
        return { success: true, waybill, packageCount: data.packages.length, raw: data };
      }
    }

    // Delhivery sometimes returns rmk (remark) on failure
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
 * One request covers all manifested shipments at that location.
 *
 * Endpoint: POST /fm/request/new/
 */
export async function createPickupRequest(
  pickup_date: string,     // YYYY-MM-DD
  pickup_time: string,     // HH:mm:ss
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
        pickup_location: warehouse,
        expected_package_count,
      }),
    });

    const data = await res.json();

    // Delhivery returns { pk: <id>, ... } on success, or error fields
    if (res.ok && (data.pk || data.id || data.pickup_id)) {
      return {
        success: true,
        pickupId: String(data.pk || data.id || data.pickup_id),
        raw: data,
      };
    }

    // Some success responses don't have pk but still have 200
    if (res.ok && !data.error && !data.message?.toLowerCase().includes("error")) {
      return { success: true, raw: data };
    }

    const errorMsg = data.error || data.message || `HTTP ${res.status}`;
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

    // Delhivery returns { data: [ { Shipment: {...}, ... } ] }
    if (!raw.data || !Array.isArray(raw.data) || raw.data.length === 0) {
      return { success: false, error: "No tracking data found", };
    }

    const shipmentWrapper = raw.data[0];
    const shipment = shipmentWrapper.Shipment || shipmentWrapper;

    // Normalise scan history
    const scans: TrackingScan[] = (
      shipment.Scans || shipmentWrapper.Scans || []
    ).map((s: any) => ({
      status: s.ScanDetail?.Scan || s.Scan || "",
      statusType: s.ScanDetail?.StatusCode || s.StatusCode || "",
      location: s.ScanDetail?.ScannedLocation || s.ScannedLocation || "",
      time: s.ScanDetail?.ScanDateTime || s.ScanDateTime || "",
      activity: s.ScanDetail?.Instructions || s.Instructions || "",
      instructions: s.ScanDetail?.Instructions || s.Instructions || "",
    }));

    const result: DelhiveryTrackingResult = {
      waybill,
      status: shipment.Status || "",
      statusType: shipment.StatusType || "",
      location:
        shipment.DestinationCity ||
        shipment.OriginCity ||
        scans[0]?.location ||
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
 * Only allowed for: Manifested, In Transit, Pending (forward) / Scheduled (RVP).
 *
 * Endpoint: POST /api/p/edit
 */
export async function cancelShipment(
  waybill: string
): Promise<CancelShipmentResult> {
  try {
    const url = `${getBaseUrl()}/api/p/edit`;
    const res = await fetch(url, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({
        waybill,
        cancellation: "true",
      }),
    });

    const data = await res.json();

    // Delhivery returns { status: true/false, ... }
    if (data.status === true || data.cancellation === true || res.ok) {
      // Double-check it's not an error response with 200
      if (data.error || data.message?.toLowerCase().includes("cannot")) {
        return { success: false, error: data.error || data.message, raw: data };
      }
      return { success: true, raw: data };
    }

    const errorMsg = data.error || data.message || `HTTP ${res.status}`;
    return { success: false, error: errorMsg, raw: data };
  } catch (err) {
    console.error("[delhivery] cancelShipment error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}