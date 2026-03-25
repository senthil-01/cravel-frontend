import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import heroImage from "@/assets/hero-menu.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartSummary } from "@/context/CartSummaryContext";
import {
  ShoppingCart, Plus, Minus, Trash2,
  Phone, Mail, MapPin, Star, Truck, Store,
  Users, Calendar, ChevronDown, Flag, TreePine, MessageSquare,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type CategoryKey = "Appetizer" | "Entree" | "Rice" | "Bread" | "Dessert";

interface TrayPrice {
  S?: number | null;
  M?: number | null;
  L?: number | null;
}

interface Dish {
  _id: string;
  itemCode: string;
  menuName: string;
  category: string;
  style: string;
  vegNonVeg?: "Veg" | "Non Veg";
  property?: string | null;
  group?: string | null;
  riceType?: string | null;
  sellByCount?: boolean;
  size?: string | null;
  price?: number | null;
  trayPrice?: TrayPrice | null;
  isActive: boolean;
}

export interface CartItem {
  name:     string;
  category: string;
  price:    number;
  quantity: number;
  size:     string;
  itemCode: string;  // ← from DB directly
}

export type DeliveryMode = "delivery" | "pickup" | null;

interface MultiplierOption {
  key: string;
  label: string;
}

interface EventDetails {
  requestedBy: string;
  eventName: string;
  eventType: string;
  serviceStyle: string;
  eventDate: string;
  adultCount: string;
  venue: string;
  kidsCount: string;
  bufferPercent: string;
  vipEvent: boolean;
  outdoorEvent: boolean;
  customNote: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: CategoryKey[] = ["Appetizer", "Entree", "Rice", "Bread", "Dessert"];



const BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${BASE}/api/v1/menu-items`;

//const API_BASE       = "http://127.0.0.1:8000/api/v1/menu-items/";
const MULTIPLIER_API = `${BASE}/api/v1/multipliers`;//"http://127.0.0.1:8000/api/v1/multipliers/";
const CALC_REQ_API   = `${BASE}/api/v1/calculation-requests`;//"http://127.0.0.1:8000/api/v1/calculation-requests/";

const OPENING_HOURS: Record<string, { open: boolean; from?: string; to?: string }> = {
  MON: { open: true, from: "10:00 AM", to: "9:00 PM" },
  TUE: { open: true, from: "10:00 AM", to: "9:00 PM" },
  WED: { open: true, from: "10:00 AM", to: "9:00 PM" },
  THU: { open: true, from: "10:00 AM", to: "9:00 PM" },
  FRI: { open: true, from: "10:00 AM", to: "9:00 PM" },
  SAT: { open: true, from: "10:00 AM", to: "9:00 PM" },
  SUN: { open: true, from: "10:00 AM", to: "9:00 PM" },
};

const DAY_KEYS        = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const LS_CART         = "nimir_cart";
const LS_MODE         = "nimir_delivery_mode";
const LS_SESSION_DATE = "nimir_session_date";

// ── API ───────────────────────────────────────────────────────────────────────

const fetchCategory = async (category: CategoryKey): Promise<Dish[]> => {
  const params = new URLSearchParams({ category });
  const res = await fetch(`${API_BASE}?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch ${category} items.`);
  const data = await res.json();
  const all: Dish[] = Array.isArray(data) ? data : (data.data ?? data.results ?? []);
  return all.filter((d) => d.isActive);
};

const fetchMultipliers = async (type: string): Promise<MultiplierOption[]> => {
  const res = await fetch(`${MULTIPLIER_API}?multiplier_type=${type}&is_active=true`);
  if (!res.ok) return [];
  const data = await res.json();
  const items = data.data ?? [];
  return items.map((item: any) => ({ key: item.key, label: item.label }));
};

// ── Time Helpers ──────────────────────────────────────────────────────────────

const checkIsOpen = () => {
  const now      = new Date();
  const jsDay    = now.getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const schedule = OPENING_HOURS[DAY_KEYS[todayIdx]];
  if (!schedule || !schedule.open) return false;
  const parseTimeMins = (t: string) => {
    const [hhmm, period] = t.trim().split(" ");
    let [h, m] = hhmm.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h * 60 + m;
  };
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= parseTimeMins(schedule.from!) && nowMins <= parseTimeMins(schedule.to!);
};

const todayDateStr = () => new Date().toISOString().split("T")[0];

// ── LocalStorage Helpers ──────────────────────────────────────────────────────

const lsGet = <T,>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const lsSet = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};
const lsDel = (keys: string[]) => {
  try { keys.forEach((k) => localStorage.removeItem(k)); } catch {}
};

const runStartupValidation = () => {
  const today       = todayDateStr();
  const sessionDate = lsGet<string>(LS_SESSION_DATE, "");
  if (sessionDate !== today) { lsDel([LS_CART, LS_SESSION_DATE]); lsSet(LS_SESSION_DATE, today); }
};
runStartupValidation();

const fmtPrice = (val: number) => `$${val.toLocaleString("en-US")}`;

// ── DishCard ──────────────────────────────────────────────────────────────────

const DishCard = ({
  dish, onAdd,
}: {
  dish: Dish;
  onAdd: (name: string, category: string, price: number, size: string, itemCode: string) => void;
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const tray = dish.trayPrice;

  const fromPrice = dish.sellByCount
    ? dish.price
    : (tray?.S ?? tray?.M ?? tray?.L ?? null);

  const handleClick = () => {
    // add to cart with name only — price calculated by engine
    onAdd(dish.menuName, dish.category, 0, "", dish.itemCode ?? "");
    setShowPopup(true);
  };

  return (
    <>
      {/* Dish Row */}
      <div
        className="px-6 py-4 hover:bg-cream/60 transition-colors cursor-pointer select-none"
        onClick={handleClick}
      >
        <p className="font-display font-semibold text-foreground text-base">{dish.menuName}</p>
        {fromPrice != null && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {dish.sellByCount ? `piece rate: ${fmtPrice(fromPrice)}` : `from ${fmtPrice(fromPrice)}`}
          </p>
        )}
      </div>

      {/* Center Popup — plain text, click anywhere to close */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setShowPopup(false)}
        >
          <div className="bg-white rounded-xl shadow-xl px-8 py-6 min-w-[240px] text-center">
            <p className="font-display font-bold text-foreground text-base mb-4">{dish.menuName}</p>
            {dish.sellByCount ? (
              <p className="text-sm text-muted-foreground">Piece &nbsp;·&nbsp; {fmtPrice(dish.price ?? 0)}</p>
            ) : (
              <div className="space-y-2 text-sm text-muted-foreground">
                {tray?.S != null && (
                  <div className="flex justify-between gap-8">
                    <span>Small</span><span className="font-medium text-foreground">{fmtPrice(tray.S)}</span>
                  </div>
                )}
                {tray?.M != null && (
                  <div className="flex justify-between gap-8">
                    <span>Medium</span><span className="font-medium text-foreground">{fmtPrice(tray.M)}</span>
                  </div>
                )}
                {tray?.L != null && (
                  <div className="flex justify-between gap-8">
                    <span>Large</span><span className="font-medium text-foreground">{fmtPrice(tray.L)}</span>
                  </div>
                )}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-4 italic">tap anywhere to close</p>
          </div>
        </div>
      )}
    </>
  );
};

// ── SelectField ───────────────────────────────────────────────────────────────

const SelectField = ({
  label, value, onChange, options, placeholder, required, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: MultiplierOption[]; placeholder: string; required?: boolean; error?: string;
}) => (
  <div>
    <label className="text-xs text-muted-foreground mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-md px-3 py-2 text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-8 ${error ? "border-red-400" : "border-input"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.key} value={o.key}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// ── ToggleField ───────────────────────────────────────────────────────────────

const ToggleField = ({
  label, value, onChange, icon: Icon,
}: {
  label: string; value: boolean; onChange: (v: boolean) => void; icon: any;
}) => (
  <div
    onClick={() => onChange(!value)}
    className={`flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2 text-sm transition-colors ${
      value ? "border-orange-400 bg-orange-50 text-orange-700" : "border-border bg-white text-muted-foreground hover:bg-gray-50"
    }`}
  >
    <Icon className="w-3.5 h-3.5" />
    <span className="text-xs font-medium">{label}</span>
    <div className={`ml-auto w-8 h-4 rounded-full transition-colors ${value ? "bg-orange-400" : "bg-gray-200"}`}>
      <div className={`w-3 h-3 bg-white rounded-full mt-0.5 transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`} />
    </div>
  </div>
);

// ── OrderPage ─────────────────────────────────────────────────────────────────

const OrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCartSummary } = useCartSummary();

  const [activeTab, setActiveTab] = useState(0);
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [loading, setLoading]     = useState(false);
  const [cart, setCart]           = useState<CartItem[]>(() => lsGet<CartItem[]>(LS_CART, []));
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(() => lsGet<DeliveryMode>(LS_MODE, "delivery"));
  const [isOpenNow, setIsOpenNow]       = useState(checkIsOpen);
  const [highlightForm, setHighlightForm] = useState(false);

  const [eventDetails, setEventDetails] = useState<EventDetails>({
    requestedBy: "", eventName: "", eventType: "", serviceStyle: "",
    eventDate: "", adultCount: "", venue: "", kidsCount: "",
    bufferPercent: "", vipEvent: false, outdoorEvent: false, customNote: "",
  });
  const [eventTypeOptions, setEventTypeOptions]       = useState<MultiplierOption[]>([]);
  const [serviceStyleOptions, setServiceStyleOptions] = useState<MultiplierOption[]>([]);
  const [eventErrors, setEventErrors]                 = useState<Partial<Record<keyof EventDetails, string>>>({});
  const [checkoutLoading, setCheckoutLoading]         = useState(false);
  const [checkoutError, setCheckoutError]             = useState("");

  const activeCategory = CATEGORIES[activeTab];

  useEffect(() => {
    fetchMultipliers("event").then(setEventTypeOptions);
    fetchMultipliers("service").then(setServiceStyleOptions);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setAllDishes([]);
    fetchCategory(activeCategory)
      .then((data) => { if (!cancelled) setAllDishes(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeCategory]);

  const half     = Math.ceil(allDishes.length / 2);
  const leftCol  = allDishes.slice(0, half);
  const rightCol = allDishes.slice(half);

  useEffect(() => { lsSet(LS_CART, cart); }, [cart]);
  useEffect(() => { lsSet(LS_MODE, deliveryMode); }, [deliveryMode]);

  useEffect(() => {
    const interval = setInterval(() => setIsOpenNow(checkIsOpen()), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const state = location.state as { fromChatbot?: boolean } | null;
    if (!state?.fromChatbot) return;
    const chatbotCart = lsGet<CartItem[]>(LS_CART, []);
    if (chatbotCart.length > 0) setCart(chatbotCart);
    window.history.replaceState({}, "");
  }, []);

  const todayDayIdx = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();

  const setEvent = (key: keyof EventDetails, val: any) => {
    setEventDetails((prev) => ({ ...prev, [key]: val }));
    setEventErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const totalItems    = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice    = useMemo(() => cart.reduce((sum, c) => sum + c.price * c.quantity, 0), [cart]);
  const belowMinOrder = totalPrice < 80;

  useEffect(() => { setCartSummary(totalItems, totalPrice); }, [totalItems, totalPrice]);

  const validateEventDetails = (): boolean => {
    const errs: Partial<Record<keyof EventDetails, string>> = {};
    if (!eventDetails.requestedBy.trim()) errs.requestedBy  = "Your name is required";
    if (!eventDetails.eventName.trim())   errs.eventName    = "Event name is required";
    if (!eventDetails.eventType)          errs.eventType    = "Event type is required";
    if (!eventDetails.serviceStyle)       errs.serviceStyle = "Service style is required";
    if (!eventDetails.eventDate) {
      errs.eventDate = "Event date is required";
    } else if (new Date(eventDetails.eventDate) < new Date()) {
      errs.eventDate = "Event date must be today or in the future";
    }
    if (!eventDetails.adultCount || parseInt(eventDetails.adultCount) < 1)
                                          errs.adultCount   = "At least 1 adult required";
    if (!eventDetails.venue.trim())       errs.venue        = "Venue is required";
    setEventErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateEventDetails()) {
      setHighlightForm(true);
      document.getElementById("order-form-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setHighlightForm(false), 2500);
      return;
    }
    if (cart.length === 0) { setCheckoutError("Please add at least one item to your cart."); return; }

    setCheckoutLoading(true);
    setCheckoutError("");

    try {
      const menuItems = cart.map((item) => ({
        itemCode:  item.itemCode,
        category:  item.category,
        vegNonVeg: "Veg",
      }));

      const payload = {
        requestChannel: "web_app",
        eventDetails: {
          eventName:    eventDetails.eventName,
          eventType:    eventDetails.eventType,
          eventDate:    new Date(eventDetails.eventDate).toISOString(),
          serviceStyle: eventDetails.serviceStyle,
          venue:        eventDetails.venue,
        },
        guestDetails: {
          adultCount: parseInt(eventDetails.adultCount),
          kidsCount:  eventDetails.kidsCount ? parseInt(eventDetails.kidsCount) : 0,
        },
        menuItems,
        ...(eventDetails.bufferPercent ? { bufferPercent: parseFloat(eventDetails.bufferPercent) } : {}),
        specialFlags: {
          vipEvent:     eventDetails.vipEvent,
          outdoorEvent: eventDetails.outdoorEvent,
          customNote:   eventDetails.customNote || null,
        },
      };

      const res = await fetch(
        `${CALC_REQ_API}?requested_by=${encodeURIComponent(eventDetails.requestedBy)}`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error("422 detail:", JSON.stringify(data.detail, null, 2));
        throw new Error(
          Array.isArray(data.detail)
            ? data.detail.map((e: any) => `${e.loc?.join(".")} — ${e.msg}`).join(" | ")
            : data.detail || "Order submission failed"
        );
      };

      navigate("/checkout", {
        state: { requestId: data.data.requestId, deliveryMode, cart },
      });
    } catch (err: any) {
      setCheckoutError(err.message || "Something went wrong. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleClearCart = () => { setCart([]); lsDel([LS_CART]); };

  const addToCart = (name: string, category: string, price: number, size: string, itemCode: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.name === name && c.size === size);
      if (existing) return prev.map((c) => c.name === name && c.size === size ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { name, category, price, quantity: 1, size, itemCode }];
    });
  };

  const updateQuantity = (name: string, size: string, delta: number) => {
    setCart((prev) =>
      prev.map((c) => c.name === name && c.size === size ? { ...c, quantity: c.quantity + delta } : c)
          .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (name: string, size: string) => {
    setCart((prev) => prev.filter((c) => !(c.name === name && c.size === size)));
  };

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes border-pulse {
          0%, 100% { outline: 2.5px solid #f97316; outline-offset: 2px; opacity: 1; }
          50%       { outline: 2.5px solid #fb923c; outline-offset: 4px; opacity: 0.7; }
        }
        .form-highlight { animation: border-pulse 0.5s ease-in-out infinite; }
      `}</style>

      {/* Hero */}
      <section className="relative w-full" style={{ minHeight: 340 }}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 flex items-start justify-between h-full px-8 py-10">
          <div className="text-white max-w-lg pt-4">
            <h1 className="text-4xl font-display font-bold mb-3">NIMIR Catering</h1>
            <p className="text-sm text-white/85 mb-4 leading-relaxed">
              One of the premier catering companies located in the vibrant city of Boston,
              Massachusetts, USA. Our commitment to excellence in culinary and event planning
              sets us apart in the industry.
            </p>
            <div className="flex items-center gap-4 text-sm text-white/90 mb-2">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> +16179875222</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> info@mayaindiangrill.com</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-white/90 mb-4">
              <MapPin className="w-3.5 h-3.5" /> 33 Tuttle St, Wakefield, Massachusetts
            </div>
            <button className="flex items-center gap-1.5 border border-white/60 text-white/90 text-xs px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors">
              <Star className="w-3 h-3" /> Write a review
            </button>
          </div>

          <div className="bg-black/60 backdrop-blur-sm text-white rounded-md p-4 min-w-[220px] text-xs">
            <p className="font-bold uppercase tracking-wider text-white/70 mb-2 text-[11px]">Opening Hours</p>
            {isOpenNow ? (
              DAY_KEYS.map((day, idx) => {
                const schedule = OPENING_HOURS[day];
                const isToday  = idx === todayDayIdx;
                return (
                  <div key={day} className={`flex items-center justify-between py-0.5 ${isToday ? "font-bold text-white" : "text-white/75"}`}>
                    <span className="w-8">{day}</span>
                    {schedule.open
                      ? <span>{schedule.from} to {schedule.to}</span>
                      : <span className="text-white/40 italic">Closed</span>}
                    {isToday && <span className="ml-2 text-white text-[9px] px-1.5 py-0.5 rounded bg-green-500">Open Now</span>}
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-white/75">MON – SUN &nbsp;·&nbsp; 10:00 AM to 9:00 PM</span>
                <span className="text-white text-[9px] px-1.5 py-0.5 rounded bg-red-500 whitespace-nowrap">Closed</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">

              {/* ── L-SHAPED ORDER FORM ───────────────────────────────────── */}
              <div
                id="order-form-section"
                className={`bg-white border border-border rounded-xl overflow-hidden transition-all duration-300 ${highlightForm ? "form-highlight" : ""}`}
              >

                {/* TOP ROW — full width event details */}
                <div className="border-b border-border px-6 py-5">
                  <h2 className="text-base font-semibold text-foreground mb-4">Event Details</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">

                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Your Name <span className="text-red-500">*</span></label>
                      <Input placeholder="Your name" value={eventDetails.requestedBy}
                        onChange={(e) => setEvent("requestedBy", e.target.value)}
                        className={eventErrors.requestedBy ? "border-red-400" : ""} />
                      {eventErrors.requestedBy && <p className="text-xs text-red-500 mt-1">{eventErrors.requestedBy}</p>}
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Event Name <span className="text-red-500">*</span></label>
                      <Input placeholder="e.g. Sharma Wedding" value={eventDetails.eventName}
                        onChange={(e) => setEvent("eventName", e.target.value)}
                        className={eventErrors.eventName ? "border-red-400" : ""} />
                      {eventErrors.eventName && <p className="text-xs text-red-500 mt-1">{eventErrors.eventName}</p>}
                    </div>

                    <SelectField label="Event Type" required
                      value={eventDetails.eventType} onChange={(v) => setEvent("eventType", v)}
                      options={eventTypeOptions} placeholder="Select type" error={eventErrors.eventType} />

                    <SelectField label="Service Style" required
                      value={eventDetails.serviceStyle} onChange={(v) => setEvent("serviceStyle", v)}
                      options={serviceStyleOptions} placeholder="Select style" error={eventErrors.serviceStyle} />

                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        <Calendar className="inline w-3 h-3 mr-1" />Event Date & Time <span className="text-red-500">*</span>
                      </label>
                      <Input type="datetime-local" value={eventDetails.eventDate}
                        onChange={(e) => setEvent("eventDate", e.target.value)}
                        className={eventErrors.eventDate ? "border-red-400" : ""} />
                      {eventErrors.eventDate && <p className="text-xs text-red-500 mt-1">{eventErrors.eventDate}</p>}
                    </div>

                  </div>
                </div>

                {/* BOTTOM ROW — Delivery/Pickup toggle (left) + Guest & Venue (right) */}
                <div className="grid md:grid-cols-2 divide-x divide-border">

                  {/* LEFT — Delivery / Pickup toggle only */}
                  <div className="px-6 py-5">
                    <h2 className="text-base font-semibold text-foreground mb-4">Order Mode</h2>

                    {/* Toggle */}
                    <div className="flex rounded-lg border border-border overflow-hidden mb-4">
                      <button
                        onClick={() => setDeliveryMode("delivery")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                          deliveryMode === "delivery"
                            ? "bg-primary text-primary-foreground"
                            : "bg-white text-muted-foreground hover:bg-gray-50"
                        }`}
                      >
                        <Truck className="w-4 h-4" /> Delivery
                      </button>
                      <button
                        onClick={() => setDeliveryMode("pickup")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-l border-border ${
                          deliveryMode === "pickup"
                            ? "bg-primary text-primary-foreground"
                            : "bg-white text-muted-foreground hover:bg-gray-50"
                        }`}
                      >
                        <Store className="w-4 h-4" /> Pickup
                      </button>
                    </div>

                    {/* Info based on mode */}
                    {deliveryMode === "delivery" && (
                      <div className="bg-orange-50 border border-orange-200 rounded-md px-4 py-3 text-sm text-orange-700 flex items-start gap-2">
                        <Truck className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Delivering to your venue</p>
                          <p className="text-xs text-orange-600 mt-0.5">
                            {eventDetails.venue ? eventDetails.venue : "Enter your venue in the form →"}
                          </p>
                        </div>
                      </div>
                    )}

                    {deliveryMode === "pickup" && (
                      <div className="bg-orange-50 border border-orange-200 rounded-md px-4 py-3 text-sm text-orange-700 flex items-start gap-2">
                        <Store className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Pickup at our location</p>
                          <p className="text-xs text-orange-600 mt-0.5">
                            {eventDetails.eventDate
                              ? `Scheduled: ${new Date(eventDetails.eventDate).toLocaleString()}`
                              : "Your event date & time will be used for scheduling"}
                          </p>
                        </div>
                      </div>
                    )}

                    {(location.state as any)?.fromChatbot && cart.length > 0 && (
                      <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 text-sm text-purple-700 flex items-center gap-2">
                        🤖 <span><strong>{cart.length} items</strong> added from chatbot.</span>
                      </div>
                    )}
                  </div>

                  {/* RIGHT — Guest & Venue */}
                  <div className="px-6 py-5">
                    <h2 className="text-base font-semibold text-foreground mb-4">Guest & Venue</h2>
                    <div className="space-y-3">

                      {/* Adults + Kids */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">
                            <Users className="inline w-3 h-3 mr-1" />Adults <span className="text-red-500">*</span>
                          </label>
                          <Input type="number" min="1" placeholder="0"
                            value={eventDetails.adultCount}
                            onChange={(e) => setEvent("adultCount", e.target.value)}
                            className={eventErrors.adultCount ? "border-red-400" : ""} />
                          {eventErrors.adultCount && <p className="text-xs text-red-500 mt-1">{eventErrors.adultCount}</p>}
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">
                            <Users className="inline w-3 h-3 mr-1" />Kids <span className="text-orange-400 text-[10px]">(optional)</span>
                          </label>
                          <Input type="number" min="0" placeholder="0"
                            value={eventDetails.kidsCount}
                            onChange={(e) => setEvent("kidsCount", e.target.value)} />
                        </div>
                      </div>

                      {/* Venue */}
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          <MapPin className="inline w-3 h-3 mr-1" />Venue <span className="text-red-500">*</span>
                        </label>
                        <Input placeholder="Venue name or address"
                          value={eventDetails.venue}
                          onChange={(e) => setEvent("venue", e.target.value)}
                          className={eventErrors.venue ? "border-red-400" : ""} />
                        {eventErrors.venue && <p className="text-xs text-red-500 mt-1">{eventErrors.venue}</p>}
                      </div>

                      {/* Buffer % */}
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          Buffer % <span className="text-orange-400 text-[10px]">(optional — default applied)</span>
                        </label>
                        <Input type="number" min="0" max="100" placeholder="e.g. 10"
                          value={eventDetails.bufferPercent}
                          onChange={(e) => setEvent("bufferPercent", e.target.value)} />
                      </div>

                      {/* VIP + Outdoor */}
                      <div className="grid grid-cols-2 gap-2">
                        <ToggleField label="VIP Event"     value={eventDetails.vipEvent}     onChange={(v) => setEvent("vipEvent", v)}     icon={Flag}     />
                        <ToggleField label="Outdoor Event" value={eventDetails.outdoorEvent} onChange={(v) => setEvent("outdoorEvent", v)} icon={TreePine} />
                      </div>

                      {/* Note */}
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          <MessageSquare className="inline w-3 h-3 mr-1" />Note <span className="text-orange-400 text-[10px]">(optional)</span>
                        </label>
                        <Input placeholder="Any special instructions..."
                          value={eventDetails.customNote}
                          onChange={(e) => setEvent("customNote", e.target.value)} />
                      </div>

                    </div>
                  </div>

                </div>
              </div>

              {/* Menu Table */}
              <h2 className="text-2xl font-display font-bold text-primary mb-4">Select Your Items</h2>

              <div className="flex flex-wrap border-t-2 border-b-2 border-primary">
                {CATEGORIES.map((cat, idx) => (
                  <button key={cat} onClick={() => setActiveTab(idx)}
                    className={`flex-1 min-w-[110px] py-4 px-2 text-xs font-bold uppercase tracking-widest font-body border-r border-border last:border-r-0 transition-colors duration-200 ${activeTab === idx ? "bg-primary text-primary-foreground" : "bg-transparent text-primary hover:bg-primary/5"}`}
                  >{cat}</button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 border border-border border-t-0 bg-white min-h-[200px]">
                {loading ? (
                  <div className="col-span-2 py-16 text-center text-muted-foreground animate-pulse">Loading…</div>
                ) : allDishes.length === 0 ? (
                  <div className="col-span-2 py-16 text-center text-muted-foreground">No items available.</div>
                ) : (
                  <>
                    <div className="divide-y divide-border md:border-r md:border-border">
                      {leftCol.map((dish) => <DishCard key={dish._id} dish={dish} onAdd={addToCart} />)}
                    </div>
                    <div className="divide-y divide-border">
                      {rightCol.map((dish) => <DishCard key={dish._id} dish={dish} onAdd={addToCart} />)}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Cart Sidebar */}
            <div className="lg:col-span-1" id="cart-sidebar">
              <div className="sticky top-24 bg-cream border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-display font-bold text-primary">Your Order</h3>
                  {deliveryMode && (
                    <span className="ml-auto flex items-center gap-1 border border-border text-muted-foreground text-xs px-2 py-1 rounded">
                      {deliveryMode === "delivery" ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                      {deliveryMode === "delivery" ? "Delivery" : "Pickup"}
                    </span>
                  )}
                  {totalItems > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">{totalItems}</span>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2 opacity-20">🍴</div>
                    <p className="text-muted-foreground text-sm">Add items to get started</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1 max-h-[400px] overflow-y-auto">
                      {cart.map((item) => (
                        <div key={`${item.name}-${item.size}`} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-cream/60 transition-colors">
                          <p className="text-sm text-foreground">{item.name}</p>
                          <button onClick={() => removeFromCart(item.name, item.size)} className="text-muted-foreground hover:text-destructive ml-2 shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button onClick={handleClearCart} className="text-xs text-muted-foreground underline mt-2 block w-full text-right hover:text-destructive">
                      Clear cart
                    </button>

                    <div className="border-t border-border mt-3 pt-4">
                      <div className="bg-orange-50 border border-orange-200 rounded-md px-3 py-2 mb-3 text-xs text-orange-700">
                        💡 Final quotation with tray counts will be shown after order is placed.
                      </div>

                      {checkoutError && <p className="text-xs text-red-500 mb-3">⚠️ {checkoutError}</p>}

                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base"
                        size="lg"
                        disabled={checkoutLoading}
                        onClick={handleCheckout}
                      >
                        {checkoutLoading ? "Submitting..." : "Checkout →"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderPage;