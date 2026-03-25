import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CartItem, DeliveryMode } from "./OrderPage";
import {
  CheckCircle, ChevronLeft, Banknote, CreditCard,
  Truck, Store, Hash, Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LocationState {
  cart:         CartItem[];
  deliveryMode: DeliveryMode;
  requestId:    string;
}

interface ItemResult {
  itemCode:      string;
  menuName:      string;
  category:      string;
  sellByCount:   boolean;
  customMode:    boolean;
  trayResult?:   { L: number; M: number; S: number };
  totalPieces?:  number;
  remainderFlag?: { message: string; acknowledged: boolean } | null;
  message?:      string;
}

interface CalcResult {
  resultId:         string;
  requestId:        string;
  hasCustomMode:    boolean;
  hasRemainderFlag: boolean;
  totalAmount:      number;
  summary: {
    effectiveGuests: number;
    eventType:       string;
    serviceStyle:    string;
    bufferApplied:   number;
  };
  itemResults: ItemResult[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${BASE}/api/v1`;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,14}[0-9]$/;

const generateOrderId = () => {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `NMR-${ts}-${rand}`;
};

const fmtPrice = (val: number) =>
  `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtTray = (t: { L: number; M: number; S: number }) => {
  const parts = [];
  if (t.L > 0) parts.push(`${t.L}L`);
  if (t.M > 0) parts.push(`${t.M}M`);
  if (t.S > 0) parts.push(`${t.S}S`);
  return parts.length ? parts.join(" + ") : "—";
};

// ─── CheckoutPage ─────────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state    = (location.state ?? {}) as Partial<LocationState>;

  const cart         = state.cart         ?? [];
  const deliveryMode = state.deliveryMode ?? "delivery";
  const requestId    = state.requestId    ?? "";

  const [orderId] = useState(generateOrderId);
  const [success, setSuccess]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [voiding, setVoiding]       = useState(false);

  // ── Void on browser back / unload ─────────────────────────────────────────
  const voidOrder = async () => {
    if (!requestId || success) return;
    try {
      await Promise.all([
        fetch(`${API_BASE}/calculation-requests/${requestId}/void`, { method: "PATCH" }),
        fetch(`${API_BASE}/calculation-results/by-request/${requestId}/status`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "voided" }),
        }),
      ]);
    } catch {}
  };

  // ── Quotation fetch ────────────────────────────────────────────────────────
  const [calcResult, setCalcResult]       = useState<CalcResult | null>(null);
  const [resultLoading, setResultLoading] = useState(true);
  const [resultError, setResultError]     = useState("");
  const [itemPrices, setItemPrices]       = useState<Record<string, any>>({});
  const [grandTotal, setGrandTotal]       = useState(0);

  const getLineTotal = (item: any): number => {
    if (item.customMode) return 0;
    const menuItem = itemPrices[item.itemCode];
    if (!menuItem) return 0;
    if (item.sellByCount && item.totalPieces != null) {
      return (menuItem.price ?? 0) * item.totalPieces;
    }
    if (item.trayResult && menuItem.trayPrice) {
      const tp = menuItem.trayPrice;
      return (
        (item.trayResult.L ?? 0) * (tp.L ?? 0) +
        (item.trayResult.M ?? 0) * (tp.M ?? 0) +
        (item.trayResult.S ?? 0) * (tp.S ?? 0)
      );
    }
    return 0;
  };

  useEffect(() => {
    if (!requestId) { setResultLoading(false); return; }
    fetch(`${API_BASE}/calculation-results/request/${requestId}`)
      .then((r) => r.json())
      .then(async (d) => {
        if (!d.success) { setResultError("Could not load quotation."); return; }
        const result = d.data;
        setCalcResult(result);

        // fetch prices for each non-custom item
        const prices: Record<string, any> = {};
        let total = 0;

        await Promise.all(
          result.itemResults.map(async (item: any) => {
            if (item.customMode) return;
            try {
              const res      = await fetch(`${API_BASE}/menu-items/${item.itemCode}`);
              const data     = await res.json();
              const menuItem = data.data ?? data;
              prices[item.itemCode] = menuItem;

              if (item.sellByCount && item.totalPieces != null) {
                total += (menuItem.price ?? 0) * item.totalPieces;
              } else if (item.trayResult && menuItem.trayPrice) {
                const tp = menuItem.trayPrice;
                total += (item.trayResult.L ?? 0) * (tp.L ?? 0);
                total += (item.trayResult.M ?? 0) * (tp.M ?? 0);
                total += (item.trayResult.S ?? 0) * (tp.S ?? 0);
              }
            } catch {}
          })
        );

        setItemPrices(prices);
        setGrandTotal(result.totalAmount ?? total);
      })
      .catch(() => setResultError("Could not load quotation."))
      .finally(() => setResultLoading(false));
  }, [requestId]);

  // ── Payment ────────────────────────────────────────────────────────────────
  type PayMethod = "cod" | "card" | null;
  const [payMethod, setPayMethod]               = useState<PayMethod>(null);
  const [highlightPayment, setHighlightPayment] = useState(false);



  // ── Form ───────────────────────────────────────────────────────────────────
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [formErrors, setFormErrors] = useState<{
    name?: string; email?: string; phone?: string; pay?: string;
  }>({});
  const [submitError, setSubmitError] = useState("");

  // ── Place Order ────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    const errors: typeof formErrors = {};
    if (!name.trim())                         errors.name  = "Name is required.";
    if (!email.trim())                        errors.email = "Email is required.";
    else if (!EMAIL_REGEX.test(email.trim())) errors.email = "Enter a valid email.";
    if (!phone.trim())                        errors.phone = "Phone is required.";
    else if (!PHONE_REGEX.test(phone.trim())) errors.phone = "Enter a valid phone number.";

    if (!payMethod) {
      errors.pay = "Please select a payment method.";
      setHighlightPayment(true);
      document.getElementById("payment-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setHighlightPayment(false), 2500);
    }

    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setFormErrors({});
    setSubmitError("");
    setSubmitting(true);

    try {
      // PATCH calculation_results status based on flags
      if (calcResult?.resultId) {
        const resultStatus = (calcResult.hasCustomMode || calcResult.hasRemainderFlag)
          ? "pending_review"
          : "final"; // clean order stays final
        await fetch(`${API_BASE}/calculation-results/by-request/${requestId}/status`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ status: resultStatus }),
        });
      }

      // clear localStorage
      [
        "nimir_cart", "nimir_delivery_mode",
        "nimir_order_source", "nimir_session_date",
      ].forEach((k) => { try { localStorage.removeItem(k); } catch {} });

      setSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "hsl(38 100% 97%)" }}>
        <div className="bg-white border border-border rounded-2xl p-10 max-w-md w-full text-center shadow-lg">
          <div className="flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-display font-bold text-primary mb-2">Order Placed!</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Thank you, <span className="font-semibold text-foreground">{name}</span>!<br />
            We'll contact you shortly to confirm your order.
          </p>
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-mono px-4 py-2 rounded-full mb-2">
            <Hash className="w-3.5 h-3.5" /> Order ID: {orderId}
          </div>
          {requestId && (
            <div className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-mono px-4 py-2 rounded-full mb-6 mt-2">
              <Hash className="w-3.5 h-3.5" /> Ref: {requestId}
            </div>
          )}
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate("/")}>
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--cream, 38 100% 97%))" }}>
      <style>{`
        @keyframes border-pulse {
          0%, 100% { outline: 2.5px solid #f97316; outline-offset: 2px; opacity: 1; }
          50%       { outline: 2.5px solid #fb923c; outline-offset: 4px; opacity: 0.7; }
        }
        .payment-highlight { animation: border-pulse 0.5s ease-in-out infinite; border-radius: 0.75rem; }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <button onClick={async () => { await voidOrder(); navigate(-1); }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Menu
          </button>
          <span className="text-border">|</span>
          <h1 className="font-display font-bold text-primary text-lg">Checkout</h1>
          <div className="ml-auto flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-mono px-3 py-1 rounded-full">
            <Hash className="w-3 h-3" /> {orderId}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">

          {/* ── 1. Quotation ── */}
          <section className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-cream/40">
              <h2 className="font-display font-bold text-foreground text-lg">Your Quotation</h2>
              {calcResult?.summary && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {calcResult.summary.effectiveGuests} effective guests · {calcResult.summary.eventType} · {calcResult.summary.serviceStyle}
                </p>
              )}
            </div>

            {resultLoading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading quotation...
              </div>
            ) : resultError ? (
              <p className="text-sm text-red-500 px-6 py-4">{resultError}</p>
            ) : calcResult ? (
              <>
                {/* Item results */}
                <div className="divide-y divide-border">
                  {(calcResult.itemResults ?? []).map((item) => (
                    <div key={item.itemCode} className="px-6 py-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{item.menuName}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                        {item.remainderFlag && !item.remainderFlag.acknowledged && (
                          <p className="text-xs text-orange-600 mt-1">
                            ⚠️ Based on your guest count, there may be a small surplus. Our team will optimise.
                          </p>
                        )}
                        {item.customMode && (
                          <p className="text-xs text-blue-600 mt-1">
                            📋 This item has a unique combination. We'll send a personalised quotation shortly.
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0 space-y-0.5">
                        {item.customMode ? (
                          <span className="text-xs text-blue-500 font-medium">Pending</span>
                        ) : item.sellByCount ? (
                          <>
                            <p className="text-sm font-medium text-foreground">{item.totalPieces} pcs</p>
                            {itemPrices[item.itemCode] && (
                              <p className="text-xs text-gold font-semibold">{fmtPrice(getLineTotal(item))}</p>
                            )}
                          </>
                        ) : item.trayResult ? (
                          <>
                            <p className="text-sm font-medium text-foreground">{fmtTray(item.trayResult)}</p>
                            {itemPrices[item.itemCode] && (
                              <p className="text-xs text-gold font-semibold">{fmtPrice(getLineTotal(item))}</p>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total + Disclaimer */}
                <div className="px-6 py-4 border-t border-border bg-cream/30">
                  {/* Case 1 & 2 — show total */}
                  {!calcResult.hasCustomMode && grandTotal > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-display font-bold text-lg text-foreground">Total</span>
                      <span className="font-display font-bold text-2xl text-gold">{fmtPrice(grandTotal)}</span>
                    </div>
                  )}

                  {/* Case 2 — remainderFlag only disclaimer */}
                  {!calcResult.hasCustomMode && calcResult.hasRemainderFlag && (
                    <p className="text-xs text-muted-foreground mt-1">
                      * Quantities may be slightly optimised by our team. Final amount will be confirmed before delivery.
                    </p>
                  )}

                  {/* Case 3 — customMode only */}
                  {calcResult.hasCustomMode && !calcResult.hasRemainderFlag && (
                    <p className="text-sm text-blue-600">
                      📋 Our team will review your order and send you a personalised quotation shortly.
                    </p>
                  )}

                  {/* Case 4 — both */}
                  {calcResult.hasCustomMode && calcResult.hasRemainderFlag && (
                    <p className="text-sm text-blue-600">
                      📋 Your order includes unique combinations and quantity adjustments. Our team will review and send you a personalised quotation shortly.
                    </p>
                  )}
                </div>
              </>
            ) : null}
          </section>

          {/* ── 2. Payment Method ── */}
          <section id="payment-section"
            className={`bg-white border border-border rounded-xl overflow-hidden transition-all duration-300 ${highlightPayment ? "payment-highlight" : ""}`}>
            <div className="px-6 py-4 border-b border-border bg-cream/40">
              <h2 className="font-display font-bold text-foreground text-lg">Payment Method</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <button onClick={() => { setPayMethod("cod"); setFormErrors((p) => ({ ...p, pay: undefined })); }}
                className={`flex flex-col gap-3 border-2 rounded-xl p-5 text-left transition-all ${payMethod === "cod" ? "border-orange-400 bg-orange-50 shadow-sm" : "border-border bg-white hover:bg-gray-50"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${payMethod === "cod" ? "bg-orange-100" : "bg-gray-100"}`}>
                  <Banknote className={`w-5 h-5 ${payMethod === "cod" ? "text-orange-500" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${payMethod === "cod" ? "text-orange-600" : "text-foreground"}`}>
                    Cash on {deliveryMode === "delivery" ? "Delivery" : "Pickup"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    {deliveryMode === "delivery" ? <><Truck className="w-3 h-3" /> Delivery</> : <><Store className="w-3 h-3" /> Pickup</>}
                  </p>
                </div>
                {payMethod === "cod" && <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wide">Selected ✓</span>}
              </button>

              <button onClick={() => { setPayMethod("card"); setFormErrors((p) => ({ ...p, pay: undefined })); }}
                className={`flex flex-col gap-3 border-2 rounded-xl p-5 text-left transition-all ${payMethod === "card" ? "border-orange-400 bg-orange-50 shadow-sm" : "border-border bg-white hover:bg-gray-50"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${payMethod === "card" ? "bg-orange-100" : "bg-gray-100"}`}>
                  <CreditCard className={`w-5 h-5 ${payMethod === "card" ? "text-orange-500" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${payMethod === "card" ? "text-orange-600" : "text-foreground"}`}>Credit Card</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Visa / Mastercard</p>
                </div>
                {payMethod === "card" && <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wide">Selected ✓</span>}
              </button>
            </div>

            <div className="mx-6 mb-5 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm text-orange-700">
              {deliveryMode === "delivery"
                ? <><Truck className="w-4 h-4 shrink-0" /><span>Delivering to your event venue</span></>
                : <><Store className="w-4 h-4 shrink-0" /><span>Pickup — scheduled as per your event date & time</span></>}
            </div>
            {formErrors.pay && <p className="text-xs text-red-500 px-6 pb-4">{formErrors.pay}</p>}
          </section>

          {/* ── 3. Customer Info ── */}
          <section className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-cream/40">
              <h2 className="font-display font-bold text-foreground text-lg">Your Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Full Name *</label>
                  <Input placeholder="e.g. Arjun Kumar" value={name}
                    onChange={(e) => { setName(e.target.value); setFormErrors((p) => ({ ...p, name: undefined })); }}
                    className={formErrors.name ? "border-red-400" : ""} />
                  {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Phone *</label>
                  <Input type="tel" placeholder="e.g. +1 617 987 5222" value={phone}
                    onChange={(e) => { setPhone(e.target.value); setFormErrors((p) => ({ ...p, phone: undefined })); }}
                    className={formErrors.phone ? "border-red-400" : ""} />
                  {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Email *</label>
                <Input type="email" placeholder="e.g. arjun@email.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setFormErrors((p) => ({ ...p, email: undefined })); }}
                  className={formErrors.email ? "border-red-400" : ""} />
                {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Special Instructions</label>
                <Textarea placeholder="Allergies, special requests, delivery notes..."
                  rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
          </section>

          {/* ── Place Order ── */}
          <div className="pb-8">
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Grand Total</p>
                  <p className="font-display font-bold text-3xl text-gold">
                    {grandTotal > 0 ? fmtPrice(grandTotal) : "—"}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{cart.length} item{cart.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {submitError && <p className="text-xs text-red-500 mb-3">⚠️ {submitError}</p>}

              <Button
                variant="outline"
                className="w-full border-red-300 text-red-500 hover:bg-red-50 mb-3"
                disabled={voiding || submitting}
                onClick={async () => {
                  setVoiding(true);
                  await voidOrder();
                  navigate("/");
                }}
              >
                {voiding ? "Cancelling..." : "Cancel Order"}
              </Button>

              <Button onClick={handlePlaceOrder} disabled={submitting || voiding}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base h-12 disabled:opacity-70"
                size="lg">
                {submitting ? "Placing Order..." : "Place Order"}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                By placing your order you agree to our terms. We'll call to confirm.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;