// ─────────────────────────────────────────────────────────────────────────────
// nimirApi.ts
// All API calls for the chatbot order flow.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MenuItem {
  itemCode:    string;
  menuName:    string;
  category:    string;
  vegNonVeg:   "Veg" | "Non Veg";
  trayPrice:   { L: number; M: number; S: number } | null;
  price:       number | null;    // piece price — when sellByCount = true
  sellByCount: boolean;
  isActive:    boolean;
}

export interface Multiplier {
  key:   string;    // value to send in POST
  label: string;    // display label (may differ from key — use key for API, label for UI)
}

export interface OrderPayload {
  requestChannel: "chat_form";
  eventDetails: {
    eventName:    string;
    eventType:    string;
    eventDate:    string;
    serviceStyle: string;
    venue:        string | null;
  };
  guestDetails: {
    adultCount: number;
    kidsCount:  number;
  };
  menuItems: {
    itemCode:  string;
    category:  string;
    vegNonVeg: "Veg" | "Non Veg";
  }[];
  bufferPercent: null;
  specialFlags: {
    vipEvent:    false;
    outdoorEvent: false;
    customNote:  null;
  };
}

export interface OrderResponse {
  requestId: string;
  status:    string;
}

export interface QuotationResult {
  requestId:        string;
  status:           string;
  totalAmount:      number;
  hasCustomMode:    boolean;
  hasRemainderFlag: boolean;
  summary: {
    effectiveGuests:   number;
    eventType:         string;
    serviceStyle:      string;
    bufferApplied:     number;
  };
  itemResults: {
    itemCode:     string;
    menuName:     string;
    category:     string;
    vegNonVeg:    string;
    sellByCount:  boolean;
    customMode:   boolean;
    trayResult:   { L: number; M: number; S: number } | null;
    totalPieces:  number | null;
    message:      string | null;
  }[];
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function fetchMenu(): Promise<MenuItem[]> {
  const res  = await fetch(`${API_BASE}/api/v1/menu-items/`);
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to fetch menu");
  // filter active items only
  return (data.data ?? data).filter((d: MenuItem) => d.isActive !== false);
}

export async function fetchEventTypes(): Promise<Multiplier[]> {
  const res  = await fetch(`${API_BASE}/api/v1/multipliers/?multiplier_type=event&is_active=true`);
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to fetch event types");
  return (data.data ?? data).map((d: any) => ({ key: d.key, label: d.label ?? d.key }));
}

export async function fetchServiceStyles(): Promise<Multiplier[]> {
  const res  = await fetch(`${API_BASE}/api/v1/multipliers/?multiplier_type=service&is_active=true`);
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to fetch service styles");
  return (data.data ?? data).map((d: any) => ({ key: d.key, label: d.label ?? d.key }));
}

export async function submitOrder(
  payload:      OrderPayload,
  customerName: string
): Promise<OrderResponse> {
  const res  = await fetch(
    `${API_BASE}/api/v1/calculation-requests/?requested_by=${encodeURIComponent(customerName)}`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? "Failed to submit order");
  return data.data as OrderResponse;
}

export async function fetchQuotation(requestId: string): Promise<QuotationResult> {
  const res  = await fetch(`${API_BASE}/api/v1/calculation-results/request/${requestId}`);
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to fetch quotation");
  return data.data as QuotationResult;
}
