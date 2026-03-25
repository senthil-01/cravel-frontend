import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft, Loader2, Search, CheckCircle2, AlertTriangle,
} from "lucide-react";

//const API_BASE = "http://127.0.0.1:8000/api/v1";



const BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${BASE}/api/v1`;

// ── Types ─────────────────────────────────────────────────────────────────────
interface ItemResult {
  itemCode:    string;
  menuName:    string;
  category:    string;
  sellByCount: boolean;
  trayResult?: { L: number; M: number; S: number };
  totalPieces?: number;
}

interface CalcResult {
  resultId:    string;
  requestId:   string;
  ruleVersionId: string;
  summary: {
    eventType:       string;
    serviceStyle:    string;
    eventDate?:      string;
    effectiveGuests: number;
  };
  itemResults: ItemResult[];
}

interface ItemOutcomeForm {
  itemCode:            string;
  menuName:            string;
  sellByCount:         boolean;
  recommendedTrays:    number;
  actualPreparedTrays: string;
  leftoverPercentage:  string;
  shortageOccurred:    boolean;
  shortageAmount:      string;
  customerSatisfaction: string;
}

const SATISFACTION_OPTIONS = [
  { key: "",        label: "Not rated" },
  { key: "good",    label: "Good" },
  { key: "average", label: "Average" },
  { key: "poor",    label: "Poor" },
];

const fmtTray = (t?: { L: number; M: number; S: number }) => {
  if (!t) return "—";
  const p = [];
  if (t.L > 0) p.push(`${t.L}L`);
  if (t.M > 0) p.push(`${t.M}M`);
  if (t.S > 0) p.push(`${t.S}S`);
  return p.length ? p.join(" + ") : "0";
};

const getRecommended = (item: ItemResult): number => {
  if (item.sellByCount) return item.totalPieces ?? 0;
  if (item.trayResult) return (item.trayResult.L ?? 0) + (item.trayResult.M ?? 0) + (item.trayResult.S ?? 0);
  return 0;
};

// ── RecordOutcomesPage ────────────────────────────────────────────────────────
const RecordOutcomesPage = () => {
  const navigate    = useNavigate();
  const { user }    = useAuth();

  const [resultId, setResultId]       = useState("");
  const [searching, setSearching]     = useState(false);
  const [result, setResult]           = useState<CalcResult | null>(null);
  const [searchError, setSearchError] = useState("");

  const [eventFulfilledAt, setEventFulfilledAt] = useState("");
  const [overallSatisfaction, setOverallSatisfaction] = useState("");
  const [staffNotes, setStaffNotes]             = useState("");
  const [itemForms, setItemForms]               = useState<ItemOutcomeForm[]>([]);
  const [formErrors, setFormErrors]             = useState<Record<string, string>>({});
  const [submitting, setSubmitting]             = useState(false);
  const [success, setSuccess]                   = useState(false);
  const [submitError, setSubmitError]           = useState("");

  // ── Search result ───────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!resultId.trim()) { setSearchError("Enter a Result ID"); return; }
    setSearching(true);
    setSearchError("");
    setResult(null);
    try {
      const res  = await fetch(`${API_BASE}/calculation-results/${resultId.trim()}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error("Result not found");
      const r = data.data as CalcResult;
      setResult(r);
      // init item forms
      setItemForms(r.itemResults
        .filter((i) => !('customMode' in i && (i as any).customMode))
        .map((i) => ({
          itemCode:            i.itemCode,
          menuName:            i.menuName,
          sellByCount:         i.sellByCount,
          recommendedTrays:    getRecommended(i),
          actualPreparedTrays: "",
          leftoverPercentage:  "",
          shortageOccurred:    false,
          shortageAmount:      "",
          customerSatisfaction: "",
        }))
      );
    } catch {
      setSearchError("Result not found. Check the Result ID.");
    } finally {
      setSearching(false);
    }
  };

  const updateItem = (idx: number, key: keyof ItemOutcomeForm, val: any) => {
    setItemForms((prev) => prev.map((f, i) => i === idx ? { ...f, [key]: val } : f));
  };

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!eventFulfilledAt) errs.eventFulfilledAt = "Event fulfilled date required";
    itemForms.forEach((item, idx) => {
      if (!item.actualPreparedTrays) errs[`actual_${idx}`] = "Required";
      if (!item.leftoverPercentage)  errs[`leftover_${idx}`] = "Required";
      if (item.shortageOccurred && !item.shortageAmount) errs[`shortage_${idx}`] = "Enter shortage amount";
    });
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const body = {
        resultId:          result!.resultId,
        eventFulfilledAt:  new Date(eventFulfilledAt).toISOString(),
        overallSatisfaction: overallSatisfaction || null,
        staffNotes:          staffNotes.trim() || null,
        itemOutcomes: itemForms.map((item) => ({
          itemCode:            item.itemCode,
          actualPreparedTrays: parseFloat(item.actualPreparedTrays),
          leftoverPercentage:  parseFloat(item.leftoverPercentage),
          shortageOccurred:    item.shortageOccurred,
          shortageAmount:      item.shortageOccurred ? parseFloat(item.shortageAmount) : 0,
          customerSatisfaction: item.customerSatisfaction || null,
        })),
      };

      const res  = await fetch(
        `${API_BASE}/outcomes?recorded_by=${user?.userId ?? "unknown"}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(
        Array.isArray(data.detail)
          ? data.detail.map((e: any) => e.msg).join(", ")
          : data.detail || "Failed to submit"
      );
      setSuccess(true);
    } catch (e: any) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success ─────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="bg-white border border-border rounded-2xl p-10 max-w-md w-full text-center shadow-lg">
          <div className="flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="font-display font-bold text-primary text-xl mb-2">Outcomes Recorded</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Event outcomes saved successfully. Learning engine will use this data.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-border"
              onClick={() => { setSuccess(false); setResult(null); setResultId(""); setItemForms([]); }}>
              Record Another
            </Button>
            <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate("/sales/dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <button onClick={() => navigate("/sales/dashboard")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <span className="text-border">|</span>
          <h1 className="font-display font-bold text-primary text-lg">Record Order Outcomes</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-5">

          {/* Search Result */}
          <section className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-cream/40">
              <h2 className="text-sm font-semibold text-foreground">Find Order</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Enter the Result ID from the order</p>
            </div>
            <div className="p-5">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. RES-036298363264"
                  value={resultId}
                  onChange={(e) => setResultId(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="font-mono"
                />
                <Button onClick={handleSearch} disabled={searching}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
              {searchError && <p className="text-xs text-red-500 mt-2">{searchError}</p>}

              {/* Event summary */}
              {result && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-md px-4 py-3 text-sm space-y-1">
                  <p className="font-medium text-green-700">Order found ✅</p>
                  <p className="text-xs text-green-600">
                    {result.summary.eventType} · {result.summary.serviceStyle} ·{" "}
                    {result.summary.effectiveGuests} effective guests
                  </p>
                </div>
              )}
            </div>
          </section>

          {result && (
            <>
              {/* Event Fulfilled Date */}
              <section className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-cream/40">
                  <h2 className="text-sm font-semibold text-foreground">Event Details</h2>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Event Fulfilled At *</label>
                    <Input type="datetime-local" value={eventFulfilledAt}
                      onChange={(e) => setEventFulfilledAt(e.target.value)}
                      className={formErrors.eventFulfilledAt ? "border-red-400" : ""} />
                    {formErrors.eventFulfilledAt && <p className="text-xs text-red-500 mt-1">{formErrors.eventFulfilledAt}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Overall Satisfaction</label>
                    <select value={overallSatisfaction} onChange={(e) => setOverallSatisfaction(e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                      {SATISFACTION_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Staff Notes <span className="text-orange-400 text-[10px]">(optional)</span></label>
                    <Input placeholder="Any notes about the event..." value={staffNotes}
                      onChange={(e) => setStaffNotes(e.target.value)} />
                  </div>
                </div>
              </section>

              {/* Item Outcomes */}
              <section className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-cream/40">
                  <h2 className="text-sm font-semibold text-foreground">Item Outcomes</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Fill actual prepared vs recommended</p>
                </div>

                <div className="divide-y divide-border">
                  {itemForms.map((item, idx) => (
                    <div key={item.itemCode} className="px-5 py-4 space-y-3">
                      {/* Item header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.menuName}</p>
                          <p className="text-xs text-muted-foreground">
                            Recommended: <span className="font-medium text-primary">
                              {item.sellByCount ? `${item.recommendedTrays} pcs` : `${item.recommendedTrays} trays`}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">
                            Actual {item.sellByCount ? "Pcs" : "Trays"} *
                          </label>
                          <Input type="number" min="0" placeholder="0"
                            value={item.actualPreparedTrays}
                            onChange={(e) => updateItem(idx, "actualPreparedTrays", e.target.value)}
                            className={formErrors[`actual_${idx}`] ? "border-red-400" : ""} />
                          {formErrors[`actual_${idx}`] && <p className="text-[10px] text-red-500 mt-0.5">{formErrors[`actual_${idx}`]}</p>}
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Leftover % *</label>
                          <Input type="number" min="0" max="100" placeholder="0"
                            value={item.leftoverPercentage}
                            onChange={(e) => updateItem(idx, "leftoverPercentage", e.target.value)}
                            className={formErrors[`leftover_${idx}`] ? "border-red-400" : ""} />
                          {formErrors[`leftover_${idx}`] && <p className="text-[10px] text-red-500 mt-0.5">{formErrors[`leftover_${idx}`]}</p>}
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Satisfaction</label>
                          <select value={item.customerSatisfaction}
                            onChange={(e) => updateItem(idx, "customerSatisfaction", e.target.value)}
                            className="w-full border border-input rounded-md px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                            {SATISFACTION_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Shortage?</label>
                          <div
                            onClick={() => updateItem(idx, "shortageOccurred", !item.shortageOccurred)}
                            className={`flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2 text-sm transition-colors ${
                              item.shortageOccurred
                                ? "border-red-300 bg-red-50 text-red-600"
                                : "border-border bg-white text-muted-foreground hover:bg-gray-50"
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span className="text-xs">{item.shortageOccurred ? "Yes" : "No"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Shortage amount */}
                      {item.shortageOccurred && (
                        <div className="max-w-[140px]">
                          <label className="text-xs text-muted-foreground mb-1 block">Shortage Amount *</label>
                          <Input type="number" min="0" placeholder="0"
                            value={item.shortageAmount}
                            onChange={(e) => updateItem(idx, "shortageAmount", e.target.value)}
                            className={formErrors[`shortage_${idx}`] ? "border-red-400" : ""} />
                          {formErrors[`shortage_${idx}`] && <p className="text-[10px] text-red-500 mt-0.5">{formErrors[`shortage_${idx}`]}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Submit */}
              <div className="bg-white border border-border rounded-xl p-5 pb-8">
                {submitError && <p className="text-xs text-red-500 mb-3">⚠️ {submitError}</p>}
                <Button onClick={handleSubmit} disabled={submitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 font-semibold text-base">
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
                    : "Save Outcomes"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Outcomes feed the learning engine for better future predictions.
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default RecordOutcomesPage;
