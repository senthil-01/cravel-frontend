import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";

//const API_BASE      = "http://127.0.0.1:8000/api/v1";

const BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${BASE}/api/v1`;


const ALLOWED_ROLES = ["sales_rep", "operations_manager", "catering_manager", "business_owner"];

const OVERRIDE_REASONS = [
  { key: "chef_experience",          label: "Chef Experience" },
  { key: "customer_specific_pattern",label: "Customer Specific Pattern" },
  { key: "seasonal_demand",          label: "Seasonal Demand" },
  { key: "vip_event_risk",           label: "VIP Event Risk" },
  { key: "new_item_no_history",      label: "New Item — No History" },
  { key: "one_time_exception",       label: "One Time Exception" },
];

const OVERRIDE_TYPES = [
  { key: "calculation", label: "Calculation (tray counts / pieces)" },
  { key: "rule",        label: "Rule (spread values)" },
  { key: "temporary",   label: "Temporary" },
  { key: "permanent",   label: "Permanent" },
];

interface ItemResult {
  itemCode:    string;
  menuName:    string;
  category:    string;
  sellByCount: boolean;
  customMode:  boolean;
  trayResult?: { L: number; M: number; S: number };
  totalPieces?: number;
}

interface CalcResult {
  resultId:    string;
  requestId:   string;
  itemResults: ItemResult[];
}

// ── SalesOverrideRequest ──────────────────────────────────────────────────────
const SalesOverrideRequest = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate      = useNavigate();
  const { user }      = useAuth();

  const [result, setResult]   = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState("");

  // form fields
  const [selectedItem, setSelectedItem]         = useState("");
  const [overrideType, setOverrideType]         = useState("calculation");
  const [reason, setReason]                     = useState("");
  const [justification, setJustification]       = useState("");
  const [effectiveFrom, setEffectiveFrom]       = useState("");
  const [effectiveTo, setEffectiveTo]           = useState("");
  // new value fields
  const [newL, setNewL]         = useState("");
  const [newM, setNewM]         = useState("");
  const [newS, setNewS]         = useState("");
  const [newPieces, setNewPieces] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (!ALLOWED_ROLES.includes(user.role)) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    if (!requestId) return;
    fetch(`${API_BASE}/calculation-results/request/${requestId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setResult(d.data); })
      .catch(() => setError("Failed to load result."))
      .finally(() => setLoading(false));
  }, [requestId]);

  const selectedItemObj = result?.itemResults.find((i) => i.itemCode === selectedItem);

  // auto-fill old value display
  const oldValueDisplay = selectedItemObj
    ? selectedItemObj.sellByCount
      ? `${selectedItemObj.totalPieces} pcs`
      : selectedItemObj.trayResult
        ? `L:${selectedItemObj.trayResult.L} M:${selectedItemObj.trayResult.M} S:${selectedItemObj.trayResult.S}`
        : "—"
    : "—";

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedItem)    errs.item          = "Select an item";
    if (!overrideType)    errs.overrideType  = "Select override type";
    if (!reason)          errs.reason        = "Select a reason";
    if (!justification.trim() || justification.trim().length < 20)
                          errs.justification = "Minimum 20 characters required";
    if (overrideType !== "calculation" && !effectiveFrom)
                          errs.effectiveFrom = "Effective from date required";
    if (selectedItemObj?.sellByCount) {
      if (!newPieces)     errs.newValue      = "Enter total pieces";
    } else {
      if (!newL && !newM && !newS) errs.newValue = "Enter at least one tray count";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError("");

    try {
      const oldValue = selectedItemObj?.sellByCount
        ? { totalPieces: selectedItemObj.totalPieces }
        : { L: selectedItemObj?.trayResult?.L ?? 0, M: selectedItemObj?.trayResult?.M ?? 0, S: selectedItemObj?.trayResult?.S ?? 0 };

      const newValue = selectedItemObj?.sellByCount
        ? { totalPieces: parseFloat(newPieces) }
        : { L: parseInt(newL) || 0, M: parseInt(newM) || 0, S: parseInt(newS) || 0 };

      const body = {
        overrideType,
        impactedOn: {
          type:      overrideType === "rule" ? "rule" : "calculation",
          resultId:  result?.resultId,
          requestId: result?.requestId,
          itemCode:  selectedItem,
          menuName:  selectedItemObj?.menuName,
          ruleField: null,
        },
        oldValue,
        newValue,
        reason,
        justificationNotes: justification.trim(),
        effectiveFrom:      effectiveFrom ? new Date(effectiveFrom).toISOString() : new Date().toISOString(),
        effectiveTo:        effectiveTo ? new Date(effectiveTo).toISOString() : null,
      };

      const res = await fetch(
        `${API_BASE}/override-requests?requested_by=${user?.userId}&requested_by_role=${user?.role}`,
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
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || !ALLOWED_ROLES.includes(user.role)) return null;

  // ── Success ────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="bg-white border border-border rounded-2xl p-10 max-w-md w-full text-center shadow-lg">
          <div className="flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="font-display font-bold text-primary text-xl mb-2">Override Request Submitted</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Your request has been sent to the approver for review.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-border"
              onClick={() => navigate(`/sales/orders/${requestId}`)}>
              Back to Order
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
          <button onClick={() => navigate(`/sales/orders/${requestId}`)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Order
          </button>
          <span className="text-border">|</span>
          <h1 className="font-display font-bold text-primary text-lg">Override Request</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : (
          <div className="space-y-5">

            {/* Item Selection */}
            <section className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-cream/40">
                <h2 className="text-sm font-semibold text-foreground">Select Item</h2>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Item *</label>
                  <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary ${formErrors.item ? "border-red-400" : "border-input"}`}>
                    <option value="">Select item</option>
                    {result?.itemResults.filter((i) => !i.customMode).map((i) => (
                      <option key={i.itemCode} value={i.itemCode}>{i.menuName}</option>
                    ))}
                  </select>
                  {formErrors.item && <p className="text-xs text-red-500 mt-1">{formErrors.item}</p>}
                </div>

                {selectedItemObj && (
                  <div className="bg-gray-50 border border-border rounded-md px-4 py-3 text-sm">
                    <p className="text-xs text-muted-foreground mb-1">Current Value</p>
                    <p className="font-medium text-foreground">{oldValueDisplay}</p>
                  </div>
                )}
              </div>
            </section>

            {/* New Value */}
            {selectedItemObj && (
              <section className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-cream/40">
                  <h2 className="text-sm font-semibold text-foreground">New Value</h2>
                </div>
                <div className="p-5">
                  {selectedItemObj.sellByCount ? (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Total Pieces *</label>
                      <Input type="number" min="0" placeholder="e.g. 250"
                        value={newPieces} onChange={(e) => setNewPieces(e.target.value)} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {["L", "M", "S"].map((size) => (
                        <div key={size}>
                          <label className="text-xs text-muted-foreground mb-1 block">{size} Trays</label>
                          <Input type="number" min="0" placeholder="0"
                            value={size === "L" ? newL : size === "M" ? newM : newS}
                            onChange={(e) => size === "L" ? setNewL(e.target.value) : size === "M" ? setNewM(e.target.value) : setNewS(e.target.value)} />
                        </div>
                      ))}
                    </div>
                  )}
                  {formErrors.newValue && <p className="text-xs text-red-500 mt-2">{formErrors.newValue}</p>}
                </div>
              </section>
            )}

            {/* Override Details */}
            <section className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-cream/40">
                <h2 className="text-sm font-semibold text-foreground">Override Details</h2>
              </div>
              <div className="p-5 space-y-4">

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Override Type *</label>
                    <select value={overrideType} onChange={(e) => setOverrideType(e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                      {OVERRIDE_TYPES.map((t) => (
                        <option key={t.key} value={t.key}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Reason *</label>
                    <select value={reason} onChange={(e) => setReason(e.target.value)}
                      className={`w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary ${formErrors.reason ? "border-red-400" : "border-input"}`}>
                      <option value="">Select reason</option>
                      {OVERRIDE_REASONS.map((r) => (
                        <option key={r.key} value={r.key}>{r.label}</option>
                      ))}
                    </select>
                    {formErrors.reason && <p className="text-xs text-red-500 mt-1">{formErrors.reason}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block flex justify-between">
                    <span>Justification * <span className="text-orange-400">(min 20 chars)</span></span>
                    <span className={justification.length < 20 ? "text-red-400" : "text-green-500"}>
                      {justification.length} chars
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Explain why this override is needed..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none ${formErrors.justification ? "border-red-400" : "border-input"}`}
                  />
                  {formErrors.justification && <p className="text-xs text-red-500 mt-1">{formErrors.justification}</p>}
                </div>

                {overrideType !== "calculation" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Effective From *</label>
                      <Input type="datetime-local" value={effectiveFrom}
                        onChange={(e) => setEffectiveFrom(e.target.value)}
                        className={formErrors.effectiveFrom ? "border-red-400" : ""} />
                      {formErrors.effectiveFrom && <p className="text-xs text-red-500 mt-1">{formErrors.effectiveFrom}</p>}
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Effective To <span className="text-orange-400 text-[10px]">(optional — leave empty = permanent)</span>
                      </label>
                      <Input type="datetime-local" value={effectiveTo}
                        onChange={(e) => setEffectiveTo(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Submit */}
            <div className="bg-white border border-border rounded-xl p-5">
              {error && <p className="text-xs text-red-500 mb-3">⚠️ {error}</p>}
              <Button onClick={handleSubmit} disabled={submitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting...</> : "Submit Override Request"}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Request will be sent to approver for review.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default SalesOverrideRequest;