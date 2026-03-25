// ─────────────────────────────────────────────────────────────────────────────
// NimirChat.tsx  — Complete rebuild
// Conversational order widget: chat → pick dishes → event details → quotation
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Trash2, ChevronRight, Loader2 } from "lucide-react";
import { askNimir, ChatMessage } from "@/lib/nimirChat";
import {
  fetchMenu, fetchEventTypes, fetchServiceStyles,
  submitOrder, fetchQuotation,
  
  MenuItem, Multiplier, QuotationResult,
} from "@/lib/nimirApi";

// ─── Cart item — what the customer selects ────────────────────────────────────

interface CartItem {
  itemCode:     string;
  menuName:     string;
  category:     string;
  vegNonVeg:    "Veg" | "Non Veg";
  sellByCount:  boolean;
  displayPrice: string; // display only — not sent to API
}

// ─── Event form state ─────────────────────────────────────────────────────────

interface EventForm {
  customerName: string;
  eventName:    string;
  eventType:    string;
  eventDate:    string;
  serviceStyle: string;
  venue:        string;
  adultCount:   string;
  kidsCount:    string;
}

type Step = "chat" | "form" | "review" | "result";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDisplayPrice(item: MenuItem): string {
  if (item.sellByCount) return `$${item.price?.toFixed(2) ?? "?"}/piece`;
  const tp = item.trayPrice;
  if (!tp) return "See menu";
  return `S:$${tp.S?.toFixed(2)} M:$${tp.M?.toFixed(2)} L:$${tp.L?.toFixed(2)}`;
}

function formatTrayResult(trayResult: { L: number; M: number; S: number }): string {
  const parts: string[] = [];
  if (trayResult.L > 0) parts.push(`${trayResult.L}×Large`);
  if (trayResult.M > 0) parts.push(`${trayResult.M}×Medium`);
  if (trayResult.S > 0) parts.push(`${trayResult.S}×Small`);
  return parts.length > 0 ? parts.join(", ") : "—";
}

// ─── Main Component ───────────────────────────────────────────────────────────

const NimirChat = () => {

  // ── Widget state ─────────────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("chat");

  // ── Data loaded from API ──────────────────────────────────────────────────────
  const [menu, setMenu]                   = useState<MenuItem[]>([]);
  const [eventTypes, setEventTypes]       = useState<Multiplier[]>([]);
  const [serviceStyles, setServiceStyles] = useState<Multiplier[]>([]);
  const [dataLoaded, setDataLoaded]       = useState(false);

  // ── Category browse state ─────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // ── Chat state ────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi! I'm NIMIR's assistant. I can help you browse our menu and place a catering order. What are you looking for today?",
    },
  ]);
  const [input, setInput]           = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // ── Cart ──────────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);

  // ── Event form ────────────────────────────────────────────────────────────────
  const [form, setForm] = useState<EventForm>({
    customerName: "",
    eventName:    "",
    eventType:    "",
    eventDate:    "",
    serviceStyle: "",
    venue:        "",
    adultCount:   "",
    kidsCount:    "0",
  });
  const [formErrors, setFormErrors] = useState<Partial<EventForm>>({});

  // ── Result ────────────────────────────────────────────────────────────────────
  const [quotation, setQuotation]     = useState<QuotationResult | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Load all data on mount ────────────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        const [menuData, etData, ssData] = await Promise.all([
          fetchMenu(),
          fetchEventTypes(),
          fetchServiceStyles(),
        ]);
        setMenu(menuData);
        setEventTypes(etData);
        setServiceStyles(ssData);
        setDataLoaded(true);
      } catch (err) {
        console.error("[NimirChat] Failed to load data:", err);
        setDataLoaded(true); // still open, degrade gracefully
      }
    }
    loadData();
  }, []);

  // ── Auto-scroll ───────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading, step]);

  // ── Add to cart ───────────────────────────────────────────────────────────────
  const addToCart = (item: MenuItem) => {
    if (cart.find((c) => c.itemCode === item.itemCode)) return; // no duplicates
    setCart((prev) => [
      ...prev,
      {
        itemCode:     item.itemCode,
        menuName:     item.menuName,
        category:     item.category,
        vegNonVeg:    item.vegNonVeg,
        sellByCount:  item.sellByCount,
        displayPrice: formatDisplayPrice(item),
      },
    ]);
  };

  const removeFromCart = (itemCode: string) => {
    setCart((prev) => prev.filter((c) => c.itemCode !== itemCode));
  };

  // ── Send chat message ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || chatLoading) return;
    const userMessage = input.trim();
    setInput("");

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", text: userMessage },
    ];
    setMessages(updatedMessages);
    setChatLoading(true);

    const answer = await askNimir(userMessage, updatedMessages.slice(-6), menu);
    setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    setChatLoading(false);
  };

  // ── Form validation ───────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const errors: Partial<EventForm> = {};
    if (!form.customerName.trim()) errors.customerName = "Required";
    if (!form.eventName.trim())    errors.eventName    = "Required";
    if (!form.eventType)           errors.eventType    = "Required";
    if (!form.serviceStyle)        errors.serviceStyle = "Required";
    if (!form.eventDate) {
      errors.eventDate = "Required";
    } else {
      const d = new Date(form.eventDate);
      if (isNaN(d.getTime()) || d < new Date()) errors.eventDate = "Must be today or future";
    }
    if (!form.adultCount || parseInt(form.adultCount) < 0) errors.adultCount = "Required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit order ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const orderResponse = await submitOrder(
        {
          requestChannel: "chat_form",
          eventDetails: {
            eventName:    form.eventName,
            eventType:    form.eventType,
            eventDate:    new Date(form.eventDate).toISOString(),
            serviceStyle: form.serviceStyle,
            venue:        form.venue.trim() || null,
          },
          guestDetails: {
            adultCount: parseInt(form.adultCount),
            kidsCount:  parseInt(form.kidsCount) || 0,
          },
          menuItems: cart.map((item) => ({
            itemCode:  item.itemCode,
            category:  item.category,
            vegNonVeg: item.vegNonVeg,
          })),
          bufferPercent: null,
          specialFlags: { vipEvent: false, outdoorEvent: false, customNote: null },
        },
        form.customerName.trim() || "guest"
      );

      // Engine ran synchronously — fetch result immediately, no polling
      const result = await fetchQuotation(orderResponse.requestId);
      setQuotation(result);
      setStep("result");

    } catch (err: any) {
      setSubmitError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset everything ──────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep("chat");
    setCart([]);
    setQuotation(null);
    setSubmitError(null);
    setForm({
      customerName: "",
      eventName:    "",
      eventType:    "",
      eventDate:    "",
      serviceStyle: "",
      venue:        "",
      adultCount:   "",
      kidsCount:    "0",
    });
    setMessages([{
      role: "assistant",
      text: "Hi! I'm NIMIR's assistant. How can I help you today?",
    }]);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Toggle Button ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full p-4 shadow-lg hover:opacity-90 transition-all"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {cart.length > 0 && step === "chat" && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cart.length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[480px] bg-white rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden min-h-[600px]">

          {/* ── Header ────────────────────────────────────────────────────────── */}
          <div className="bg-primary px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-lg">NIMIR Assistant</p>
              <p className="text-white/70 text-xs">
                {step === "chat"   && "Browse menu & build your order"}
                {step === "form"   && "Step 1 of 2 — Event details"}
                {step === "review" && "Step 2 of 2 — Review & confirm"}
                {step === "result" && "Your quotation is ready"}
              </p>
            </div>
            {step !== "chat" && (
              <button
                onClick={() => setStep("chat")}
                className="text-white/70 text-xs underline hover:text-white"
              >
                ← Back to chat
              </button>
            )}
          </div>

          {/* ── STEP: CHAT ────────────────────────────────────────────────────── */}
          {step === "chat" && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[520px]">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-cream text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-cream px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                {/* Category → Dish drill-down browser */}
                {!chatLoading && menu.length > 0 && (() => {
                  const categories = [...new Set(menu.map((i) => i.category))].slice(0, 5);

                  if (!selectedCategory) {
                    return (
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2">Browse by category:</p>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className="text-xs px-3 py-1.5 rounded-full border border-border bg-white text-foreground hover:border-primary hover:text-primary transition-all"
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  const dishes = menu.filter((i) => i.category === selectedCategory);
                  return (
                    <div className="pt-2">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-xs text-primary underline mb-2 block"
                      >
                        ← Back to categories
                      </button>
                      <p className="text-xs text-muted-foreground mb-2">{selectedCategory}:</p>
                      <div className="flex flex-wrap gap-2">
                        {dishes.map((item) => {
                          const inCart = cart.find((c) => c.itemCode === item.itemCode);
                          return (
                            <button
                              key={item.itemCode}
                              onClick={() => addToCart(item)}
                              disabled={!!inCart}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                                inCart
                                  ? "bg-primary/10 border-primary text-primary cursor-default"
                                  : "bg-white border-border text-foreground hover:border-primary hover:text-primary"
                              }`}
                            >
                              {inCart ? "✓ " : "+ "}{item.menuName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                <div ref={bottomRef} />
              </div>

              {/* Cart bar */}
              {cart.length > 0 && (
                <div className="border-t border-border px-4 py-2 bg-cream/50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold">
                      {cart.length} item{cart.length > 1 ? "s" : ""} in order
                    </p>
                    <button
                      onClick={() => setStep("form")}
                      className="flex items-center gap-1 bg-primary text-white text-xs px-3 py-1.5 rounded-lg hover:opacity-90"
                    >
                      Proceed <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cart.map((item) => (
                      <span
                        key={item.itemCode}
                        className="flex items-center gap-1 text-xs bg-white border border-border rounded px-2 py-0.5"
                      >
                        {item.menuName}
                        <button
                          onClick={() => removeFromCart(item.itemCode)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-border p-3 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about our menu..."
                  className="flex-1 text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-primary"
                />
                <button
                  onClick={handleSend}
                  disabled={chatLoading || !input.trim()}
                  className="bg-primary text-white rounded-lg px-3 py-2 hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* ── STEP: FORM ────────────────────────────────────────────────────── */}
          {step === "form" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[520px]">
              <p className="text-sm font-semibold">Tell us about your event</p>

              {/* Customer name */}
              <div>
                <label className="text-xs text-muted-foreground">Your Name *</label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 mt-1 outline-none focus:border-primary"
                  placeholder="e.g. Priya Kumar"
                />
                {formErrors.customerName && (
                  <p className="text-xs text-red-500 mt-0.5">{formErrors.customerName}</p>
                )}
              </div>

              {/* Event name */}
              <div>
                <label className="text-xs text-muted-foreground">Event Name *</label>
                <input
                  type="text"
                  value={form.eventName}
                  onChange={(e) => setForm((f) => ({ ...f, eventName: e.target.value }))}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 mt-1 outline-none focus:border-primary"
                  placeholder="e.g. My Wedding Reception"
                />
                {formErrors.eventName && (
                  <p className="text-xs text-red-500 mt-0.5">{formErrors.eventName}</p>
                )}
              </div>

              {/* Event type dropdown */}
              <div>
                <label className="text-xs text-muted-foreground">Event Type *</label>
                <select
                  value={form.eventType}
                  onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 mt-1 outline-none focus:border-primary bg-white"
                >
                  <option value="">Select event type</option>
                  {eventTypes.map((et) => (
                    <option key={et.key} value={et.key}>{et.label}</option>
                  ))}
                </select>
                {formErrors.eventType && (
                  <p className="text-xs text-red-500 mt-0.5">{formErrors.eventType}</p>
                )}
              </div>

              {/* Event date */}
              <div>
                <label className="text-xs text-muted-foreground">Event Date *</label>
                <input
                  type="datetime-local"
                  value={form.eventDate}
                  onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 mt-1 outline-none focus:border-primary"
                />
                {formErrors.eventDate && (
                  <p className="text-xs text-red-500 mt-0.5">{formErrors.eventDate}</p>
                )}
              </div>

              {/* Service style dropdown */}
              <div>
                <label className="text-xs text-muted-foreground">Service Style *</label>
                <select
                  value={form.serviceStyle}
                  onChange={(e) => setForm((f) => ({ ...f, serviceStyle: e.target.value }))}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 mt-1 outline-none focus:border-primary bg-white"
                >
                  <option value="">Select service style</option>
                  {serviceStyles.map((ss) => (
                    <option key={ss.key} value={ss.key}>{ss.label}</option>
                  ))}
                </select>
                {formErrors.serviceStyle && (
                  <p className="text-xs text-red-500 mt-0.5">{formErrors.serviceStyle}</p>
                )}
              </div>

              {/* Guest counts */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Adults *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.adultCount}
                    onChange={(e) => setForm((f) => ({ ...f, adultCount: e.target.value }))}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 mt-1 outline-none focus:border-primary"
                    placeholder="50"
                  />
                  {formErrors.adultCount && (
                    <p className="text-xs text-red-500 mt-0.5">{formErrors.adultCount}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Kids (optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.kidsCount}
                    onChange={(e) => setForm((f) => ({ ...f, kidsCount: e.target.value }))}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 mt-1 outline-none focus:border-primary"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Venue (optional) */}
              <div>
                <label className="text-xs text-muted-foreground">Venue (optional)</label>
                <input
                  type="text"
                  value={form.venue}
                  onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 mt-1 outline-none focus:border-primary"
                  placeholder="e.g. Grand Banquet Hall"
                />
              </div>

              <button
                onClick={() => { if (validateForm()) setStep("review"); }}
                className="w-full bg-primary text-white text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 mt-2"
              >
                Review Order →
              </button>
            </div>
          )}

          {/* ── STEP: REVIEW ──────────────────────────────────────────────────── */}
          {step === "review" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[520px]">
              <p className="text-sm font-semibold">Review your order</p>

              {/* Event summary */}
              <div className="bg-cream/50 rounded-lg p-3 text-sm space-y-1">
                <p><span className="text-muted-foreground">Event:</span> {form.eventName}</p>
                <p>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  {eventTypes.find((e) => e.key === form.eventType)?.label ?? form.eventType}
                </p>
                <p>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  {new Date(form.eventDate).toLocaleString()}
                </p>
                <p>
                  <span className="text-muted-foreground">Style:</span>{" "}
                  {serviceStyles.find((s) => s.key === form.serviceStyle)?.label ?? form.serviceStyle}
                </p>
                <p>
                  <span className="text-muted-foreground">Guests:</span>{" "}
                  {form.adultCount} adults{parseInt(form.kidsCount) > 0 ? `, ${form.kidsCount} kids` : ""}
                </p>
                {form.venue && (
                  <p><span className="text-muted-foreground">Venue:</span> {form.venue}</p>
                )}
              </div>

              {/* Cart items */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  SELECTED DISHES ({cart.length})
                </p>
                <div className="space-y-1.5">
                  {cart.map((item) => (
                    <div
                      key={item.itemCode}
                      className="flex items-center justify-between text-sm bg-cream/30 rounded px-3 py-2"
                    >
                      <div>
                        <span>{item.menuName}</span>
                        <span
                          className={`ml-2 text-xs px-1 py-0.5 rounded ${
                            item.vegNonVeg === "Veg"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.vegNonVeg}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.itemCode)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {submitError && (
                <p className="text-xs text-red-600 bg-red-50 rounded p-2">{submitError}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0}
                className="w-full bg-primary text-white text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Calculating...</>
                ) : (
                  "Get Quotation →"
                )}
              </button>
            </div>
          )}

          {/* ── STEP: RESULT ──────────────────────────────────────────────────── */}
          {step === "result" && quotation && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[520px]">

              {/* Status badge */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Your Quotation</p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    quotation.hasCustomMode || quotation.hasRemainderFlag
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {quotation.hasCustomMode || quotation.hasRemainderFlag
                    ? "Unique Order"
                    : "Confirmed"}
                </span>
              </div>

              {/* Summary */}
              <div className="bg-cream/50 rounded-lg p-3 text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Effective guests:</span>{" "}
                  {quotation.summary.effectiveGuests}
                </p>
                <p>
                  <span className="text-muted-foreground">Buffer applied:</span>{" "}
                  {quotation.summary.bufferApplied}%
                </p>
              </div>

              {/* Item results */}
              <div className="space-y-2">
                {quotation.itemResults.map((item) => (
                  <div
                    key={item.itemCode}
                    className="border border-border rounded-lg p-3 text-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.menuName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.category} · {item.vegNonVeg}
                        </p>
                      </div>
                      {item.customMode && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                          Staff review
                        </span>
                      )}
                    </div>

                    {!item.customMode && item.trayResult && (
                      <p className="text-xs text-primary mt-1.5 font-medium">
                        {formatTrayResult(item.trayResult)}
                      </p>
                    )}
                    {!item.customMode && item.totalPieces != null && (
                      <p className="text-xs text-primary mt-1.5 font-medium">
                        {item.totalPieces} pieces
                      </p>
                    )}
                    {item.customMode && (
                      <p className="text-xs text-amber-600 mt-1">Quantity to be confirmed by our team</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <p className="text-sm font-semibold">Estimated Total</p>
                <p className="text-lg font-bold text-primary">
                  ${quotation.totalAmount.toFixed(2)}
                </p>
              </div>

              {/* Staff review warning */}
              {(quotation.hasCustomMode || quotation.hasRemainderFlag) && (
                <div className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
                  <p className="font-semibold text-amber-700">🎉 You've placed a unique catering order!</p>
                  <p className="text-xs text-amber-600">Our team will review your selection and get back to you with a detailed quotation. Thank you for choosing NIMIR!</p>
                </div>
              )}

              {/* Reference ID */}
              <p className="text-xs text-muted-foreground">
                Reference ID: {quotation.requestId}
              </p>

              {/* Reset */}
              <button
                onClick={handleReset}
                className="w-full border border-primary text-primary text-sm font-semibold py-2.5 rounded-lg hover:bg-primary/5"
              >
                Start New Order
              </button>
            </div>
          )}

        </div>
      )}
    </>
  );
};

export default NimirChat;